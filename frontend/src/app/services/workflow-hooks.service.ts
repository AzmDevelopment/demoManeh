import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * Dynamic Hook Loader with Workflow Index Pattern
 * 
 * SCALABLE ARCHITECTURE FOR 85+ WORKFLOWS
 * ========================================
 * 
 * Each workflow has an index.ts file that exports:
 * - WORKFLOW_ID: string
 * - ALL_STEPS: Array<{ stepId: string, hooks: object }>
 * 
 * To add a new workflow:
 * 1. Create folder: components/workflow-code/definition/{WorkflowId}/
 * 2. Create step files: {stepId}.ts (export STEP_ID and hooks)
 * 3. Create index.ts in the workflow folder
 * 4. Import the workflow index below and add to WORKFLOW_REGISTRATIONS
 * 
 * Example folder structure:
 * └── workflow-code/
 *     └── definition/
 *         ├── SASO301_Cooker/
 *         │   ├── index.ts
 *         │   ├── saso_test_step1_types.ts
 *         │   ├── saso_test_step2_brands.ts
 *         │   └── saso_test_step3_products.ts
 *         ├── CT401_Battery/
 *         │   ├── index.ts
 *         │   ├── step1_data_entry.ts
 *         │   └── step2_documents.ts
 *         └── ... (85 more workflows)
 */

// ============================================================================
// WORKFLOW REGISTRATIONS - Add new workflow imports here
// ============================================================================

import * as SASO301_Cooker from '../components/workflow-code/definition/SASO301_Cooker';

// Add more workflow imports following the same pattern:
// import * as CT401_Battery from '../components/workflow-code/definition/CT401_Battery';
// import * as IEC_Electronics from '../components/workflow-code/definition/IEC_Electronics';
// ... etc

/**
 * All workflows to register
 * Each workflow module MUST export:
 * - WORKFLOW_ID: string
 * - ALL_STEPS: Array<{ stepId: string, hooks: object }>
 */
const WORKFLOW_REGISTRATIONS = [
  SASO301_Cooker,
  // CT401_Battery,
  // IEC_Electronics,
  // Add more workflows here...
];

/**
 * Service for managing and executing workflow step hooks
 * 
 * Supports 85+ workflows with clean registration pattern
 */
@Injectable({
  providedIn: 'root'
})
export class WorkflowHooksService {
  
  // Dynamic registry: Map<"workflowId/stepId", hooks>
  private hooksRegistry: Map<string, any> = new Map();
  
  // Workflow metadata registry
  private workflowMetadata: Map<string, { name?: string, stepCount: number }> = new Map();

  constructor(private http: HttpClient) {
    this.initializeRegistry();
    console.log('=== WorkflowHooksService INITIALIZED ===');
    console.log(`Registered ${this.workflowMetadata.size} workflows with ${this.hooksRegistry.size} total steps`);
  }

  /**
   * Initialize the hooks registry from all registered workflows
   */
  private initializeRegistry(): void {
    for (const workflow of WORKFLOW_REGISTRATIONS) {
      const workflowId = workflow.WORKFLOW_ID;
      
      if (!workflowId) {
        console.warn('Workflow module is missing WORKFLOW_ID export');
        continue;
      }

      const steps = workflow.ALL_STEPS || [];
      
      if (steps.length === 0) {
        console.warn(`Workflow '${workflowId}' has no steps registered`);
        continue;
      }

      // Register each step
      for (const step of steps) {
        if (!step.stepId || !step.hooks) {
          console.warn(`Invalid step in workflow '${workflowId}':`, step);
          continue;
        }

        const key = `${workflowId}/${step.stepId}`;
        this.hooksRegistry.set(key, step.hooks);
      }

      // Store workflow metadata
      this.workflowMetadata.set(workflowId, {
        name: (workflow as any).WORKFLOW_NAME,
        stepCount: steps.length
      });

      console.log(`Registered workflow: ${workflowId} with ${steps.length} steps`);
    }
  }

