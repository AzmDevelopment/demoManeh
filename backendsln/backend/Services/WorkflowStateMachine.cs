using backend.Models;
using backend.Data;
using System.Text.Json;

namespace backend.Services;

/// <summary>
/// Workflow State Machine Implementation
/// Enforces valid state transitions with role-based access control
/// </summary>
public class WorkflowStateMachine : IWorkflowStateMachine
{
    private readonly IWorkflowRepository _repository;
    private readonly WorkflowDbContext _dbContext;
    private readonly ILogger<WorkflowStateMachine> _logger;

    #region Workflow Transitions Definition
    
    /// <summary>
    /// Defines all valid workflow-level state transitions
    /// </summary>
    private static readonly List<TransitionDefinition> WorkflowTransitions = new()
    {
        // === Draft State ===
        new() { FromState = "draft", Event = "Start", ToState = "in_progress", 
                Description = "Start the workflow" },
        new() { FromState = "draft", Event = "Cancel", ToState = "cancelled", 
                Description = "Cancel before starting" },
        
        // === In Progress State ===
        new() { FromState = "in_progress", Event = "Submit", ToState = "pending_approval", 
                RequiredRole = "customer", Description = "Submit for review" },
        new() { FromState = "in_progress", Event = "Hold", ToState = "on_hold", 
                Description = "Put workflow on hold" },
        new() { FromState = "in_progress", Event = "Cancel", ToState = "cancelled", 
                Description = "Cancel workflow" },
        new() { FromState = "in_progress", Event = "Complete", ToState = "completed", 
                Description = "Mark as complete" },
        new() { FromState = "in_progress", Event = "Fail", ToState = "failed", 
                Description = "Mark as failed" },
        
        // === Pending Approval State ===
        new() { FromState = "pending_approval", Event = "Approve", ToState = "in_progress", 
                RequiredRole = "reviewer", Description = "Approve and continue" },
        new() { FromState = "pending_approval", Event = "Reject", ToState = "revision", 
                RequiredRole = "reviewer", Description = "Reject - needs revision" },
        new() { FromState = "pending_approval", Event = "SendBack", ToState = "revision", 
                RequiredRole = "reviewer", Description = "Send back for changes" },
        new() { FromState = "pending_approval", Event = "Complete", ToState = "completed", 
                RequiredRole = "reviewer", Description = "Final approval - complete" },
        new() { FromState = "pending_approval", Event = "Cancel", ToState = "cancelled", 
                RequiredRole = "admin", Description = "Cancel pending workflow" },
        
        // === On Hold State ===
        new() { FromState = "on_hold", Event = "Resume", ToState = "in_progress", 
                Description = "Resume workflow" },
        new() { FromState = "on_hold", Event = "Cancel", ToState = "cancelled", 
                Description = "Cancel while on hold" },
        new() { FromState = "on_hold", Event = "Expire", ToState = "expired", 
                Description = "Expired due to timeout" },
        
        // === Revision State ===
        new() { FromState = "revision", Event = "Submit", ToState = "pending_approval", 
                RequiredRole = "customer", Description = "Resubmit after revision" },
        new() { FromState = "revision", Event = "Cancel", ToState = "cancelled", 
                Description = "Cancel during revision" },
        new() { FromState = "revision", Event = "Start", ToState = "in_progress", 
                Description = "Continue editing" },
        
        // === Terminal States (can only reset) ===
        new() { FromState = "failed", Event = "Reset", ToState = "draft", 
                RequiredRole = "admin", Description = "Reset failed workflow" },
        new() { FromState = "expired", Event = "Reset", ToState = "draft", 
                RequiredRole = "admin", Description = "Reset expired workflow" },
        new() { FromState = "cancelled", Event = "Reset", ToState = "draft", 
                RequiredRole = "admin", Description = "Restore cancelled workflow" },
    };
    
    #endregion

    #region Step Transitions Definition
    
