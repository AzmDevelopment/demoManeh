import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, forkJoin, Observable } from 'rxjs';
import { FormConfigService, FormConfig, FormFieldOption } from '../../services/form-config.service';
import { HttpClient } from '@angular/common/http';
import { JsonFormComponent, FormFieldDefinition } from '../json-form/json-form.component';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, FormsModule, JsonFormComponent],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.css'
})
export class DynamicFormComponent implements OnInit, OnDestroy {
  private formConfigService = inject(FormConfigService);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private requiredCategories: string[] = [];
  private optionsCache: Record<string, Record<string, FormFieldOption[]>> = {};

  formId: string = 'lithium-battery-local';

  model: Record<string, any> = {};
  fields: FormFieldDefinition[] = [];
  formConfig = signal<FormConfig | null>(null);
  isLoading = signal(true);
  showAlert = signal<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  // Workflow properties
  workflowSteps: any[] = [];
  currentStepIndex = signal(0);
  stepFormData: Record<string, any>[] = [];

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['formId']) {
          this.formId = params['formId'];
          this.resetAndLoadForm();
        } else {
          this.loadFormConfig();
        }
      });
  }

  // Reset form state and load new config when category changes
  private resetAndLoadForm(): void {
    // Reset all form state
    this.model = {};
    this.fields = [];
    this.optionsCache = {};
    this.formConfig.set(null);
    this.isLoading.set(true);
    this.showAlert.set(null);

    // Load new form config
    this.loadFormConfig();
  }

  // Navigate back to category selection
  goBack(): void {
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFormConfig(): void {
    this.formConfigService.getRequiredProductCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => this.requiredCategories = categories);

    this.formConfigService.loadFormConfig(this.formId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (config: any) => {
          // Load workflow (all forms are now workflows)
          if (config.steps && Array.isArray(config.steps)) {
            this.loadWorkflowSteps(config);
          } else {
            this.isLoading.set(false);
            this.showAlert.set({ type: 'error', message: 'Invalid workflow configuration.' });
          }
        },
        error: (err) => {
          console.error('Failed to load workflow config:', err);
          this.isLoading.set(false);
          this.showAlert.set({ type: 'error', message: 'Failed to load workflow configuration.' });
        }
      });
  }

  private loadWorkflowSteps(workflowDef: any): void {
    // Filter steps with stepRef (exclude system steps like "completed")
    const formSteps = workflowDef.steps.filter((step: any) => step.stepRef);

    if (formSteps.length === 0) {
      this.isLoading.set(false);
      this.showAlert.set({ type: 'error', message: 'No form steps found in workflow.' });
      return;
    }

    // Load all step configurations
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
          this.isLoading.set(false);
          this.showAlert.set({ type: 'error', message: 'Failed to load workflow steps.' });
        }
      });
  }

  private loadCurrentWorkflowStep(): void {
    const stepIndex = this.currentStepIndex();
    if (stepIndex < 0 || stepIndex >= this.workflowSteps.length) return;

    const stepConfig = this.workflowSteps[stepIndex];
    this.formConfig.set(stepConfig);
    this.fields = this.convertFields(stepConfig.fields || []);
    this.model = { ...this.stepFormData[stepIndex] };
    this.loadInitialOptions();
  }

  private convertFields(jsonFields: any[]): FormFieldDefinition[] {
    return jsonFields.map(field => ({
      key: field.key,
      type: this.mapFieldType(field.type),
      defaultValue: field.defaultValue,
      templateOptions: {
        label: field.templateOptions?.label || '',
        placeholder: field.templateOptions?.placeholder || '',
        required: field.templateOptions?.required || false,
        options: field.templateOptions?.options || [],
        rows: field.templateOptions?.rows,
        accept: field.templateOptions?.accept,
        multiple: field.templateOptions?.multiple,
        type: field.templateOptions?.type,
        min: field.templateOptions?.min,
        max: field.templateOptions?.max,
        maxLength: field.templateOptions?.maxLength,
        columns: field.templateOptions?.columns,
        columnHeaders: field.templateOptions?.columnHeaders,
        emptyMessage: field.templateOptions?.emptyMessage,
        badgeColumns: field.templateOptions?.badgeColumns,
        allowDelete: field.templateOptions?.allowDelete,
        addText: field.templateOptions?.addText,
        saveText: field.templateOptions?.saveText,
        cancelText: field.templateOptions?.cancelText,
        targetTableKey: field.templateOptions?.targetTableKey,
        fieldMapping: field.templateOptions?.fieldMapping,
        defaults: field.templateOptions?.defaults
      },
      hooks: field.hooks,
      showWhen: field.showWhen,
      hideWhen: field.hideWhen,
      validation: field.validation,
      fieldGroup: field.fieldGroup ? this.convertFields(field.fieldGroup) : undefined
    }));
  }

  private mapFieldType(type: string): string {
    switch (type) {
      case 'multicheckbox':
        return 'select';
      case 'date':
        return 'input';
      default:
        return type || 'input';
    }
  }

  private loadInitialOptions(): void {
    const config = this.formConfig();
    if (!config) return;

    config.fields.forEach((field: any) => {
      if (field.type === 'select' && field.hooks?.['onInit']) {
        this.loadOptionsForField(field.key, field.hooks['onInit']);
      }
    });
  }

  private loadOptionsForField(fieldKey: string, hookName: string): void {
    const field = this.fields.find(f => f.key === fieldKey);
    if (!field) return;

    if (hookName === 'loadLocalCategories' || hookName === 'loadBatteryCategories') {
      this.formConfigService.getCategories()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (options) => {
            field.templateOptions = field.templateOptions || {};
            field.templateOptions.options = options;
          },
          error: () => {
            console.error('Failed to load options for', fieldKey);
          }
        });
    }
  }

  onFieldChange(event: { key: string; value: any }): void {
    const config = this.formConfig();
    if (!config) return;

    const fieldConfig = config.fields.find((f: any) => f.key === event.key);
    if (fieldConfig?.hooks?.['onChanges'] === 'onCategoryChange' && event.value) {
      this.loadDependentOptions(event.key, event.value);
    }
  }

  onModelChange(newModel: Record<string, any>): void {
    this.model = newModel;
  }

  private loadDependentOptions(parentKey: string, parentValue: string): void {
    const parentIndex = this.fields.findIndex(f => f.key === parentKey);
    const dependentField = this.fields.find((f, index) => index > parentIndex && f.type === 'select');

    if (!dependentField) return;

    const cacheKey = `${parentKey}_${parentValue}`;
    if (this.optionsCache[dependentField.key]?.[cacheKey]) {
      dependentField.templateOptions = dependentField.templateOptions || {};
      dependentField.templateOptions.options = this.optionsCache[dependentField.key][cacheKey];
      return;
    }

    this.formConfigService.getProductsByCategory(parentValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (options) => {
          if (!this.optionsCache[dependentField.key]) {
            this.optionsCache[dependentField.key] = {};
          }
          this.optionsCache[dependentField.key][cacheKey] = options;
          dependentField.templateOptions = dependentField.templateOptions || {};
          dependentField.templateOptions.options = options;
        },
        error: () => {
          console.error('Failed to load dependent options');
        }
      });
  }

  onSubmit(): void {
    if (!this.hasRequiredFieldsFilled) {
      this.showAlert.set({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    const currentStepConfig = this.workflowSteps[this.currentStepIndex()];
    const stepId = currentStepConfig?.stepId;

    this.stepFormData[this.currentStepIndex()] = { ...this.cleanModel };

    const stepDataWithId = {
      stepId: stepId,
      ...this.cleanModel
    };

    console.log('Step Data:', stepDataWithId);

    if (this.currentStepIndex() === this.workflowSteps.length - 1) {
      console.log('Workflow completed! All data:', this.stepFormData);
      this.showAlert.set({ type: 'success', message: 'Workflow completed successfully!' });
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 3000);
    } else {
      this.currentStepIndex.set(this.currentStepIndex() + 1);
      this.loadCurrentWorkflowStep();
      this.showAlert.set(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onPreviousStep(): void {
    if (this.currentStepIndex() > 0) {
      this.stepFormData[this.currentStepIndex()] = { ...this.cleanModel };
      this.currentStepIndex.set(this.currentStepIndex() - 1);
      this.loadCurrentWorkflowStep();
      this.showAlert.set(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  dismissAlert(): void {
    this.showAlert.set(null);
  }

  get hasRequiredFieldsFilled(): boolean {
    for (const field of this.fields) {
      if (field.templateOptions?.required && !this.model[field.key]) {
        return false;
      }
    }
    return true;
  }

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
}
