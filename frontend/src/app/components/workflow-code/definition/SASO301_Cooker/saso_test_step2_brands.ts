import { HttpClient } from '@angular/common/http';

/**
 * Step code for: saso_test_step2_brands
 * 
 * This file lives alongside the step JSON so each step has its own logic.
 * The add-to-table formly type handles adding new brands to the brandTable.
 * This file handles API-driven logic: loading existing brands, selecting them.
 */

/**
 * Brand interface for API response (matches BrandDto from backend)
 */
export interface Brand {
  value: string;
  label: string;
  labelAr: string;
}

/**
 * Brand table row interface
 */
export interface BrandTableRow {
  nameEn: string;
  nameAr: string;
  source: 'Existing' | 'New';
}

/**
 * Load brands from API and populate the selectedBrand dropdown
 * 
 * This hook is called when the step loads (onInit)
 * It fetches brands from the /api/Brands endpoint and populates the dropdown
 */
export async function loadBrands(field: any, model: any, formState: any, http: HttpClient): Promise<void> {
  try {
    console.log('loadBrands: Starting to fetch brands from API...');
    
    // Set loading state on props (ngx-formly uses props, not templateOptions)
    if (field.props) {
      field.props.loading = true;
    }
    
    // Call the backend API
    const apiUrl = '/api/Brands';
    const brands = await http.get<Brand[]>(apiUrl).toPromise();
    
    console.log('loadBrands: Received brands from API:', brands);
    
    if (brands && Array.isArray(brands)) {
      // Map API response to dropdown options format
      const options = brands.map(brand => ({
        value: brand.value,
        label: brand.label,
        labelAr: brand.labelAr
      }));

      console.log('loadBrands: Mapped options:', options);

      // Set options on props (ngx-formly uses props, not templateOptions)
      if (field.props) {
        field.props.options = options;
        field.props.loading = false;
      }
      
      console.log(`loadBrands: Successfully loaded ${options.length} brands`);
      console.log('loadBrands: field.props.options is now:', field.props?.options);
    } else {
      console.warn('loadBrands: API returned invalid data (not an array)');
      if (field.props) {
        field.props.loading = false;
        field.props.options = [];
      }
    }
  } catch (error) {
    console.error('loadBrands: Error fetching brands from API', error);
    
    if (field.props) {
      field.props.loading = false;
      field.props.options = [];
    }
  }
}

/**
 * Handle brand selection change - add existing brand to table
 * 
 * This hook is called when the user selects a brand from the dropdown (onChange)
 * It automatically adds the selected brand to the brandTable
 */
export function onBrandSelected(field: any, model: any): void {
  console.log('onBrandSelected: Brand selected:', model.selectedBrand);
  
  const selectedBrand = model.selectedBrand;
  if (!selectedBrand) {
    console.log('onBrandSelected: No brand selected, skipping');
    return;
  }

  // Get options from props (ngx-formly uses props)
  const options = field.props?.options || [];
  const brandOption = options.find((opt: any) => opt.value === selectedBrand);
  
  console.log('onBrandSelected: Found brand option:', brandOption);
  
  if (brandOption) {
    // Initialize brandTable if it doesn't exist
    if (!model.brandTable) {
      model.brandTable = [];
      console.log('onBrandSelected: Initialized brandTable array');
    }

    // Create the table row
    const row: BrandTableRow = {
      nameEn: brandOption.label,
      nameAr: brandOption.labelAr || brandOption.label,
      source: 'Existing'
    };

    // Check if brand already exists in table (prevent duplicates)
    const exists = model.brandTable.some(
      (existing: BrandTableRow) => existing.nameEn === row.nameEn && existing.nameAr === row.nameAr
    );

    if (!exists) {
      // Add to table
      model.brandTable = [...model.brandTable, row];
      console.log('onBrandSelected: Added brand to table:', row);
      console.log('onBrandSelected: brandTable now has', model.brandTable.length, 'entries');
      
      // Clear the selection after adding (allows adding the same brand again if removed)
      model.selectedBrand = '';
      console.log('onBrandSelected: Cleared selection');
    } else {
      console.warn('onBrandSelected: Brand already exists in table, skipping');
    }
  } else {
    console.error('onBrandSelected: Brand option not found in dropdown options');
  }
}

/**
 * Validate that at least one brand is in the table
 * 
 * This validation is also enforced on the backend via stepConfig.validation.
 * The backend validation ensures data integrity even if frontend validation is bypassed.
 * 
 * @param model The form model containing brandTable
 * @returns Validation result with isValid flag and message
 */
export function validateBrands(model: any): { isValid: boolean; message: string } {
  const hasBrands = model.brandTable && model.brandTable.length > 0;
  
  console.log('validateBrands: Checking validation', {
    hasBrands,
    brandCount: model.brandTable?.length || 0
  });
  
  return {
    isValid: hasBrands,
    message: hasBrands ? '' : 'Please select an existing brand or add a new one before proceeding'
  };
}

export const STEP_ID = 'saso_test_step2_brands';

export const hooks = {
  loadBrands,
  onBrandSelected,
  validateBrands
};

export default {
  stepId: STEP_ID,
  hooks
};
