import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { forkJoin } from 'rxjs';

export interface WorkflowDefinition {
  certificationId: string;
  name: string;
  description: string;
  version: string;
  metadata: {
    workflowCode: string;
    applicableCertificateTypes: string[];
    estimatedTotalDurationDays: number;
    complexity: string;
    requiresFactoryVisit: boolean;
  };
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  stepRef?: string;
  stepId?: string;
  name?: string;
  overrides?: {
    nextStep: string;
  };
}

export interface StepDefinition {
  stepId: string;
  name: string;
  actor: string;
  description: string;
  fields: any[];
  stepConfig: {
    canSendBack: boolean;
    estimatedDurationHours: number;
    nextStep: string;
    isMandatory: boolean;
  };
}

@Component({
  selector: 'app-workflow-selector',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule, FormlyBootstrapModule],
  templateUrl: './workflow-selector.component.html',
  styleUrl: './workflow-selector.component.css'
})
export class WorkflowSelectorComponent implements OnInit {
  private http = inject(HttpClient);

  workflows = signal<WorkflowDefinition[]>([]);
  selectedWorkflow = signal<WorkflowDefinition | null>(null);
  currentStep = signal<StepDefinition | null>(null);
  currentStepIndex = signal<number>(0);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // ngx-formly form state
  form = new FormGroup({});
  model: Record<string, any> = {};
  fields = signal<FormlyFieldConfig[]>([]);

  // Store form data for each step
  stepFormData: Record<string, any> = {};

  private definitionsPath = 'assets/forms/workflows/Definitions';

  // List of workflow definition files
  private workflowFiles = [
    'BT501_shampoo_new.json',
    'CT401_lithium_battery_new.json',
    'SASO301_Cooker.json'
  ];

  ngOnInit(): void {
    this.loadWorkflowDefinitions();
  }

  loadWorkflowDefinitions(): void {
    this.loading.set(true);
    this.error.set(null);

    const requests = this.workflowFiles.map(file =>
      this.http.get<WorkflowDefinition>(`${this.definitionsPath}/${file}`)
    );

    forkJoin(requests).subscribe({
      next: (definitions: WorkflowDefinition[]) => {
        this.workflows.set(definitions);
        this.loading.set(false);
      },
      error: (err: Error) => {
        console.error('Error loading workflow definitions:', err);
        this.error.set('Failed to load workflow definitions');
        this.loading.set(false);
      }
    });
  }

  startWorkflow(workflow: WorkflowDefinition): void {
    this.selectedWorkflow.set(workflow);
    this.currentStepIndex.set(0);
    this.stepFormData = {};
    this.loadFirstStep(workflow);
  }

  private loadFirstStep(workflow: WorkflowDefinition): void {
    const firstStep = workflow.steps[0];
    
    if (firstStep.stepRef) {
      this.loading.set(true);
      const stepPath = `assets/forms/${firstStep.stepRef}.json`;
      
      this.http.get<StepDefinition>(stepPath).subscribe({
        next: (stepDef: StepDefinition) => {
          this.setCurrentStep(stepDef);
          this.loading.set(false);
        },
        error: (err: Error) => {
          console.error('Error loading step definition:', err);
          this.error.set('Failed to load step definition');
          this.loading.set(false);
        }
      });
    }
  }

  private setCurrentStep(stepDef: StepDefinition): void {
    this.currentStep.set(stepDef);
    
    // Reset form for new step
    this.form = new FormGroup({});
    
    // Load saved data for this step if exists, otherwise empty model
    this.model = this.stepFormData[stepDef.stepId] || {};
    
    // Convert fields from JSON to formly format
    const convertedFields = this.convertFieldsToFormly(stepDef.fields);
    this.fields.set(convertedFields);
  }

  private convertFieldsToFormly(jsonFields: any[]): FormlyFieldConfig[] {
    return jsonFields.map(field => {
      const formlyField: FormlyFieldConfig = {
        key: field.key,
        type: field.type,
        props: this.convertProps(field)
      };

      // Handle fieldArray for repeat type
      if (field.fieldArray && field.type === 'repeat') {
        formlyField.fieldArray = {
          fieldGroup: this.convertFieldsToFormly(field.fieldArray.fieldGroup || [])
        };
      }

      // Handle fieldGroup for add-to-table type
      if (field.fieldGroup && field.type === 'add-to-table') {
        formlyField.fieldGroup = this.convertFieldsToFormly(field.fieldGroup);
      }

      return formlyField;
    });
  }

