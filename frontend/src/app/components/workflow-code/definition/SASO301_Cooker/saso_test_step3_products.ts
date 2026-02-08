import { HttpClient } from '@angular/common/http';

/**
 * Step hooks for: saso_test_step3_products
 * 
 * This file contains hooks for the Product Management step.
 * Products are loaded from the backend API.
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
 * Load all products from API and populate the existingProduct dropdown
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
    console.log('loadProducts: Starting to fetch products from API...');

    const apiUrl = '/api/Products';
    const products = await http.get<Product[]>(apiUrl).toPromise();

    console.log('loadProducts: Received products from API:', products);

    if (products && Array.isArray(products)) {
      // Store the full product objects in the model for reference
      model._productsData = products;

      // If field has schema access, update it
      if (field.schema && field.schema.properties && field.schema.properties.existingProduct) {
        // Use labels for enum values so dropdown shows readable names
        const enumLabels = products.map(product => product.label);
        field.schema.properties.existingProduct.enum = enumLabels;
        
        console.log('loadProducts: Updated schema.properties.existingProduct.enum:', enumLabels);
      }

      console.log(`loadProducts: Successfully loaded ${products.length} products`);
    } else {
      console.warn('loadProducts: API returned invalid data');
      if (field.schema && field.schema.properties && field.schema.properties.existingProduct) {
        field.schema.properties.existingProduct.enum = [];
      }
    }
  } catch (error) {
    console.error('loadProducts: Error fetching products from API', error);

    if (field.schema && field.schema.properties && field.schema.properties.existingProduct) {
      field.schema.properties.existingProduct.enum = [];
    }
  }
}

/**
 * Load brands that were selected in step 2 (from model._brandsData or brandTable)
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
    console.log('loadSelectedBrands: Loading brands for new product form...');

    // First try to get brands from API
    const apiUrl = '/api/Brands';
    const brands = await http.get<Brand[]>(apiUrl).toPromise();

    console.log('loadSelectedBrands: Received brands from API:', brands);

    if (brands && Array.isArray(brands)) {
      model._brandsData = brands;

      if (field.schema && field.schema.properties && field.schema.properties.newProductBrandId) {
        const enumLabels = brands.map(brand => brand.label);
        field.schema.properties.newProductBrandId.enum = enumLabels;
        
        console.log('loadSelectedBrands: Updated newProductBrandId enum:', enumLabels);
      }
    }
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
    console.log('loadSectors: Loading sectors for new product form...');

    // Mock sectors data (in real app, this would come from API)
    const sectors: Sector[] = [
      { value: 'sector_001', label: 'Electronics' },
      { value: 'sector_002', label: 'Home Appliances' },
      { value: 'sector_003', label: 'Automotive' },
      { value: 'sector_004', label: 'Industrial' },
      { value: 'sector_005', label: 'Consumer Goods' },
      { value: 'sector_006', label: 'Food & Beverage' }
    ];

    model._sectorsData = sectors;

    if (field.schema && field.schema.properties && field.schema.properties.newProductSectorId) {
      const enumLabels = sectors.map(sector => sector.label);
      field.schema.properties.newProductSectorId.enum = enumLabels;
      
      console.log('loadSectors: Updated newProductSectorId enum:', enumLabels);
    }
  } catch (error) {
    console.error('loadSectors: Error loading sectors', error);
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
    console.log('loadClassifications: Loading classifications for new product form...');

    // Mock classifications data (in real app, this would come from API)
    const classifications: Classification[] = [
      { value: 'class_001', label: 'Class A - High Safety' },
      { value: 'class_002', label: 'Class B - Standard Safety' },
      { value: 'class_003', label: 'Class C - Basic Safety' },
      { value: 'class_004', label: 'Class I - Industrial Grade' },
      { value: 'class_005', label: 'Class II - Commercial Grade' }
    ];

    model._classificationsData = classifications;

    if (field.schema && field.schema.properties && field.schema.properties.newProductClassificationId) {
      const enumLabels = classifications.map(c => c.label);
      field.schema.properties.newProductClassificationId.enum = enumLabels;
      
      console.log('loadClassifications: Updated newProductClassificationId enum:', enumLabels);
    }
  } catch (error) {
    console.error('loadClassifications: Error loading classifications', error);
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
  if (!selectedProductLabel) {
    console.log('onProductSelected: No product selected, skipping');
    return;
  }

  // Get product data from model (stored during loadProducts)
  const productsData = model._productsData || [];
  const productOption = productsData.find((product: Product) => product.label === selectedProductLabel);

  console.log('onProductSelected: Found product option:', productOption);

  if (productOption) {
    // Initialize productTable if it doesn't exist
    if (!model.productTable) {
      model.productTable = [];
      console.log('onProductSelected: Initialized productTable array');
    }

    // Create the table row
    const row: ProductTableRow = {
      brandName: '', // Will be filled if we have brand info
      sectorName: '',
      classificationName: '',
      modelName: productOption.productName,
      modelNumber: productOption.productId,
      source: 'Existing'
    };

    // Check if product already exists in table (prevent duplicates)
    const exists = model.productTable.some(
      (existing: ProductTableRow) => 
        existing.modelName === row.modelName && 
        existing.modelNumber === row.modelNumber
    );

    if (!exists) {
      model.productTable = [...model.productTable, row];
      console.log('onProductSelected: Added product to table:', row);
      console.log('onProductSelected: productTable now has', model.productTable.length, 'entries');

      // Clear the selection
      model.existingProduct = '';
    } else {
      console.warn('onProductSelected: Product already exists in table, skipping');
    }
  } else {
    console.error('onProductSelected: Product option not found in stored product data');
  }
}

/**
 * Save new product to the productTable
 *
 * Custom action hook for "Save Product" button
 */
export function saveNewProduct(field: any, model: any): boolean {
  const brandName = model['newProductBrandId'];
  const sectorName = model['newProductSectorId'];
  const classificationName = model['newProductClassificationId'];
  const modelName = model['newProductModelName'];
  const modelNumber = model['newProductModelNumber'];

  if (!modelName) {
    console.warn('Model name is required');
    alert('Model name is required!');
    return false;
  }

  // Initialize productTable if it doesn't exist
  if (!model['productTable']) {
    model['productTable'] = [];
  }

  // Check for duplicates
  const exists = model['productTable'].some(
    (product: ProductTableRow) => 
      product.modelName === modelName && 
      product.modelNumber === modelNumber
  );

  if (exists) {
    console.warn('Product already exists in table');
    alert('This product already exists in the table!');
    return false;
  }

  // Add new product to table
  const newProduct: ProductTableRow = {
    brandName: brandName || '',
    sectorName: sectorName || '',
    classificationName: classificationName || '',
    modelName: modelName,
    modelNumber: modelNumber || '',
    source: 'New'
  };

  model['productTable'] = [...model['productTable'], newProduct];

  // Clear the input fields
  model['newProductBrandId'] = '';
  model['newProductSectorId'] = '';
  model['newProductClassificationId'] = '';
  model['newProductModelName'] = '';
  model['newProductModelNumber'] = '';
  model['newProductBarcode'] = '';

  console.log('New product added to table:', newProduct);
  return true;
}

/**
 * Check if new product can be saved
 *
 * Validation hook for "Save Product" button
 */
export function canSaveNewProduct(field: any, model: any): boolean {
  const modelName = model['newProductModelName'];
  return !!(modelName && modelName.trim());
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

export default {
  stepId: STEP_ID,
  hooks
};
