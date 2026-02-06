import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

export interface BadgeConfig {
  [value: string]: string;
}

@Component({
  selector: 'formly-field-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule],
  template: `
    <div class="mb-3">
      <label *ngIf="tableLabel" class="form-label">
        {{ tableLabel }}
      </label>
      
      <div class="table-responsive">
        <table class="table table-bordered table-hover">
          <thead class="table-light">
            <tr>
              <th *ngFor="let col of columns">{{ getColumnHeader(col) }}</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngIf="tableData && tableData.length > 0; else emptyState">
              <tr *ngFor="let row of tableData; let i = index">
                <td *ngFor="let col of columns">
                  <ng-container *ngIf="isBadgeColumn(col); else normalCell">
                    <span [class]="'badge ' + getBadgeClass(col, row[col])">
                      {{ row[col] }}
                    </span>
                  </ng-container>
                  <ng-template #normalCell>
                    {{ row[col] }}
                  </ng-template>
                </td>
              </tr>
            </ng-container>
            <ng-template #emptyState>
              <tr>
                <td [attr.colspan]="columns.length" class="text-center text-muted py-4">
                  {{ emptyMessage }}
                </td>
              </tr>
            </ng-template>
          </tbody>
        </table>
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

    .form-label {
      display: block;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 0.75rem;
      font-size: 0.95rem;
    }

    .table-responsive {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .table {
      margin-bottom: 0;
      font-size: 0.9rem;
      width: 100%;
      border-collapse: collapse;
    }

    .table thead {
      background-color: #f8f9fa;
    }

    .table th {
      font-weight: 600;
      color: #4a5568;
      padding: 12px;
      border-bottom: 2px solid #dee2e6;
      border: 1px solid #dee2e6;
    }

    .table td {
      padding: 10px 12px;
      vertical-align: middle;
      border: 1px solid #dee2e6;
    }

    .table-hover tbody tr:hover {
      background-color: #f7fafc;
    }

    .badge {
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 500;
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

    .bg-primary {
      background-color: #bee3f8 !important;
      color: #2a4365;
    }

    .bg-secondary {
      background-color: #e2e8f0 !important;
      color: #4a5568;
    }

    .text-center {
      text-align: center;
    }

    .text-muted {
      color: #a0aec0;
      font-style: italic;
    }

    .py-4 {
      padding-top: 2rem;
      padding-bottom: 2rem;
    }
  `]
})
export class FormlyFieldTable extends FieldType<FieldTypeConfig> {
  get tableLabel(): string {
    return this.props['label'] || '';
  }

  get columns(): string[] {
    return this.props['columns'] || [];
  }

  get columnHeaders(): { [key: string]: string } {
    return this.props['columnHeaders'] || {};
  }

  get tableData(): any[] {
    // Read from model (kept in sync by add-to-table), fall back to formControl
    const key = this.field.key as string;
    const modelData = this.model?.[key];
    if (modelData && Array.isArray(modelData)) {
      return modelData;
    }
    return this.formControl?.value || [];
  }

  get emptyMessage(): string {
    return this.props['emptyMessage'] || 'No data available';
  }

  get badgeColumns(): { [column: string]: BadgeConfig } {
    return this.props['badgeColumns'] || {};
  }

  getColumnHeader(column: string): string {
    return this.columnHeaders[column] || column;
  }

  isBadgeColumn(column: string): boolean {
    return !!this.badgeColumns[column];
  }

  getBadgeClass(column: string, value: string): string {
    const badgeConfig = this.badgeColumns[column];
    return badgeConfig && badgeConfig[value] ? badgeConfig[value] : 'bg-secondary';
  }
}
