import { Component } from '@angular/core';
import { FieldArrayType, FormlyModule } from '@ngx-formly/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'formly-field-repeat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule],
  template: `
    <div class="mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <label *ngIf="props['label']" class="form-label mb-0">
          {{ props['label'] }}
        </label>
        <button type="button" class="btn btn-sm btn-outline-primary" (click)="add()">
          {{ props['addText'] || '+ Add' }}
        </button>
      </div>

      <div *ngFor="let fieldItem of field.fieldGroup; let i = index" class="repeat-item card mb-2">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <span class="badge bg-secondary">{{ props['itemLabel'] || 'Item' }} {{ i + 1 }}</span>
            <button type="button" class="btn btn-sm btn-outline-danger" (click)="remove(i)">
              {{ props['removeText'] || '✕ Remove' }}
            </button>
          </div>
          <formly-field *ngFor="let f of fieldItem.fieldGroup" [field]="f"></formly-field>
        </div>
      </div>

      <div *ngIf="!field.fieldGroup || field.fieldGroup.length === 0" class="text-muted text-center py-3">
        No items added yet.
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .mb-3 {
      margin-bottom: 1.5rem;
    }

    .mb-2 {
      margin-bottom: 0.5rem;
    }

    .mb-0 {
      margin-bottom: 0;
    }

    .py-3 {
      padding-top: 1rem;
      padding-bottom: 1rem;
    }

    .form-label {
      font-weight: 600;
      color: #2d3748;
      font-size: 0.95rem;
    }

    .d-flex {
      display: flex;
    }

    .justify-content-between {
      justify-content: space-between;
    }

    .align-items-center {
      align-items: center;
    }

    .align-items-start {
      align-items: flex-start;
    }

    .btn {
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid;
      transition: all 0.2s ease;
    }

    .btn-sm {
      padding: 4px 10px;
      font-size: 0.8rem;
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

    .btn-outline-danger {
      color: #dc3545;
      border-color: #dc3545;
      background: transparent;
    }

    .btn-outline-danger:hover {
      color: #fff;
      background-color: #dc3545;
    }

    .card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #f8f9fa;
    }

    .card-body {
      padding: 16px;
    }

    .badge {
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .bg-secondary {
      background-color: #e2e8f0 !important;
      color: #4a5568;
    }

    .text-muted {
      color: #a0aec0;
      font-style: italic;
    }

    .text-center {
      text-align: center;
    }

    .repeat-item {
      transition: box-shadow 0.2s ease;
    }

    .repeat-item:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class FormlyFieldRepeat extends FieldArrayType {}
