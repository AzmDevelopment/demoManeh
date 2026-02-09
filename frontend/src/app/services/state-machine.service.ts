import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * Workflow status enum matching backend
 */
export type WorkflowStatus = 
  | 'draft' 
  | 'in_progress' 
  | 'on_hold' 
  | 'pending_approval' 
  | 'revision' 
  | 'completed' 
  | 'cancelled' 
  | 'failed' 
  | 'expired';

/**
 * Step status enum matching backend
 */
export type StepStatus = 
  | 'not_started' 
  | 'active' 
  | 'in_progress' 
  | 'sent_back' 
  | 'pending_approval' 
  | 'completed' 
  | 'skipped' 
  | 'failed';

/**
 * Workflow events that trigger state transitions
 */
export type WorkflowEvent = 
  | 'Create' 
  | 'Start' 
  | 'Submit' 
  | 'Approve' 
  | 'Reject' 
  | 'SendBack' 
  | 'Cancel' 
  | 'Resume' 
  | 'Hold' 
  | 'Complete' 
  | 'Fail' 
  | 'Expire' 
  | 'Reset';

/**
 * Step events that trigger step state transitions
 */
export type StepEvent = 
  | 'Enter' 
  | 'Save' 
  | 'Submit' 
  | 'Approve' 
  | 'Reject' 
  | 'SendBack' 
  | 'Skip' 
  | 'GoBack' 
  | 'Complete' 
  | 'Fail' 
  | 'Reset';

/**
 * Transition result from backend
 */
export interface TransitionResult {
  success: boolean;
  errorMessage?: string;
  previousState?: string;
  newState?: string;
  transitionDescription?: string;
  timestamp: string;
}

/**
 * Step transition result from backend
 */
export interface StepTransitionResult {
  success: boolean;
  errorMessage?: string;
  previousStepStatus?: string;
  newStepStatus?: string;
  nextStepId?: string;
  workflowCompleted: boolean;
}

/**
 * Transition definition
 */
export interface TransitionDefinition {
  fromState: string;
  event: string;
  toState: string;
  requiredRole?: string;
  description?: string;
}

/**
 * Workflow status display info
 */
export interface WorkflowStatusInfo {
  status: string;
  displayName: string;
  description: string;
  color: string;
  canEdit: boolean;
  canSubmit: boolean;
  canCancel: boolean;
  availableActions: string[];
}

/**
 * Step status response
 */
export interface StepStatusResponse {
  stepId: string;
  status: string;
  isCurrentStep: boolean;
  availableEvents: string[];
}

/**
 * Audit record for transitions
 */
export interface TransitionAuditRecord {
  id: string;
  workflowInstanceId: string;
  stepId?: string;
  transitionType: 'workflow' | 'step';
  fromState: string;
  toState: string;
  event: string;
  triggeredBy: string;
  triggeredByRole?: string;
  timestamp: string;
  comments?: string;
}

/**
 * Workflow transition request - for API calls
 */
export interface WorkflowTransitionRequest {
  event: string;
  triggeredBy: string;
  triggeredByRole?: string;
  comments?: string;
}

/**
 * Step transition request - for API calls
 */
export interface StepTransitionRequest {
  stepId: string;
  event: string;
  triggeredBy: string;
  triggeredByRole?: string;
  formData?: Record<string, any>;
  comments?: string;
}

/**
 * Can transition response
 */
interface CanTransitionResponse {
  canTransition: boolean;
  currentState?: string;
  event?: string;
  reason?: string;
}

/**
 * Frontend State Machine Service
 * Communicates with backend state machine for proper state transitions
 */
@Injectable({
  providedIn: 'root'
})
export class StateMachineService {
  private readonly apiUrl = `${environment.apiBaseUrl}/StateMachine`;
  private readonly isEnabled = environment.stateMachineEnabled;
  
