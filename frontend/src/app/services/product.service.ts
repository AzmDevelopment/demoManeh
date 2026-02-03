import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Sector {
  id: string;
  name: string;
  nameAr: string;
}

export interface Classification {
  id: string;
  name: string;
  nameAr: string;
  measurements?: Measurement[];
  models?: Model[];
}

export interface Measurement {
  id: string;
  name: string;
  unit: string;
}

export interface Model {
  id: string;
  name: string;
  modelNumber: string;
  barcode: string;
  classificationId: string;
  classificationName?: string;
  measurements?: Measurement[];
}

export interface Product {
  id: string;
  brandId: string;
  brandName?: string;
  sectorId: string;
  sectorName?: string;
  typeId: string;
  classifications: Classification[];
  models: Model[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductType {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  description: string;
  descriptionAr: string;
  workflowDefinition: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = '/api/Product';

  constructor(private http: HttpClient) {}

  /**
   * Get all product types
   */
  getProductTypes(): Observable<ProductType[]> {
    return this.http.get<ProductType[]>(`${this.apiUrl}/types`);
  }

  /**
   * Get all sectors
   */
  getSectors(): Observable<Sector[]> {
    return this.http.get<Sector[]>(`${this.apiUrl}/sectors`);
  }

  /**
   * Get sectors by product type
   */
  getSectorsByType(typeId: string): Observable<Sector[]> {
    return this.http.get<Sector[]>(`${this.apiUrl}/types/${typeId}/sectors`);
  }

  /**
   * Get all classifications
   */
  getClassifications(): Observable<Classification[]> {
    return this.http.get<Classification[]>(`${this.apiUrl}/classifications`);
  }

  /**
   * Get classifications by sector
   */
  getClassificationsBySector(sectorId: string): Observable<Classification[]> {
    return this.http.get<Classification[]>(`${this.apiUrl}/sectors/${sectorId}/classifications`);
  }

  /**
   * Get all products
   */
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  /**
   * Get products by type
   */
  getProducts(typeId: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/by-type/${typeId}`);
  }

  /**
   * Get a product by ID
   */
  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new product
   */
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  /**
   * Update an existing product
   */
  updateProduct(id: string, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  /**
   * Delete a product
   */
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Add a classification to a product
   */
  addClassification(productId: string, classification: Classification): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/${productId}/classifications`, classification);
  }

  /**
   * Add a model to a product
   */
  addModel(productId: string, model: Model): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/${productId}/models`, model);
  }

  /**
   * Remove a model from a product
   */
  removeModel(productId: string, modelId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productId}/models/${modelId}`);
  }
}
