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
    console.log('loadBrands: field object:', field);

    // Call the backend API
    const apiUrl = '/api/Brands';
    const brands = await http.get<Brand[]>(apiUrl).toPromise();

    console.log('loadBrands: Received brands from API:', brands);

    if (brands && Array.isArray(brands)) {
      // For JSON Forms, we need to update the schema's enum property
      // Extract just the values for the enum
      const enumValues = brands.map(brand => brand.value);

      // Store the brand data in the model for later use (for onChange hook)
      model._brandsData = brands;

      // If field has schema access, update it
      if (field.schema && field.schema.properties && field.schema.properties.selectedBrand) {
        field.schema.properties.selectedBrand.enum = enumValues;
        console.log('loadBrands: Updated schema.properties.selectedBrand.enum:', field.schema.properties.selectedBrand.enum);
        console.log('loadBrands: Full schema:', JSON.stringify(field.schema, null, 2));
      }

      console.log(`loadBrands: Successfully loaded ${brands.length} brands`);
      console.log('loadBrands: Enum values:', enumValues);
    } else {
      console.warn('loadBrands: API returned invalid data (not an array)');
      if (field.schema && field.schema.properties && field.schema.properties.selectedBrand) {
        field.schema.properties.selectedBrand.enum = [];
      }
    }
  } catch (error) {
    console.error('loadBrands: Error fetching brands from API', error);

    if (field.schema && field.schema.properties && field.schema.properties.selectedBrand) {
      field.schema.properties.selectedBrand.enum = [];
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

  // Get brand data from model (stored during loadBrands)
  const brandsData = model._brandsData || [];
  const brandOption = brandsData.find((brand: Brand) => brand.value === selectedBrand);

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
    console.error('onBrandSelected: Brand option not found in stored brand data');
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

/**
 * Save new brand to the brandTable
 *
 * This is a custom action hook that gets called when the user clicks "Save New Brand" button
 */
export function saveNewBrand(field: any, model: any): boolean {
  const nameEn = model['newBrandNameEn'];
  const nameAr = model['newBrandNameAr'];

  if (!nameEn || !nameAr) {
    console.warn('Both English and Arabic brand names are required');
    return false;
  }

  // Initialize brandTable if it doesn't exist
  if (!model['brandTable']) {
    model['brandTable'] = [];
  }

  // Check for duplicates
  const exists = model['brandTable'].some(
    (brand: BrandTableRow) => brand.nameEn === nameEn && brand.nameAr === nameAr
  );

  if (exists) {
    console.warn('Brand already exists in table');
    alert('This brand already exists in the table!');
    return false;
  }

  // Add new brand to table
  const newBrand: BrandTableRow = {
    nameEn: nameEn,
    nameAr: nameAr,
    source: 'New'
  };

  model['brandTable'] = [...model['brandTable'], newBrand];

  // Clear the input fields
  model['newBrandNameEn'] = '';
  model['newBrandNameAr'] = '';

  console.log('New brand added to table:', newBrand);
  return true;
}

/**
 * Check if new brand can be saved
 *
 * This is a validation hook for the "Save New Brand" button
 */
export function canSaveNewBrand(field: any, model: any): boolean {
  const nameEn = model['newBrandNameEn'];
  const nameAr = model['newBrandNameAr'];
  return !!(nameEn && nameAr && nameEn.trim() && nameAr.trim());
}

export const STEP_ID = 'saso_test_step2_brands';

export const hooks = {
  loadBrands,
  onBrandSelected,
  validateBrands,
  saveNewBrand,
  canSaveNewBrand
};

export default {
  stepId: STEP_ID,
  hooks
};