  // Observable state for UI updates
  private currentStatusSubject = new BehaviorSubject<WorkflowStatusInfo | null>(null);
  public currentStatus$ = this.currentStatusSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('StateMachineService initialized', {
      apiUrl: this.apiUrl,
      enabled: this.isEnabled
    });
  }

  /**
   * Trigger a workflow state transition
   */
  triggerWorkflowTransition(
    instanceId: string,
    request: WorkflowTransitionRequest
  ): Observable<TransitionResult> {
    if (!this.isEnabled) {
      return of({ success: true, timestamp: new Date().toISOString() } as TransitionResult);
    }

    return this.http.post<TransitionResult>(
      `${this.apiUrl}/${instanceId}/transition`,
      request
    ).pipe(
      tap((result: TransitionResult) => {
        if (result.success) {
          console.log(`Workflow transition: ${result.previousState} -> ${result.newState}`);
        }
      }),
      catchError(err => {
        console.warn('Workflow transition error:', err);
        return of({ success: false, errorMessage: err.message, timestamp: new Date().toISOString() } as TransitionResult);
      })
    );
  }

  /**
   * Trigger a step state transition
   */
  triggerStepTransition(
    instanceId: string,
    request: StepTransitionRequest
  ): Observable<StepTransitionResult> {
    if (!this.isEnabled) {
      return of({ 
        success: true, 
        workflowCompleted: false,
        previousStepStatus: 'active',
        newStepStatus: request.event === 'Submit' ? 'completed' : 'in_progress'
      } as StepTransitionResult);
    }

    console.log('Calling step transition API:', `${this.apiUrl}/${instanceId}/step-transition`, request);

    return this.http.post<StepTransitionResult>(
      `${this.apiUrl}/${instanceId}/step-transition`,
      request
    ).pipe(
      tap((result: StepTransitionResult) => {
        if (result.success) {
          console.log(`Step transition: ${result.previousStepStatus} -> ${result.newStepStatus}`);
          if (result.workflowCompleted) {
            console.log('Workflow completed!');
          }
        }
      }),
      catchError(err => {
        console.warn('Step transition error:', err);
        return of({ 
          success: true, // Return success to not block workflow
          workflowCompleted: false,
          errorMessage: err.message 
        } as StepTransitionResult);
      })
    );
  }

  /**
   * Get available workflow transitions for current state
   */
  getAvailableTransitions(
    instanceId: string,
    userRole?: string
  ): Observable<TransitionDefinition[]> {
    if (!this.isEnabled) {
      return of([]);
    }

    let params = new HttpParams();
    if (userRole) {
      params = params.set('userRole', userRole);
    }
    return this.http.get<TransitionDefinition[]>(
      `${this.apiUrl}/${instanceId}/available-transitions`,
      { params }
    ).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Get available step events
   */
  getAvailableStepEvents(
    instanceId: string,
    stepId: string,
    userRole?: string
  ): Observable<string[]> {
    if (!this.isEnabled) {
      return of(['Enter', 'Save', 'Submit', 'GoBack']);
    }

    let params = new HttpParams();
    if (userRole) {
      params = params.set('userRole', userRole);
    }
    return this.http.get<string[]>(
      `${this.apiUrl}/${instanceId}/steps/${stepId}/available-events`,
      { params }
    ).pipe(
      catchError(() => of(['Enter', 'Save', 'Submit', 'GoBack']))
    );
  }

  /**
   * Check if a workflow transition is valid
   */
  canTransition(
    instanceId: string,
    event: WorkflowEvent,
    userRole?: string
  ): Observable<boolean> {
    if (!this.isEnabled) {
      return of(true);
    }

    let params = new HttpParams();
    if (userRole) {
      params = params.set('userRole', userRole);
    }
    return this.http.get<CanTransitionResponse>(
      `${this.apiUrl}/${instanceId}/can-transition/${event}`,
      { params }
    ).pipe(
      map((response: CanTransitionResponse) => response.canTransition),
      catchError(() => of(true))
    );
  }

  /**
   * Get workflow status information
   */
  getStatusInfo(instanceId: string): Observable<WorkflowStatusInfo> {
    if (!this.isEnabled) {
      const defaultStatus: WorkflowStatusInfo = {
        status: 'in_progress',
        displayName: 'In Progress',
        description: 'Workflow is being processed',
        color: 'blue',
        canEdit: true,
        canSubmit: true,
        canCancel: true,
        availableActions: ['Submit', 'Hold', 'Cancel']
      };
      this.currentStatusSubject.next(defaultStatus);
      return of(defaultStatus);
    }

    return this.http.get<WorkflowStatusInfo>(
      `${this.apiUrl}/${instanceId}/status-info`
    ).pipe(
      tap((info: WorkflowStatusInfo) => this.currentStatusSubject.next(info)),
      catchError(() => {
        const defaultStatus: WorkflowStatusInfo = {
          status: 'in_progress',
          displayName: 'In Progress',
          description: 'Workflow is being processed',
          color: 'blue',
          canEdit: true,
          canSubmit: true,
          canCancel: true,
          availableActions: ['Submit', 'Hold', 'Cancel']
        };
        this.currentStatusSubject.next(defaultStatus);
        return of(defaultStatus);
      })
    );
  }

  /**
   * Get step status
   */
  getStepStatus(instanceId: string, stepId: string): Observable<StepStatusResponse> {
    if (!this.isEnabled) {
      return of({
        stepId,
        status: 'active',
        isCurrentStep: true,
        availableEvents: ['Enter', 'Save', 'Submit', 'GoBack']
      });
    }

    return this.http.get<StepStatusResponse>(
      `${this.apiUrl}/${instanceId}/steps/${stepId}/status`
    ).pipe(
      catchError(() => of({
        stepId,
        status: 'active',
        isCurrentStep: true,
        availableEvents: ['Enter', 'Save', 'Submit', 'GoBack']
      }))
    );
  }

  /**
   * Get transition audit history
   */
  getAuditHistory(instanceId: string): Observable<TransitionAuditRecord[]> {
    if (!this.isEnabled) {
      return of([]);
    }

    return this.http.get<TransitionAuditRecord[]>(
      `${this.apiUrl}/${instanceId}/audit-history`
    ).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Get all valid workflow events
   */
  getWorkflowEvents(): Observable<string[]> {
    if (!this.isEnabled) {
      return of(['Create', 'Start', 'Submit', 'Approve', 'Reject', 'SendBack', 'Cancel', 'Resume', 'Hold', 'Complete', 'Fail', 'Expire', 'Reset']);
    }

    return this.http.get<string[]>(`${this.apiUrl}/workflow-events`).pipe(
      catchError(() => of(['Create', 'Start', 'Submit', 'Approve', 'Reject', 'SendBack', 'Cancel', 'Resume', 'Hold', 'Complete', 'Fail', 'Expire', 'Reset']))
    );
  }

  /**
   * Get all valid step events
   */
  getStepEvents(): Observable<string[]> {
    if (!this.isEnabled) {
      return of(['Enter', 'Save', 'Submit', 'Approve', 'Reject', 'SendBack', 'Skip', 'GoBack', 'Complete', 'Fail', 'Reset']);
    }

    return this.http.get<string[]>(`${this.apiUrl}/step-events`).pipe(
      catchError(() => of(['Enter', 'Save', 'Submit', 'Approve', 'Reject', 'SendBack', 'Skip', 'GoBack', 'Complete', 'Fail', 'Reset']))
    );
  }

  // =========================================================================
  // Helper Methods for Common Transitions
  // =========================================================================

  /**
   * Start a workflow (draft -> in_progress)
   */
  startWorkflow(instanceId: string, triggeredBy: string): Observable<TransitionResult> {
    return this.triggerWorkflowTransition(instanceId, {
      event: 'Start',
      triggeredBy
    });
  }

  /**
   * Submit workflow for approval (in_progress -> pending_approval)
   */
  submitForApproval(
    instanceId: string,
    triggeredBy: string,
    comments?: string
  ): Observable<TransitionResult> {
    return this.triggerWorkflowTransition(instanceId, {
      event: 'Submit',
      triggeredBy,
      triggeredByRole: 'customer',
      comments
    });
  }

  /**
   * Approve workflow (pending_approval -> in_progress/completed)
   */
  approveWorkflow(
    instanceId: string,
    triggeredBy: string,
    comments?: string
  ): Observable<TransitionResult> {
    return this.triggerWorkflowTransition(instanceId, {
      event: 'Approve',
      triggeredBy,
      triggeredByRole: 'reviewer',
      comments
    });
  }

  /**
   * Reject workflow (pending_approval -> revision)
   */
  rejectWorkflow(
    instanceId: string,
    triggeredBy: string,
    comments?: string
  ): Observable<TransitionResult> {
    return this.triggerWorkflowTransition(instanceId, {
      event: 'Reject',
      triggeredBy,
      triggeredByRole: 'reviewer',
      comments
    });
  }

  /**
   * Cancel workflow
   */
  cancelWorkflow(
    instanceId: string,
    triggeredBy: string,
    comments?: string
  ): Observable<TransitionResult> {
    return this.triggerWorkflowTransition(instanceId, {
      event: 'Cancel',
      triggeredBy,
      comments
    });
  }

  /**
   * Put workflow on hold
   */
  holdWorkflow(
    instanceId: string,
    triggeredBy: string,
    comments?: string
  ): Observable<TransitionResult> {
    return this.triggerWorkflowTransition(instanceId, {
      event: 'Hold',
      triggeredBy,
      comments
    });
  }

  /**
   * Resume workflow from hold
   */
  resumeWorkflow(instanceId: string, triggeredBy: string): Observable<TransitionResult> {
    return this.triggerWorkflowTransition(instanceId, {
      event: 'Resume',
      triggeredBy
    });
  }

  // =========================================================================
  // Step Transition Helpers
  // =========================================================================

  /**
   * Submit a step
   */
  submitStep(
    instanceId: string,
    stepId: string,
    triggeredBy: string,
    formData?: Record<string, any>
  ): Observable<StepTransitionResult> {
    return this.triggerStepTransition(instanceId, {
      stepId,
      event: 'Submit',
      triggeredBy,
      formData
    });
  }

  /**
   * Save step progress
   */
  saveStep(
    instanceId: string,
    stepId: string,
    triggeredBy: string,
    formData?: Record<string, any>
  ): Observable<StepTransitionResult> {
    return this.triggerStepTransition(instanceId, {
      stepId,
      event: 'Save',
      triggeredBy,
      formData
    });
  }

  /**
   * Go back to previous step
   */
  goBackStep(
    instanceId: string,
    stepId: string,
    triggeredBy: string
  ): Observable<StepTransitionResult> {
    return this.triggerStepTransition(instanceId, {
      stepId,
      event: 'GoBack',
      triggeredBy
    });
  }

  // =========================================================================
  // Status Color Helpers for UI
  // =========================================================================

  /**
   * Get CSS color class for status
   */
  getStatusColorClass(status: string): string {
    const colorMap: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'on_hold': 'bg-yellow-100 text-yellow-800',
      'pending_approval': 'bg-orange-100 text-orange-800',
      'revision': 'bg-red-100 text-red-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-gray-100 text-gray-500',
      'failed': 'bg-red-100 text-red-800',
      'expired': 'bg-gray-100 text-gray-500'
    };
    return colorMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Get display name for status
   */
  getStatusDisplayName(status: string): string {
    const nameMap: Record<string, string> = {
      'draft': 'Draft',
      'in_progress': 'In Progress',
      'on_hold': 'On Hold',
      'pending_approval': 'Pending Approval',
      'revision': 'Revision Required',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'failed': 'Failed',
      'expired': 'Expired'
    };
    return nameMap[status.toLowerCase()] || status;
  }
}
