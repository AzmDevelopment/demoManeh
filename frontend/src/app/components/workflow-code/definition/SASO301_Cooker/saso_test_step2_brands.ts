import { HttpClient } from '@angular/common/http';

/**
 * Step code for: saso_test_step2_brands
 * 
 * This file lives alongside the step JSON so each step has its own logic.
 * The add-to-table formly type handles adding new brands to the brandTable.
 * This file handles API-driven logic: loading existing brands, selecting them.
 */

/**
 * Brand interface for API response
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
 */
export async function loadBrands(field: any, model: any, formState: any, http: HttpClient): Promise<void> {
  try {
    if (field.templateOptions) {
      field.templateOptions.loading = true;
    }
    
    const brands = await http.get<Brand[]>('/api/Brands').toPromise();
    
    if (brands && Array.isArray(brands)) {
      const options = brands.map(brand => ({
        value: brand.value,
        label: brand.label,
        labelAr: brand.labelAr
      }));

      if (field.templateOptions) {
        field.templateOptions.options = options;
        field.templateOptions.loading = false;
      }
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
 * Handle brand selection change - add existing brand to table
 */
export function onBrandSelected(field: any, model: any): void {
  const selectedBrand = model.selectedBrand;
  if (!selectedBrand) return;

  const options = field.templateOptions?.options || [];
  const brandOption = options.find((opt: any) => opt.value === selectedBrand);
  
  if (brandOption) {
    if (!model.brandTable) {
      model.brandTable = [];
    }

    const row: BrandTableRow = {
      nameEn: brandOption.label,
      nameAr: brandOption.labelAr || brandOption.label,
      source: 'Existing'
    };

    const exists = model.brandTable.some(
      (existing: BrandTableRow) => existing.nameEn === row.nameEn && existing.nameAr === row.nameAr
    );

    if (!exists) {
      model.brandTable = [...model.brandTable, row];
    }
  }
}

/**
 * Validate that at least one brand is in the table
 */
export function validateBrands(model: any): { isValid: boolean; message: string } {
  const hasBrands = model.brandTable && model.brandTable.length > 0;
  return {
    isValid: hasBrands,
    message: hasBrands ? '' : 'Please select an existing brand or add a new one'
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
