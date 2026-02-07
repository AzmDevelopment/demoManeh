import { Component, OnInit, ChangeDetectorRef, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { WorkflowService } from '../../services/workflow.service';
import { WorkflowHooksService } from '../../services/workflow-hooks.service';

@Component({
  selector: 'app-workflow-step',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink,
    FormlyModule,
    FormlyBootstrapModule
  ],
  providers: [WorkflowService, WorkflowHooksService],
  templateUrl: './workflow-step.component.html',
  styleUrls: ['./workflow-step.component.css']
})
export class WorkflowStepComponent implements OnInit {
  instanceId: string = '';
  stepId: string = '';

  instance: any = null;
  stepDefinition: any = null;
  currentData: any = {};

  // Formly configuration
  form = new FormGroup({});
  model: any = {};
  fields: FormlyFieldConfig[] = [];

  loading = true;
  submitting = false;
  validating = false;
  error: string | null = null;
  validationErrors: any[] = [];

  // Store uploaded files
  uploadedFiles: Map<string, File[]> = new Map();

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

      // Build formly fields from step definition
      this.fields = this.buildFormlyFields(this.stepDefinition.fields || []);

      // Load and execute hooks
      await this.loadAndExecuteHooks();

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
   * Build FormlyFieldConfig array from JSON step definition
   */
  private buildFormlyFields(jsonFields: any[]): FormlyFieldConfig[] {
    return jsonFields.map(field => this.convertToFormlyField(field));
  }

  /**
   * Convert a single JSON field to FormlyFieldConfig
   */
  private convertToFormlyField(field: any): FormlyFieldConfig {
    const formlyField: FormlyFieldConfig = {
      key: field.key,
      type: field.type,
      props: {
        label: field.templateOptions?.label || '',
        placeholder: field.templateOptions?.placeholder || '',
        required: field.templateOptions?.required || false,
        options: field.templateOptions?.options || [],
        // Pass through all templateOptions
        ...field.templateOptions
      },
      fieldGroup: field.fieldGroup ? this.buildFormlyFields(field.fieldGroup) : undefined,
      fieldArray: field.fieldArray ? {
        fieldGroup: field.fieldArray.fieldGroup ? this.buildFormlyFields(field.fieldArray.fieldGroup) : undefined
      } : undefined
    };

    // Store hooks reference for later execution
    if (field.hooks) {
      (formlyField as any)._hooks = field.hooks;
      console.log(`Field '${field.key}' has hooks configured:`, field.hooks);
    }

    // Handle hide expressions
    if (field.hideExpression) {
      formlyField.expressions = {
        hide: field.hideExpression
      };
    }

    return formlyField;
  }

  /**
   * Load hooks and execute onInit hooks for fields
   */
  private async loadAndExecuteHooks(): Promise<void> {
    const workflowId = this.instance?.definitionId;
    const stepId = this.stepDefinition?.stepId;

    console.log('=== LOAD AND EXECUTE HOOKS ===');
    console.log('  workflowId:', workflowId);
    console.log('  stepId:', stepId);
    console.log('  fields count:', this.fields?.length);
    console.log('  stepDefinition.fields:', this.stepDefinition?.fields);

    if (!workflowId || !stepId) {
      console.log('❌ Cannot load hooks: missing workflowId or stepId');
      return;
    }

    console.log(`Looking up hooks for: ${workflowId}/${stepId}`);

    this.stepHooks = this.workflowHooksService.getHooksForStep(workflowId, stepId);

    if (this.stepHooks) {
      console.log('✅ Hooks loaded:', Object.keys(this.stepHooks));
      
      // Debug: Log all fields and their _hooks
      this.fields.forEach(f => {
        console.log(`  Field '${f.key}' _hooks:`, (f as any)._hooks);
      });
      
      await this.processFieldHooks(this.fields);
      this.cdr.detectChanges();
    } else {
      console.log('❌ No hooks found for this step');
    }
  }

  /**
   * Process onInit hooks for fields recursively
   */
  private async processFieldHooks(fields: FormlyFieldConfig[]): Promise<void> {
    if (!fields || !this.stepHooks) {
      console.log('processFieldHooks: No fields or stepHooks');
      return;
    }

    for (const field of fields) {
      const fieldHooks = (field as any)._hooks;
      
      console.log(`Processing field '${field.key}':`, {
        hasHooks: !!fieldHooks,
        hooks: fieldHooks,
        availableStepHooks: Object.keys(this.stepHooks)
      });
      
      if (fieldHooks?.onInit) {
        const hookName = fieldHooks.onInit;
        console.log(`  Looking for hook function '${hookName}'`);
        
        if (this.stepHooks[hookName]) {
          console.log(`  ✅ Executing onInit hook '${hookName}' for field '${field.key}'`);
          try {
            await this.stepHooks[hookName](field, this.model, {}, this.http);
            console.log(`  Hook '${hookName}' executed. Options now:`, field.props?.options);
          } catch (error) {
            console.error(`  ❌ Error executing hook '${hookName}':`, error);
          }
        } else {
          console.log(`  ❌ Hook function '${hookName}' not found in stepHooks`);
        }
      }

      // Setup onChange hooks
      if (fieldHooks?.onChange && this.stepHooks[fieldHooks.onChange]) {
        const onChangeHookName = fieldHooks.onChange;
        const originalHooks = field.hooks || {};
        field.hooks = {
          ...originalHooks,
          onInit: (f: FormlyFieldConfig) => {
            f.formControl?.valueChanges.subscribe(value => {
              console.log(`Field '${f.key}' changed to:`, value);
              this.model[f.key as string] = value;
              this.stepHooks[onChangeHookName](f, this.model, {}, this.http);
              this.cdr.detectChanges();
            });
          }
        };
      }

      // Process nested fields
      if (field.fieldGroup) {
        await this.processFieldHooks(field.fieldGroup);
      }
    }
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
   * Check if submit is allowed based on validation config
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
