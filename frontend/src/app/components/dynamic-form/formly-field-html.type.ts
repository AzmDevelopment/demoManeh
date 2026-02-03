import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'formly-field-html',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-3">
      <label *ngIf="props.label" class="form-label fw-bold">{{ props.label }}</label>
      <div [innerHTML]="htmlContent" class="html-content"></div>
    </div>
  `,
  styles: [`
    .html-content {
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 4px;
    }
    .html-content table {
      width: 100%;
    }
  `]
})
export class FormlyFieldHtml extends FieldType<FieldTypeConfig> {
  get htmlContent(): string {
    return this.props['template'] || this.props['html'] || '';
  }
}
