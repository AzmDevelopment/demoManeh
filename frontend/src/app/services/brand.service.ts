import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BrandAttachment {
  id: string;
  fileName: string;
  fileSize?: number;
  uploadedAt?: string;
}

export interface Brand {
  id: string;
  nameEn: string;
  nameAr: string;
  attachments: BrandAttachment[];
  isNew?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FileUploadResponse {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private apiUrl = '/api/Brand';

  constructor(private http: HttpClient) {}

  /**
   * Get all brands
   */
  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(this.apiUrl);
  }

  /**
   * Get a brand by ID
   */
  getBrand(id: string): Observable<Brand> {
    return this.http.get<Brand>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new brand
   */
  createBrand(brand: Brand): Observable<Brand> {
    return this.http.post<Brand>(this.apiUrl, brand);
  }

  /**
   * Update an existing brand
   */
  updateBrand(id: string, brand: Brand): Observable<Brand> {
    return this.http.put<Brand>(`${this.apiUrl}/${id}`, brand);
  }

  /**
   * Delete a brand
   */
  deleteBrand(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Upload a file for a brand
   */
  uploadFile(file: File): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<FileUploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  /**
   * Upload multiple files for a brand
   */
  uploadFiles(files: File[]): Observable<FileUploadResponse[]> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('files', file, file.name);
    });
    return this.http.post<FileUploadResponse[]>(`${this.apiUrl}/upload-multiple`, formData);
  }

  /**
   * Delete an uploaded file
   */
  deleteFile(fileId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/files/${fileId}`);
  }

  /**
   * Get attachments for a brand
   */
  getBrandAttachments(brandId: string): Observable<BrandAttachment[]> {
    return this.http.get<BrandAttachment[]>(`${this.apiUrl}/${brandId}/attachments`);
  }
}
