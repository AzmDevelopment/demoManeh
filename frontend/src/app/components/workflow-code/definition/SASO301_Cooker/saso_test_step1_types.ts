import { HttpClient } from '@angular/common/http';

/**
 * Step hooks for: saso_test_step1_types
 * 
 * This file contains hooks for the Type Selection step.
 * Types are loaded from the backend API.
 */

/**
 * Type interface for API response
 */
export interface CertificationType {
  value: string;
  label: string;
}

/**
 * Load certification types from API and populate the selectedType dropdown
 *
 * Hook: onInit
 * Called when the step loads
 */
export async function loadTypes(
  field: any,
  model: any,
  formState: any,
  http: HttpClient
): Promise<void> {
  try {
    console.log('loadTypes: Starting to fetch types from API...');
    console.log('loadTypes: field object:', field);

    // Call the backend API
    const apiUrl = '/api/Types';
    const types = await http.get<CertificationType[]>(apiUrl).toPromise();

    console.log('loadTypes: Received types from API:', types);

    if (types && Array.isArray(types)) {
      // Store the full type objects in the model for reference
      model._typesData = types;

      // If field has schema access, update it
      if (field.schema && field.schema.properties && field.schema.properties.selectedType) {
        // For JSON Forms Angular Material, we use enum with the LABEL as the value
        // This way the dropdown shows the label and stores the label
        // We keep the mapping in _typesData for any value-to-label lookups needed
        const enumLabels = types.map(type => type.label);
        
        field.schema.properties.selectedType.enum = enumLabels;
        
        console.log('loadTypes: Updated schema.properties.selectedType.enum:', field.schema.properties.selectedType.enum);
      }

      console.log(`loadTypes: Successfully loaded ${types.length} types`);
    } else {
      console.warn('loadTypes: API returned invalid data');
      if (field.schema && field.schema.properties && field.schema.properties.selectedType) {
        field.schema.properties.selectedType.enum = [];
      }
    }
  } catch (error) {
    console.error('loadTypes: Error fetching types from API', error);

    if (field.schema && field.schema.properties && field.schema.properties.selectedType) {
      field.schema.properties.selectedType.enum = [];
    }
  }
}

export const STEP_ID = 'saso_test_step1_types';

export const hooks = {
  loadTypes
};

export default {
  stepId: STEP_ID,
  hooks
};