    /// <summary>
    /// Defines all valid step-level state transitions
    /// Key: (FromStatus, Event) => ToStatus
    /// </summary>
    private static readonly Dictionary<(string From, string Event), string> StepTransitions = new()
    {
        // === Not Started ===
        { ("not_started", "Enter"), "active" },
        { ("not_started", "Skip"), "skipped" },
        
        // === Active ===
        { ("active", "Save"), "in_progress" },
        { ("active", "Submit"), "completed" },
        { ("active", "Complete"), "completed" },
        { ("active", "Fail"), "failed" },
        { ("active", "Skip"), "skipped" },
        
        // === In Progress ===
        { ("in_progress", "Save"), "in_progress" },
        { ("in_progress", "Submit"), "completed" },
        { ("in_progress", "Complete"), "completed" },
        { ("in_progress", "SendBack"), "sent_back" },
        { ("in_progress", "GoBack"), "active" },
        { ("in_progress", "Fail"), "failed" },
        
        // === Sent Back ===
        { ("sent_back", "Enter"), "active" },
        { ("sent_back", "Save"), "in_progress" },
        { ("sent_back", "Submit"), "completed" },
        
        // === Pending Approval (step level) ===
        { ("pending_approval", "Approve"), "completed" },
        { ("pending_approval", "Reject"), "sent_back" },
        { ("pending_approval", "SendBack"), "sent_back" },
        
        // === Completed (can go back for editing) ===
        { ("completed", "GoBack"), "active" },
        { ("completed", "Reset"), "active" },
        
        // === Failed ===
        { ("failed", "Reset"), "active" },
        
        // === Skipped ===
        { ("skipped", "Enter"), "active" },
        { ("skipped", "Reset"), "not_started" },
    };
    
    #endregion

    #region Status Display Configuration
    
    private static readonly Dictionary<string, WorkflowStatusInfo> StatusInfoMap = new()
    {
        ["draft"] = new() { 
            Status = "draft", DisplayName = "Draft", 
            Description = "Workflow created but not started",
            Color = "gray", CanEdit = true, CanSubmit = false, CanCancel = true,
            AvailableActions = new() { "Start", "Cancel" }
        },
        ["in_progress"] = new() { 
            Status = "in_progress", DisplayName = "In Progress", 
            Description = "Workflow is being processed",
            Color = "blue", CanEdit = true, CanSubmit = true, CanCancel = true,
            AvailableActions = new() { "Submit", "Hold", "Cancel" }
        },
        ["on_hold"] = new() { 
            Status = "on_hold", DisplayName = "On Hold", 
            Description = "Workflow is paused",
            Color = "yellow", CanEdit = false, CanSubmit = false, CanCancel = true,
            AvailableActions = new() { "Resume", "Cancel" }
        },
        ["pending_approval"] = new() { 
            Status = "pending_approval", DisplayName = "Pending Approval", 
            Description = "Waiting for reviewer approval",
            Color = "orange", CanEdit = false, CanSubmit = false, CanCancel = false,
            AvailableActions = new() { "Approve", "Reject", "SendBack" }
        },
        ["revision"] = new() { 
            Status = "revision", DisplayName = "Revision Required", 
            Description = "Sent back for corrections",
            Color = "red", CanEdit = true, CanSubmit = true, CanCancel = true,
            AvailableActions = new() { "Submit", "Cancel" }
        },
        ["completed"] = new() { 
            Status = "completed", DisplayName = "Completed", 
            Description = "Workflow completed successfully",
            Color = "green", CanEdit = false, CanSubmit = false, CanCancel = false,
            AvailableActions = new()
        },
        ["cancelled"] = new() { 
            Status = "cancelled", DisplayName = "Cancelled", 
            Description = "Workflow was cancelled",
            Color = "gray", CanEdit = false, CanSubmit = false, CanCancel = false,
            AvailableActions = new() { "Reset" }
        },
        ["failed"] = new() { 
            Status = "failed", DisplayName = "Failed", 
            Description = "Workflow failed",
            Color = "red", CanEdit = false, CanSubmit = false, CanCancel = false,
            AvailableActions = new() { "Reset" }
        },
        ["expired"] = new() { 
            Status = "expired", DisplayName = "Expired", 
            Description = "Workflow expired due to timeout",
            Color = "gray", CanEdit = false, CanSubmit = false, CanCancel = false,
            AvailableActions = new() { "Reset" }
        },
    };
    
