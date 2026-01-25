import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

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
      />
      <small *ngIf="props['maxFileSize']" class="form-text text-muted">
        Max file size: {{ (props['maxFileSize'] / 1048576).toFixed(2) }} MB
      </small>
      <div *ngIf="selectedFiles.length > 0" class="mt-2">
        <small class="text-muted">Selected: {{ selectedFiles.join(', ') }}</small>
      </div>
      <div *ngIf="showError && formControl.errors" class="text-danger mt-1">
        <small *ngIf="formControl.errors['required']">This field is required</small>
      </div>
    </div>
  `,
})
export class FormlyFieldFile extends FieldType<FieldTypeConfig> {
  selectedFiles: string[] = [];

  override get showError() {
    return this.formControl.invalid && (this.formControl.dirty || this.formControl.touched);
  }

  onFileChange(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedFiles = Array.from(files).map((file: any) => file.name);

      // For single file, store the file object
      if (!this.props['multiple']) {
        this.formControl.setValue(files[0]);
        this.formControl.markAsTouched();
      } else {
        // For multiple files, store array of file objects
        this.formControl.setValue(Array.from(files));
        this.formControl.markAsTouched();
      }
    } else {
      this.selectedFiles = [];
      this.formControl.setValue(null);
      this.formControl.markAsTouched();
    }
  }
}
