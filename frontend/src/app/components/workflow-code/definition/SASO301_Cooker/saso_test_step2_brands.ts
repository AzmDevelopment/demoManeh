import { HttpClient } from '@angular/common/http';

/**
 * Brand interface for API response
 */
export interface Brand {
  value: string;
  label: string;
  labelAr: string;
}

/**
 * Load brands from API and populate the selectedBrand dropdown
 * Called on field initialization (onInit hook)
 */
export async function loadBrands(field: any, model: any, formState: any, http: HttpClient): Promise<void> {
  try {
    console.log('loadBrands: Fetching brands from API...');
    
    // Set loading state
    if (field.templateOptions) {
      field.templateOptions.loading = true;
    }
    
    const brands = await http.get<Brand[]>('/api/Brands').toPromise();
    
    if (brands && Array.isArray(brands)) {
      // Map brands to dropdown options
      const options = brands.map(brand => ({
        value: brand.value,
        label: brand.label,
        labelAr: brand.labelAr
      }));

      if (field.templateOptions) {
        field.templateOptions.options = options;
        field.templateOptions.loading = false;
      }
      
      console.log('loadBrands: Loaded', brands.length, 'brands successfully');
    }
  } catch (error) {
    console.error('loadBrands: Error fetching brands', error);
    
    if (field.templateOptions) {
      field.templateOptions.loading = false;
      field.templateOptions.options = [];
    }
  }
}

/**
 * Handle brand selection change event
 */
export function onBrandSelected(field: any, model: any, formState: any): void {
  const selectedBrand = model.selectedBrand;
  
  if (selectedBrand) {
    console.log('onBrandSelected: Brand selected:', selectedBrand);
  }
}

/**
 * Add a brand to the summary table
 */
export function addBrandToTable(field: any, model: any, formState: any): void {
  if (!model.brandTable) {
    model.brandTable = [];
  }

  const brand = formState?.selectedBrandDetails || { 
    label: model.brandNameEn, 
    labelAr: model.brandNameAr 
  };

  model.brandTable.push({
    nameEn: brand.label || brand.brandNameEn,
    nameAr: brand.labelAr || brand.brandNameAr,
    fileCount: 0,
    source: brand.value ? 'Existing' : 'New'
  });
  
  console.log('addBrandToTable: Added brand to table');
}

/**
 * Validate that at least one brand is selected or added
 */
export function validateBrands(field: any, model: any, formState: any): { isValid: boolean; message: string } {
  const hasSelectedBrand = !!model.selectedBrand;
  const hasNewBrands = model.newBrand && model.newBrand.length > 0;
  const hasBrandsInTable = model.brandTable && model.brandTable.length > 0;
  
  const isValid = hasSelectedBrand || hasNewBrands || hasBrandsInTable;
  
  return {
    isValid,
    message: isValid ? '' : 'Please select an existing brand or add a new one'
  };
}

/**
 * Export all hooks as a single object
 * The key names match the hook names used in the step JSON definition
 */
export const hooks = {
  loadBrands,
  onBrandSelected,
  addBrandToTable,
  validateBrands
};

/**
 * Step ID constant
 */
export const STEP_ID = 'saso_test_step2_brands';

/**
 * Export default for convenience
 */
export default {
  stepId: STEP_ID,
  hooks
};