    #endregion

    public WorkflowStateMachine(
        IWorkflowRepository repository,
        WorkflowDbContext dbContext,
        ILogger<WorkflowStateMachine> logger)
    {
        _repository = repository;
        _dbContext = dbContext;
        _logger = logger;
    }

    #region Workflow Transitions

    public async Task<TransitionResult> TryTransitionAsync(
        WorkflowInstance instance,
        WorkflowEvent workflowEvent,
        string triggeredBy,
        string? triggeredByRole = null,
        string? comments = null)
    {
        var eventName = workflowEvent.ToString();
        var currentState = instance.Status.ToLowerInvariant();
        
        _logger.LogInformation(
            "Attempting workflow transition: {InstanceId} [{CurrentState}] --{Event}--> ?",
            instance.Id, currentState, eventName);

        // Find matching transition
        var transition = WorkflowTransitions.FirstOrDefault(t =>
            t.FromState.Equals(currentState, StringComparison.OrdinalIgnoreCase) &&
            t.Event.Equals(eventName, StringComparison.OrdinalIgnoreCase));

        if (transition == null)
        {
            var error = $"Invalid transition: Cannot {eventName} from state '{currentState}'";
            _logger.LogWarning(error);
            return TransitionResult.Fail(error);
        }

        // Check role requirement
        if (!string.IsNullOrEmpty(transition.RequiredRole))
        {
            if (string.IsNullOrEmpty(triggeredByRole) || 
                !triggeredByRole.Equals(transition.RequiredRole, StringComparison.OrdinalIgnoreCase))
            {
                var error = $"Insufficient permissions: {eventName} requires role '{transition.RequiredRole}'";
                _logger.LogWarning(error);
                return TransitionResult.Fail(error);
            }
        }

        // Perform transition
        var previousState = instance.Status;
        instance.Status = transition.ToState;

        // Handle terminal states
        if (transition.ToState == "completed")
        {
            instance.CompletedAt = DateTime.UtcNow;
        }

        // Save changes
        await _repository.SaveWorkflowInstanceAsync(instance);

        // Save audit record to database
        await SaveAuditRecordAsync(new TransitionAuditEntity
        {
            WorkflowInstanceId = instance.Id,
            TransitionType = "workflow",
            FromState = previousState,
            ToState = transition.ToState,
            Event = eventName,
            TriggeredBy = triggeredBy,
            TriggeredByRole = triggeredByRole,
            Timestamp = DateTime.UtcNow,
            Comments = comments
        });

        _logger.LogInformation(
            "Workflow transition successful: {InstanceId} [{PreviousState}] --{Event}--> [{NewState}]",
            instance.Id, previousState, eventName, transition.ToState);

        return TransitionResult.Ok(previousState, transition.ToState, transition.Description);
    }

