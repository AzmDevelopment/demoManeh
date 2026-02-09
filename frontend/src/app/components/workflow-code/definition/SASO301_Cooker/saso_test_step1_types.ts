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

/**
 * Handle type selection change
 * Stores both the value and label in the model for context passing
 *
 * Hook: onChange for selectedType field
 */
export function onTypeSelected(field: any, model: any): void {
  console.log('=== onTypeSelected START ===');
  console.log('onTypeSelected: model.selectedType:', model.selectedType);
  console.log('onTypeSelected: model._typesData:', model._typesData);

  const selectedTypeLabel = model.selectedType;
  if (!selectedTypeLabel) {
    console.log('onTypeSelected: No type selected, clearing context values');
    model.selectedTypeValue = '';
    model.selectedTypeLabel = '';
    return;
  }

  // Get the full type data from stored types
  const typesData = model._typesData || [];
  console.log('onTypeSelected: Looking for type with label:', selectedTypeLabel);
  
  const typeOption = typesData.find((type: CertificationType) => type.label === selectedTypeLabel);
  console.log('onTypeSelected: Found type option:', typeOption);

  if (typeOption) {
    // Store both the value (code) and label for context passing
    model.selectedTypeValue = typeOption.value;
    model.selectedTypeLabel = typeOption.label;
    
    console.log('onTypeSelected: ✅ Set selectedTypeValue:', model.selectedTypeValue);
    console.log('onTypeSelected: ✅ Set selectedTypeLabel:', model.selectedTypeLabel);
  } else {
    // If no match found in _typesData, extract the code from the label
    // Label format is typically "CODE - Description" (e.g., "QML - Quality Management License")
    const extractedCode = extractTypeCodeFromLabel(selectedTypeLabel);
    
    model.selectedTypeValue = extractedCode;
    model.selectedTypeLabel = selectedTypeLabel;
    
    console.log('onTypeSelected: ⚠️ Type not found in _typesData, extracted code:', extractedCode);
    console.log('onTypeSelected: ✅ Set selectedTypeValue:', model.selectedTypeValue);
    console.log('onTypeSelected: ✅ Set selectedTypeLabel:', model.selectedTypeLabel);
  }
  
  console.log('=== onTypeSelected END ===');
  console.log('onTypeSelected: Final model state:', {
    selectedType: model.selectedType,
    selectedTypeValue: model.selectedTypeValue,
    selectedTypeLabel: model.selectedTypeLabel
  });
}

/**
 * Extract the type code from a label like "QML - Quality Management License"
 */
function extractTypeCodeFromLabel(label: string): string {
  if (!label) return '';
  
  // If it contains " - ", extract the first part (the code)
  if (label.includes(' - ')) {
    return label.split(' - ')[0].trim();
  }
  
  // If it contains " (", extract the part before it
  if (label.includes(' (')) {
    return label.split(' (')[0].trim();
  }
  
  // Otherwise, return as-is
  return label.trim();
}

export const STEP_ID = 'saso_test_step1_types';

export const hooks = {
  loadTypes,
  onTypeSelected
};

export default {
  stepId: STEP_ID,
  hooks
};
