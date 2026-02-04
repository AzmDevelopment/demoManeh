import { Component, inject } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FileUploadService, FileUploadResponse, FileUploadConfig } from '../../services/file-upload.service';

interface UploadedFile {
  id: string;
  fileName: string;
  fileSize?: number;
  uploading?: boolean;
  error?: string;
}

@Component({
  selector: 'formly-field-file',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule],
  template: `
    <div class="mb-3">
      <label *ngIf="props.label" [attr.for]="id" class="form-label">
        {{ props.label }}
        <span *ngIf="props.required" class="text-danger">*</span>
      </label>
      <input
        [id]="id"
        type="file"
        class="form-control"
        [attr.accept]="props['accept']"
        [multiple]="props['multiple']"
        (change)="onFileChange($event)"
        [required]="props.required"
        [disabled]="isUploading"
      />
      <small *ngIf="props['maxFileSize']" class="form-text text-muted">
        Max file size: {{ (props['maxFileSize'] / 1048576).toFixed(2) }} MB
      </small>

      <!-- Uploading indicator -->
      <div *ngIf="isUploading" class="mt-2">
        <div class="d-flex align-items-center text-primary">
          <div class="spinner-border spinner-border-sm me-2" role="status">
            <span class="visually-hidden">Uploading...</span>
          </div>
          <small>Uploading files...</small>
        </div>
      </div>

      <!-- Uploaded files list -->
      <div *ngIf="uploadedFiles.length > 0 && !isUploading" class="mt-2">
        <div class="list-group">
          <div *ngFor="let file of uploadedFiles; let i = index"
               class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2">
            <div class="d-flex align-items-center">
              <i class="bi bi-file-earmark-check text-success me-2"></i>
              <span>{{ file.fileName }}</span>
              <span *ngIf="file.fileSize" class="text-muted ms-2 small">
                ({{ formatFileSize(file.fileSize) }})
              </span>
            </div>
            <button type="button" class="btn btn-outline-danger btn-sm" (click)="removeFile(i)">
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Error message -->
      <div *ngIf="uploadError" class="text-danger mt-1">
        <small><i class="bi bi-exclamation-triangle me-1"></i>{{ uploadError }}</small>
      </div>

      <div *ngIf="showError && formControl.errors" class="text-danger mt-1">
        <small *ngIf="formControl.errors['required']">This field is required</small>
      </div>
    </div>
  `,
})
export class FormlyFieldFile extends FieldType<FieldTypeConfig> {
  private fileUploadService = inject(FileUploadService);

  uploadedFiles: UploadedFile[] = [];
  isUploading = false;
  uploadError: string | null = null;

  override get showError() {
    return this.formControl.invalid && (this.formControl.dirty || this.formControl.touched);
  }

  get uploadConfig(): Partial<FileUploadConfig> {
    return {
      uploadEndpoint: this.props['uploadEndpoint'],
      deleteEndpoint: this.props['deleteEndpoint'],
      uploadMultipleEndpoint: this.props['uploadMultipleEndpoint']
    };
  }

  onFileChange(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    this.uploadError = null;
    this.isUploading = true;

    const fileArray = Array.from(files);

    if (!this.props['multiple']) {
      // Single file upload
      this.uploadSingleFile(fileArray[0]);
    } else {
      // Multiple files upload
      this.uploadMultipleFiles(fileArray);
    }
  }

  private uploadSingleFile(file: File): void {
    this.fileUploadService.uploadFile(file, this.uploadConfig).subscribe({
      next: (response: FileUploadResponse) => {
        this.uploadedFiles = [{
          id: response.id,
          fileName: response.fileName,
          fileSize: response.fileSize
        }];
        this.updateFormControlValue();
        this.isUploading = false;
      },
      error: (err) => {
        console.error('File upload error:', err);
        this.uploadError = 'Failed to upload file. Please try again.';
        this.isUploading = false;
        // Fallback: store file info locally with mock ID
        this.uploadedFiles = [{
          id: 'local_' + Date.now(),
          fileName: file.name,
          fileSize: file.size
        }];
        this.updateFormControlValue();
      }
    });
  }

  private uploadMultipleFiles(files: File[]): void {
    this.fileUploadService.uploadFiles(files, this.uploadConfig).subscribe({
      next: (responses: FileUploadResponse[]) => {
        this.uploadedFiles = [
          ...this.uploadedFiles,
          ...responses.map(r => ({
            id: r.id,
            fileName: r.fileName,
            fileSize: r.fileSize
          }))
        ];
        this.updateFormControlValue();
        this.isUploading = false;
      },
      error: (err) => {
        console.error('File upload error:', err);
        this.uploadError = 'Failed to upload files. Please try again.';
        this.isUploading = false;
        // Fallback: store file info locally with mock IDs
        this.uploadedFiles = [
          ...this.uploadedFiles,
          ...files.map(f => ({
            id: 'local_' + Date.now() + '_' + Math.random().toString(36).slice(2),
            fileName: f.name,
            fileSize: f.size
          }))
        ];
        this.updateFormControlValue();
      }
    });
  }

  removeFile(index: number): void {
    const file = this.uploadedFiles[index];

    // Optionally delete from server (if not a local file)
    if (file.id && !file.id.startsWith('local_')) {
      this.fileUploadService.deleteFile(file.id, this.uploadConfig).subscribe({
        error: (err) => console.error('Failed to delete file:', err)
      });
    }

    this.uploadedFiles.splice(index, 1);
    this.updateFormControlValue();
  }

  private updateFormControlValue(): void {
    // Store the uploaded file metadata (id and fileName) in the form control
    if (this.uploadedFiles.length === 0) {
      this.formControl.setValue(null);
    } else if (!this.props['multiple']) {
      this.formControl.setValue(this.uploadedFiles[0]);
    } else {
      this.formControl.setValue([...this.uploadedFiles]);
    }
    this.formControl.markAsTouched();
    this.formControl.markAsDirty();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