  /**
   * Get hooks for a specific step
   * 
   * @param workflowId - The workflow definition ID (e.g., 'SASO301_Cooker')
   * @param stepId - The step ID (e.g., 'saso_test_step2_brands')
   * @returns Hooks object or null if not found
   */
  getHooksForStep(workflowId: string, stepId: string): any {
    const cacheKey = `${workflowId}/${stepId}`;
    
    console.log(`=== WorkflowHooksService.getHooksForStep ===`);
    console.log(`  Looking for: "${cacheKey}"`);
    
    let hooks = this.hooksRegistry.get(cacheKey);
    
    if (hooks) {
      console.log(`  ✅ Found hooks:`, Object.keys(hooks));
      return hooks;
    }
    
    // Try case-insensitive search as fallback
    for (const [key, value] of this.hooksRegistry.entries()) {
      if (key.toLowerCase() === cacheKey.toLowerCase()) {
        console.log(`  ✅ Found hooks (case-insensitive match for ${key}):`, Object.keys(value));
        return value;
      }
    }
    
    console.log(`  ❌ No hooks found for "${cacheKey}"`);
    return null;
  }

  /**
   * Get all registered workflow IDs
   */
  getRegisteredWorkflows(): string[] {
    return Array.from(this.workflowMetadata.keys());
  }

  /**
   * Get all registered steps for a workflow
   */
  getRegisteredSteps(workflowId: string): string[] {
    const steps: string[] = [];
    const prefix = `${workflowId}/`;
    
    for (const key of this.hooksRegistry.keys()) {
      if (key.startsWith(prefix)) {
        steps.push(key.substring(prefix.length));
      }
    }
    return steps;
  }

  /**
   * Get workflow metadata
   */
  getWorkflowMetadata(workflowId: string): { name?: string, stepCount: number } | undefined {
    return this.workflowMetadata.get(workflowId);
  }

  /**
   * Check if hooks exist for a step
   */
  hasHooks(workflowId: string, stepId: string): boolean {
    return this.hooksRegistry.has(`${workflowId}/${stepId}`);
  }

  /**
   * Get total number of registered hooks
   */
  getTotalRegisteredSteps(): number {
    return this.hooksRegistry.size;
  }

  /**
   * Execute a specific hook function
   */
  async executeHook(
    hooks: any, 
    hookName: string, 
    field: any, 
    model: any, 
    formState: any
  ): Promise<void> {
    if (!hooks || !hooks[hookName]) {
      console.log(`WorkflowHooksService: Hook '${hookName}' not found`);
      return;
    }

    try {
      console.log(`WorkflowHooksService: Executing hook '${hookName}'`);
      await hooks[hookName](field, model, formState, this.http);
      console.log(`WorkflowHooksService: Hook '${hookName}' executed successfully`);
    } catch (error) {
      console.error(`WorkflowHooksService: Error executing hook '${hookName}':`, error);
      throw error;
    }
  }

  /**
   * Execute a hook by workflow/step/hook name
   */
  async executeHookByName(
    workflowId: string,
    stepId: string,
    hookName: string,
    field: any,
    model: any,
    formState: any
  ): Promise<void> {
    const hooks = this.getHooksForStep(workflowId, stepId);
    if (hooks) {
      await this.executeHook(hooks, hookName, field, model, formState);
    }
  }

  /**
   * Process all onInit hooks for fields in a step
   */
  async processFieldHooks(
    workflowId: string,
    stepId: string,
    fields: any[],
    model: any,
    formState: any
  ): Promise<void> {
    const hooks = this.getHooksForStep(workflowId, stepId);
    
    if (!hooks) {
      console.log(`WorkflowHooksService: No hooks for ${workflowId}/${stepId}`);
      return;
    }

    for (const field of fields) {
      if (field.hooks?.onInit) {
        await this.executeHook(hooks, field.hooks.onInit, field, model, formState);
      }

      // Process nested fields
      if (field.fieldGroup) {
        await this.processFieldHooks(workflowId, stepId, field.fieldGroup, model, formState);
      }
      if (field.fieldArray?.fieldGroup) {
        await this.processFieldHooks(workflowId, stepId, field.fieldArray.fieldGroup, model, formState);
      }
    }
  }

  /**
   * Get HttpClient instance (for use in hook functions)
   */
  getHttpClient(): HttpClient {
    return this.http;
  }
}
