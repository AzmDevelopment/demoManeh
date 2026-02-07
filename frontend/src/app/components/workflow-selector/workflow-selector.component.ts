import { Component, inject, signal, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { JsonFormComponent, FormFieldDefinition } from '../json-form/json-form.component';
import { WorkflowHooksService } from '../../services/workflow-hooks.service';

export interface WorkflowDefinition {
  certificationId: string;
  name: string;
  description: string;
  version: string;
  metadata?: {
    workflowCode?: string;
    applicableCertificateTypes?: string[];
    estimatedTotalDurationDays?: number;
    complexity?: string;
    requiresFactoryVisit?: boolean;
  };
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  stepRef?: string;
  stepId?: string;
  name?: string;
  overrides?: {
    nextStep: string;
  };
}

export interface CustomAction {
  label: string;
  hookName: string;
  buttonClass?: string;
  validateHook?: string;
}

export interface StepDefinition {
  stepId: string;
  name: string;
  actor: string;
  description: string;
  // Legacy fields format
  fields?: any[];
  // JSON Forms format
  schema?: any;
  uischema?: any;
  hooks?: {
    onInit?: string[];
    onChange?: Record<string, string>;
  };
  customActions?: CustomAction[];
  stepConfig: {
    canSendBack: boolean;
    estimatedDurationHours: number;
    nextStep: string;
    isMandatory?: boolean;
    validation?: {
      type: string;
      minRequired?: number;
      message?: string;
    };
  };
}

@Component({
  selector: 'app-workflow-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, JsonFormComponent],
  templateUrl: './workflow-selector.component.html',
  styleUrl: './workflow-selector.component.css'
})
export class WorkflowSelectorComponent implements OnInit {
  @ViewChild(JsonFormComponent) jsonFormComponent!: JsonFormComponent;
  
  private http = inject(HttpClient);
  private workflowHooksService = inject(WorkflowHooksService);
  private cdr = inject(ChangeDetectorRef);

  // Backend API base URL
  private apiUrl = '/api/Workflow';

  workflows = signal<WorkflowDefinition[]>([]);
  selectedWorkflow = signal<WorkflowDefinition | null>(null);
  currentStep = signal<StepDefinition | null>(null);
  currentStepIndex = signal<number>(0);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Form state
  model: Record<string, any> = {};
  fields = signal<any[]>([]);
  
  // JSON Forms state
  schema = signal<any>(null);
  uischema = signal<any>(null);

  // Store form data for each step
  stepFormData: Record<string, any> = {};

  // Store loaded hooks for current step
  private stepHooks: any = null;

  ngOnInit(): void {
    this.loadWorkflowDefinitions();
  }

  /**
   * Load workflow definitions from backend API
   */
  loadWorkflowDefinitions(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<WorkflowDefinition[]>(`${this.apiUrl}/definitions`).subscribe({
      next: (definitions: WorkflowDefinition[]) => {
        console.log('Loaded workflow definitions from API:', definitions);
        this.workflows.set(definitions);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading workflow definitions from API:', err);
        this.error.set('Failed to load workflow definitions. Please ensure the backend is running.');
        this.loading.set(false);
      }
    });
  }

  startWorkflow(workflow: WorkflowDefinition): void {
    this.selectedWorkflow.set(workflow);
    this.currentStepIndex.set(0);
    this.stepFormData = {};
    this.loadFirstStep(workflow);
  }

  /**
   * Load first step definition from backend API
   */
  private loadFirstStep(workflow: WorkflowDefinition): void {
    const firstStep = workflow.steps[0];
    
    if (firstStep.stepRef) {
      this.loading.set(true);
      
      this.http.get<StepDefinition>(`${this.apiUrl}/steps/${encodeURIComponent(firstStep.stepRef)}`).subscribe({
        next: async (stepDef: StepDefinition) => {
          await this.setCurrentStep(stepDef);
          this.loading.set(false);
        },
        error: (err: any) => {
          console.error('Error loading step definition from API:', err);
          this.error.set('Failed to load step definition');
          this.loading.set(false);
        }
      });
    }
  }

  private async setCurrentStep(stepDef: StepDefinition): Promise<void> {
    console.log('=== SET CURRENT STEP ===');
    console.log('Step definition received from API:', JSON.stringify(stepDef, null, 2));

    this.currentStep.set(stepDef);

    // Load saved data for this step if exists, otherwise empty model
    this.model = this.stepFormData[stepDef.stepId] || {};

    // Check if step uses JSON Forms format (schema/uischema) or legacy format (fields)
    if (stepDef.schema) {
      console.log('Using JSON Forms schema/uischema format');

      // Don't set schema yet if there are onInit hooks - let them run first
      if (stepDef.hooks?.onInit && stepDef.hooks.onInit.length > 0) {
        console.log('Delaying schema initialization until after onInit hooks execute');
        this.schema.set(null);
        this.uischema.set(null);
        this.fields.set([]);

        // Execute hooks first
        await this.loadAndExecuteHooks(stepDef);

        // Now set the schema after hooks have modified it
        console.log('Setting schema after hooks execution');
        this.schema.set(stepDef.schema);
        this.uischema.set(stepDef.uischema || null);
      } else {
        // No hooks, set schema immediately
        this.schema.set(stepDef.schema);
        this.uischema.set(stepDef.uischema || null);
        this.fields.set([]);
      }
    } else if (stepDef.fields) {
      console.log('Using legacy fields format');
      this.schema.set(null);
      this.uischema.set(null);
      const convertedFields = this.convertFields(stepDef.fields);
      this.fields.set([...convertedFields]);

      // Execute hooks after fields are set
      await this.loadAndExecuteHooks(stepDef);
    }

    // Force change detection
    this.cdr.detectChanges();
  }

  /**
   * Convert JSON fields to FormFieldDefinition format
   */
  private convertFields(jsonFields: any[]): FormFieldDefinition[] {
    return jsonFields.map(field => {
      // Deep copy templateOptions to ensure all nested properties are preserved
      const templateOptions = field.templateOptions ? JSON.parse(JSON.stringify(field.templateOptions)) : {};
      
      console.log(`=== Converting field '${field.key}' ===`);
      console.log(`  Type: ${field.type}`);
      console.log(`  Raw templateOptions from API:`, field.templateOptions);
      console.log(`  Deep copied templateOptions:`, templateOptions);
      
      if (field.type === 'table') {
        console.log(`  TABLE FIELD DETECTED!`);
        console.log(`  Raw columns:`, field.templateOptions?.columns);
        console.log(`  Copied columns:`, templateOptions.columns);
      }
      
      const converted: FormFieldDefinition = {
        key: field.key,
        type: field.type,
        defaultValue: field.defaultValue,
        templateOptions: templateOptions,
        hooks: field.hooks,
        showWhen: field.showWhen,
        hideWhen: field.hideWhen,
        validation: field.validation,
        fieldGroup: field.fieldGroup ? this.convertFields(field.fieldGroup) : undefined
      };
      
      console.log(`  Final converted templateOptions:`, converted.templateOptions);
      
      return converted;
    });
  }

  /**
   * Load and execute hooks for the current step
   */
  private async loadAndExecuteHooks(stepDef: StepDefinition): Promise<void> {
    const workflow = this.selectedWorkflow();
    if (!workflow) return;

    const workflowId = workflow.certificationId;
    const stepId = stepDef.stepId;

    console.log(`=== LOADING HOOKS for ${workflowId}/${stepId} ===`);

    this.stepHooks = this.workflowHooksService.getHooksForStep(workflowId, stepId);

    // Expose hooks globally for custom button renderer
    (window as any).__currentStepHooks = this.stepHooks;
    (window as any).__httpClient = this.http;

    if (this.stepHooks) {
      console.log('✅ Hooks loaded:', Object.keys(this.stepHooks));

      // Execute onInit hooks
      if (stepDef.hooks?.onInit) {
        for (const hookName of stepDef.hooks.onInit) {
          if (this.stepHooks[hookName]) {
            console.log(`Executing onInit hook: ${hookName}`);
            try {
              // Pass the schema to the hook so it can modify it
              const fieldProxy = {
                schema: stepDef.schema,
                uischema: stepDef.uischema
              };
              await this.stepHooks[hookName](fieldProxy, this.model, {}, this.http);

              // Schema is modified by reference, no need to update here
              // The schema will be set after all hooks complete
            } catch (error) {
              console.error(`Error executing hook ${hookName}:`, error);
            }
          }
        }
      }
    } else {
      console.log('❌ No hooks found for this step');
    }
  }

  /**
   * Process onInit hooks for fields
   */
  private async processFieldHooks(fields: FormFieldDefinition[]): Promise<void> {
    if (!fields || !this.stepHooks) return;

    for (const field of fields) {
      if (field.hooks?.onInit) {
        const hookName = field.hooks.onInit;
        console.log(`Looking for hook '${hookName}' for field '${field.key}'`);
        
        if (this.stepHooks[hookName]) {
          console.log(`✅ Executing onInit hook '${hookName}' for field '${field.key}'`);
          try {
            // Create a field-like object for the hook
            const fieldProxy = {
              key: field.key,
              props: field.templateOptions
            };
            await this.stepHooks[hookName](fieldProxy, this.model, {}, this.http);
            
            // Update the field's options if they were set
            if (fieldProxy.props?.options) {
              field.templateOptions = field.templateOptions || {};
              field.templateOptions.options = fieldProxy.props.options;
            }
            console.log(`Hook '${hookName}' executed. Options:`, field.templateOptions?.options);
          } catch (error) {
            console.error(`❌ Error executing hook '${hookName}':`, error);
          }
        }
      }

      // Process nested fields
      if (field.fieldGroup) {
        await this.processFieldHooks(field.fieldGroup);
      }
    }
  }

  /**
   * Handle field changes (for onChange hooks)
   */
  onFieldChange(event: { key: string; value: any }): void {
    console.log('onFieldChange called:', event.key, event.value);
    
    const field = this.fields().find(f => f.key === event.key);
    if (field?.hooks?.onChange && this.stepHooks?.[field.hooks.onChange]) {
      console.log(`Executing onChange hook '${field.hooks.onChange}' for field '${event.key}'`);
      
      const fieldProxy = {
        key: field.key,
        props: field.templateOptions
      };
      
      // Execute the hook - this modifies the model directly
      this.stepHooks[field.hooks.onChange](fieldProxy, this.model, {}, this.http);
      
      console.log('Model after onChange hook:', JSON.stringify(this.model));
      
      // IMPORTANT: Create a completely new model object to trigger change detection
      this.model = JSON.parse(JSON.stringify(this.model));
      
      console.log('Model reference replaced, brandTable:', this.model['brandTable']);
      
      // Trigger change detection
      this.cdr.detectChanges();
    }
  }

  /**
   * Handle model updates from the form component
   */
  onModelChange(newModel: Record<string, any>): void {
    // Detect which field changed by comparing old and new model
    const changedFields = Object.keys(newModel).filter(key => {
      return this.model[key] !== newModel[key];
    });

    this.model = newModel;

    // Execute onChange hooks for changed fields (JSON Forms)
    const step = this.currentStep();
    if (step?.hooks?.onChange && this.stepHooks && changedFields.length > 0) {
      for (const fieldKey of changedFields) {
        const hookName = step.hooks.onChange[fieldKey];
        if (hookName && this.stepHooks[hookName]) {
          console.log(`Executing onChange hook '${hookName}' for field '${fieldKey}'`);

          const fieldProxy = {
            schema: step.schema,
            uischema: step.uischema
          };

          // Execute the hook
          this.stepHooks[hookName](fieldProxy, this.model, {}, this.http);

          console.log('Model after onChange hook:', JSON.stringify(this.model));

          // Trigger change detection
          this.cdr.detectChanges();
        }
      }
    }
  }

  private saveCurrentStepData(): void {
    const step = this.currentStep();
    if (step) {
      this.stepFormData[step.stepId] = { ...this.model };
    }
  }

  /**
   * Load next step definition from backend API
   */
  loadNextStep(): void {
    this.saveCurrentStepData();

    const workflow = this.selectedWorkflow();
    const currentIndex = this.currentStepIndex();
    
    if (workflow && currentIndex < workflow.steps.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextStepDef = workflow.steps[nextIndex];
      
      if (nextStepDef.stepRef) {
        this.loading.set(true);
        this.currentStepIndex.set(nextIndex);
        
        this.http.get<StepDefinition>(`${this.apiUrl}/steps/${encodeURIComponent(nextStepDef.stepRef)}`).subscribe({
          next: async (stepDef: StepDefinition) => {
            await this.setCurrentStep(stepDef);
            this.loading.set(false);
          },
          error: (err: any) => {
            console.error('Error loading step definition from API:', err);
            this.error.set('Failed to load step definition');
            this.loading.set(false);
          }
        });
      } else if (nextStepDef.stepId === 'completed') {
        this.currentStep.set(null);
        this.currentStepIndex.set(nextIndex);
        this.fields.set([]);
        console.log('Workflow completed. All form data:', this.stepFormData);
      }
    }
  }

  /**
   * Load previous step definition from backend API
   */
  loadPreviousStep(): void {
    this.saveCurrentStepData();

    const workflow = this.selectedWorkflow();
    const currentIndex = this.currentStepIndex();
    
    if (workflow && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevStepDef = workflow.steps[prevIndex];
      
      if (prevStepDef.stepRef) {
        this.loading.set(true);
        this.currentStepIndex.set(prevIndex);
        
        this.http.get<StepDefinition>(`${this.apiUrl}/steps/${encodeURIComponent(prevStepDef.stepRef)}`).subscribe({
          next: async (stepDef: StepDefinition) => {
            await this.setCurrentStep(stepDef);
            this.loading.set(false);
          },
          error: (err: any) => {
            console.error('Error loading step definition from API:', err);
            this.error.set('Failed to load step definition');
            this.loading.set(false);
          }
        });
      }
    }
  }

  backToWorkflowList(): void {
    this.selectedWorkflow.set(null);
    this.currentStep.set(null);
    this.currentStepIndex.set(0);
    this.error.set(null);
    this.model = {};
    this.fields.set([]);
    this.schema.set(null);
    this.uischema.set(null);
    this.stepFormData = {};
    this.stepHooks = null;
  }

  isLastStep(): boolean {
    const workflow = this.selectedWorkflow();
    const currentIndex = this.currentStepIndex();
    return workflow ? currentIndex >= workflow.steps.length - 2 : false;
  }

  isFirstStep(): boolean {
    return this.currentStepIndex() === 0;
  }

  isFormValid(): boolean {
    // Check table validation from stepConfig
    const step = this.currentStep();
    if (step?.stepConfig?.validation) {
      const validation = step.stepConfig.validation;
      const tableKey = validation.type;
      const minRequired = validation.minRequired || 1;
      const tableData = this.model[tableKey];
      
      if (Array.isArray(tableData)) {
        if (tableData.length < minRequired) {
          return false;
        }
      } else if (minRequired > 0) {
        return false;
      }
    }
    
    // Basic validation - check required fields that are visible
    const requiredFields = this.fields().filter(f => f.templateOptions?.required);
    return requiredFields.every(f => {
      const value = this.model[f.key];
      return value !== undefined && value !== null && value !== '';
    });
  }

  getComplexityClass(complexity: string | undefined): string {
    if (!complexity) return '';
    switch (complexity.toLowerCase()) {
      case 'low': return 'complexity-low';
      case 'medium': return 'complexity-medium';
      case 'high': return 'complexity-high';
      default: return '';
    }
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      this.saveCurrentStepData();
      console.log('Step submitted:', this.model);
      this.loadNextStep();
    }
  }

  /**
   * Execute a custom action (button click)
   */
  executeCustomAction(action: CustomAction): void {
    console.log(`Executing custom action: ${action.hookName}`);

    if (!this.stepHooks || !this.stepHooks[action.hookName]) {
      console.error(`Hook '${action.hookName}' not found`);
      return;
    }

    const step = this.currentStep();
    const fieldProxy = {
      schema: step?.schema,
      uischema: step?.uischema
    };

    // Execute the hook
    const result = this.stepHooks[action.hookName](fieldProxy, this.model, {}, this.http);

    // If hook returns true or is successful, trigger change detection
    if (result !== false) {
      console.log('Custom action executed successfully');
      // Force change detection to update the UI
      this.cdr.detectChanges();
    }
  }

  /**
   * Check if a custom action is enabled
   */
  isCustomActionEnabled(action: CustomAction): boolean {
    // If no validate hook, button is always enabled
    if (!action.validateHook) {
      return true;
    }

    // Check if validate hook exists
    if (!this.stepHooks || !this.stepHooks[action.validateHook]) {
      console.warn(`Validate hook '${action.validateHook}' not found`);
      return true;
    }

    const step = this.currentStep();
    const fieldProxy = {
      schema: step?.schema,
      uischema: step?.uischema
    };

    // Execute validate hook
    try {
      return this.stepHooks[action.validateHook](fieldProxy, this.model, {}, this.http);
    } catch (error) {
      console.error(`Error executing validate hook '${action.validateHook}':`, error);
      return false;
    }
  }
}
