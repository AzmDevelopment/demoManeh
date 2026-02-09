import { HttpClient } from '@angular/common/http';

/**
 * Step hooks for: saso_test_step3_products
 * 
 * This file contains hooks for the Product Management step.
 * Products are loaded from the backend API and filtered by the selected type from step 1.
 */

/**
 * Product interface for API response
 */
export interface Product {
  productId: string;
  productName: string;
  productType: string;
  label: string;
}

/**
 * Product table row interface
 */
export interface ProductTableRow {
  brandName: string;
  sectorName: string;
  classificationName: string;
  modelName: string;
  modelNumber: string;
  source: 'Existing' | 'New';
}

/**
 * Brand interface for dropdown
 */
export interface Brand {
  value: string;
  label: string;
  labelAr: string;
}

/**
 * Sector interface for dropdown
 */
export interface Sector {
  value: string;
  label: string;
}

/**
 * Classification interface for dropdown
 */
export interface Classification {
  value: string;
  label: string;
}

/**
 * Load products from API filtered by the selected type from step 1
 * The selected type is available in model._selectedValues.selectedTypeValue
 *
 * Hook: onInit
 * Called when the step loads
 */
export async function loadProducts(
  field: any,
  model: any,
  formState: any,
  http: HttpClient
): Promise<void> {
  try {
    console.log('=== loadProducts START ===');
    console.log('loadProducts: model._selectedValues:', model._selectedValues);
    console.log('loadProducts: Full model keys:', Object.keys(model));

    // Get the selected type from context (passed from step 1)
    // Try multiple sources for the type value
    let selectedTypeValue = model._selectedValues?.selectedTypeValue;
    let selectedTypeLabel = model._selectedValues?.selectedTypeLabel;
    
    // Also check if selectedType is directly in _selectedValues (the raw dropdown value)
    const selectedTypeRaw = model._selectedValues?.selectedType;
    
    console.log('loadProducts: selectedTypeValue:', selectedTypeValue);
    console.log('loadProducts: selectedTypeLabel:', selectedTypeLabel);
    console.log('loadProducts: selectedTypeRaw:', selectedTypeRaw);

    let apiUrl = '/api/Products';
    let typeCode: string | null = null;

    // Determine the type code from available sources
    if (selectedTypeValue) {
      typeCode = extractTypeCode(selectedTypeValue);
      console.log('loadProducts: Using selectedTypeValue, extracted code:', typeCode);
    } else if (selectedTypeLabel) {
      typeCode = extractTypeCode(selectedTypeLabel);
      console.log('loadProducts: Using selectedTypeLabel, extracted code:', typeCode);
    } else if (selectedTypeRaw) {
      typeCode = extractTypeCode(selectedTypeRaw);
      console.log('loadProducts: Using selectedTypeRaw, extracted code:', typeCode);
    }

    // If we have a type code, filter products
    if (typeCode) {
      apiUrl = `/api/Products/by-type/${encodeURIComponent(typeCode)}`;
      console.log('loadProducts: Filtering by type code:', typeCode);
    } else {
      console.warn('loadProducts: No type filter found, loading ALL products');
    }

    console.log('loadProducts: Calling API:', apiUrl);
    const products = await http.get<Product[]>(apiUrl).toPromise() || [];

    console.log('loadProducts: Received', products.length, 'products from API');
    console.log('loadProducts: Products:', products.map(p => p.label));

    if (products && Array.isArray(products)) {
      // Store the full product objects in the model for reference
      model._productsData = products;

      // If field has schema access, update it
      if (field.schema && field.schema.properties && field.schema.properties.existingProduct) {
        const enumLabels = products.map(product => product.label);
        field.schema.properties.existingProduct.enum = enumLabels;
        
        console.log('loadProducts: Updated existingProduct enum with', enumLabels.length, 'options');
      }

      console.log(`loadProducts: SUCCESS - Loaded ${products.length} products`);
    } else {
      console.warn('loadProducts: API returned invalid data');
      if (field.schema?.properties?.existingProduct) {
        field.schema.properties.existingProduct.enum = [];
      }
    }
    
    console.log('=== loadProducts END ===');
  } catch (error) {
    console.error('loadProducts: Error fetching products from API', error);
    if (field.schema?.properties?.existingProduct) {
      field.schema.properties.existingProduct.enum = [];
    }
  }
}

