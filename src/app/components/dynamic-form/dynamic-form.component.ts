import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FormConfigService, FormConfig, FormFieldOption } from '../../services/form-config.service';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule, FormlyBootstrapModule],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.css'
})
export class DynamicFormComponent implements OnInit, OnDestroy {
  private formConfigService = inject(FormConfigService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private requiredCategories: string[] = [];
  private optionsCache: Record<string, Record<string, FormFieldOption[]>> = {};

  formId: string = 'lithium-battery-local';

  form = new FormGroup({});
  model: Record<string, any> = {};
  fields: FormlyFieldConfig[] = [];
  formConfig = signal<FormConfig | null>(null);
  isLoading = signal(true);
  showAlert = signal<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  ngOnInit(): void {
    // Subscribe to route params to handle dynamic form loading
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
    this.form = new FormGroup({});
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
        next: (config) => {
          this.formConfig.set(config);
          this.fields = this.buildFormlyFields(config);
          this.isLoading.set(false);
          this.loadInitialOptions();
        },
        error: (err) => {
          console.error('Failed to load form config:', err);
          this.isLoading.set(false);
          this.showAlert.set({ type: 'error', message: 'Failed to load form configuration. Please refresh the page.' });
        }
      });
  }

  private buildFormlyFields(config: FormConfig): FormlyFieldConfig[] {
    return config.fields.map(field => this.convertToFormlyField(field));
  }

  private convertToFormlyField(field: any): FormlyFieldConfig {
    // Check if field has inline options defined
    const hasInlineOptions = field.templateOptions.options && field.templateOptions.options.length > 0;

    const formlyField: FormlyFieldConfig = {
      key: field.key,
      type: field.type === 'select' ? 'select' : 'input',
      props: {
        label: field.templateOptions.label,
        placeholder: field.templateOptions.placeholder || '',
        required: field.templateOptions.required || false,
        options: hasInlineOptions ? field.templateOptions.options : [],
        disabled: field.templateOptions.disabled || false
      },
      expressions: {},
      validators: {}
    };

    if (field.type === 'input' && field.templateOptions.type) {
      formlyField.props!.type = field.templateOptions.type;
      if (field.templateOptions.min !== undefined) formlyField.props!.min = field.templateOptions.min;
      if (field.templateOptions.step) formlyField.props!.step = field.templateOptions.step;
    }

    // Handle hideExpression dynamically
    if (field.hideExpression) {
      formlyField.expressions!['hide'] = (fld: FormlyFieldConfig) => {
        return this.evaluateExpression(field.hideExpression, fld.model);
      };
    }

    // Handle expression properties dynamically
    if (field.expressionProperties) {
      for (const [prop, expr] of Object.entries(field.expressionProperties)) {
        const formlyProp = prop.replace('templateOptions.', 'props.');
        formlyField.expressions![formlyProp] = (fld: FormlyFieldConfig) => {
          return this.evaluateExpression(expr as string, fld.model);
        };
      }
    }

    // Handle validators
    if (field.validators?.validation) {
      field.validators.validation.forEach((validatorName: string) => {
        if (validatorName === 'positiveNumber') {
          formlyField.validators!['positiveNumber'] = {
            expression: (c: any) => {
              if (!c.value && c.value !== 0) return true;
              const value = parseFloat(c.value);
              return !isNaN(value) && value >= 0;
            },
            message: field.validation?.messages?.positiveNumber || 'Value must be a positive number'
          };
        }
        if (validatorName === 'requiredIfCategory') {
          formlyField.validators!['requiredIfCategory'] = {
            expression: (c: any, fld: FormlyFieldConfig) => {
              const firstFieldValue = fld.model?.[this.fields[0]?.key as string];
              return !(firstFieldValue && this.requiredCategories.includes(firstFieldValue)) || !!c.value;
            },
            message: field.validation?.messages?.requiredIfCategory || 'This field is required for the selected category'
          };
        }
      });
    }

    if (field.validation?.messages) {
      formlyField.validation = { messages: field.validation.messages };
    }

    // Handle hooks from JSON config
    if (field.hooks?.onChanges) {
      formlyField.hooks = {
        onInit: (fld: FormlyFieldConfig) => {
          fld.formControl?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(value => this.handleFieldChange(field.key, value, field.hooks.onChanges));
        }
      };
    }

    return formlyField;
  }

  // Evaluate expression strings from JSON config
  private evaluateExpression(expr: string, model: any): any {
    if (!expr || !model) return false;

    // Handle negation: !model.fieldName
    if (expr.startsWith('!model.')) {
      const fieldName = expr.substring(7);
      return !model[fieldName];
    }

    // Handle inequality: model.field !== 'value'
    const inequalityMatch = expr.match(/model\.(\w+)\s*!==\s*'([^']+)'/);
    if (inequalityMatch) {
      const [, fieldName, value] = inequalityMatch;
      return model[fieldName] !== value;
    }

    // Handle equality: model.field === 'value'
    const equalityMatch = expr.match(/model\.(\w+)\s*===\s*'([^']+)'/);
    if (equalityMatch) {
      const [, fieldName, value] = equalityMatch;
      return model[fieldName] === value;
    }

    // Handle ternary: model.field ? 'value1' : 'value2'
    const ternaryMatch = expr.match(/model\.(\w+)\s*\?\s*'([^']+)'\s*:\s*'([^']+)'/);
    if (ternaryMatch) {
      const [, fieldName, trueValue, falseValue] = ternaryMatch;
      return model[fieldName] ? trueValue : falseValue;
    }

    // Handle array includes: model.field && ['A', 'B'].includes(model.field)
    const includesMatch = expr.match(/model\.(\w+)\s*&&\s*\[([^\]]+)\]\.includes\(model\.\w+\)/);
    if (includesMatch) {
      const [, fieldName, arrayStr] = includesMatch;
      const values = arrayStr.split(',').map(s => s.trim().replace(/'/g, ''));
      return model[fieldName] && values.includes(model[fieldName]);
    }

    return false;
  }

  // Load initial options for select fields based on hooks
  private loadInitialOptions(): void {
    const config = this.formConfig();
    if (!config) return;

    config.fields.forEach(field => {
      if (field.type === 'select') {
        // Load based on onInit hook
        if (field.hooks?.['onInit']) {
          this.loadOptionsForField(field.key, field.hooks['onInit']);
        }
        // Load VAT categories for VAT fields
        if (field.key.toLowerCase().includes('vat')) {
          this.loadVatOptions(field.key);
        }
      }
    });
  }

  private loadOptionsForField(fieldKey: string, hookName: string): void {
    const formlyField = this.fields.find(f => f.key === fieldKey);
    if (!formlyField) return;

    formlyField.props!.placeholder = 'Loading...';

    if (hookName === 'loadLocalCategories') {
      this.formConfigService.getCategories()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (options) => {
            formlyField.props!.options = options;
            formlyField.props!.placeholder = `Select ${formlyField.props!.label?.toLowerCase() || 'option'}`;
          },
          error: () => formlyField.props!.placeholder = 'Failed to load options'
        });
    }
  }

  private loadVatOptions(fieldKey: string): void {
    const formlyField = this.fields.find(f => f.key === fieldKey);
    if (!formlyField) return;

    this.formConfigService.getVatCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(options => formlyField.props!.options = options);
  }

  private handleFieldChange(fieldKey: string, value: any, hookName: string): void {
    // Get field index to know which fields come after it
    const fieldIndex = this.fields.findIndex(f => f.key === fieldKey);

    // Reset all fields that come after the changed field
    this.fields.forEach((field, index) => {
      if (index > fieldIndex && field.key) {
        delete this.model[field.key as string];
      }
    });

    if (hookName === 'onCategoryChange' && value) {
      this.loadDependentOptions(fieldKey, value);
    }
  }

  private loadDependentOptions(parentKey: string, parentValue: string): void {
    // Find fields that depend on the parent field (next select field)
    const parentIndex = this.fields.findIndex(f => f.key === parentKey);
    const dependentField = this.fields.find((f, index) => index > parentIndex && f.type === 'select');

    if (!dependentField) return;

    const cacheKey = `${parentKey}_${parentValue}`;
    if (this.optionsCache[dependentField.key as string]?.[cacheKey]) {
      dependentField.props!.options = this.optionsCache[dependentField.key as string][cacheKey];
      dependentField.props!.disabled = false;
      return;
    }

    dependentField.props!.placeholder = 'Loading...';
    dependentField.props!.disabled = true;
    dependentField.props!.options = [];

    this.formConfigService.getProductsByCategory(parentValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (options) => {
          if (!this.optionsCache[dependentField.key as string]) {
            this.optionsCache[dependentField.key as string] = {};
          }
          this.optionsCache[dependentField.key as string][cacheKey] = options;
          dependentField.props!.options = options;
          dependentField.props!.placeholder = `Select ${dependentField.props!.label?.toLowerCase() || 'option'}`;
          dependentField.props!.disabled = false;
        },
        error: () => {
          dependentField.props!.placeholder = 'Failed to load options';
          dependentField.props!.disabled = false;
        }
      });
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.valid) {
      console.log('Form Data:', this.cleanModel);
      this.showAlert.set({ type: 'success', message: 'Form submitted successfully! Data has been saved.' });
      setTimeout(() => {
        if (this.showAlert()?.type === 'success') this.showAlert.set(null);
      }, 5000);
    } else {
      this.showAlert.set({ type: 'error', message: 'Please fill in all required fields correctly before submitting.' });
    }
  }

  resetForm(): void {
    this.form.reset();
    this.model = {};
    this.showAlert.set(null);

    // Reset all select fields dynamically
    this.fields.forEach((field, index) => {
      if (index > 0 && field.type === 'select') {
        field.props!.options = [];
        field.props!.disabled = true;
        field.props!.placeholder = `Select ${this.fields[0].props?.label?.toLowerCase() || 'option'} first`;
      }
    });
  }

  dismissAlert(): void {
    this.showAlert.set(null);
  }

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
