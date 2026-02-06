import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Import hooks directly
import * as saso_test_step2_brands_hooks from '../components/workflow-code/definition/SASO301_Cooker/saso_test_step2_brands';

/**
 * Service for managing and executing workflow step hooks
 * Loads hook files from workflow-code/definition/{workflowId}/{stepId}.ts
 */
@Injectable({
  providedIn: 'root'
})
export class WorkflowHooksService {
  
  // Static registry of all hooks - add new hooks here
  private static readonly HOOKS_REGISTRY: { [key: string]: any } = {
    'SASO301_Cooker/saso_test_step2_brands': saso_test_step2_brands_hooks.hooks
  };

  constructor(private http: HttpClient) {
    console.log('WorkflowHooksService: Initialized with hooks:', Object.keys(WorkflowHooksService.HOOKS_REGISTRY));
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
    
    console.log(`WorkflowHooksService: Looking for hooks: ${cacheKey}`);
    
    const hooks = WorkflowHooksService.HOOKS_REGISTRY[cacheKey];
    
    if (hooks) {
      console.log(`WorkflowHooksService: Found hooks for ${cacheKey}:`, Object.keys(hooks));
      return hooks;
    }
    
    console.log(`WorkflowHooksService: No hooks found for ${cacheKey}`);
    return null;
  }

  /**
   * Execute a specific hook function
   * 
   * @param hooks - The hooks object containing hook functions
   * @param hookName - Name of the hook to execute (e.g., 'loadBrands')
   * @param field - The field configuration
   * @param model - The form model
   * @param formState - The form state object
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
   * Process all onInit hooks for fields in a step
   * 
   * @param workflowId - The workflow definition ID
   * @param stepId - The step ID
   * @param fields - Array of field definitions
   * @param model - The form model
   * @param formState - The form state object
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
      console.log(`WorkflowHooksService: No hooks to process for ${workflowId}/${stepId}`);
      return;
    }

    for (const field of fields) {
      // Check if field has hooks defined
      if (field.hooks) {
        // Execute onInit hook if defined
        if (field.hooks.onInit) {
          await this.executeHook(hooks, field.hooks.onInit, field, model, formState);
        }
      }

      // Process nested fields (fieldGroup, fieldArray)
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
