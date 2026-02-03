import { FormlyFieldConfig } from '@ngx-formly/core';
import { WorkflowFunctions, WorkflowFunctionContext } from '../workflow-function.interface';

/**
 * Workflow-specific functions for CT401 Lithium Battery Certification
 * Handles lithium battery certification logic and validations
 */
export class CT401LithiumBatteryFunctions implements WorkflowFunctions {
  workflowId = 'CT401_lithium_battery_new';

  /**
   * Custom validation for battery certification
   */
  customValidation(
    model: Record<string, any>,
    fields: FormlyFieldConfig[]
  ): { valid: boolean; message?: string } {
    // Example: Validate battery capacity ranges
    if (model['batteryCapacity']) {
      const capacity = parseFloat(model['batteryCapacity']);
      if (capacity <= 0) {
        return {
          valid: false,
          message: 'Battery capacity must be greater than 0'
        };
      }
    }

    return { valid: true };
  }

  /**
   * Pre-submit processing for battery certification
   */
  beforeSubmit(
    model: Record<string, any>,
    stepIndex: number
  ): Record<string, any> {
    // Add any CT401-specific data transformations before submission
    const processedModel = { ...model };

    // Example: Add safety warnings flag for high-capacity batteries
    if (model['batteryCapacity'] && parseFloat(model['batteryCapacity']) > 10000) {
      processedModel['requiresAdditionalSafetyReview'] = true;
    }

    return processedModel;
  }
}

/**
 * Export singleton instance for use in the workflow function handler
 */
export const ct401LithiumBatteryFunctions = new CT401LithiumBatteryFunctions();