/**
 * Extract the type code from a type value or label
 * Examples:
 *   "IEC" -> "IEC"
 *   "IEC - Electrical Equipment" -> "IEC"
 *   "SASO - Saudi Standards" -> "SASO"
 *   "QML - Quality Management" -> "QML"
 */
function extractTypeCode(typeValue: string): string | null {
  if (!typeValue) return null;
  
  console.log('extractTypeCode: Input:', typeValue);
  
  // If it contains " - ", extract the first part (the code)
  if (typeValue.includes(' - ')) {
    const code = typeValue.split(' - ')[0].trim();
    console.log('extractTypeCode: Extracted from " - ":', code);
    return code;
  }
  
  // If it contains " (", extract the part before it
  if (typeValue.includes(' (')) {
    const code = typeValue.split(' (')[0].trim();
    console.log('extractTypeCode: Extracted from " (":', code);
    return code;
  }
  
  // Otherwise, return as-is (might already be the code)
  console.log('extractTypeCode: Using as-is:', typeValue.trim());
  return typeValue.trim();
}

/**
 * Load brands that were selected in step 2 (from model._selectedValues.brandTable)
 * These are used for the "Add New Product" form
 *
 * Hook: onInit
 */
export async function loadSelectedBrands(
  field: any,
  model: any,
  formState: any,
  http: HttpClient
): Promise<void> {
  try {
    console.log('=== loadSelectedBrands START ===');
    console.log('loadSelectedBrands: model._selectedValues:', model._selectedValues);

    // First check if we have brands from step 2 context
    const brandsFromContext = model._selectedValues?.brandTable;
    
    if (brandsFromContext && Array.isArray(brandsFromContext) && brandsFromContext.length > 0) {
      console.log('loadSelectedBrands: Using brands from step 2 context:', brandsFromContext);
      
      // Convert brand table rows to dropdown options
      const brandOptions = brandsFromContext.map((brand: any, index: number) => ({
        value: `brand_${index}`,
        label: brand.brandName || brand.name || `Brand ${index + 1}`,
        labelAr: brand.brandNameAr || brand.labelAr || ''
      }));
      
      model._brandsData = brandOptions;

      if (field.schema?.properties?.newProductBrandId) {
        const enumLabels = brandOptions.map((brand: any) => brand.label);
        field.schema.properties.newProductBrandId.enum = enumLabels;
        console.log('loadSelectedBrands: Updated newProductBrandId enum from context:', enumLabels);
      }
      return;
    }

    // Fallback: Load from API
    console.log('loadSelectedBrands: No brands in context, loading from API');
    const apiUrl = '/api/Brands';
    const brands = await http.get<Brand[]>(apiUrl).toPromise();

    if (brands && Array.isArray(brands)) {
      model._brandsData = brands;

      if (field.schema?.properties?.newProductBrandId) {
        const enumLabels = brands.map(brand => brand.label);
        field.schema.properties.newProductBrandId.enum = enumLabels;
        console.log('loadSelectedBrands: Updated newProductBrandId enum from API:', enumLabels);
      }
    }
    
    console.log('=== loadSelectedBrands END ===');
  } catch (error) {
    console.error('loadSelectedBrands: Error loading brands', error);
  }
}

/**
 * Load sectors for the new product form
 *
 * Hook: onInit
 */
