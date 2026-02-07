import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, inject, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { JsonFormsModule } from '@jsonforms/angular';
import { JsonFormsAngularMaterialModule } from '@jsonforms/angular-material';
import { angularMaterialRenderers } from '@jsonforms/angular-material';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';

/**
 * Legacy field definition for backward compatibility
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
    type?: string;
    columns?: string[];
    columnHeaders?: Record<string, string>;
    emptyMessage?: string;
    badgeColumns?: Record<string, Record<string, string>>;
    allowDelete?: boolean;
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
  showWhen?: string;
  hideWhen?: string;
  validation?: {
    messages?: Record<string, string>;
  };
}

/**
 * JSON Forms based form component
 * Uses the official JSON Forms library with Angular Material renderers
 */
@Component({
  selector: 'app-json-form',
  standalone: true,
  imports: [
    CommonModule,
    JsonFormsModule,
    JsonFormsAngularMaterialModule
  ],
  template: `
    <div class="json-forms-container">
      @if (isBrowser) {
        @if (schema && uischema) {
          <jsonforms
            [schema]="schema"
            [uischema]="uischema"
            [data]="data"
            [renderers]="renderers"
            (dataChange)="onDataChange($event)">
          </jsonforms>
        } @else if (schema) {
          <!-- If no uischema provided, JSON Forms will auto-generate one -->
          <jsonforms
            [schema]="schema"
            [data]="data"
            [renderers]="renderers"
            (dataChange)="onDataChange($event)">
          </jsonforms>
        } @else {
          <div class="alert alert-info">
            Loading form...
          </div>
        }
      } @else {
        <div class="ssr-placeholder">
          <p>Loading form...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .json-forms-container {
      padding: 1rem 0;
    }
    
    :host ::ng-deep .mat-mdc-form-field {
      width: 100%;
      margin-bottom: 1rem;
    }
    
    :host ::ng-deep .mat-mdc-card {
      margin-bottom: 1rem;
    }
    
    :host ::ng-deep .array-layout-toolbar {
      margin-bottom: 0.5rem;
    }
    
    :host ::ng-deep mat-expansion-panel {
      margin-bottom: 0.5rem;
    }
    
    .alert {
      padding: 1rem;
      border-radius: 4px;
    }
    
    .alert-info {
      background-color: #d1ecf1;
      border: 1px solid #bee5eb;
      color: #0c5460;
    }
    
    .ssr-placeholder {
      padding: 2rem;
      text-align: center;
      color: #666;
    }
  `]
})
export class JsonFormComponent implements OnInit, OnChanges {
  private cdr = inject(ChangeDetectorRef);
  isBrowser: boolean;

  // JSON Forms inputs
  @Input() schema: JsonSchema | null = null;
  @Input() uischema: UISchemaElement | null = null;
  @Input() data: any = {};
  
  // Legacy inputs for backward compatibility
  @Input() fields: FormFieldDefinition[] = [];
  @Input() model: Record<string, any> = {};

  // Outputs
  @Output() dataChange = new EventEmitter<any>();
  @Output() modelChange = new EventEmitter<Record<string, any>>();
  @Output() fieldChange = new EventEmitter<{ key: string; value: any }>();

  // JSON Forms renderers
  renderers = angularMaterialRenderers;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.initializeData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isBrowser && (changes['schema'] || changes['data'] || changes['model'])) {
      this.initializeData();
    }
  }

  private initializeData(): void {
    // If model is provided (legacy), use it as data
    if (this.model && Object.keys(this.model).length > 0) {
      this.data = { ...this.model };
    }
  }

  onDataChange(event: any): void {
    this.data = event;
    this.dataChange.emit(event);
    
    // For backward compatibility
    this.model = event;
    this.modelChange.emit(event);
    
    // Emit individual field changes
    if (event) {
      Object.keys(event).forEach(key => {
        this.fieldChange.emit({ key, value: event[key] });
      });
    }
    
    this.cdr.detectChanges();
  }
}
