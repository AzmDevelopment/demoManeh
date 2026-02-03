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
                <span *ngIf="col !== 'source'">{{ row[col] }}</span>
                <span *ngIf="col === 'source'"
                      class="badge"
                      [class.bg-info]="row[col] === 'Existing'"
                      [class.bg-success]="row[col] === 'New'">
                  {{ row[col] }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="!props['template'] && tableData.length === 0" class="alert alert-info mb-0">
          <i class="bi bi-info-circle me-2"></i>
          No brands added yet. Select an existing brand or add a new one.
        </div>
      </div>
    </div>
  `,
})
export class FormlyFieldTable extends FieldType<FieldTypeConfig> {
  // Column header mapping for user-friendly display
  private columnHeaders: Record<string, string> = {
    'nameEn': 'Brand (English)',
    'nameAr': 'Brand (Arabic)',
    'fileCount': 'Files',
    'source': 'Source'
  };

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

  getColumnHeader(col: string): string {
    return this.columnHeaders[col] || col;
  }
}
