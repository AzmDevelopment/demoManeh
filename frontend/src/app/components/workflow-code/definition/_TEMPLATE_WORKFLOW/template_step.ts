import { HttpClient } from '@angular/common/http';

/**
 * Template Step Hooks
 * 
 * INSTRUCTIONS:
 * 1. Rename this file to match your step ID (e.g., step1_data_entry.ts)
 * 2. Update STEP_ID below
 * 3. Implement your hook functions
 * 4. Export hooks object with all functions
 * 5. Import in workflow's index.ts
 */

// ============================================================================
// STEP IDENTIFICATION
// ============================================================================

export const STEP_ID = 'template_step';  // Change this to match your step!

// ============================================================================
// INTERFACES
// ============================================================================

// Define your data interfaces here
export interface MyDataItem {
  value: string;
  label: string;
}

// ============================================================================
// HOOK FUNCTIONS
// ============================================================================

/**
 * Load data hook - called on step initialization
 * 
 * @param field - Field/schema configuration object
 * @param model - Form data model
 * @param formState - Form state object
 * @param http - HttpClient for API calls
 */
export async function loadData(
  field: any,
  model: any,
  formState: any,
  http: HttpClient
): Promise<void> {
  try {
    console.log(`${STEP_ID}: Loading data...`);

    // Example: Fetch data from API
    // const apiUrl = '/api/MyData';
    // const data = await http.get<MyDataItem[]>(apiUrl).toPromise();

    // Example: Update schema enum
    // if (field.schema?.properties?.myField) {
    //   field.schema.properties.myField.enum = data.map(d => d.label);
    // }

    // Example: Store data in model for later use
    // model._myData = data;

    console.log(`${STEP_ID}: Data loaded successfully`);
  } catch (error) {
    console.error(`${STEP_ID}: Error loading data`, error);
  }
}

/**
 * Handle field change hook
 * 
 * @param field - Field configuration
 * @param model - Form data model
 */
export function onFieldChange(field: any, model: any): void {
  console.log(`${STEP_ID}: Field changed`, model);
  
  // Example: React to field changes
  // const selectedValue = model.myField;
  // if (selectedValue) {
  //   // Do something with the selected value
  // }
}

/**
 * Custom action hook - for custom buttons
 */
export function customAction(field: any, model: any): boolean {
  console.log(`${STEP_ID}: Custom action executed`);
  
  // Return true for success, false for failure
  return true;
}

/**
 * Validation hook - for custom button validation
 */
export function canExecuteAction(field: any, model: any): boolean {
  // Return true if action can be executed
  return true;
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * All hooks for this step
 * Add all your hook functions here
 */
export const hooks = {
  loadData,
  onFieldChange,
  customAction,
  canExecuteAction,
};

/**
 * Default export for convenient importing
 */
export default {
  stepId: STEP_ID,
  hooks
};