  private convertProps(field: any): any {
    const props: any = {};

    if (field.templateOptions) {
      const tpl = field.templateOptions;
      
      if (tpl.label) props.label = tpl.label;
      if (tpl.placeholder) props.placeholder = tpl.placeholder;
      if (tpl.required !== undefined) props.required = tpl.required;
      if (tpl.options) props.options = tpl.options;
      if (tpl.type) props.type = tpl.type;
      if (tpl.rows) props.rows = tpl.rows;
      if (tpl.accept) props.accept = tpl.accept;
      if (tpl.multiple !== undefined) props.multiple = tpl.multiple;
      
      // Handle table-specific properties
      if (field.type === 'table') {
        if (tpl.columns) props.columns = tpl.columns;
        if (tpl.columnHeaders) props.columnHeaders = tpl.columnHeaders;
        if (tpl.emptyMessage) props.emptyMessage = tpl.emptyMessage;
        if (tpl.badgeColumns) props.badgeColumns = tpl.badgeColumns;
      }

      // Handle repeat-specific properties
      if (field.type === 'repeat') {
        if (tpl.addText) props.addText = tpl.addText;
        if (tpl.removeText) props.removeText = tpl.removeText;
        if (tpl.saveText) props.saveText = tpl.saveText;
        if (tpl.itemLabel) props.itemLabel = tpl.itemLabel;
        if (tpl.titleField) props.titleField = tpl.titleField;
        if (tpl.subtitleField) props.subtitleField = tpl.subtitleField;
      }

      // Handle add-to-table specific properties
      if (field.type === 'add-to-table') {
        if (tpl.addText) props.addText = tpl.addText;
        if (tpl.saveText) props.saveText = tpl.saveText;
        if (tpl.cancelText) props.cancelText = tpl.cancelText;
        if (tpl.targetTableKey) props.targetTableKey = tpl.targetTableKey;
        if (tpl.fieldMapping) props.fieldMapping = tpl.fieldMapping;
        if (tpl.defaults) props.defaults = tpl.defaults;
      }
    }

    if (field.props) {
      Object.assign(props, field.props);
    }

    return props;
  }

  private saveCurrentStepData(): void {
    const step = this.currentStep();
    if (step) {
      this.stepFormData[step.stepId] = { ...this.model };
    }
  }

  loadNextStep(): void {
    // Save current step data before navigating
    this.saveCurrentStepData();

    const workflow = this.selectedWorkflow();
    const currentIndex = this.currentStepIndex();
    
    if (workflow && currentIndex < workflow.steps.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextStepDef = workflow.steps[nextIndex];
      
      if (nextStepDef.stepRef) {
        this.loading.set(true);
        this.currentStepIndex.set(nextIndex);
        
        const stepPath = `assets/forms/${nextStepDef.stepRef}.json`;
        
        this.http.get<StepDefinition>(stepPath).subscribe({
          next: (stepDef: StepDefinition) => {
            this.setCurrentStep(stepDef);
            this.loading.set(false);
          },
          error: (err: Error) => {
            console.error('Error loading step definition:', err);
            this.error.set('Failed to load step definition');
            this.loading.set(false);
          }
        });
      } else if (nextStepDef.stepId === 'completed') {
        this.currentStep.set(null);
        this.currentStepIndex.set(nextIndex);
        this.fields.set([]);
        console.log('Workflow completed. All form data:', this.stepFormData);
      }
    }
  }

  loadPreviousStep(): void {
    // Save current step data before navigating
    this.saveCurrentStepData();

    const workflow = this.selectedWorkflow();
    const currentIndex = this.currentStepIndex();
    
    if (workflow && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevStepDef = workflow.steps[prevIndex];
      
      if (prevStepDef.stepRef) {
        this.loading.set(true);
        this.currentStepIndex.set(prevIndex);
        
        const stepPath = `assets/forms/${prevStepDef.stepRef}.json`;
        
        this.http.get<StepDefinition>(stepPath).subscribe({
          next: (stepDef: StepDefinition) => {
            this.setCurrentStep(stepDef);
            this.loading.set(false);
          },
          error: (err: Error) => {
            console.error('Error loading step definition:', err);
            this.error.set('Failed to load step definition');
            this.loading.set(false);
          }
        });
      }
    }
  }

  backToWorkflowList(): void {
    this.selectedWorkflow.set(null);
    this.currentStep.set(null);
    this.currentStepIndex.set(0);
    this.error.set(null);
    this.form = new FormGroup({});
    this.model = {};
    this.fields.set([]);
    this.stepFormData = {};
  }

  isLastStep(): boolean {
    const workflow = this.selectedWorkflow();
    const currentIndex = this.currentStepIndex();
    return workflow ? currentIndex >= workflow.steps.length - 2 : false;
  }

  isFirstStep(): boolean {
    return this.currentStepIndex() === 0;
  }

  isFormValid(): boolean {
    return this.form.valid;
  }

  getComplexityClass(complexity: string): string {
    switch (complexity.toLowerCase()) {
      case 'low': return 'complexity-low';
      case 'medium': return 'complexity-medium';
      case 'high': return 'complexity-high';
      default: return '';
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.saveCurrentStepData();
      console.log('Step submitted:', this.model);
      this.loadNextStep();
    }
  }
}
