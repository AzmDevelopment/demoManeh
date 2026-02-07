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
      // For JSON Forms, we need to update the schema's enum property
      // The field parameter should have access to the schema

      // Extract just the values for the enum
      const enumValues = types.map(type => type.value);

      // If field has schema access, update it
      if (field.schema && field.schema.properties && field.schema.properties.selectedType) {
        field.schema.properties.selectedType.enum = enumValues;
        console.log('loadTypes: Updated schema.properties.selectedType.enum:', field.schema.properties.selectedType.enum);
        console.log('loadTypes: Full schema:', JSON.stringify(field.schema, null, 2));
      }

      // Also store the full type objects in the model for reference (optional)
      model._typesData = types;

      console.log(`loadTypes: Successfully loaded ${types.length} types`);
      console.log('loadTypes: Enum values:', enumValues);
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
