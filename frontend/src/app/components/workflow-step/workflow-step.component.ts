import { Component, OnInit, ChangeDetectorRef, PLATFORM_ID, Inject, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { JsonFormComponent, FormFieldDefinition } from '../json-form/json-form.component';
import { WorkflowService } from '../../services/workflow.service';
import { WorkflowHooksService } from '../../services/workflow-hooks.service';

@Component({
  selector: 'app-workflow-step',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink,
    JsonFormComponent
  ],
  providers: [WorkflowService, WorkflowHooksService],
  templateUrl: './workflow-step.component.html',
  styleUrls: ['./workflow-step.component.css']
})
export class WorkflowStepComponent implements OnInit {
  @ViewChild(JsonFormComponent) jsonFormComponent!: JsonFormComponent;
  
  instanceId: string = '';
  stepId: string = '';

  instance: any = null;
  stepDefinition: any = null;
  currentData: any = {};

  // Form state
  model: any = {};
  fields: FormFieldDefinition[] = [];

  loading = true;
  submitting = false;
  validating = false;
  error: string | null = null;
  validationErrors: any[] = [];

  // Store loaded hooks for this step
  private stepHooks: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workflowService: WorkflowService,
    private workflowHooksService: WorkflowHooksService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.route.paramMap.subscribe(params => {
      this.instanceId = params.get('instanceId') || '';
      this.stepId = params.get('stepId') || '';

      console.log('=== WORKFLOW STEP COMPONENT INIT ===');
      console.log('Instance ID:', this.instanceId);
      console.log('Step ID:', this.stepId);

      if (this.instanceId) {
        this.loadCurrentStep();
      } else {
        this.error = 'No workflow instance specified';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Load the current step definition and data from API
   */
  async loadCurrentStep(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;

      const response = await this.workflowService.getCurrentStep(this.instanceId).toPromise();

      if (!response || !response.stepDefinition) {
        throw new Error('Step definition is missing in response');
      }

      this.instance = response.instance;
      this.stepDefinition = response.stepDefinition;
      this.currentData = response.currentData || {};

      console.log('=== STEP LOADED ===');
      console.log('Definition ID:', this.instance?.definitionId);
      console.log('Step ID:', this.stepDefinition?.stepId);

      // Initialize model with current data
      this.model = { ...this.currentData };

      // Convert fields
      const convertedFields = this.convertFields(this.stepDefinition.fields || []);

      // Load and execute hooks
      await this.loadAndExecuteHooks(convertedFields);

      // Set the fields
      this.fields = convertedFields;
      
      console.log('Fields set after hooks:', this.fields);

      this.loading = false;
      this.cdr.detectChanges();
    } catch (error: any) {
      console.error('Error loading step:', error);
      this.error = error?.error?.message || error?.message || 'Failed to load workflow step.';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Convert JSON fields to FormFieldDefinition format
   */
  private convertFields(jsonFields: any[]): FormFieldDefinition[] {
    return jsonFields.map(field => ({
      key: field.key,
      type: field.type,
      defaultValue: field.defaultValue,
      templateOptions: field.templateOptions || {},
      hooks: field.hooks,
      showWhen: field.showWhen,
      hideWhen: field.hideWhen,
      validation: field.validation,
      fieldGroup: field.fieldGroup ? this.convertFields(field.fieldGroup) : undefined
    }));
  }

  /**
   * Load hooks and execute onInit hooks for fields
   */
  private async loadAndExecuteHooks(fields: FormFieldDefinition[]): Promise<void> {
    const workflowId = this.instance?.definitionId;
    const stepId = this.stepDefinition?.stepId;

    console.log('=== LOAD AND EXECUTE HOOKS ===');
    console.log('  workflowId:', workflowId);
    console.log('  stepId:', stepId);

    if (!workflowId || !stepId) {
      console.log('❌ Cannot load hooks: missing workflowId or stepId');
      return;
    }

    this.stepHooks = this.workflowHooksService.getHooksForStep(workflowId, stepId);

    if (this.stepHooks) {
      console.log('✅ Hooks loaded:', Object.keys(this.stepHooks));
      await this.processFieldHooks(fields);
    } else {
      console.log('❌ No hooks found for this step');
    }
  }

  /**
   * Process onInit hooks for fields recursively
   */
  private async processFieldHooks(fields: FormFieldDefinition[]): Promise<void> {
    if (!fields || !this.stepHooks) return;

    for (const field of fields) {
      if (field.hooks?.onInit) {
        const hookName = field.hooks.onInit;
        
        if (this.stepHooks[hookName]) {
          console.log(`✅ Executing onInit hook '${hookName}' for field '${field.key}'`);
          try {
            const fieldProxy = {
              key: field.key,
              props: field.templateOptions
            };
            await this.stepHooks[hookName](fieldProxy, this.model, {}, this.http);
            
            if (fieldProxy.props?.options) {
              field.templateOptions = field.templateOptions || {};
              field.templateOptions.options = fieldProxy.props.options;
            }
            console.log(`Hook executed. Options:`, field.templateOptions?.options);
          } catch (error) {
            console.error(`❌ Error executing hook '${hookName}':`, error);
          }
        }
      }

      if (field.fieldGroup) {
        await this.processFieldHooks(field.fieldGroup);
      }
    }
  }

  /**
   * Handle field changes
   */
  onFieldChange(event: { key: string; value: any }): void {
    console.log('onFieldChange called:', event.key, event.value);
    
    const field = this.fields.find(f => f.key === event.key);
    if (field?.hooks?.onChange && this.stepHooks?.[field.hooks.onChange]) {
      console.log(`Executing onChange hook '${field.hooks.onChange}' for field '${event.key}'`);
      
      const fieldProxy = {
        key: field.key,
        props: field.templateOptions
      };
      
      // Execute the hook - this modifies the model directly
      this.stepHooks[field.hooks.onChange](fieldProxy, this.model, {}, this.http);
      
      // Force a new reference to trigger change detection
      this.model = { ...this.model };
      
      console.log('Model after onChange hook:', this.model);
      
      // Trigger change detection
      this.cdr.detectChanges();
    }
  }

  /**
   * Handle model updates from the form component
   */
  onModelChange(newModel: Record<string, any>): void {
    this.model = newModel;
  }

  /**
   * Validate form
   */
  async validateForm(): Promise<boolean> {
    try {
      this.validating = true;
      this.validationErrors = [];

      const result = await this.workflowService.validateStep(
        this.instanceId,
        this.stepDefinition.stepId,
        this.model
      ).toPromise();

      if (result && !result.isValid) {
        this.validationErrors = result.errors || [];
        this.validating = false;
        return false;
      }

      this.validating = false;
      return true;
    } catch (error) {
      console.error('Validation error:', error);
      this.validating = false;
      return false;
    }
  }

  /**
   * Submit the step
   */
  async onSubmit(): Promise<void> {
    try {
      const isValid = await this.validateForm();
      if (!isValid) return;

      this.submitting = true;
      this.error = null;

      const submission = {
        certificationId: this.instance.definitionId,
        stepId: this.stepDefinition.stepId,
        formData: this.model,
        submittedBy: this.getCurrentUserEmail(),
        decision: 'approve',
        comments: ''
      };

      console.log('Submitting:', submission);

      const updatedInstance = await this.workflowService.submitStep(
        this.instanceId,
        submission
      ).toPromise();

      if (updatedInstance) {
        if (updatedInstance.status === 'completed') {
          this.router.navigate(['/workflow', this.instanceId, 'completed']);
        } else {
          this.router.navigate(['/workflow', this.instanceId, 'step', updatedInstance.currentStep]);
          window.location.reload();
        }
      }

      this.submitting = false;
    } catch (error: any) {
      console.error('Submit error:', error);
      this.error = error.error?.message || 'Failed to submit step';
      this.submitting = false;
    }
  }

  /**
   * Check if submit is allowed
   */
  get canSubmit(): boolean {
    if (this.submitting || this.validating) return false;

    const validation = this.stepDefinition?.stepConfig?.validation;
    if (validation) {
      const targetField = validation.targetField || validation.type;
      const minRequired = validation.minRequired || 1;
      const tableData = this.model[targetField];
      
      if (Array.isArray(tableData)) {
        return tableData.length >= minRequired;
      } else if (minRequired > 0) {
        return false;
      }
    }

    return true;
  }

  goBack(): void {
    console.log('Send back not implemented');
  }

  cancel(): void {
    if (confirm('Are you sure you want to cancel?')) {
      this.router.navigate(['/']);
    }
  }

  private getCurrentUserEmail(): string {
    return 'user@example.com';
  }
}
