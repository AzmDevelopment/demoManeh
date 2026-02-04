import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, forkJoin, Observable } from 'rxjs';
import { FormConfigService, FormConfig } from '../../services/form-config.service';
import { HttpClient } from '@angular/common/http';

// Import refactored services
import { ExpressionEvaluatorService } from '../../services/workflow-functions/common/expression-evaluator.service';
import { OptionLoaderService } from '../../services/workflow-functions/common/option-loader.service';
import { FieldConverterService } from '../../services/workflow-functions/common/field-converter.service';
import { WorkflowFunctionHandlerService } from '../../services/workflow-functions/workflow-function-handler.service';
import { WorkflowFunctionContext } from '../../services/workflow-functions/workflow-function.interface';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule, FormlyBootstrapModule],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.css'
})
export class DynamicFormComponent implements OnInit, OnDestroy {
  // Injected services
  private formConfigService = inject(FormConfigService);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Refactored services
  private expressionEvaluator = inject(ExpressionEvaluatorService);
  private optionLoader = inject(OptionLoaderService);
  private fieldConverter = inject(FieldConverterService);
  private workflowHandler = inject(WorkflowFunctionHandlerService);

  private destroy$ = new Subject<void>();

  // Form state
  formId: string = 'lithium-battery-local';
  workflowId: string | null = null;
  form = new FormGroup({});
  model: Record<string, any> = {};
  fields: FormlyFieldConfig[] = [];
  formConfig = signal<FormConfig | null>(null);
  isLoading = signal(true);
  showAlert = signal<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  // Workflow properties
  workflowSteps: any[] = [];
  currentStepIndex = signal(0);
  stepFormData: Record<string, any>[] = [];

  ngOnInit(): void {
    // Load required categories for validation
    this.formConfigService.getRequiredProductCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => this.fieldConverter.setRequiredCategories(categories));

