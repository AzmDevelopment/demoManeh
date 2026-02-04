import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'formly-field-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-3">
      <label *ngIf="props.label" class="form-label fw-bold">{{ props.label }}</label>
      <div class="table-responsive">
        <div *ngIf="props['template']" [innerHTML]="props['template']"></div>
        <table *ngIf="!props['template'] && tableData.length > 0" class="table table-bordered table-striped">
          <thead class="table-primary">
            <tr>
              <th *ngFor="let col of columns">{{ getColumnHeader(col) }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of tableData">
              <td *ngFor="let col of columns">
                <ng-container *ngIf="!isBadgeColumn(col)">{{ row[col] }}</ng-container>
                <span *ngIf="isBadgeColumn(col)"
                      class="badge"
                      [ngClass]="getBadgeClass(col, row[col])">
                  {{ row[col] }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="!props['template'] && tableData.length === 0" class="alert alert-info mb-0">
          <i class="bi bi-info-circle me-2"></i>
          {{ emptyMessage }}
        </div>
      </div>
    </div>
  `,
})
export class FormlyFieldTable extends FieldType<FieldTypeConfig> {
  get tableData(): any[] {
    return this.formControl?.value || this.model?.[this.key as string] || [];
  }

  get columns(): string[] {
    if (this.props['columns']) {
      return this.props['columns'];
    }
    if (this.tableData.length > 0) {
      return Object.keys(this.tableData[0]);
    }
    return [];
  }

  get columnHeaders(): Record<string, string> {
    return this.props['columnHeaders'] || {};
  }

  get badgeColumns(): Record<string, Record<string, string>> {
    return this.props['badgeColumns'] || {};
  }

  get emptyMessage(): string {
    return this.props['emptyMessage'] || 'No data available.';
  }

  getColumnHeader(col: string): string {
    return this.columnHeaders[col] || col;
  }

  isBadgeColumn(col: string): boolean {
    return !!this.badgeColumns[col];
  }

  getBadgeClass(col: string, value: any): string {
    const colConfig = this.badgeColumns[col];
    if (colConfig && value && colConfig[value]) {
      return colConfig[value];
    }
    return 'bg-secondary';
  }
}
