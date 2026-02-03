import { FormlyFieldConfig } from '@ngx-formly/core';
import { Brand } from '../form-config.service';

/**
 * Interface for workflow-specific functions
 * Each workflow can implement custom logic for building tables, handling changes, etc.
 */
export interface WorkflowFunctions {
  /**
   * Unique identifier for the workflow
   */
  workflowId: string;

  /**
   * Build custom tables (e.g., brand table, product table)
   */
  buildTables?(
    model: Record<string, any>,
    fields: FormlyFieldConfig[],
    additionalData?: any
  ): void;

  /**
   * Handle model changes (called when form data updates)
   */
  onModelChange?(
    model: Record<string, any>,
    fields: FormlyFieldConfig[],
    additionalData?: any
  ): void;

  /**
   * Custom field change handlers specific to this workflow
   */
  handleFieldChange?(
    fieldKey: string,
    value: any,
    model: Record<string, any>,
    fields: FormlyFieldConfig[]
  ): void;

  /**
   * Custom validation logic
   */
  customValidation?(
    model: Record<string, any>,
    fields: FormlyFieldConfig[]
  ): { valid: boolean; message?: string };

  /**
   * Pre-submit processing
   */
  beforeSubmit?(
    model: Record<string, any>,
    stepIndex: number
  ): Record<string, any>;

  /**
   * Post-submit processing
   */
  afterSubmit?(
    result: any,
    model: Record<string, any>
  ): void;
}

/**
 * Additional data that can be passed to workflow functions
 */
export interface WorkflowFunctionContext {
  loadedBrands?: Brand[];
  currentStepIndex?: number;
  workflowSteps?: any[];
  [key: string]: any;
}
