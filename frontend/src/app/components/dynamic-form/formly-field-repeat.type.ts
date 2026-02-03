import { Component } from '@angular/core';
import { FieldArrayType, FormlyModule } from '@ngx-formly/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'formly-field-repeat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule],
  template: `
    <div class="repeat-section mb-3">
      <label *ngIf="props.label" class="form-label fw-bold">{{ props.label }}</label>

      <div *ngFor="let field of field.fieldGroup; let i = index" class="card mb-2">
        <!-- Collapsed View (when saved) -->
        <div *ngIf="savedItems[i]" class="card-body bg-light">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <i class="bi bi-check-circle-fill text-success me-2"></i>
              <strong>{{ getItemTitle(i) }}</strong>
              <span class="text-muted ms-2" *ngIf="getItemSubtitle(i)">{{ getItemSubtitle(i) }}</span>
            </div>
            <div>
              <button type="button" class="btn btn-outline-primary btn-sm me-2" (click)="editItem(i)">
                <i class="bi bi-pencil me-1"></i>Edit
              </button>
              <button type="button" class="btn btn-outline-danger btn-sm" (click)="remove(i)">
                <i class="bi bi-trash me-1"></i>Remove
              </button>
            </div>
          </div>
        </div>

        <!-- Expanded View (when editing) -->
        <div *ngIf="!savedItems[i]" class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <span class="badge bg-primary">New Brand {{ i + 1 }}</span>
            <button type="button" class="btn btn-outline-danger btn-sm" (click)="remove(i)">
              {{ props['removeText'] || '❌ Remove' }}
            </button>
          </div>
          <formly-field [field]="field"></formly-field>
          <div class="mt-3 d-flex justify-content-end">
            <button
              type="button"
              class="btn btn-success"
              (click)="saveItem(i)"
              [disabled]="!isItemValid(i)"
            >
              <i class="bi bi-check-lg me-1"></i>
              {{ props['saveText'] || 'Save Brand' }}
            </button>
          </div>
        </div>
      </div>

      <button type="button" class="btn btn-outline-primary" (click)="addNew()">
        {{ props['addText'] || '➕ Add' }}
      </button>
    </div>
  `,
})
export class FormlyFieldRepeat extends FieldArrayType {
  savedItems: boolean[] = [];

  override add(i?: number, initialModel?: any, opts?: { markAsDirty: boolean }): void {
    super.add(i, initialModel, opts);
    // New items start in editing mode
    this.savedItems.push(false);
  }

  addNew(): void {
    this.add();
  }

  override remove(i: number, opts?: { markAsDirty: boolean }): void {
    super.remove(i, opts);
    this.savedItems.splice(i, 1);
  }

  saveItem(index: number): void {
    if (this.isItemValid(index)) {
      this.savedItems[index] = true;
    }
  }

  editItem(index: number): void {
    this.savedItems[index] = false;
  }

  isItemValid(index: number): boolean {
    const fieldGroup = this.field.fieldGroup;
    if (!fieldGroup || !fieldGroup[index]) return false;

    const model = this.model?.[index];
    if (!model) return false;

    // Check brandNameEn and brandNameAr are filled
    return !!(model['brandNameEn'] && model['brandNameAr']);
  }

  getItemTitle(index: number): string {
    const model = this.model?.[index];
    if (!model) return `Brand ${index + 1}`;
    return model['brandNameEn'] || `Brand ${index + 1}`;
  }

  getItemSubtitle(index: number): string {
    const model = this.model?.[index];
    if (!model) return '';
    return model['brandNameAr'] || '';
  }
}
