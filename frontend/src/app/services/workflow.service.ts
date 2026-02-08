import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  steps?: any[];
  workflowConfig?: any;
  slaConfig?: any;
  notifications?: any;
  permissions?: any;
  integrations?: any;
}

export interface WorkflowInstance {
  id: string;
  definitionId: string;
  workflowType: string;
  currentStep: string;
  status: string;
  assignedActor: string;
  startedAt: string;
  createdBy: string;
  currentData: any;
  stepHistory: any[];
}

export interface WorkflowInstanceCreateRequest {
  certificationId: string;
  createdBy: string;
  priority?: number;
  tags?: string[];
}

export interface WorkflowSubmission {
  certificationId: string;
  stepId: string;
  formData: any;
  submittedBy: string;
  decision?: string;
  comments?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  errors: ValidationError[];
}

export interface ValidationError {
  ruleId?: string;
  field?: string;
  message: string;
}

export interface CurrentStepResponse {
  instance: WorkflowInstance;
  stepDefinition: any;
  currentData: any;
}

export interface AdvanceStepRequest {
  currentStepId: string;
  nextStepId: string;
  formData: any;
  submittedBy: string;
}

export interface GoBackRequest {
  previousStepId: string;
}

export interface StepHistoryEntry {
  stepId: string;
  completedAt: string;
  completedBy: string;
  actorRole: string;
  dataSnapshot: any;
  changedFields?: any;
  decision?: string;
  comments?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  private apiUrl = '/api/Workflow';

  constructor(private http: HttpClient) { }

  /**
   * Get all available workflow definitions
   */
  getWorkflowDefinitions(): Observable<WorkflowDefinition[]> {
    return this.http.get<WorkflowDefinition[]>(`${this.apiUrl}/definitions`);
  }

  /**
   * Get a specific workflow definition by certification ID
   */
  getWorkflowDefinition(certificationId: string): Observable<WorkflowDefinition> {
    return this.http.get<WorkflowDefinition>(`${this.apiUrl}/definitions/${certificationId}`);
  }

  /**
   * Get a step definition by step name
   */
  getStepByName(stepName: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/step-by-name/${stepName}`);
  }

  /**
   * Create a new workflow instance
   */
  createWorkflowInstance(request: WorkflowInstanceCreateRequest): Observable<WorkflowInstance> {
    return this.http.post<WorkflowInstance>(`${this.apiUrl}/instances`, request);
  }

  /**
   * Get a workflow instance by ID
   */
  getWorkflowInstance(instanceId: string): Observable<WorkflowInstance> {
    return this.http.get<WorkflowInstance>(`${this.apiUrl}/instances/${instanceId}`);
  }

  /**
   * Get the current step of a workflow instance
   */
  getCurrentStep(instanceId: string): Observable<CurrentStepResponse> {
    return this.http.get<CurrentStepResponse>(`${this.apiUrl}/instances/${instanceId}/current-step`);
  }

  /**
   * Validate step data without submitting
   */
  validateStep(instanceId: string, stepId: string, formData: any): Observable<ValidationResult> {
    return this.http.post<ValidationResult>(
      `${this.apiUrl}/instances/${instanceId}/steps/${stepId}/validate`,
      formData
    );
  }

  /**
   * Submit a workflow step
   */
  submitStep(instanceId: string, submission: WorkflowSubmission): Observable<WorkflowInstance> {
    return this.http.post<WorkflowInstance>(
      `${this.apiUrl}/instances/${instanceId}/submit`,
      submission
    );
  }

  /**
   * Save draft data for a workflow step (without completing the step)
   */
  saveDraftData(instanceId: string, formData: any): Observable<WorkflowInstance> {
    return this.http.patch<WorkflowInstance>(
      `${this.apiUrl}/instances/${instanceId}/data`,
      { formData }
    );
  }

  /**
   * Get workflow instances by status
   */
  getWorkflowsByStatus(status: string, actor?: string): Observable<WorkflowInstance[]> {
    let url = `${this.apiUrl}/instances?status=${status}`;
    if (actor) {
      url += `&actor=${actor}`;
    }
    return this.http.get<WorkflowInstance[]>(url);
  }

  /**
   * Upload files for a workflow step
   */
  uploadFiles(instanceId: string, stepId: string, uploadedBy: string, files: FormData): Observable<any> {
    console.log('=== WORKFLOW SERVICE: Uploading files ===');
    console.log('Instance ID:', instanceId);
    console.log('Step ID:', stepId);
    console.log('Uploaded By:', uploadedBy);
    console.log('FormData:', files);

    // Log FormData contents
    console.log('FormData contents:');
    (files as any).forEach((value: any, key: string) => {
      console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
    });

    // Don't set Content-Type header - browser will set it automatically with boundary
    return this.http.post<any>(
      `${this.apiUrl}/instances/${instanceId}/steps/${stepId}/upload?uploadedBy=${uploadedBy}`,
      files
    );
  }

  /**
   * Download a file
   */
  downloadFile(fileName: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/files/${fileName}`, {
      responseType: 'blob'
    });
  }

  /**
   * Advance to the next step and save current step to history
   */
  advanceToNextStep(instanceId: string, request: AdvanceStepRequest): Observable<WorkflowInstance> {
    return this.http.post<WorkflowInstance>(
      `${this.apiUrl}/instances/${instanceId}/advance`,
      request
    );
  }

  /**
   * Go back to a previous step
   */
  goToPreviousStep(instanceId: string, previousStepId: string): Observable<WorkflowInstance> {
    return this.http.post<WorkflowInstance>(
      `${this.apiUrl}/instances/${instanceId}/go-back`,
      { previousStepId }
    );
  }

  /**
   * Get step history data for a specific step
   */
  getStepHistory(instanceId: string, stepId: string): Observable<StepHistoryEntry> {
    return this.http.get<StepHistoryEntry>(
      `${this.apiUrl}/instances/${instanceId}/steps/${stepId}/history`
    );
  }
}
