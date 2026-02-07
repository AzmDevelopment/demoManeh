import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { rankWith, uiTypeIs } from '@jsonforms/core';
import { JsonFormsAngularService, JsonFormsControl } from '@jsonforms/angular';

/**
 * Custom Button Renderer for JSON Forms
 *
 * This renderer handles CustomButton type in uischema
 * Example:
 * {
 *   "type": "CustomButton",
 *   "label": "Save",
 *   "hookName": "saveData",
 *   "buttonClass": "btn-primary",
 *   "validateHook": "canSave"
 * }
 */
@Component({
  selector: 'custom-button-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="custom-button-container">
      <button
        type="button"
        [class]="'btn ' + getButtonClass()"
        (click)="handleClick()"
        [disabled]="!isButtonEnabled()">
        {{ getButtonLabel() }}
      </button>
    </div>
  `,
  styles: [`
    .custom-button-container {
      margin: 16px 0;
      padding: 8px 0;
    }

    .btn {
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 500;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .btn-outline-primary {
      background-color: transparent;
      color: #007bff;
      border: 1px solid #007bff;
    }

    .btn-outline-primary:hover:not(:disabled) {
      background-color: #007bff;
      color: white;
    }

    .btn-success {
      background-color: #28a745;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background-color: #218838;
    }
  `]
})
export class CustomButtonRenderer extends JsonFormsControl implements OnInit, OnDestroy {

  constructor(
    protected override jsonFormsService: JsonFormsAngularService
  ) {
    super(jsonFormsService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    console.log('CustomButtonRenderer initialized');
    console.log('UISchema:', this.uischema);
    console.log('Button properties:', {
      label: this.getButtonLabel(),
      hookName: this.getHookName(),
      buttonClass: this.getButtonClass(),
      validateHook: this.getValidateHook()
    });
  }

  getButtonLabel(): string {
    return (this.uischema as any)?.label || 'Button';
  }

  getHookName(): string {
    return (this.uischema as any)?.hookName || '';
  }

  getButtonClass(): string {
    return (this.uischema as any)?.buttonClass || 'btn-primary';
  }

  getValidateHook(): string | undefined {
    return (this.uischema as any)?.validateHook;
  }

  isButtonEnabled(): boolean {
    const validateHook = this.getValidateHook();

    if (!validateHook) {
      return true;
    }

    // Get the hook from window object
    const hooks = (window as any).__currentStepHooks;

    if (!hooks || !hooks[validateHook]) {
      return true;
    }

    // Execute validate hook
    try {
      return hooks[validateHook]({}, this.data, {}, (window as any).__httpClient);
    } catch (error) {
      console.error(`Error executing validate hook '${validateHook}':`, error);
      return false;
    }
  }

  handleClick(): void {
    const hookName = this.getHookName();
    console.log(`CustomButton clicked: hookName="${hookName}"`);
    console.log('UISchema at click:', this.uischema);

    if (!hookName) {
      console.error('No hookName defined for custom button');
      console.error('UISchema:', JSON.stringify(this.uischema, null, 2));
      return;
    }

    // Get the hook from window object (set by workflow-selector)
    const hooks = (window as any).__currentStepHooks;

    if (!hooks) {
      console.error('No hooks found in window.__currentStepHooks');
      return;
    }

    if (!hooks[hookName]) {
      console.error(`Hook '${hookName}' not found`);
      console.log('Available hooks:', Object.keys(hooks));
      return;
    }

    console.log('Executing hook with data:', this.data);

    // Execute the hook
    const result = hooks[hookName]({}, this.data, {}, (window as any).__httpClient);

    // If successful, log it
    if (result !== false) {
      console.log('Hook executed successfully');
    } else {
      console.warn('Hook returned false');
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}

// Tester function for JSON Forms
export const customButtonTester = rankWith(
  10, // priority
  uiTypeIs('CustomButton')
);
