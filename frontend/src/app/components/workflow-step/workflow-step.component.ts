import { Component, OnInit, ChangeDetectorRef, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { WorkflowService } from '../../services/workflow.service';
import { WorkflowHooksService } from '../../services/workflow-hooks.service';

@Component({
  selector: 'app-workflow-step',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, ReactiveFormsModule, RouterLink],
  providers: [WorkflowService, WorkflowHooksService],
  templateUrl: './workflow-step.component.html',
  styleUrls: ['./workflow-step.component.css']
})
export class WorkflowStepComponent implements OnInit {
  instanceId: string = '';
  stepId: string = '';

  instance: any = null;
  stepDefinition: any = null;
  currentData: any = {};
  formState: any = {}; // Form state for hooks

  form: FormGroup;
  loading = true;
  submitting = false;
  validating = false;
  error: string | null = null;
  validationErrors: any[] = [];

  // Store uploaded files
  uploadedFiles: Map<string, File[]> = new Map();

  // Store loaded hooks for this step
  private stepHooks: any = null;

  // Brand table data
  brandTable: any[] = [];

  // New brand items (for repeat field)
  newBrandItems: any[] = [];

  // Store brand options for lookup
  private brandOptions: any[] = [];

  // Store the repeat field definition for dynamic rendering
  repeatFieldDef: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workflowService: WorkflowService,
    private workflowHooksService: WorkflowHooksService,
    private http: HttpClient,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    // Only run in browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Get instance ID and step ID from route
    this.route.paramMap.subscribe(params => {
      this.instanceId = params.get('instanceId') || '';
      this.stepId = params.get('stepId') || '';

      console.log('=== WORKFLOW STEP COMPONENT INIT ===');
      console.log('Instance ID from route:', this.instanceId);
      console.log('Step ID from route:', this.stepId);

      if (this.instanceId) {
        this.loadCurrentStep();
      } else {
        this.error = 'No workflow instance specified';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Load the current step definition and data
   */
  async loadCurrentStep(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;

      console.log('=== LOADING CURRENT STEP ===');
      console.log('Instance ID:', this.instanceId);
      console.log('Step ID from route:', this.stepId);

      const response = await this.workflowService.getCurrentStep(this.instanceId).toPromise();

      console.log('=== API RESPONSE ===');
      console.log('Full response:', response);

      if (!response) {
        throw new Error('No response from API');
      }

      if (!response.stepDefinition) {
        throw new Error('Step definition is missing in response');
      }

      this.instance = response.instance;
      this.stepDefinition = response.stepDefinition;
      this.currentData = response.currentData || {};

      console.log('=== PARSED DATA ===');
      console.log('Instance:', this.instance);
      console.log('Instance definitionId:', this.instance?.definitionId);
      console.log('Step Definition stepId:', this.stepDefinition?.stepId);
      console.log('Step Definition Fields:', this.stepDefinition?.fields);

      // Find and store the repeat field definition
      if (this.stepDefinition?.fields) {
        this.repeatFieldDef = this.stepDefinition.fields.find((f: any) => f.type === 'repeat');
        console.log('Repeat Field Definition:', this.repeatFieldDef);
        if (this.repeatFieldDef?.fieldArray?.fieldGroup) {
          console.log('Field Array Group:', this.repeatFieldDef.fieldArray.fieldGroup);
        }
      }

      // Build form from step definition
      this.buildForm();

      // Pre-populate form with existing data
      if (Object.keys(this.currentData).length > 0) {
        this.form.patchValue(this.currentData);
        console.log('Form pre-populated with data');
        
        // Restore brandTable if exists in currentData
        if (this.currentData.brandTable) {
          this.brandTable = this.currentData.brandTable;
        }
        // Restore newBrandItems if exists
        if (this.currentData.newBrand) {
          this.newBrandItems = this.currentData.newBrand;
        }
      }

      // Load and execute hooks for this step
      await this.loadAndExecuteHooks();

      this.loading = false;
      console.log('=== LOADING COMPLETE ===');

      // Force change detection to ensure UI updates
      this.cdr.detectChanges();
    } catch (error: any) {
      console.error('=== ERROR LOADING CURRENT STEP ===');
      console.error('Error:', error);

      this.error = error?.error?.message || error?.message || 'Failed to load workflow step.';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Load hooks and execute onInit hooks for fields
   */
  private async loadAndExecuteHooks(): Promise<void> {
    if (!this.stepDefinition?.fields) {
      console.log('No fields in step definition, skipping hooks');
      return;
    }

    const workflowId = this.instance?.definitionId;
    const stepId = this.stepDefinition.stepId;

    if (!workflowId || !stepId) {
      console.log('Cannot load hooks: missing workflowId or stepId');
      console.log('  workflowId:', workflowId);
      console.log('  stepId:', stepId);
      return;
    }

    console.log(`=== LOADING HOOKS for ${workflowId}/${stepId} ===`);

    // Get hooks from registry (synchronous now)
    this.stepHooks = this.workflowHooksService.getHooksForStep(workflowId, stepId);

    if (this.stepHooks) {
      console.log('Hooks loaded:', Object.keys(this.stepHooks));

      // Process onInit hooks for all fields
      await this.processFieldHooks(this.stepDefinition.fields);

      // Force change detection after hooks execution
      this.cdr.detectChanges();
    } else {
      console.log('No hooks file found for this step');
    }
  }

  /**
   * Process hooks for fields recursively
   */
  private async processFieldHooks(fields: any[]): Promise<void> {
    if (!fields || !this.stepHooks) {
      return;
    }

    for (const field of fields) {
      // Check if field has hooks defined in JSON
      if (field.hooks) {
        console.log(`Field '${field.key}' has hooks:`, field.hooks);
        
        // Execute onInit hook
        if (field.hooks.onInit) {
          const hookName = field.hooks.onInit;
          console.log(`Looking for hook '${hookName}' in stepHooks`);
          
          if (this.stepHooks[hookName]) {
            console.log(`Executing onInit hook '${hookName}' for field '${field.key}'`);
            try {
              await this.stepHooks[hookName](field, this.form.value, this.formState, this.http);
              console.log(`Hook '${hookName}' executed successfully`);
              console.log(`Field options after hook:`, field.templateOptions?.options);
              
              // Store brand options for later use
              if (field.key === 'selectedBrand' && field.templateOptions?.options) {
                this.brandOptions = field.templateOptions.options;
                console.log('Brand options stored:', this.brandOptions);
              }
            } catch (error) {
              console.error(`Error executing hook '${hookName}':`, error);
            }
          } else {
            console.warn(`Hook '${hookName}' not found in stepHooks. Available hooks:`, Object.keys(this.stepHooks));
          }
        }
      }

      // Process nested fields
      if (field.fieldGroup) {
        await this.processFieldHooks(field.fieldGroup);
      }
      if (field.fieldArray?.fieldGroup) {
        await this.processFieldHooks(field.fieldArray.fieldGroup);
      }
    }
  }

  /**
   * Execute a hook by name (can be called from template or other methods)
   */
  async executeHook(hookName: string, field?: any): Promise<void> {
    if (!this.stepHooks || !this.stepHooks[hookName]) {
      console.log(`Hook '${hookName}' not found`);
      return;
    }

    try {
      await this.stepHooks[hookName](field || {}, this.form.value, this.formState, this.http);
      this.cdr.detectChanges();
    } catch (error) {
      console.error(`Error executing hook '${hookName}':`, error);
    }
  }

  /**
   * Build form dynamically from step definition fields
   */
  private buildForm(): void {
    const formControls: any = {};

    if (this.stepDefinition?.fields) {
      this.stepDefinition.fields.forEach((field: any) => {
        // Skip table and repeat fields as they're handled separately
        if (field.type === 'table' || field.type === 'repeat') {
          return;
        }

        let defaultValue;

        if (field.type === 'multicheckbox') {
          defaultValue = this.currentData[field.key] || [];
        } else {
          defaultValue = this.currentData[field.key] || '';
        }

        formControls[field.key] = [defaultValue];
      });
    }

    this.form = this.fb.group(formControls);
    console.log('Form built with controls:', Object.keys(formControls));
  }

  /**
   * Validate form before submission
   */
  async validateForm(): Promise<boolean> {
    try {
      this.validating = true;
      this.validationErrors = [];

      // Include brandTable and newBrandItems in form data
      const formData = {
        ...this.form.value,
        brandTable: this.brandTable,
        newBrand: this.newBrandItems.filter(item => item.saved)
      };

      console.log('Validating form data:', formData);

      const result = await this.workflowService.validateStep(
        this.instanceId,
        this.stepDefinition.stepId,
        formData
      ).toPromise();

      console.log('Validation result:', result);

      if (result && !result.isValid) {
        this.validationErrors = result.errors || [];
        this.validating = false;
        return false;
      }

      this.validating = false;
      return true;
    } catch (error) {
      console.error('Error validating form:', error);
      this.validating = false;
      return false;
    }
  }

  /**
   * Submit the current step
   */
  async onSubmit(): Promise<void> {
    try {
      const isValid = await this.validateForm();
      if (!isValid) {
        return;
      }

      this.submitting = true;
      this.error = null;

      try {
        await this.uploadFiles();
      } catch (uploadError: any) {
        this.error = uploadError.message || 'Failed to upload files';
        this.submitting = false;
        return;
      }

      // Include brandTable and newBrandItems in submission
      const formData = {
        ...this.form.value,
        brandTable: this.brandTable,
        newBrand: this.newBrandItems.filter(item => item.saved)
      };

      const submission = {
        certificationId: this.instance.definitionId,
        stepId: this.stepDefinition.stepId,
        formData: formData,
        submittedBy: this.getCurrentUserEmail(),
        decision: 'approve',
        comments: ''
      };

      console.log('Submitting step:', submission);

      const updatedInstance = await this.workflowService.submitStep(
        this.instanceId,
        submission
      ).toPromise();

      if (updatedInstance) {
        console.log('Step submitted successfully:', updatedInstance);

        if (updatedInstance.status === 'completed') {
          this.router.navigate(['/workflow', this.instanceId, 'completed']);
        } else {
          this.router.navigate(['/workflow', this.instanceId, 'step', updatedInstance.currentStep]);
          window.location.reload();
        }
      }

      this.submitting = false;
    } catch (error: any) {
      console.error('Error submitting step:', error);
      this.error = error.error?.message || 'Failed to submit step';
      this.submitting = false;
    }
  }

  goBack(): void {
    console.log('Send back not implemented yet');
  }

  cancel(): void {
    if (confirm('Are you sure you want to cancel this workflow?')) {
      this.router.navigate(['/']);
    }
  }

  private getCurrentUserEmail(): string {
    return 'user@example.com';
  }

  getFieldError(fieldKey: string): string | null {
    const error = this.validationErrors.find(e => e.field === fieldKey);
    return error ? error.message : null;
  }

  hasFieldError(fieldKey: string): boolean {
    return this.validationErrors.some(e => e.field === fieldKey);
  }

  onCheckboxChange(fieldKey: string, optionValue: string, event: any): void {
    const isChecked = event.target.checked;
    const currentValue = this.form.get(fieldKey)?.value || [];

    let newValue: string[];
    if (isChecked) {
      newValue = [...currentValue, optionValue];
    } else {
      newValue = currentValue.filter((v: string) => v !== optionValue);
    }

    this.form.patchValue({ [fieldKey]: newValue });
  }

  onFileChange(fieldKey: string, event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray: File[] = Array.from(files);
      this.uploadedFiles.set(fieldKey, fileArray);
      const fileNames = fileArray.map(f => f.name).join(', ');
      this.form.patchValue({ [fieldKey]: fileNames });
    }
  }

  getSelectedFileName(fieldKey: string): string | null {
    const files = this.uploadedFiles.get(fieldKey);
    if (files && files.length > 0) {
      return files.map(f => f.name).join(', ');
    }
    return null;
  }

  async uploadFiles(): Promise<void> {
    if (this.uploadedFiles.size === 0) {
      return;
    }

    for (const [fieldKey, files] of this.uploadedFiles.entries()) {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append(fieldKey, file, file.name);
      });

      const uploadedBy = this.getCurrentUserEmail();
      const result = await this.workflowService.uploadFiles(
        this.instanceId,
        this.stepDefinition.stepId,
        uploadedBy,
        formData
      ).toPromise();

      if (result?.uploadedFiles?.[fieldKey]) {
        this.form.patchValue({ [fieldKey]: result.uploadedFiles[fieldKey] });
      }
    }
  }

  /**
   * Handle select dropdown change
   */
  onSelectChange(field: any, event: any): void {
    const value = event.target.value;
    console.log(`Select changed for ${field.key}:`, value);

    // Execute onChange hook if defined
    if (field.hooks?.onChange && this.stepHooks?.[field.hooks.onChange]) {
      this.stepHooks[field.hooks.onChange](field, this.form.value, this.formState, this.http);
    }

    this.cdr.detectChanges();
  }

  /**
   * Add selected brand to the table
   */
  addSelectedBrandToTable(): void {
    const selectedValue = this.form.get('selectedBrand')?.value;
    if (!selectedValue) {
      return;
    }

    // Find the selected brand from options
    const selectedBrand = this.brandOptions.find(b => b.value === selectedValue);
    if (!selectedBrand) {
      console.log('Brand not found in options');
      return;
    }

    // Check if already in table
    const exists = this.brandTable.some(b => b.nameEn === selectedBrand.label);
    if (exists) {
      alert('This brand is already in the table!');
      return;
    }

    // Add to table
    this.brandTable.push({
      nameEn: selectedBrand.label,
      nameAr: selectedBrand.labelAr,
      fileCount: 0,
      source: 'Existing'
    });

    // Clear the selection
    this.form.patchValue({ selectedBrand: '' });

    console.log('Brand added to table:', this.brandTable);
    this.cdr.detectChanges();
  }

  /**
   * Remove brand from table
   */
  removeBrandFromTable(index: number): void {
    this.brandTable.splice(index, 1);
    console.log('Brand removed from table');
    this.cdr.detectChanges();
  }

  /**
   * Add new brand item (for repeat field)
   */
  addNewBrandItem(): void {
    // Create new item with empty values for each field in the fieldArray
    const newItem: any = { saved: false };
    
    if (this.repeatFieldDef?.fieldArray?.fieldGroup) {
      this.repeatFieldDef.fieldArray.fieldGroup.forEach((sf: any) => {
        if (sf.type === 'file') {
          newItem[sf.key] = [];
        } else {
          newItem[sf.key] = '';
        }
      });
    } else {
      // Fallback defaults
      newItem.brandNameEn = '';
      newItem.brandNameAr = '';
      newItem.attachments = [];
    }

    this.newBrandItems.push(newItem);
    console.log('New brand item added:', newItem);
    console.log('All items:', this.newBrandItems);
    this.cdr.detectChanges();
  }

  /**
   * Remove new brand item
   */
  removeNewBrandItem(index: number): void {
    this.newBrandItems.splice(index, 1);
    console.log('New brand item removed');
    this.cdr.detectChanges();
  }

  /**
   * Save new brand item and add to table
   */
  saveNewBrandItem(index: number): void {
    const item = this.newBrandItems[index];
    
    if (!item.brandNameEn || !item.brandNameAr) {
      alert('Please fill in both English and Arabic brand names');
      return;
    }

    // Mark as saved
    item.saved = true;

    // Add to brand table
    this.brandTable.push({
      nameEn: item.brandNameEn,
      nameAr: item.brandNameAr,
      fileCount: item.attachments?.length || 0,
      source: 'New'
    });

    console.log('New brand saved and added to table:', item);
    this.cdr.detectChanges();
  }

  /**
   * Handle file change for new brand items
   */
  onNewBrandFileChange(itemIndex: number, fieldKey: string, event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.newBrandItems[itemIndex][fieldKey] = Array.from(files);
      console.log(`Files selected for new brand item ${itemIndex}:`, files.length);
      this.cdr.detectChanges();
    }
  }

  // Helper method to get the repeat field's sub-fields
  getRepeatFieldSubFields(): any[] {
    return this.repeatFieldDef?.fieldArray?.fieldGroup || [];
  }
}
