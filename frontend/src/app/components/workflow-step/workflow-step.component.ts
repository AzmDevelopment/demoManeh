import { Component, OnInit, ChangeDetectorRef, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { WorkflowService } from '../../services/workflow.service';

@Component({
  selector: 'app-workflow-step',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, ReactiveFormsModule, RouterLink],
  providers: [WorkflowService],
  templateUrl: './workflow-step.component.html',
  styleUrls: ['./workflow-step.component.css']
})
export class WorkflowStepComponent implements OnInit {
  instanceId: string = '';
  stepId: string = '';

  instance: any = null;
  stepDefinition: any = null;
  currentData: any = {};

  form: FormGroup;
  loading = true;
  submitting = false;
  validating = false;
  error: string | null = null;
  validationErrors: any[] = [];

  // Store uploaded files
  uploadedFiles: Map<string, File[]> = new Map();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workflowService: WorkflowService,
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
      console.log('API call: getCurrentStep(' + this.instanceId + ')');

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
      console.log('Instance Current Step:', this.instance?.currentStep);
      console.log('Step Definition:', this.stepDefinition);
      console.log('Step Definition ID:', this.stepDefinition?.stepId);
      console.log('Step Definition Fields:', this.stepDefinition?.fields);
      console.log('Current Data:', this.currentData);

      // Build form from step definition
      this.buildForm();

      // Pre-populate form with existing data
      if (Object.keys(this.currentData).length > 0) {
        this.form.patchValue(this.currentData);
        console.log('Form pre-populated with data');
      }

      this.loading = false;
      console.log('=== LOADING COMPLETE ===');

