import { Injectable } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { WorkflowFunctions, WorkflowFunctionContext } from './workflow-function.interface';

// Import all workflow-specific function implementations
import { sasoDemoBrandProductFunctions } from './workflows/SASO_demo_brand_product.functions';
import { sasoTestWorkflowFunctions } from './workflows/saso_test_workflow.functions';
import { bt501ShampooFunctions } from './workflows/BT501_shampoo_new.functions';
import { ct401LithiumBatteryFunctions } from './workflows/CT401_lithium_battery_new.functions';

/**
 * Central handler service for workflow-specific functions
 * Routes function calls to the appropriate workflow implementation
 */
@Injectable({
  providedIn: 'root'
})
export class WorkflowFunctionHandlerService {
  private workflowRegistry: Map<string, WorkflowFunctions> = new Map();

  constructor() {
    this.registerWorkflows();
  }

  /**
   * Register all available workflow function implementations
   */
  private registerWorkflows(): void {
    this.register(sasoDemoBrandProductFunctions);
    this.register(sasoTestWorkflowFunctions);
    this.register(bt501ShampooFunctions);
    this.register(ct401LithiumBatteryFunctions);

    console.log('Registered workflows:', this.getRegisteredWorkflowIds());

    // Additional workflows can be registered here as they're created
    // this.register(newWorkflowFunctions);
  }

  /**
   * Register a workflow function implementation
   */
  private register(workflow: WorkflowFunctions): void {
    this.workflowRegistry.set(workflow.workflowId, workflow);
  }

  /**
   * Get workflow functions for a specific workflow ID
   */
  private getWorkflow(workflowId: string): WorkflowFunctions | undefined {
    return this.workflowRegistry.get(workflowId);
  }

  /**
   * Build tables for a specific workflow
   */
  buildTables(
    workflowId: string,
    model: Record<string, any>,
    fields: FormlyFieldConfig[],
    context?: WorkflowFunctionContext
  ): void {
    const workflow = this.getWorkflow(workflowId);
    if (workflow?.buildTables) {
      workflow.buildTables(model, fields, context);
    }
  }

  /**
   * Handle model changes for a specific workflow
   */
  onModelChange(
    workflowId: string,
    model: Record<string, any>,
    fields: FormlyFieldConfig[],
    context?: WorkflowFunctionContext
  ): void {
    console.log('WorkflowHandler.onModelChange called for:', workflowId);
    const workflow = this.getWorkflow(workflowId);
    if (workflow?.onModelChange) {
      console.log('Calling workflow onModelChange');
      workflow.onModelChange(model, fields, context);
    } else {
      console.warn('No onModelChange handler found for workflow:', workflowId);
    }
  }

  /**
   * Handle field changes for a specific workflow
   */
  handleFieldChange(
    workflowId: string,
    fieldKey: string,
    value: any,
    model: Record<string, any>,
    fields: FormlyFieldConfig[]
  ): void {
    const workflow = this.getWorkflow(workflowId);
    if (workflow?.handleFieldChange) {
      workflow.handleFieldChange(fieldKey, value, model, fields);
    }
  }

  /**
   * Perform custom validation for a specific workflow
   */
  customValidation(
    workflowId: string,
    model: Record<string, any>,
    fields: FormlyFieldConfig[]
  ): { valid: boolean; message?: string } {
    const workflow = this.getWorkflow(workflowId);
    if (workflow?.customValidation) {
      return workflow.customValidation(model, fields);
    }
    return { valid: true };
  }

  /**
   * Pre-submit processing for a specific workflow
   */
  beforeSubmit(
    workflowId: string,
    model: Record<string, any>,
    stepIndex: number
  ): Record<string, any> {
    const workflow = this.getWorkflow(workflowId);
    if (workflow?.beforeSubmit) {
      return workflow.beforeSubmit(model, stepIndex);
    }
    return model;
  }

  /**
   * Post-submit processing for a specific workflow
   */
  afterSubmit(
    workflowId: string,
    result: any,
    model: Record<string, any>
  ): void {
    const workflow = this.getWorkflow(workflowId);
    if (workflow?.afterSubmit) {
      workflow.afterSubmit(result, model);
    }
  }

  /**
   * Check if a workflow has custom functions registered
   */
  hasWorkflowFunctions(workflowId: string): boolean {
    return this.workflowRegistry.has(workflowId);
  }

  /**
   * Get all registered workflow IDs
   */
  getRegisteredWorkflowIds(): string[] {
    return Array.from(this.workflowRegistry.keys());
  }
}