export async function loadSectors(
  field: any,
  model: any,
  formState: any,
  http: HttpClient
): Promise<void> {
  try {
    const sectors: Sector[] = [
      { value: 'sector_001', label: 'Electronics' },
      { value: 'sector_002', label: 'Home Appliances' },
      { value: 'sector_003', label: 'Automotive' },
      { value: 'sector_004', label: 'Industrial' },
      { value: 'sector_005', label: 'Consumer Goods' },
      { value: 'sector_006', label: 'Food & Beverage' }
    ];

    model._sectorsData = sectors;

    if (field.schema?.properties?.newProductSectorId) {
      field.schema.properties.newProductSectorId.enum = sectors.map(s => s.label);
    }
  } catch (error) {
    console.error('loadSectors: Error', error);
  }
}

/**
 * Load classifications for the new product form
 *
 * Hook: onInit
 */
export async function loadClassifications(
  field: any,
  model: any,
  formState: any,
  http: HttpClient
): Promise<void> {
  try {
    const classifications: Classification[] = [
      { value: 'class_001', label: 'Class A - High Safety' },
      { value: 'class_002', label: 'Class B - Standard Safety' },
      { value: 'class_003', label: 'Class C - Basic Safety' },
      { value: 'class_004', label: 'Class I - Industrial Grade' },
      { value: 'class_005', label: 'Class II - Commercial Grade' }
    ];

    model._classificationsData = classifications;

    if (field.schema?.properties?.newProductClassificationId) {
      field.schema.properties.newProductClassificationId.enum = classifications.map(c => c.label);
    }
  } catch (error) {
    console.error('loadClassifications: Error', error);
  }
}

/**
 * Handle product selection change - add existing product to table
 *
 * Hook: onChange for existingProduct field
 */
export function onProductSelected(field: any, model: any): void {
  console.log('onProductSelected: Product selected:', model.existingProduct);

  const selectedProductLabel = model.existingProduct;
  if (!selectedProductLabel) return;

  const productsData = model._productsData || [];
  const productOption = productsData.find((product: Product) => product.label === selectedProductLabel);

  if (productOption) {
    if (!model.productTable) model.productTable = [];

    const row: ProductTableRow = {
      brandName: '',
      sectorName: '',
      classificationName: '',
      modelName: productOption.productName,
      modelNumber: productOption.productId,
      source: 'Existing'
    };

    const exists = model.productTable.some(
      (existing: ProductTableRow) => 
        existing.modelName === row.modelName && 
        existing.modelNumber === row.modelNumber
    );

    if (!exists) {
      model.productTable = [...model.productTable, row];
      console.log('onProductSelected: Added product to table:', row);
      model.existingProduct = '';
    }
  }
}

/**
 * Save new product to the productTable
 */
export function saveNewProduct(field: any, model: any): boolean {
  const modelName = model['newProductModelName'];
  if (!modelName) {
    alert('Model name is required!');
    return false;
  }

  if (!model['productTable']) model['productTable'] = [];

  const exists = model['productTable'].some(
    (p: ProductTableRow) => p.modelName === modelName && p.modelNumber === model['newProductModelNumber']
  );

  if (exists) {
    alert('This product already exists!');
    return false;
  }

  model['productTable'] = [...model['productTable'], {
    brandName: model['newProductBrandId'] || '',
    sectorName: model['newProductSectorId'] || '',
    classificationName: model['newProductClassificationId'] || '',
    modelName: modelName,
    modelNumber: model['newProductModelNumber'] || '',
    source: 'New'
  }];

  // Clear inputs
  model['newProductBrandId'] = '';
  model['newProductSectorId'] = '';
  model['newProductClassificationId'] = '';
  model['newProductModelName'] = '';
  model['newProductModelNumber'] = '';
  model['newProductBarcode'] = '';

  return true;
}

export function canSaveNewProduct(field: any, model: any): boolean {
  return !!(model['newProductModelName']?.trim());
}

export const STEP_ID = 'saso_test_step3_products';

export const hooks = {
  loadProducts,
  loadSelectedBrands,
  loadSectors,
  loadClassifications,
  onProductSelected,
  saveNewProduct,
  canSaveNewProduct
};

export default { stepId: STEP_ID, hooks };
