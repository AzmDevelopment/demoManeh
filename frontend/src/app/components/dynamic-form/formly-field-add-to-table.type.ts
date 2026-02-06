import { Component, signal, ChangeDetectorRef, inject } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'formly-field-add-to-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule],
  template: `
    <!-- Add Button - shown when form is hidden -->
    <div *ngIf="!showForm()" class="add-button-wrapper">
      <button type="button" class="btn btn-outline-primary" (click)="openForm()">
        {{ props['addText'] || '+ Add' }}
      </button>
    </div>

    <!-- Inline Form - shown when form is visible -->
    <div *ngIf="showForm()" class="inline-form card">
      <div class="card-body">
        <formly-form
          [form]="inlineForm"
          [fields]="inlineFields"
          [model]="inlineModel">
        </formly-form>

        <div class="form-actions">
          <button type="button" class="btn btn-success btn-sm" (click)="saveToTable()" [disabled]="!inlineForm.valid">
            {{ props['saveText'] || '💾 Save' }}
          </button>
          <button type="button" class="btn btn-outline-secondary btn-sm" (click)="cancelForm()">
            {{ props['cancelText'] || '✕ Cancel' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin-bottom: 1rem;
    }

    .add-button-wrapper {
      margin-bottom: 1rem;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid;
      transition: all 0.2s ease;
    }

    .btn-sm {
      padding: 6px 14px;
      font-size: 0.85rem;
    }

    .btn-outline-primary {
      color: #007bff;
      border-color: #007bff;
      background: transparent;
    }

    .btn-outline-primary:hover {
      color: #fff;
      background-color: #007bff;
    }

    .btn-success {
      color: #fff;
      background-color: #28a745;
      border-color: #28a745;
    }

    .btn-success:hover {
      background-color: #218838;
      border-color: #1e7e34;
    }

    .btn-success:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-outline-secondary {
      color: #6c757d;
      border-color: #6c757d;
      background: transparent;
    }

    .btn-outline-secondary:hover {
      color: #fff;
      background-color: #6c757d;
    }

    .card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #f8f9fa;
    }

    .card-body {
      padding: 20px;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }
  `]
})
export class FormlyFieldAddToTable extends FieldType<FieldTypeConfig> {
  private cdr = inject(ChangeDetectorRef);

  showForm = signal(false);
  inlineForm = new FormGroup({});
  inlineModel: Record<string, any> = {};
  inlineFields: FormlyFieldConfig[] = [];

  openForm(): void {
    this.inlineModel = {};
    this.inlineForm = new FormGroup({});
    this.inlineFields = this.buildInlineFields();
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.inlineModel = {};
    this.inlineForm = new FormGroup({});
    this.inlineFields = [];
  }

  saveToTable(): void {
    if (!this.inlineForm.valid) {
      return;
    }

    const targetKey = this.props['targetTableKey'] as string;
    const fieldMapping: Record<string, string> = this.props['fieldMapping'] || {};
    const defaults: Record<string, any> = this.props['defaults'] || {};

    // Build the table row from inline model using field mapping
    const row: Record<string, any> = { ...defaults };
    for (const [formKey, tableCol] of Object.entries(fieldMapping)) {
      row[tableCol] = this.inlineModel[formKey] || '';
    }

    // Update the parent model's table array
    const parentModel = this.field.parent?.model;
    if (parentModel) {
      if (!parentModel[targetKey] || !Array.isArray(parentModel[targetKey])) {
        parentModel[targetKey] = [];
      }
      parentModel[targetKey] = [...parentModel[targetKey], row];

      // Find the table field and update its formControl value so it re-renders
      const tableField = this.field.parent?.fieldGroup?.find(
        (f: FormlyFieldConfig) => f.key === targetKey
      );
      if (tableField?.formControl) {
        tableField.formControl.setValue(parentModel[targetKey]);
      }
    }

    // Reset and hide the form
    this.cancelForm();
    this.cdr.detectChanges();
  }

  private buildInlineFields(): FormlyFieldConfig[] {
    const fieldGroup = this.field.fieldGroup || [];
    return fieldGroup.map((f: FormlyFieldConfig) => ({
      key: f.key,
      type: f.type,
      props: { ...(f.props || {}) }
    }));
  }
}
