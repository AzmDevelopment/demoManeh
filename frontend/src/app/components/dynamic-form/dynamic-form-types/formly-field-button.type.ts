import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'formly-field-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-3">
      <button
        type="button"
        class="btn btn-outline-primary"
        (click)="onClick()"
        [disabled]="props.disabled"
      >
        {{ props['text'] || props.label }}
      </button>
    </div>
  `,
})
export class FormlyFieldButton extends FieldType<FieldTypeConfig> {
  onClick() {
    if (this.props['onClick']) {
      // Emit event that can be handled by parent component
      this.formControl.setValue({ action: this.props['onClick'], timestamp: Date.now() });
    }
  }
}
