import { Injectable, inject } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ExpressionEvaluatorService } from './expression-evaluator.service';

/**
 * Service to convert JSON field definitions to Formly field configurations
 * Handles all field types, validators, expressions, and hooks
 */
@Injectable({
  providedIn: 'root'
})
export class FieldConverterService {
  private expressionEvaluator = inject(ExpressionEvaluatorService);
  private requiredCategories: string[] = [];

  /**
   * Set required categories for validation
   */
  setRequiredCategories(categories: string[]): void {
    this.requiredCategories = categories;
  }

  /**
   * Build Formly fields from a form config
   */
  buildFormlyFields(config: any): FormlyFieldConfig[] {
    return config.fields.map((field: any) => this.convertToFormlyField(field));
  }

  /**
   * Convert a JSON field definition to a Formly field config
   */
  convertToFormlyField(field: any, allFields?: FormlyFieldConfig[]): FormlyFieldConfig {
    // Check if field has inline options defined
    const hasInlineOptions = field.templateOptions.options && field.templateOptions.options.length > 0;

    // Map JSON field types to Formly types
    const formlyType = this.mapFieldType(field.type);

    const formlyField: FormlyFieldConfig = {
      key: field.key,
      type: formlyType,
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

    // Handle field-specific properties
    this.applyFieldTypeProperties(formlyField, field);

    // Handle hideExpression dynamically
    if (field.hideExpression) {
      formlyField.expressions!['hide'] = (fld: FormlyFieldConfig) => {
        return this.expressionEvaluator.evaluateExpression(field.hideExpression, fld.model);
      };
    }

    // Handle expression properties dynamically
    if (field.expressionProperties) {
      for (const [prop, expr] of Object.entries(field.expressionProperties)) {
        const formlyProp = prop.replace('templateOptions.', 'props.');
        formlyField.expressions![formlyProp] = (fld: FormlyFieldConfig) => {
          return this.expressionEvaluator.evaluateExpression(expr as string, fld.model);
        };
      }
    }

    // Handle validators
    this.applyValidators(formlyField, field, allFields);

    // Handle validation messages
    if (field.validation?.messages) {
      formlyField.validation = { messages: field.validation.messages };
    }

    return formlyField;
  }

  /**
   * Map JSON field type to Formly type
   */
  private mapFieldType(type: string): string {
    const typeMap: Record<string, string> = {
      'input': 'input',
      'textarea': 'textarea',
      'select': 'select',
      'radio': 'radio',
      'checkbox': 'checkbox',
      'multicheckbox': 'multicheckbox',
      'file': 'file',
      'date': 'input',
      'button': 'button',
      'repeat': 'repeat',
      'table': 'table',
      'html': 'html'
    };
    return typeMap[type] || 'input';
  }

  /**
   * Apply field-type-specific properties
   */
  private applyFieldTypeProperties(formlyField: FormlyFieldConfig, field: any): void {
    const type = field.type;

    // Input field properties
    if (type === 'input') {
      formlyField.props!.type = field.templateOptions.type || 'text';
      if (field.templateOptions.min !== undefined) formlyField.props!.min = field.templateOptions.min;
      if (field.templateOptions.max !== undefined) formlyField.props!.max = field.templateOptions.max;
      if (field.templateOptions.step !== undefined) formlyField.props!.step = field.templateOptions.step;
      if (field.templateOptions.minLength !== undefined) formlyField.props!.minLength = field.templateOptions.minLength;
      if (field.templateOptions.maxLength !== undefined) formlyField.props!.maxLength = field.templateOptions.maxLength;
      if (field.templateOptions.pattern) formlyField.props!.pattern = field.templateOptions.pattern;
    }

    // Date field properties
    if (type === 'date') {
      formlyField.props!.type = 'date';
    }

    // Textarea properties
    if (type === 'textarea') {
      formlyField.props!.rows = field.templateOptions.rows || 3;
      if (field.templateOptions.cols) formlyField.props!.cols = field.templateOptions.cols;
      if (field.templateOptions.maxLength !== undefined) formlyField.props!.maxLength = field.templateOptions.maxLength;
    }

    // File field properties
    if (type === 'file') {
      formlyField.props!['accept'] = field.templateOptions.accept || '';
      formlyField.props!['multiple'] = field.templateOptions.multiple || false;
      if (field.templateOptions.maxFileSize) {
        formlyField.props!['maxFileSize'] = field.templateOptions.maxFileSize;
      }
    }

    // Radio and multicheckbox properties
    if (type === 'radio' || type === 'multicheckbox') {
      if (field.templateOptions.options) {
        formlyField.props!.options = field.templateOptions.options;
      }
    }

    // Button properties
    if (type === 'button') {
      formlyField.props!['text'] = field.templateOptions.text || field.templateOptions.label;
      formlyField.props!['onClick'] = field.templateOptions.onClick;
    }

    // Repeat (field array) properties
    if (type === 'repeat' && field.fieldArray) {
      formlyField.props!['addText'] = field.templateOptions.addText;
      formlyField.props!['removeText'] = field.templateOptions.removeText;
      formlyField.fieldArray = {
        fieldGroup: field.fieldArray.fieldGroup?.map((f: any) => this.convertToFormlyField(f)) || []
      };
    }

    // Table properties
    if (type === 'table') {
      formlyField.props!['columns'] = field.templateOptions.columns;
      if (field.expressionProperties?.template) {
        formlyField.props!['template'] = field.expressionProperties.template;
      }
    }

    // HTML properties
    if (type === 'html') {
      if (field.expressionProperties?.template) {
        formlyField.props!['template'] = field.expressionProperties.template;
      }
    }
  }

  /**
   * Apply validators to a field
   */
  private applyValidators(
    formlyField: FormlyFieldConfig,
    field: any,
    allFields?: FormlyFieldConfig[]
  ): void {
    if (!field.validators?.validation) return;

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
            const firstFieldValue = fld.model?.[allFields?.[0]?.key as string];
            return !(firstFieldValue && this.requiredCategories.includes(firstFieldValue)) || !!c.value;
          },
          message: field.validation?.messages?.requiredIfCategory || 'This field is required for the selected category'
        };
      }
    });
  }

  /**
   * Create hooks for field changes
   */
  createFieldChangeHook(
    field: any,
    destroy$: Subject<void>,
    changeHandler: (key: string, value: any, hookName: string) => void
  ): any {
    if (!field.hooks?.onChanges) return undefined;

    return {
      onInit: (fld: FormlyFieldConfig) => {
        fld.formControl?.valueChanges
          .pipe(takeUntil(destroy$))
          .subscribe(value => changeHandler(field.key, value, field.hooks.onChanges));
      }
    };
  }
}