    public bool CanTransition(
        WorkflowInstance instance,
        WorkflowEvent workflowEvent,
        string? userRole = null)
    {
        var eventName = workflowEvent.ToString();
        var currentState = instance.Status.ToLowerInvariant();

        var transition = WorkflowTransitions.FirstOrDefault(t =>
            t.FromState.Equals(currentState, StringComparison.OrdinalIgnoreCase) &&
            t.Event.Equals(eventName, StringComparison.OrdinalIgnoreCase));

        if (transition == null) return false;

        // Check role if required
        if (!string.IsNullOrEmpty(transition.RequiredRole))
        {
            if (string.IsNullOrEmpty(userRole)) return false;
            if (!userRole.Equals(transition.RequiredRole, StringComparison.OrdinalIgnoreCase) &&
                !userRole.Equals("admin", StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }
        }

        return true;
    }

    public IEnumerable<TransitionDefinition> GetAvailableTransitions(
        WorkflowInstance instance,
        string? userRole = null)
    {
        var currentState = instance.Status.ToLowerInvariant();

        return WorkflowTransitions
            .Where(t => t.FromState.Equals(currentState, StringComparison.OrdinalIgnoreCase))
            .Where(t =>
            {
                // No role requirement
                if (string.IsNullOrEmpty(t.RequiredRole)) return true;
                // Admin can do anything
                if (userRole?.Equals("admin", StringComparison.OrdinalIgnoreCase) == true) return true;
                // Check specific role
                return userRole?.Equals(t.RequiredRole, StringComparison.OrdinalIgnoreCase) == true;
            });
    }

    #endregion

    #region Step Transitions

    public async Task<StepTransitionResult> TryStepTransitionAsync(
        WorkflowInstance instance,
        string stepId,
        StepEvent stepEvent,
        string triggeredBy,
        string? triggeredByRole = null,
        Dictionary<string, object>? formData = null)
    {
        var eventName = stepEvent.ToString();
        var currentStepStatus = GetStepStatus(instance, stepId);
        
        _logger.LogInformation(
            "Attempting step transition: {InstanceId}/{StepId} [{CurrentStatus}] --{Event}--> ?",
            instance.Id, stepId, currentStepStatus, eventName);

        // Find matching transition
        var key = (currentStepStatus.ToLowerInvariant(), eventName);
        if (!StepTransitions.TryGetValue(key, out var newStatus))
        {
            var error = $"Invalid step transition: Cannot {eventName} from status '{currentStepStatus}'";
            _logger.LogWarning(error);
            return StepTransitionResult.Fail(error);
        }

        // Update step status in instance
        UpdateStepStatus(instance, stepId, newStatus);

        // If step completed, determine next step
        string? nextStepId = null;
        if (newStatus == "completed" && stepEvent == StepEvent.Submit)
        {
            nextStepId = DetermineNextStep(instance, stepId);
            
            if (nextStepId == "completed")
            {
                // Workflow is complete
                instance.Status = "completed";
                instance.CompletedAt = DateTime.UtcNow;
                instance.CurrentStep = "completed";
            }
            else if (!string.IsNullOrEmpty(nextStepId))
            {
                instance.CurrentStep = nextStepId;
            }
        }

        // Handle go back
        if (stepEvent == StepEvent.GoBack)
        {
            var previousStepId = DeterminePreviousStep(instance, stepId);
            if (!string.IsNullOrEmpty(previousStepId))
            {
                instance.CurrentStep = previousStepId;
                nextStepId = previousStepId;
            }
        }

        // Save changes
        await _repository.SaveWorkflowInstanceAsync(instance);

        // Save audit record to database
        await SaveAuditRecordAsync(new TransitionAuditEntity
        {
            WorkflowInstanceId = instance.Id,
            StepId = stepId,
            TransitionType = "step",
            FromState = currentStepStatus,
            ToState = newStatus,
            Event = eventName,
            TriggeredBy = triggeredBy,
            TriggeredByRole = triggeredByRole,
            Timestamp = DateTime.UtcNow,
            DataSnapshotJson = formData != null ? JsonSerializer.Serialize(formData) : null
        });

        _logger.LogInformation(
            "Step transition successful: {InstanceId}/{StepId} [{PreviousStatus}] --{Event}--> [{NewStatus}]",
            instance.Id, stepId, currentStepStatus, eventName, newStatus);

        if (instance.Status == "completed")
        {
            return StepTransitionResult.Completed();
        }

        return StepTransitionResult.Ok(currentStepStatus, newStatus, nextStepId);
    }

    public bool CanStepTransition(
        WorkflowInstance instance,
        string stepId,
        StepEvent stepEvent,
        string? userRole = null)
    {
        var currentStatus = GetStepStatus(instance, stepId);
        var key = (currentStatus.ToLowerInvariant(), stepEvent.ToString());
        return StepTransitions.ContainsKey(key);
    }

    public IEnumerable<string> GetAvailableStepEvents(
        WorkflowInstance instance,
        string stepId,
        string? userRole = null)
    {
        var currentStatus = GetStepStatus(instance, stepId).ToLowerInvariant();
        
        return StepTransitions.Keys
            .Where(k => k.From == currentStatus)
            .Select(k => k.Event);
    }

    public string GetStepStatus(WorkflowInstance instance, string stepId)
    {
        // Check if step is in history
        var historyEntry = instance.StepHistory
            .OrderByDescending(h => h.CompletedAt)
            .FirstOrDefault(h => h.StepId == stepId);

        if (historyEntry != null)
        {
            return "completed";
        }

        // Check if it's the current step
        if (instance.CurrentStep == stepId)
        {
            return "active";
        }

        return "not_started";
    }

    #endregion

    #region Helper Methods

    private void UpdateStepStatus(WorkflowInstance instance, string stepId, string newStatus)
    {
        // For now, step status is tracked implicitly via CurrentStep and StepHistory
        // This could be extended to track per-step status in a new field
        _logger.LogDebug("Step {StepId} status updated to {NewStatus}", stepId, newStatus);
    }

    private string? DetermineNextStep(WorkflowInstance instance, string currentStepId)
    {
        // This would typically come from the workflow definition
        // For now, return null to indicate we don't have step sequence info here
        // The WorkflowEngine handles step sequencing
        return null;
    }

    private string? DeterminePreviousStep(WorkflowInstance instance, string currentStepId)
    {
        // Find the previous step from history
        var stepHistory = instance.StepHistory
            .OrderByDescending(h => h.CompletedAt)
            .ToList();

        var currentIndex = stepHistory.FindIndex(h => h.StepId == currentStepId);
        if (currentIndex >= 0 && currentIndex < stepHistory.Count - 1)
        {
            return stepHistory[currentIndex + 1].StepId;
        }

        return null;
    }

    private async Task SaveAuditRecordAsync(TransitionAuditEntity auditEntity)
    {
        try
        {
            _dbContext.TransitionAudits.Add(auditEntity);
            await _dbContext.SaveChangesAsync();
            _logger.LogDebug("Saved transition audit record for workflow {WorkflowId}", auditEntity.WorkflowInstanceId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save transition audit record for workflow {WorkflowId}", auditEntity.WorkflowInstanceId);
            // Don't throw - audit failure shouldn't block the transition
        }
    }

    #endregion

    #region Status Info & Audit

    public WorkflowStatusInfo GetStatusInfo(WorkflowInstance instance)
    {
        var status = instance.Status.ToLowerInvariant();
        
        if (StatusInfoMap.TryGetValue(status, out var info))
        {
            return info;
        }

        // Default for unknown status
        return new WorkflowStatusInfo
        {
            Status = status,
            DisplayName = status,
            Description = "Unknown status",
            Color = "gray"
        };
    }

    public async Task<List<TransitionAuditRecord>> GetTransitionHistoryAsync(Guid instanceId)
    {
        var records = await Task.Run(() => 
            _dbContext.TransitionAudits
                .Where(r => r.WorkflowInstanceId == instanceId)
                .OrderByDescending(r => r.Timestamp)
                .Select(e => new TransitionAuditRecord
                {
                    WorkflowInstanceId = e.WorkflowInstanceId,
                    StepId = e.StepId,
                    TransitionType = e.TransitionType,
                    FromState = e.FromState,
                    ToState = e.ToState,
                    Event = e.Event,
                    TriggeredBy = e.TriggeredBy,
                    TriggeredByRole = e.TriggeredByRole,
                    Timestamp = e.Timestamp,
                    Comments = e.Comments
                })
                .ToList());

        return records;
    }

    #endregion
}
