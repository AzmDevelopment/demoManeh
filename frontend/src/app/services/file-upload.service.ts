import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface FileUploadResponse {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt?: string;
}

export interface FileUploadConfig {
  uploadEndpoint: string;
  deleteEndpoint?: string;
  uploadMultipleEndpoint?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private defaultConfig: FileUploadConfig = {
    uploadEndpoint: '/api/files/upload',
    deleteEndpoint: '/api/files',
    uploadMultipleEndpoint: '/api/files/upload-multiple'
  };

  constructor(private http: HttpClient) {}

  /**
   * Upload a single file
   */
  uploadFile(file: File, config?: Partial<FileUploadConfig>): Observable<FileUploadResponse> {
    const endpoint = config?.uploadEndpoint || this.defaultConfig.uploadEndpoint;
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<FileUploadResponse>(endpoint, formData);
  }

  /**
   * Upload multiple files
   */
  uploadFiles(files: File[], config?: Partial<FileUploadConfig>): Observable<FileUploadResponse[]> {
    const multipleEndpoint = config?.uploadMultipleEndpoint || this.defaultConfig.uploadMultipleEndpoint;
    const singleEndpoint = config?.uploadEndpoint || this.defaultConfig.uploadEndpoint;

    // Try multiple upload endpoint first, fallback to individual uploads
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file, file.name);
    });

    return this.http.post<FileUploadResponse[]>(multipleEndpoint!, formData).pipe(
      catchError(() => {
        // Fallback to individual file uploads if batch endpoint fails
        const uploadObservables = files.map(file => {
          const singleFormData = new FormData();
          singleFormData.append('file', file, file.name);
          return this.http.post<FileUploadResponse>(singleEndpoint, singleFormData);
        });
        return forkJoin(uploadObservables);
      })
    );
  }

  /**
   * Delete an uploaded file
   */
  deleteFile(fileId: string, config?: Partial<FileUploadConfig>): Observable<void> {
    const endpoint = config?.deleteEndpoint || this.defaultConfig.deleteEndpoint;
    return this.http.delete<void>(`${endpoint}/${fileId}`);
  }
}
