import { Component, inject, signal, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { JsonFormComponent, FormFieldDefinition } from '../json-form/json-form.component';
import { WorkflowHooksService } from '../../services/workflow-hooks.service';
import { WorkflowService, WorkflowInstance, StepHistoryEntry } from '../../services/workflow.service';
import { 
  StateMachineService, 
  WorkflowStatusInfo, 
  StepStatusResponse,
  StepEvent,
  WorkflowEvent 
} from '../../services/state-machine.service';
import { environment } from '../../../environments/environment';

export interface WorkflowDefinition {
  certificationId: string;
  name: string;
  description: string;
  version: string;
  metadata?: {
    workflowCode?: string;
    applicableCertificateTypes?: string[];
    estimatedTotalDurationDays?: number;
    complexity?: string;
    requiresFactoryVisit?: boolean;
  };
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  stepRef?: string;
  stepId?: string;
  name?: string;
  overrides?: { nextStep: string; };
}

export interface CustomAction {
  label: string;
  hookName: string;
  buttonClass?: string;
  validateHook?: string;
}

export interface StepDefinition {
  stepId: string;
  name: string;
  actor: string;
  description: string;
  fields?: any[];
  schema?: any;
  uischema?: any;
  hooks?: { onInit?: string[]; onChange?: Record<string, string>; };
  stateMachine?: {
    initialStatus: string;
    allowedEvents: string[];
    transitions: Record<string, any>;
    requiredForSubmit?: string[];
    canGoBack: boolean;
  };
  context?: { provides?: string[]; requires?: string[]; filters?: Record<string, any>; };
  customActions?: CustomAction[];
  stepConfig: {
    canSendBack: boolean;
    estimatedDurationHours: number;
    nextStep: string;
    previousStep?: string | null;
    isFirstStep?: boolean;
    isLastStep?: boolean;
    isMandatory?: boolean;
    validation?: { type: string; minRequired?: number; message?: string; };
  };
}

@Component({
  selector: 'app-workflow-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, JsonFormComponent],
  templateUrl: './workflow-selector.component.html',
  styleUrl: './workflow-selector.component.css'
})
export class WorkflowSelectorComponent implements OnInit {
  @ViewChild(JsonFormComponent) jsonFormComponent!: JsonFormComponent;
  
  private http = inject(HttpClient);
  private workflowHooksService = inject(WorkflowHooksService);
  private workflowService = inject(WorkflowService);
  private stateMachineService = inject(StateMachineService);
  private cdr = inject(ChangeDetectorRef);
  private apiUrl = `${environment.apiBaseUrl}/Workflow`;

  workflows = signal<WorkflowDefinition[]>([]);
  selectedWorkflow = signal<WorkflowDefinition | null>(null);
  currentStep = signal<StepDefinition | null>(null);
  currentStepIndex = signal<number>(0);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  currentInstance = signal<WorkflowInstance | null>(null);
  workflowStatus = signal<WorkflowStatusInfo | null>(null);
  stepStatus = signal<StepStatusResponse | null>(null);
  availableStepEvents = signal<string[]>([]);
  model: Record<string, any> = {};
  fields = signal<any[]>([]);
  schema = signal<any>(null);
  uischema = signal<any>(null);
  stepFormData: Record<string, any> = {};
  private stepHooks: any = null;

  ngOnInit(): void { this.loadWorkflowDefinitions(); }

  loadWorkflowDefinitions(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<WorkflowDefinition[]>(`${this.apiUrl}/definitions`).subscribe({
      next: (definitions) => { this.workflows.set(definitions); this.loading.set(false); },
      error: (err) => { this.error.set('Failed to load workflow definitions.'); this.loading.set(false); }
    });
  }

  startWorkflow(workflow: WorkflowDefinition): void {
    this.loading.set(true);
    this.selectedWorkflow.set(workflow);
    this.currentStepIndex.set(0);
    this.stepFormData = {};
    this.workflowService.createWorkflowInstance({ certificationId: workflow.certificationId, createdBy: 'user@example.com' }).subscribe({
      next: (instance) => { this.currentInstance.set(instance); this.loadWorkflowStatus(instance.id); this.loadFirstStep(workflow); },
      error: (err) => { this.error.set('Failed to create workflow instance'); this.loading.set(false); }
    });
  }

  private loadWorkflowStatus(instanceId: string): void {
    this.stateMachineService.getStatusInfo(instanceId).subscribe({
      next: (status) => this.workflowStatus.set(status),
      error: () => {}
    });
  }

  private loadStepStatus(instanceId: string, stepId: string): void {
    this.stateMachineService.getStepStatus(instanceId, stepId).subscribe({
      next: (status) => { this.stepStatus.set(status); this.availableStepEvents.set(status.availableEvents); },
      error: () => {}
    });
  }

  private async triggerStepTransition(event: StepEvent): Promise<boolean> {
    const instance = this.currentInstance();
    const step = this.currentStep();
    if (!instance || !step) return true;
    try {
      const result = await this.stateMachineService.triggerStepTransition(instance.id, {
        stepId: step.stepId, event: event.toString(), triggeredBy: 'user@example.com', triggeredByRole: 'customer', formData: this.getFormDataForSave()
      }).toPromise();
      if (result?.success) { this.loadStepStatus(instance.id, step.stepId); if (result.workflowCompleted) { this.workflowStatus.set({ status: 'completed', displayName: 'Completed', description: 'Workflow completed', color: 'green', canEdit: false, canSubmit: false, canCancel: false, availableActions: [] }); } }
      return true;
    } catch { return true; }
  }

  canExecuteStepEvent(event: string): boolean { return this.availableStepEvents().includes(event); }

  private loadFirstStep(workflow: WorkflowDefinition): void {
    const firstStep = workflow.steps[0];
    if (firstStep.stepRef) {
      this.loading.set(true);
      this.http.get<StepDefinition>(`${this.apiUrl}/steps/${encodeURIComponent(firstStep.stepRef)}`).subscribe({
        next: async (stepDef) => { await this.setCurrentStep(stepDef); const instance = this.currentInstance(); if (instance) { this.loadStepStatus(instance.id, stepDef.stepId); await this.triggerStepTransition('Enter' as StepEvent); } this.loading.set(false); },
        error: () => { this.error.set('Failed to load step definition'); this.loading.set(false); }
      });
    }
  }

  private async setCurrentStep(stepDef: StepDefinition, loadFromHistory = false): Promise<void> {
    this.currentStep.set(stepDef);
    if (loadFromHistory) {
      const instance = this.currentInstance();
      if (instance) { try { const h = await this.workflowService.getStepHistory(instance.id, stepDef.stepId).toPromise(); if (h?.dataSnapshot) { this.model = { ...h.dataSnapshot }; this.stepFormData[stepDef.stepId] = { ...h.dataSnapshot }; } else { this.model = this.stepFormData[stepDef.stepId] || {}; } } catch { this.model = this.stepFormData[stepDef.stepId] || {}; } }
      else { this.model = this.stepFormData[stepDef.stepId] || {}; }
    } else { this.model = this.stepFormData[stepDef.stepId] || {}; }
    this.loadContextFromPreviousSteps(stepDef);
    if (stepDef.schema) { if (stepDef.hooks?.onInit?.length) { this.schema.set(null); this.uischema.set(null); this.fields.set([]); await this.loadAndExecuteHooks(stepDef); } this.schema.set(stepDef.schema); this.uischema.set(stepDef.uischema || null); this.fields.set([]); }
    else if (stepDef.fields) { this.schema.set(null); this.uischema.set(null); this.fields.set([...this.convertFields(stepDef.fields)]); await this.loadAndExecuteHooks(stepDef); }
    this.cdr.detectChanges();
  }

  private loadContextFromPreviousSteps(stepDef: StepDefinition): void {
    if (!stepDef.context?.requires?.length) return;
    if (!this.model['_selectedValues']) this.model['_selectedValues'] = {};
    for (const key of stepDef.context.requires) {
      for (const [, data] of Object.entries(this.stepFormData)) {
        if (data[key] !== undefined) this.model['_selectedValues'][key] = data[key];
        if (data['_selectedValues']?.[key] !== undefined) this.model['_selectedValues'][key] = data['_selectedValues'][key];
      }
    }
  }

  private convertFields(jsonFields: any[]): FormFieldDefinition[] {
    return jsonFields.map(f => ({ key: f.key, type: f.type, defaultValue: f.defaultValue, templateOptions: f.templateOptions ? JSON.parse(JSON.stringify(f.templateOptions)) : {}, hooks: f.hooks, showWhen: f.showWhen, hideWhen: f.hideWhen, validation: f.validation, fieldGroup: f.fieldGroup ? this.convertFields(f.fieldGroup) : undefined }));
  }

  private async loadAndExecuteHooks(stepDef: StepDefinition): Promise<void> {
    const workflow = this.selectedWorkflow();
    if (!workflow) return;
    this.stepHooks = this.workflowHooksService.getHooksForStep(workflow.certificationId, stepDef.stepId);
    (window as any).__currentStepHooks = this.stepHooks;
    (window as any).__httpClient = this.http;
    if (this.stepHooks && stepDef.hooks?.onInit) {
      for (const hookName of stepDef.hooks.onInit) {
        if (this.stepHooks[hookName]) { try { await this.stepHooks[hookName]({ schema: stepDef.schema, uischema: stepDef.uischema, context: stepDef.context }, this.model, {}, this.http); } catch {} }
      }
    }
  }

  onFieldChange(event: { key: string; value: any }): void {
    const field = this.fields().find(f => f.key === event.key);
    if (field?.hooks?.onChange && this.stepHooks?.[field.hooks.onChange]) {
      this.stepHooks[field.hooks.onChange]({ key: field.key, props: field.templateOptions }, this.model, {}, this.http);
      this.model = JSON.parse(JSON.stringify(this.model));
      this.cdr.detectChanges();
    }
  }

  onModelChange(newModel: Record<string, any>): void {
    const changed = Object.keys(newModel).filter(k => this.model[k] !== newModel[k]);
    this.model = newModel;
    const step = this.currentStep();
    if (step?.hooks?.onChange && this.stepHooks && changed.length) {
      for (const k of changed) { const h = step.hooks.onChange[k]; if (h && this.stepHooks[h]) { this.stepHooks[h]({ schema: step.schema, uischema: step.uischema, context: step.context }, this.model, {}, this.http); this.cdr.detectChanges(); } }
    }
  }

  private saveCurrentStepData(): void { const s = this.currentStep(); if (s) this.stepFormData[s.stepId] = { ...this.model }; }

  private getFormDataForSave(): Record<string, any> {
    const step = this.currentStep();
    if (!step) return {};
    const formData: Record<string, any> = {};
    const keys: string[] = step.schema?.properties ? Object.keys(step.schema.properties) : step.fields ? this.extractKeys(step.fields) : [];
    for (const k of keys) { if (this.model.hasOwnProperty(k) && this.model[k] !== undefined && this.model[k] !== null && this.model[k] !== '') formData[k] = this.model[k]; }
    if (this.model['_selectedValues']) formData['_selectedValues'] = this.model['_selectedValues'];
    return formData;
  }

  private extractKeys(fields: any[]): string[] {
    const keys: string[] = [];
    for (const f of fields) { if (f.key) keys.push(f.key); if (f.fieldGroup) keys.push(...this.extractKeys(f.fieldGroup)); }
    return keys;
  }

  async loadNextStep(): Promise<void> {
    this.saveCurrentStepData();
    const instance = this.currentInstance(), workflow = this.selectedWorkflow(), idx = this.currentStepIndex(), step = this.currentStep();
    if (!workflow || !instance || !step) return;
    await this.triggerStepTransition('Submit' as StepEvent);
    const nextIdx = idx + 1;
    if (nextIdx >= workflow.steps.length) return;
    const nextDef = workflow.steps[nextIdx], nextId = nextDef.stepId || nextDef.stepRef?.split('/').pop() || '';
    const data = this.getFormDataForSave();
    if (Object.keys(data).length) {
      this.loading.set(true);
      this.workflowService.advanceToNextStep(instance.id, { currentStepId: step.stepId, nextStepId: nextId, formData: data, submittedBy: 'user@example.com' }).subscribe({
        next: (u) => { this.currentInstance.set(u); this.loadWorkflowStatus(u.id); this.proceedToNextStep(workflow, idx); },
        error: () => { this.error.set('Failed to save step data'); this.loading.set(false); }
      });
    } else this.proceedToNextStep(workflow, idx);
  }

  private proceedToNextStep(workflow: WorkflowDefinition, idx: number): void {
    if (idx < workflow.steps.length - 1) {
      const nextIdx = idx + 1, nextDef = workflow.steps[nextIdx];
      if (nextDef.stepRef) {
        this.loading.set(true); this.currentStepIndex.set(nextIdx);
        this.http.get<StepDefinition>(`${this.apiUrl}/steps/${encodeURIComponent(nextDef.stepRef)}`).subscribe({
          next: async (s) => { await this.setCurrentStep(s, false); const i = this.currentInstance(); if (i) { this.loadStepStatus(i.id, s.stepId); await this.triggerStepTransition('Enter' as StepEvent); } this.loading.set(false); },
          error: () => { this.error.set('Failed to load step definition'); this.loading.set(false); }
        });
      } else if (nextDef.stepId === 'completed') { this.currentStep.set(null); this.currentStepIndex.set(nextIdx); this.fields.set([]); this.loading.set(false); }
    } else this.loading.set(false);
  }

  async loadPreviousStep(): Promise<void> {
    this.saveCurrentStepData();
    const instance = this.currentInstance(), workflow = this.selectedWorkflow(), idx = this.currentStepIndex();
    if (!workflow || !instance || idx <= 0) return;
    if (!this.canExecuteStepEvent('GoBack')) { this.error.set('Cannot go back'); return; }
    await this.triggerStepTransition('GoBack' as StepEvent);
    const prevIdx = idx - 1, prevDef = workflow.steps[prevIdx], prevId = prevDef.stepId || prevDef.stepRef?.split('/').pop() || '';
    this.loading.set(true);
    this.workflowService.goToPreviousStep(instance.id, prevId).subscribe({
      next: (u) => {
        this.currentInstance.set(u); this.loadWorkflowStatus(u.id);
        if (prevDef.stepRef) {
          this.currentStepIndex.set(prevIdx);
          this.http.get<StepDefinition>(`${this.apiUrl}/steps/${encodeURIComponent(prevDef.stepRef)}`).subscribe({
            next: async (s) => { await this.setCurrentStep(s, true); this.loadStepStatus(u.id, s.stepId); this.loading.set(false); },
            error: () => { this.error.set('Failed to load step'); this.loading.set(false); }
          });
        }
      },
      error: () => { this.error.set('Failed to go back'); this.loading.set(false); }
    });
  }

  async saveStepProgress(): Promise<void> {
    const instance = this.currentInstance(), step = this.currentStep();
    if (!instance || !step) return;
    await this.triggerStepTransition('Save' as StepEvent);
    this.workflowService.saveDraftData(instance.id, this.getFormDataForSave()).subscribe({ next: () => {}, error: () => {} });
  }

  backToWorkflowList(): void {
    this.selectedWorkflow.set(null); this.currentStep.set(null); this.currentStepIndex.set(0); this.currentInstance.set(null);
    this.workflowStatus.set(null); this.stepStatus.set(null); this.availableStepEvents.set([]); this.error.set(null);
    this.model = {}; this.fields.set([]); this.schema.set(null); this.uischema.set(null); this.stepFormData = {}; this.stepHooks = null;
  }

  isLastStep(): boolean { const w = this.selectedWorkflow(); return w ? this.currentStepIndex() >= w.steps.length - 2 : false; }
  isFirstStep(): boolean { const s = this.currentStep(); return s?.stepConfig?.isFirstStep || this.currentStepIndex() === 0; }
  canGoBack(): boolean { const s = this.currentStep(); if (s?.stateMachine?.canGoBack === false) return false; if (s?.stepConfig?.isFirstStep) return false; return this.currentStepIndex() > 0; }

  isFormValid(): boolean {
    const step = this.currentStep();
    if (step?.stateMachine?.requiredForSubmit) { for (const k of step.stateMachine.requiredForSubmit) { const v = this.model[k]; if (Array.isArray(v) ? v.length === 0 : !v) return false; } }
    if (step?.stepConfig?.validation) { const t = this.model[step.stepConfig.validation.type]; const min = step.stepConfig.validation.minRequired || 1; if (Array.isArray(t) ? t.length < min : min > 0) return false; }
    return true;
  }

  getComplexityClass(c: string | undefined): string { if (!c) return ''; switch (c.toLowerCase()) { case 'low': return 'complexity-low'; case 'medium': return 'complexity-medium'; case 'high': return 'complexity-high'; default: return ''; } }
  getStatusClass(): string { const s = this.workflowStatus(); return s ? this.stateMachineService.getStatusColorClass(s.status) : ''; }
  getStatusDisplayName(): string { return this.workflowStatus()?.displayName || 'Unknown'; }

  onSubmit(): void { if (this.isFormValid()) { this.saveCurrentStepData(); this.loadNextStep(); } }

  executeCustomAction(action: CustomAction): void {
    if (!this.stepHooks?.[action.hookName]) return;
    const s = this.currentStep();
    const r = this.stepHooks[action.hookName]({ schema: s?.schema, uischema: s?.uischema, context: s?.context }, this.model, {}, this.http);
    if (r !== false) this.cdr.detectChanges();
  }

  isCustomActionEnabled(action: CustomAction): boolean {
    if (!action.validateHook || !this.stepHooks?.[action.validateHook]) return true;
    const s = this.currentStep();
    try { return this.stepHooks[action.validateHook]({ schema: s?.schema, uischema: s?.uischema, context: s?.context }, this.model, {}, this.http); } catch { return false; }
  }
}