      // Force change detection to ensure UI updates
      this.cdr.detectChanges();
    } catch (error: any) {
      console.error('=== ERROR LOADING CURRENT STEP ===');
      console.error('Error object:', error);
      console.error('Error message:', error?.message);
      console.error('Error status:', error?.status);
      console.error('Error error:', error?.error);

      this.error = error?.error?.message || error?.message || 'Failed to load workflow step. Please try again.';
      this.loading = false;

      // Force change detection to show error
      this.cdr.detectChanges();
    }
  }

  /**
   * Build form dynamically from step definition fields
   */
  private buildForm(): void {
    const formControls: any = {};

    if (this.stepDefinition?.fields) {
      this.stepDefinition.fields.forEach((field: any) => {
        let defaultValue;

        // Handle different field types
        if (field.type === 'multicheckbox') {
          // Multicheckbox should be an array
          defaultValue = this.currentData[field.key] || [];
        } else {
          // All other fields use string/number/etc
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

      const formData = this.form.value;

      console.log('Validating form data:', formData);

      const result = await this.workflowService.validateStep(
        this.instanceId,
        this.stepDefinition.stepId,
        formData
      ).toPromise();

      console.log('Validation result:', result);

      if (result && !result.isValid) {
        this.validationErrors = result.errors || [];
        console.log('Validation errors:', this.validationErrors);
        this.validating = false;
        return false;
      }

      this.validating = false;
      console.log('Validation passed!');
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
      // Validate first
      const isValid = await this.validateForm();
      if (!isValid) {
        return;
      }

      this.submitting = true;
      this.error = null;

      // Upload files first if there are any
      try {
        await this.uploadFiles();
      } catch (uploadError: any) {
        this.error = uploadError.message || 'Failed to upload files';
        this.submitting = false;
        return;
      }

      const submission = {
        certificationId: this.instance.definitionId,
        stepId: this.stepDefinition.stepId,
        formData: this.form.value,
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

        // Check if workflow is completed
        if (updatedInstance.status === 'completed') {
          this.router.navigate(['/workflow', this.instanceId, 'completed']);
        } else {
          // Navigate to next step
          this.router.navigate(['/workflow', this.instanceId, 'step', updatedInstance.currentStep]);

          // Reload the page to show next step
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

  /**
   * Go back to previous step (if allowed)
   */
  goBack(): void {
    // TODO: Implement send back functionality
    console.log('Send back not implemented yet');
  }

  /**
   * Cancel workflow
   */
  cancel(): void {
    if (confirm('Are you sure you want to cancel this workflow?')) {
      // Navigate back to categories
      this.router.navigate(['/']);
    }
  }

  /**
   * Get current user email
   */
  private getCurrentUserEmail(): string {
    // TODO: Get from auth service
    return 'user@example.com';
  }

  /**
   * Get error message for a specific field
   */
  getFieldError(fieldKey: string): string | null {
    const error = this.validationErrors.find(e => e.field === fieldKey);
    return error ? error.message : null;
  }

  /**
   * Check if field has error
   */
  hasFieldError(fieldKey: string): boolean {
    return this.validationErrors.some(e => e.field === fieldKey);
  }

  /**
   * Handle checkbox change for multicheckbox fields
   */
  onCheckboxChange(fieldKey: string, optionValue: string, event: any): void {
    const isChecked = event.target.checked;
    const currentValue = this.form.get(fieldKey)?.value || [];

    let newValue: string[];
    if (isChecked) {
      // Add value if checked
      newValue = [...currentValue, optionValue];
    } else {
      // Remove value if unchecked
      newValue = currentValue.filter((v: string) => v !== optionValue);
    }

    this.form.patchValue({ [fieldKey]: newValue });
    console.log(`Checkbox ${fieldKey} updated:`, newValue);
  }

  /**
   * Handle file upload
   */
  onFileChange(fieldKey: string, event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray: File[] = Array.from(files);
      this.uploadedFiles.set(fieldKey, fileArray);

      // Store file names in form for validation
      const fileNames = fileArray.map(f => f.name).join(', ');
      this.form.patchValue({ [fieldKey]: fileNames });

      console.log(`Files selected for ${fieldKey}:`, fileArray.map(f => f.name));
    }
  }

  /**
   * Get selected file name for display
   */
  getSelectedFileName(fieldKey: string): string | null {
    const files = this.uploadedFiles.get(fieldKey);
    if (files && files.length > 0) {
      return files.map(f => f.name).join(', ');
    }
    return null;
  }

  /**
   * Upload files for a specific field
   */
  async uploadFiles(): Promise<void> {
    if (this.uploadedFiles.size === 0) {
      console.log('No files to upload');
      return;
    }

    try {
      console.log('Uploading files...');
      console.log('Files to upload:', Array.from(this.uploadedFiles.entries()).map(([k, v]) => `${k}: ${v.length} file(s)`));

      for (const [fieldKey, files] of this.uploadedFiles.entries()) {
        const formData = new FormData();

        // Add files - use fieldKey as the form field name
        // Backend uses file.Name (form field name) to identify which field the file belongs to
        files.forEach((file, index) => {
          console.log(`Adding file to FormData: ${file.name} (${file.size} bytes, type: ${file.type})`);
          // Use fieldKey as the form field name so backend can identify it
          formData.append(fieldKey, file, file.name);
        });

        // Log FormData contents
        console.log('FormData entries:');
        for (let pair of (formData as any).entries()) {
          console.log(`  ${pair[0]}:`, pair[1]);
        }

        console.log(`Uploading ${files.length} file(s) for field ${fieldKey}`);
        console.log(`Upload URL: /api/Workflow/instances/${this.instanceId}/steps/${this.stepDefinition.stepId}/upload`);

        const uploadedBy = this.getCurrentUserEmail();
        const result = await this.workflowService.uploadFiles(
          this.instanceId,
          this.stepDefinition.stepId,
          uploadedBy,
          formData
        ).toPromise();

        console.log(`Files uploaded successfully for ${fieldKey}:`, result);

        // Update form data with file metadata
        if (result && result.uploadedFiles && result.uploadedFiles[fieldKey]) {
          const fileMetadata = result.uploadedFiles[fieldKey];
          this.form.patchValue({ [fieldKey]: fileMetadata });
        }
      }

      console.log('All files uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading files:', error);
      console.error('Error details:', error.error);
      throw new Error(error.error?.message || 'Failed to upload files. Please try again.');
    }
  }
}
