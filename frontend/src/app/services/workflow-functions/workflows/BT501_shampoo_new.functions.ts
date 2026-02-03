import { FormlyFieldConfig } from '@ngx-formly/core';
import { WorkflowFunctions, WorkflowFunctionContext } from '../workflow-function.interface';

/**
 * Workflow-specific functions for BT501 Shampoo Certification
 * Handles shampoo product certification logic and validations
 */
export class BT501ShampooFunctions implements WorkflowFunctions {
  workflowId = 'BT501_shampoo_new';

  /**
   * Custom validation for shampoo certification
   */
  customValidation(
    model: Record<string, any>,
    fields: FormlyFieldConfig[]
  ): { valid: boolean; message?: string } {
    // Example: Validate pH level if present
    if (model['phLevel']) {
      const ph = parseFloat(model['phLevel']);
      if (ph < 4 || ph > 9) {
        return {
          valid: false,
          message: 'pH level must be between 4 and 9 for shampoo products'
        };
      }
    }

    return { valid: true };
  }

  /**
   * Pre-submit processing for shampoo certification
   */
  beforeSubmit(
    model: Record<string, any>,
    stepIndex: number
  ): Record<string, any> {
    // Add any BT501-specific data transformations before submission
    const processedModel = { ...model };

    // Example: Add timestamp for lab testing step
    if (stepIndex === 1 && model['testResult']) {
      processedModel['testCompletedAt'] = new Date().toISOString();
    }

    return processedModel;
  }
}

/**
 * Export singleton instance for use in the workflow function handler
 */
export const bt501ShampooFunctions = new BT501ShampooFunctions();
