import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, inject, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { JsonFormsModule } from '@jsonforms/angular';
import { JsonFormsAngularMaterialModule } from '@jsonforms/angular-material';
import { angularMaterialRenderers } from '@jsonforms/angular-material';
import { JsonSchema, UISchemaElement, JsonFormsRendererRegistryEntry } from '@jsonforms/core';
import { CustomButtonRenderer, customButtonTester } from '../custom-renderers/custom-button.renderer';

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

    /* Fix aria-hidden warning for mat-badge on mat-icon */
    :host ::ng-deep .mat-badge[aria-hidden="true"] {
      aria-hidden: false !important;
    }

    /* Style array add/delete buttons to be more visible */
    :host ::ng-deep button.mat-mdc-button,
    :host ::ng-deep button.mat-mdc-outlined-button,
    :host ::ng-deep button.mat-mdc-raised-button,
    :host ::ng-deep button.mat-mdc-unelevated-button {
      font-size: 14px !important;
      line-height: 20px !important;
      min-height: 40px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    /* Add button styling */
    :host ::ng-deep .mat-mdc-button.mat-primary,
    :host ::ng-deep button[aria-label*="Add"],
    :host ::ng-deep button[aria-label*="add"],
    :host ::ng-deep .array-layout-toolbar button {
      background-color: #007bff !important;
      color: white !important;
      font-weight: 500 !important;
      padding: 10px 20px !important;
      border-radius: 6px !important;
      margin: 8px 4px !important;
      min-width: 140px !important;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
      text-transform: none !important;
      letter-spacing: 0.3px !important;
      height: auto !important;
    }

    :host ::ng-deep .mat-mdc-button.mat-primary:hover {
      background-color: #0056b3 !important;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3) !important;
    }

    /* Delete button styling - normal button style */
    :host ::ng-deep .mat-mdc-button.mat-warn,
    :host ::ng-deep button[aria-label*="Delete"],
    :host ::ng-deep button[aria-label*="delete"],
    :host ::ng-deep button[aria-label*="Remove"],
    :host ::ng-deep button[aria-label*="remove"],
    :host ::ng-deep mat-expansion-panel-header button {
      background-color: #f8f9fa !important;
      color: #333 !important;
      border: 1px solid #dee2e6 !important;
      font-weight: 500 !important;
      padding: 8px 16px !important;
      border-radius: 4px !important;
      margin: 4px !important;
      min-width: 80px !important;
      box-shadow: none !important;
      text-transform: none !important;
      letter-spacing: 0.3px !important;
      height: auto !important;
    }

    :host ::ng-deep .mat-mdc-button.mat-warn:hover {
      background-color: #e9ecef !important;
      border-color: #adb5bd !important;
    }

    /* Make button text visible and properly sized */
    :host ::ng-deep button .mdc-button__label,
    :host ::ng-deep button .mat-mdc-button-touch-target,
    :host ::ng-deep button span.mat-button-wrapper,
    :host ::ng-deep button span {
      font-size: 14px !important;
      font-weight: 500 !important;
      line-height: 1.5 !important;
      display: inline !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    /* Force mat-icon text to be visible */
    :host ::ng-deep button mat-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      margin-right: 4px !important;
    }

    /* Ensure button content wrapper is visible */
    :host ::ng-deep .mat-mdc-button > .mat-mdc-button-persistent-ripple,
    :host ::ng-deep .mat-mdc-button > .mat-mdc-button-ripple {
      display: none !important;
    }

    /* Style expansion panel headers */
    :host ::ng-deep mat-expansion-panel-header {
      background-color: #f8f9fa !important;
      border: 1px solid #dee2e6 !important;
      margin-bottom: 4px !important;
    }

    :host ::ng-deep mat-expansion-panel {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
      margin-bottom: 12px !important;
    }

    /* Make array toolbar buttons more prominent */
    :host ::ng-deep .array-layout-toolbar {
      padding: 12px;
      background-color: #f8f9fa;
      border-radius: 6px;
      margin-bottom: 16px;
    }

    :host ::ng-deep .array-layout-toolbar button {
      font-size: 15px !important;
      text-transform: capitalize !important;
      letter-spacing: 0.5px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    /* Style the array container */
    :host ::ng-deep jsonforms-array-control,
    :host ::ng-deep [jsonforms-array-control] {
      display: block;
      padding: 16px;
      background-color: #ffffff;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      margin: 16px 0;
    }

    /* Make array items more visible */
    :host ::ng-deep .array-list-item,
    :host ::ng-deep mat-list-item {
      border: 1px solid #dee2e6 !important;
      margin-bottom: 8px !important;
      padding: 12px !important;
      background-color: #f8f9fa !important;
      border-radius: 4px !important;
    }

    /* Style the delete button inside array items */
    :host ::ng-deep .array-list-item button,
    :host ::ng-deep mat-list-item button {
      visibility: visible !important;
      opacity: 1 !important;
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

  // JSON Forms renderers - Material + Custom
  renderers: JsonFormsRendererRegistryEntry[] = [
    ...angularMaterialRenderers,
    { tester: customButtonTester, renderer: CustomButtonRenderer }
  ];

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
