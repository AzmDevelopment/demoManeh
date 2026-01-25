import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { WorkflowService } from '../../services/workflow.service';

@Component({
  selector: 'app-workflow-step',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, ReactiveFormsModule],
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workflowService: WorkflowService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
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
      console.log('API call: getCurrentStep(' + this.instanceId + ')');

      const response = await this.workflowService.getCurrentStep(this.instanceId).toPromise();

      console.log('=== API RESPONSE ===');
      console.log('Full response:', response);

      if (response) {
        this.instance = response.instance;
        this.stepDefinition = response.stepDefinition;
        this.currentData = response.currentData || {};

        console.log('=== PARSED DATA ===');
        console.log('Instance:', this.instance);
        console.log('Instance Current Step:', this.instance?.currentStep);
        console.log('Step Definition:', this.stepDefinition);
        console.log('Step Definition ID:', this.stepDefinition?.stepId);
        console.log('Current Data:', this.currentData);

        // Build form from step definition
        this.buildForm();
        
        // Pre-populate form with existing data
        if (Object.keys(this.currentData).length > 0) {
          this.form.patchValue(this.currentData);
          console.log('Form pre-populated with data');
        }
      }

      this.loading = false;
    } catch (error) {
      console.error('Error loading current step:', error);
      this.error = 'Failed to load workflow step';
      this.loading = false;
    }
  }

  /**
   * Build form dynamically from step definition fields
   */
  private buildForm(): void {
    const formControls: any = {};

    if (this.stepDefinition?.fields) {
      this.stepDefinition.fields.forEach((field: any) => {
        const defaultValue = this.currentData[field.key] || '';
        formControls[field.key] = [defaultValue];
      });
    }

    this.form = this.fb.group(formControls);
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

      this.validating = false;

      if (result && !result.isValid) {
        this.validationErrors = result.errors || [];
        console.log('Validation errors:', this.validationErrors);
        return false;
      }

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
}
