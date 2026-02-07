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
    
    // Set loading state on props (ngx-formly uses props, not templateOptions)
    if (field.props) {
      field.props.loading = true;
    }
    
    // Call the backend API
    const apiUrl = '/api/Types';
    const types = await http.get<CertificationType[]>(apiUrl).toPromise();
    
    console.log('loadTypes: Received types from API:', types);
    
    if (types && Array.isArray(types)) {
      // Map API response to dropdown options format
      const options = types.map(type => ({
        value: type.value,
        label: type.label
      }));

      console.log('loadTypes: Mapped options:', options);

      // Set options on props (ngx-formly uses props, not templateOptions)
      if (field.props) {
        field.props.options = options;
        field.props.loading = false;
      }
      
      console.log(`loadTypes: Successfully loaded ${options.length} types`);
      console.log('loadTypes: field.props.options is now:', field.props?.options);
    } else {
      console.warn('loadTypes: API returned invalid data');
      if (field.props) {
        field.props.loading = false;
        field.props.options = [];
      }
    }
  } catch (error) {
    console.error('loadTypes: Error fetching types from API', error);
    
    if (field.props) {
      field.props.loading = false;
      field.props.options = [];
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
