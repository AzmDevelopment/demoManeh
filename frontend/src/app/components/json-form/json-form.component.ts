import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/**
 * Field definition for JSON-driven forms
 */
export interface FormFieldDefinition {
  key: string;
  type: string;
  defaultValue?: any;
  templateOptions?: {
    label?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    options?: Array<{ value: string; label: string }>;
    rows?: number;
    accept?: string;
    multiple?: boolean;
    min?: number;
    max?: number;
    step?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    // Input type (text, number, email, password, date, etc.)
    type?: string;
    // Table specific
    columns?: string[];
    columnHeaders?: Record<string, string>;
    emptyMessage?: string;
    badgeColumns?: Record<string, Record<string, string>>;
    allowDelete?: boolean;
    // Add-to-table specific
    addText?: string;
    saveText?: string;
    cancelText?: string;
    targetTableKey?: string;
    fieldMapping?: Record<string, string>;
    defaults?: Record<string, any>;
  };
  hooks?: {
    onInit?: string;
    onChange?: string;
  };
  fieldGroup?: FormFieldDefinition[];
  // Conditional visibility
  showWhen?: string;
  hideWhen?: string;
  // Validation
  validation?: {
    messages?: Record<string, string>;
  };
}

@Component({
  selector: 'app-json-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="json-form">
      @for (field of fields; track field.key) {
        @if (isFieldVisible(field)) {
          <div class="form-field mb-3" [class.has-error]="fieldErrors[field.key]">
            @switch (field.type) {
              <!-- Text Input -->
              @case ('input') {
                <label [for]="field.key" class="form-label">
                  {{ field.templateOptions?.label }}
                  @if (field.templateOptions?.required) {
                    <span class="text-danger">*</span>
                  }
                </label>
                <input 
                  [id]="field.key"
                  [type]="field.templateOptions?.type || 'text'"
                  class="form-control"
                  [class.is-invalid]="fieldErrors[field.key]"
                  [placeholder]="field.templateOptions?.placeholder || ''"
                  [(ngModel)]="model[field.key]"
                  (ngModelChange)="onFieldChange(field.key, $event)"
                  [required]="field.templateOptions?.required || false"
                  [disabled]="field.templateOptions?.disabled || false"
                  [attr.min]="field.templateOptions?.min"
                  [attr.max]="field.templateOptions?.max"
                  [attr.step]="field.templateOptions?.step"
                  [attr.pattern]="field.templateOptions?.pattern"
                  [attr.minlength]="field.templateOptions?.minLength"
                  [attr.maxlength]="field.templateOptions?.maxLength">
                @if (fieldErrors[field.key]) {
                  <div class="invalid-feedback">{{ fieldErrors[field.key] }}</div>
                }
              }
              
              <!-- Select Dropdown -->
              @case ('select') {
                <label [for]="field.key" class="form-label">
                  {{ field.templateOptions?.label }}
                  @if (field.templateOptions?.required) {
                    <span class="text-danger">*</span>
                  }
                </label>
                <select 
                  [id]="field.key"
                  class="form-select"
                  [class.is-invalid]="fieldErrors[field.key]"
                  [(ngModel)]="model[field.key]"
                  (ngModelChange)="onFieldChange(field.key, $event)"
                  [required]="field.templateOptions?.required || false"
                  [disabled]="field.templateOptions?.disabled || false">
                  <option value="">{{ field.templateOptions?.placeholder || 'Select...' }}</option>
                  @for (opt of getFieldOptions(field); track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
                @if (fieldErrors[field.key]) {
                  <div class="invalid-feedback">{{ fieldErrors[field.key] }}</div>
                }
              }
              
              <!-- Radio Buttons -->
              @case ('radio') {
                <label class="form-label d-block">
                  {{ field.templateOptions?.label }}
                  @if (field.templateOptions?.required) {
                    <span class="text-danger">*</span>
                  }
                </label>
                <div class="radio-group">
                  @for (opt of field.templateOptions?.options || []; track opt.value) {
                    <div class="form-check form-check-inline">
                      <input 
                        class="form-check-input"
                        type="radio"
                        [id]="field.key + '_' + opt.value"
                        [name]="field.key"
                        [value]="opt.value"
                        [(ngModel)]="model[field.key]"
                        (ngModelChange)="onFieldChange(field.key, $event)"
                        [disabled]="field.templateOptions?.disabled || false">
                      <label class="form-check-label" [for]="field.key + '_' + opt.value">
                        {{ opt.label }}
                      </label>
                    </div>
                  }
                </div>
              }
              
              <!-- Checkbox -->
              @case ('checkbox') {
                <div class="form-check">
                  <input 
                    class="form-check-input"
                    type="checkbox"
                    [id]="field.key"
                    [(ngModel)]="model[field.key]"
                    (ngModelChange)="onFieldChange(field.key, $event)"
                    [disabled]="field.templateOptions?.disabled || false">
                  <label class="form-check-label" [for]="field.key">
                    {{ field.templateOptions?.label }}
                    @if (field.templateOptions?.required) {
                      <span class="text-danger">*</span>
                    }
                  </label>
                </div>
              }
              
              <!-- Textarea -->
              @case ('textarea') {
                <label [for]="field.key" class="form-label">
                  {{ field.templateOptions?.label }}
                  @if (field.templateOptions?.required) {
                    <span class="text-danger">*</span>
                  }
                </label>
                <textarea 
                  [id]="field.key"
                  class="form-control"
                  [class.is-invalid]="fieldErrors[field.key]"
                  [placeholder]="field.templateOptions?.placeholder || ''"
                  [rows]="field.templateOptions?.rows || 3"
                  [(ngModel)]="model[field.key]"
                  (ngModelChange)="onFieldChange(field.key, $event)"
                  [required]="field.templateOptions?.required || false"
                  [disabled]="field.templateOptions?.disabled || false"
                  [attr.maxlength]="field.templateOptions?.maxLength">
                </textarea>
                @if (field.templateOptions?.maxLength) {
                  <small class="text-muted">
                    {{ (model[field.key] || '').length }} / {{ field.templateOptions?.maxLength }}
                  </small>
                }
                @if (fieldErrors[field.key]) {
                  <div class="invalid-feedback">{{ fieldErrors[field.key] }}</div>
                }
              }
              
              <!-- Table Display -->
              @case ('table') {
                <label class="form-label">{{ field.templateOptions?.label }}</label>
                <!-- Debug info -->
                <div class="debug-info" style="background: #fffde7; padding: 8px; margin-bottom: 8px; font-size: 12px; border-radius: 4px; border: 1px solid #ffc107;">
                  <div><strong>Table key:</strong> {{ field.key }}</div>
                  <div><strong>Has templateOptions:</strong> {{ !!field.templateOptions }}</div>
                  <div><strong>Columns array:</strong> {{ field.templateOptions?.columns | json }}</div>
                  <div><strong>Columns length:</strong> {{ field.templateOptions?.columns?.length || 0 }}</div>
                  <div><strong>Data length:</strong> {{ model[field.key]?.length || 0 }}</div>
                  <div><strong>Data:</strong> {{ model[field.key] | json }}</div>
                </div>
                <div class="table-responsive">
                  <table class="table table-bordered table-hover">
                    <thead class="table-light">
                      <tr>
                        @for (col of getTableColumns(field); track col) {
                          <th>{{ getColumnHeader(field, col) }}</th>
                        }
                        @if (field.templateOptions?.allowDelete !== false) {
                          <th style="width: 60px;">Actions</th>
                        }
                      </tr>
                    </thead>
                    <tbody>
                      @if (getTableData(field.key).length > 0) {
                        @for (row of getTableData(field.key); track $index) {
                          <tr>
                            @for (col of getTableColumns(field); track col) {
                              <td>
                                @if (field.templateOptions?.badgeColumns?.[col]) {
                                  <span [class]="'badge ' + getBadgeClass(field, col, row[col])">
                                    {{ row[col] }}
                                  </span>
                                } @else {
                                  {{ row[col] }}
                                }
                              </td>
                            }
                            @if (field.templateOptions?.allowDelete !== false) {
                              <td class="text-center">
                                <button type="button" class="btn btn-sm btn-outline-danger" 
                                        (click)="removeTableRow(field.key, $index)" title="Remove">
                                  ✕
                                </button>
                              </td>
                            }
                          </tr>
                        }
                      } @else {
                        <tr>
                          <td [attr.colspan]="getTableColumns(field).length + (field.templateOptions?.allowDelete !== false ? 1 : 0)" 
                              class="text-center text-muted py-4">
                            {{ field.templateOptions?.emptyMessage || 'No data available' }}
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
              
              <!-- Add to Table Form -->
              @case ('add-to-table') {
                <div class="add-to-table">
                  @if (!showAddForm[field.key]) {
                    <button type="button" class="btn btn-outline-primary" (click)="openAddForm(field)">
                      {{ field.templateOptions?.addText || '+ Add' }}
                    </button>
                  } @else {
                    <div class="card">
                      <div class="card-body">
                        @for (subField of field.fieldGroup || []; track subField.key) {
                          <div class="mb-3">
                            @switch (subField.type) {
                              @case ('select') {
                                <label [for]="field.key + '_' + subField.key" class="form-label">
                                  {{ subField.templateOptions?.label }}
                                  @if (subField.templateOptions?.required) {
                                    <span class="text-danger">*</span>
                                  }
                                </label>
                                <select 
                                  [id]="field.key + '_' + subField.key"
                                  class="form-select"
                                  [(ngModel)]="addFormModels[field.key][subField.key]"
                                  [required]="subField.templateOptions?.required || false">
                                  <option value="">{{ subField.templateOptions?.placeholder || 'Select...' }}</option>
                                  @for (opt of subField.templateOptions?.options || []; track opt.value) {
                                    <option [value]="opt.value">{{ opt.label }}</option>
                                  }
                                </select>
                              }
                              @default {
                                <label [for]="field.key + '_' + subField.key" class="form-label">
                                  {{ subField.templateOptions?.label }}
                                  @if (subField.templateOptions?.required) {
                                    <span class="text-danger">*</span>
                                  }
                                </label>
                                <input 
                                  [id]="field.key + '_' + subField.key"
                                  [type]="subField.templateOptions?.type || 'text'"
                                  class="form-control"
                                  [placeholder]="subField.templateOptions?.placeholder || ''"
                                  [(ngModel)]="addFormModels[field.key][subField.key]"
                                  [required]="subField.templateOptions?.required || false">
                              }
                            }
                          </div>
                        }
                        <div class="d-flex gap-2">
                          <button type="button" class="btn btn-success btn-sm" 
                                  (click)="saveToTable(field)"
                                  [disabled]="!isAddFormValid(field)">
                            {{ field.templateOptions?.saveText || '💾 Save' }}
                          </button>
                          <button type="button" class="btn btn-outline-secondary btn-sm" (click)="cancelAddForm(field)">
                            {{ field.templateOptions?.cancelText || '✕ Cancel' }}
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
              
              <!-- File Upload -->
              @case ('file') {
                <label [for]="field.key" class="form-label">
                  {{ field.templateOptions?.label }}
                  @if (field.templateOptions?.required) {
                    <span class="text-danger">*</span>
                  }
                </label>
                <input 
                  [id]="field.key"
                  type="file"
                  class="form-control"
                  [accept]="field.templateOptions?.accept || '*/*'"
                  [multiple]="field.templateOptions?.multiple || false"
                  (change)="onFileChange(field.key, $event)"
                  [required]="field.templateOptions?.required || false"
                  [disabled]="field.templateOptions?.disabled || false">
                @if (model[field.key]) {
                  <small class="text-muted">
                    Selected: {{ getFileName(model[field.key]) }}
                  </small>
                }
              }
              
              <!-- Default fallback -->
              @default {
                <label [for]="field.key" class="form-label">
                  {{ field.templateOptions?.label }}
                </label>
                <input 
                  [id]="field.key"
                  type="text"
                  class="form-control"
                  [placeholder]="field.templateOptions?.placeholder || ''"
                  [(ngModel)]="model[field.key]"
                  (ngModelChange)="onFieldChange(field.key, $event)">
              }
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .json-form {
      padding: 1rem 0;
    }
    
    .form-field {
      margin-bottom: 1rem;
    }
    
    .form-field.has-error .form-control,
    .form-field.has-error .form-select {
      border-color: #dc3545;
    }
    
    .form-label {
      font-weight: 500;
      margin-bottom: 0.5rem;
      display: block;
    }
    
    .form-label.d-block {
      display: block;
    }
    
    .form-control, .form-select {
      border-radius: 6px;
      border: 1px solid #ced4da;
      padding: 0.5rem 0.75rem;
      width: 100%;
    }
    
    .form-control:focus, .form-select:focus {
      border-color: #80bdff;
      box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
    }
    
    .form-control.is-invalid, .form-select.is-invalid {
      border-color: #dc3545;
    }
    
    .invalid-feedback {
      display: block;
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    .form-check {
      padding-left: 1.5rem;
    }
    
    .form-check-input {
      margin-left: -1.5rem;
    }
    
    .form-check-inline {
      display: inline-flex;
      align-items: center;
      margin-right: 1rem;
    }
    
    .radio-group {
      padding: 0.5rem 0;
    }
    
    .table {
      margin-bottom: 0;
    }
    
    .table th {
      font-weight: 600;
      background-color: #f8f9fa;
    }
    
    .table-responsive {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      margin-top: 0.5rem;
    }
    
    .card-body {
      padding: 1rem;
    }
    
    .badge {
      padding: 0.35em 0.65em;
      font-size: 0.85em;
      border-radius: 4px;
    }
    
    .bg-info {
      background-color: #bee3f8 !important;
      color: #2c5282;
    }
    
    .bg-success {
      background-color: #c6f6d5 !important;
      color: #276749;
    }
    
    .bg-warning {
      background-color: #feebc8 !important;
      color: #c05621;
    }
    
    .bg-danger {
      background-color: #fed7d7 !important;
      color: #c53030;
    }
    
    .bg-secondary {
      background-color: #e2e8f0 !important;
      color: #4a5568;
    }
    
    .gap-2 {
      gap: 0.5rem;
    }
    
    .d-flex {
      display: flex;
    }
    
    .text-center {
      text-align: center;
    }
    
    .text-muted {
      color: #6c757d;
    }
    
    .py-4 {
      padding-top: 1.5rem;
      padding-bottom: 1.5rem;
    }
    
    .btn {
      cursor: pointer;
      border-radius: 6px;
      font-weight: 500;
      padding: 0.5rem 1rem;
      transition: all 0.2s;
    }
    
    .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
    }
    
    .btn-outline-primary {
      color: #007bff;
      border: 1px solid #007bff;
      background: transparent;
    }
    
    .btn-outline-primary:hover {
      background: #007bff;
      color: white;
    }
    
    .btn-outline-danger {
      color: #dc3545;
      border: 1px solid #dc3545;
      background: transparent;
    }
    
    .btn-outline-danger:hover {
      background: #dc3545;
      color: white;
    }
    
    .btn-outline-secondary {
      color: #6c757d;
      border: 1px solid #6c757d;
      background: transparent;
    }
    
    .btn-success {
      background: #28a745;
      border: 1px solid #28a745;
      color: white;
    }
    
    .btn-success:hover {
      background: #218838;
    }
    
    .btn-success:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class JsonFormComponent implements OnInit, OnChanges {
  private cdr = inject(ChangeDetectorRef);
  
  @Input() fields: FormFieldDefinition[] = [];
  @Input() model: Record<string, any> = {};
  @Output() modelChange = new EventEmitter<Record<string, any>>();
  @Output() fieldChange = new EventEmitter<{ key: string, value: any }>();

  // Track which add-to-table forms are open
  showAddForm: Record<string, boolean> = {};
  addFormModels: Record<string, Record<string, any>> = {};
  
  // Store dynamic options loaded from hooks
  fieldOptions: Record<string, Array<{ value: string, label: string }>> = {};
  
  // Field validation errors
  fieldErrors: Record<string, string> = {};

  ngOnInit(): void {
    this.initializeFields();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fields']) {
      this.initializeFields();
    }
    if (changes['model']) {
      console.log('JsonFormComponent: model changed', this.model);
      this.cdr.detectChanges();
    }
  }

  private initializeFields(): void {
    // Initialize add-to-table forms
    this.fields.forEach(field => {
      if (field.type === 'add-to-table') {
        this.showAddForm[field.key] = false;
        this.addFormModels[field.key] = {};
      }
      
      // Set default values if not already set
      if (field.defaultValue !== undefined && this.model[field.key] === undefined) {
        this.model[field.key] = field.defaultValue;
      }
    });
  }

  /**
   * Check if a field should be visible based on showWhen/hideWhen conditions
   */
  isFieldVisible(field: FormFieldDefinition): boolean {
    // Check showWhen condition
    if (field.showWhen) {
      const condition = field.showWhen;
      
      // Handle specific conditions
      if (condition.endsWith('Yes')) {
        const baseKey = condition.replace('Yes', '');
        return this.model[baseKey] === 'yes';
      }
      if (condition.endsWith('No')) {
        const baseKey = condition.replace('No', '');
        return this.model[baseKey] === 'no';
      }
      
      // Generic: show if the referenced field has a truthy value
      return !!this.model[condition];
    }
    
    // Check hideWhen condition
    if (field.hideWhen) {
      const condition = field.hideWhen;
      return !this.model[condition];
    }
    
    return true;
  }

  getFieldOptions(field: FormFieldDefinition): Array<{ value: string, label: string }> {
    // First check if we have dynamically loaded options
    if (this.fieldOptions[field.key]?.length > 0) {
      return this.fieldOptions[field.key];
    }
    // Fall back to static options from templateOptions
    return field.templateOptions?.options || [];
  }

  /**
   * Set options for a field (called from parent component after hook execution)
   */
  setFieldOptions(key: string, options: Array<{ value: string, label: string }>): void {
    this.fieldOptions[key] = options;
    this.cdr.detectChanges();
  }

  onFieldChange(key: string, value: any): void {
    this.model[key] = value;
    this.clearFieldError(key);
    this.modelChange.emit(this.model);
    this.fieldChange.emit({ key, value });
  }

  onFileChange(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.model[key] = files.length === 1 ? files[0] : files;
      this.modelChange.emit(this.model);
      this.fieldChange.emit({ key, value: this.model[key] });
    }
  }

  getFileName(file: File | File[]): string {
    if (Array.isArray(file)) {
      return file.map(f => f.name).join(', ');
    }
    return file?.name || '';
  }

  openAddForm(field: FormFieldDefinition): void {
    this.showAddForm[field.key] = true;
    this.addFormModels[field.key] = {};
  }

  cancelAddForm(field: FormFieldDefinition): void {
    this.showAddForm[field.key] = false;
    this.addFormModels[field.key] = {};
  }

  /**
   * Check if the add form has all required fields filled
   */
  isAddFormValid(field: FormFieldDefinition): boolean {
    const subFields = field.fieldGroup || [];
    const formModel = this.addFormModels[field.key] || {};
    
    for (const subField of subFields) {
      if (subField.templateOptions?.required) {
        const value = formModel[subField.key];
        if (value === undefined || value === null || value === '') {
          return false;
        }
      }
    }
    return true;
  }

  saveToTable(field: FormFieldDefinition): void {
    const targetKey = field.templateOptions?.targetTableKey;
    const fieldMapping = field.templateOptions?.fieldMapping || {};
    const defaults = field.templateOptions?.defaults || {};

    if (!targetKey) {
      console.error('No targetTableKey specified for add-to-table field');
      return;
    }

    // Build the row from the add form model
    const row: Record<string, any> = { ...defaults };
    for (const [formKey, tableCol] of Object.entries(fieldMapping)) {
      row[tableCol] = this.addFormModels[field.key][formKey] || '';
    }

    // Initialize table array if needed
    if (!this.model[targetKey]) {
      this.model[targetKey] = [];
    }

    // Add the row
    this.model[targetKey] = [...this.model[targetKey], row];
    this.modelChange.emit(this.model);

    // Close the form
    this.cancelAddForm(field);
  }

  /**
   * Remove a row from a table
   */
  removeTableRow(tableKey: string, index: number): void {
    if (this.model[tableKey] && Array.isArray(this.model[tableKey])) {
      this.model[tableKey] = this.model[tableKey].filter((_: any, i: number) => i !== index);
      this.modelChange.emit(this.model);
    }
  }

  /**
   * Set a validation error for a field
   */
  setFieldError(key: string, message: string): void {
    this.fieldErrors[key] = message;
    this.cdr.detectChanges();
  }

  /**
   * Clear a validation error for a field
   */
  clearFieldError(key: string): void {
    delete this.fieldErrors[key];
  }

  /**
   * Clear all validation errors
   */
  clearAllErrors(): void {
    this.fieldErrors = {};
  }

  /**
   * Validate all required fields
   */
  validate(): boolean {
    this.clearAllErrors();
    let isValid = true;

    for (const field of this.fields) {
      if (!this.isFieldVisible(field)) continue;
      
      if (field.templateOptions?.required) {
        const value = this.model[field.key];
        if (value === undefined || value === null || value === '') {
          this.setFieldError(field.key, field.validation?.messages?.['required'] || 'This field is required');
          isValid = false;
        }
      }
    }

    return isValid;
  }

  /**
   * Get table columns for a field
   */
  getTableColumns(field: FormFieldDefinition): string[] {
    const columns = field.templateOptions?.columns || [];
    console.log(`getTableColumns for ${field.key}:`, columns);
    return columns;
  }

  /**
   * Get column header for a table column
   */
  getColumnHeader(field: FormFieldDefinition, col: string): string {
    return field.templateOptions?.columnHeaders?.[col] || col;
  }

  /**
   * Get table data for a field key
   */
  getTableData(key: string): any[] {
    const data = this.model[key] || [];
    console.log(`getTableData for ${key}:`, data);
    return data;
  }

  /**
   * Get badge class for a table cell
   */
  getBadgeClass(field: FormFieldDefinition, col: string, value: any): string {
    return field.templateOptions?.badgeColumns?.[col]?.[value] || 'bg-secondary';
  }

  /**
   * Get a field by key
   */
  getField(key: string): FormFieldDefinition | undefined {
    return this.fields.find(f => f.key === key);
  }
}