    // Subscribe to route params to handle dynamic form loading
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['workflowId']) {
          this.workflowId = params['workflowId'];
          this.resetAndLoadWorkflow();
        } else if (params['formId']) {
          this.formId = params['formId'];
          this.resetAndLoadForm();
        } else {
          this.loadFormConfig();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Navigate back to category selection
  goBack(): void {
    this.router.navigate(['/']);
  }

  /**
   * Reset form state and load new config when category changes
   */
  private resetAndLoadForm(): void {
    this.resetFormState();
    this.loadFormConfig();
  }

  /**
   * Reset form state and load workflow definition
   */
  private resetAndLoadWorkflow(): void {
    this.resetFormState();
    this.workflowSteps = [];
    this.stepFormData = [];
    this.currentStepIndex.set(0);
    this.loadWorkflowConfig();
  }

  /**
   * Reset all form state
   */
  private resetFormState(): void {
    this.form = new FormGroup({});
    this.model = {};
    this.fields = [];
    this.optionLoader.clearCache();
    this.formConfig.set(null);
    this.isLoading.set(true);
    this.showAlert.set(null);
  }

  /**
   * Load form configuration
   */
  private loadFormConfig(): void {
    this.formConfigService.loadFormConfig(this.formId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (config: any) => {
          if (config.steps && Array.isArray(config.steps)) {
            this.loadWorkflowSteps(config);
          } else {
            this.showError('Invalid workflow configuration. Please check the workflow definition.');
          }
        },
        error: (err) => {
          console.error('Failed to load workflow config:', err);
          this.showError('Failed to load workflow configuration. Please refresh the page.');
        }
      });
  }

  /**
   * Load workflow configuration
   */
  private loadWorkflowConfig(): void {
    if (!this.workflowId) return;

    this.formConfigService.loadWorkflowDefinition(this.workflowId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (config: any) => {
          if (config.steps && Array.isArray(config.steps)) {
            this.loadWorkflowSteps(config);
          } else {
            this.showError('Invalid workflow configuration. Please check the workflow definition.');
          }
        },
        error: (err) => {
          console.error('Failed to load workflow config:', err);
          this.showError('Failed to load workflow configuration. Please refresh the page.');
        }
      });
  }

  /**
   * Load all workflow steps
   */
  private loadWorkflowSteps(workflowDef: any): void {
    // Always use certificationId from definition (overrides route param)
    // This ensures we use the correct ID for workflow functions
    if (workflowDef.certificationId) {
      this.workflowId = workflowDef.certificationId;
      console.log('Workflow ID set from definition:', this.workflowId);
    }

    const formSteps = workflowDef.steps.filter((step: any) => step.stepRef);

    if (formSteps.length === 0) {
      this.showError('No form steps found in workflow.');
      return;
    }

    const stepRequests: Observable<any>[] = formSteps.map((step: any) =>
      this.http.get<any>(`assets/forms/${step.stepRef}.json`)
    );

    forkJoin(stepRequests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (steps: any[]) => {
          this.workflowSteps = steps;
          this.stepFormData = new Array(steps.length).fill({}).map(() => ({}));
          this.currentStepIndex.set(0);
          this.loadCurrentWorkflowStep();
          this.isLoading.set(false);
        },
        error: (err: any) => {
          console.error('Failed to load workflow steps:', err);
          this.showError('Failed to load workflow steps. Please check the console.');
        }
      });
  }

  /**
   * Load the current workflow step
   */
  private loadCurrentWorkflowStep(): void {
    const stepIndex = this.currentStepIndex();
    if (stepIndex < 0 || stepIndex >= this.workflowSteps.length) return;

    const stepConfig = this.workflowSteps[stepIndex];
    this.formConfig.set(stepConfig);

    // Build form fields using the field converter service
    this.fields = this.fieldConverter.buildFormlyFields(stepConfig);

    // Add hooks for field changes
    this.addFieldChangeHooks(stepConfig);

    // Load saved data for this step
    this.model = { ...this.stepFormData[stepIndex] };

    // Reset form
    this.form = new FormGroup({});

    // Load initial options using the option loader service
    this.optionLoader.loadInitialOptions(this.fields, stepConfig, this.destroy$);
  }

  /**
   * Add hooks for field changes
   */
  private addFieldChangeHooks(stepConfig: any): void {
    stepConfig.fields.forEach((field: any) => {
      const formlyField = this.fields.find(f => f.key === field.key);
      if (formlyField && field.hooks?.onChanges) {
        formlyField.hooks = this.fieldConverter.createFieldChangeHook(
          field,
          this.destroy$,
          (key, value, hookName) => this.handleFieldChange(key, value, hookName)
        );
      }
    });
  }

  /**
   * Handle field value changes
   */
  private handleFieldChange(fieldKey: string, value: any, hookName: string): void {
    // Get field index to know which fields come after it
    const fieldIndex = this.fields.findIndex(f => f.key === fieldKey);

    // Reset all fields that come after the changed field
    this.fields.forEach((field, index) => {
      if (index > fieldIndex && field.key) {
        delete this.model[field.key as string];
      }
    });

    // Handle category changes (load dependent options)
    if (hookName === 'onCategoryChange' && value) {
      this.optionLoader.loadDependentOptions(fieldKey, value, this.fields, this.destroy$);
    }

    // Call workflow-specific field change handler
    if (this.workflowId) {
      this.workflowHandler.handleFieldChange(
        this.workflowId,
        fieldKey,
        value,
        this.model,
        this.fields
      );
    }
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    this.form.markAllAsTouched();

    if (!this.form.valid) {
      this.showAlert.set({
        type: 'error',
        message: 'Please fill in all required fields correctly before submitting.'
      });
      return;
    }

    // Perform workflow-specific custom validation
    if (this.workflowId) {
      const validation = this.workflowHandler.customValidation(
        this.workflowId,
        this.model,
        this.fields
      );
      if (!validation.valid) {
        this.showAlert.set({ type: 'error', message: validation.message || 'Validation failed' });
        return;
      }
    }

    // Get current step configuration
    const currentStepConfig = this.workflowSteps[this.currentStepIndex()];
    const stepId = currentStepConfig?.stepId;

    // Perform workflow-specific pre-submit processing
    let processedModel = this.cleanModel;
    if (this.workflowId) {
      processedModel = this.workflowHandler.beforeSubmit(
        this.workflowId,
        processedModel,
        this.currentStepIndex()
      );
    }

    // Save current step data
    this.stepFormData[this.currentStepIndex()] = { ...processedModel };

    // Prepare data object with stepId on top
    const stepDataWithId = {
      stepId: stepId,
      ...processedModel
    };

    // Console the data for current step
    console.log('Step Data:', stepDataWithId);

    // Check if this is the last step
    if (this.currentStepIndex() === this.workflowSteps.length - 1) {
      // Final submission
      console.log('Workflow completed! All data:', this.stepFormData);
      this.showAlert.set({
        type: 'success',
        message: 'Workflow completed successfully! Certificate application submitted.'
      });
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 3000);
    } else {
      // Move to next step
      this.currentStepIndex.set(this.currentStepIndex() + 1);
      this.loadCurrentWorkflowStep();
      this.showAlert.set(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Go to previous workflow step
   */
  onPreviousStep(): void {
    if (this.currentStepIndex() > 0) {
      // Save current step data before going back
      this.stepFormData[this.currentStepIndex()] = { ...this.cleanModel };

      this.currentStepIndex.set(this.currentStepIndex() - 1);
      this.loadCurrentWorkflowStep();
      this.showAlert.set(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Dismiss alert message
   */
  dismissAlert(): void {
    this.showAlert.set(null);
  }

  /**
   * Check if all required fields are filled
   */
  get hasRequiredFieldsFilled(): boolean {
    for (const field of this.fields) {
      const key = field.key as string;
      const isRequired = field.props?.required;
      const hideExpr = field.expressions?.['hide'];
      const isHidden = typeof hideExpr === 'function' ? hideExpr(field) : false;

      if (isHidden) continue;
      if (isRequired && !this.model[key]) return false;
    }
    return true;
  }

  /**
   * Get clean model (remove null, undefined, empty values)
   */
  get cleanModel(): Record<string, any> {
    const clean: Record<string, any> = {};
    for (const key in this.model) {
      const value = this.model[key];
      if (value !== null && value !== undefined && value !== '') {
        clean[key] = value;
      }
    }
    return clean;
  }

  /**
   * Handle model changes (called by Formly when model updates)
   */
  onModelChange(model: Record<string, any>): void {
    console.log('Component.onModelChange called with model:', model);
    console.log('Current workflowId:', this.workflowId);
    this.model = model;
    this.triggerWorkflowModelChange();
  }

  /**
   * Trigger workflow model change handlers
   * Extracted to be called from both onModelChange and form.valueChanges subscription
   */
  private triggerWorkflowModelChange(): void {
    if (this.workflowId) {
      const context: WorkflowFunctionContext = {
        loadedBrands: this.optionLoader.getLoadedBrands(),
        currentStepIndex: this.currentStepIndex(),
        workflowSteps: this.workflowSteps
      };

      this.workflowHandler.onModelChange(
        this.workflowId,
        this.model,
        this.fields,
        context
      );
    }
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    this.isLoading.set(false);
    this.showAlert.set({ type: 'error', message });
  }
}
