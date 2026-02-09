using backend.Models;

namespace backend.Services;

/// <summary>
/// Interface for the workflow state machine
/// Enforces valid state transitions and maintains audit trail
/// </summary>
public interface IWorkflowStateMachine
{
    /// <summary>
    /// Attempt a workflow state transition
    /// </summary>
    Task<TransitionResult> TryTransitionAsync(
        WorkflowInstance instance, 
        WorkflowEvent workflowEvent, 
        string triggeredBy,
        string? triggeredByRole = null,
        string? comments = null);
    
    /// <summary>
    /// Attempt a step state transition
    /// </summary>
    Task<StepTransitionResult> TryStepTransitionAsync(
        WorkflowInstance instance,
        string stepId,
        StepEvent stepEvent,
        string triggeredBy,
        string? triggeredByRole = null,
        Dictionary<string, object>? formData = null);
    
    /// <summary>
    /// Get available workflow transitions for current state
    /// </summary>
    IEnumerable<TransitionDefinition> GetAvailableTransitions(
        WorkflowInstance instance, 
        string? userRole = null);
    
    /// <summary>
    /// Get available step events for current step
    /// </summary>
    IEnumerable<string> GetAvailableStepEvents(
        WorkflowInstance instance, 
        string stepId, 
        string? userRole = null);
    
    /// <summary>
    /// Check if a workflow transition is valid
    /// </summary>
    bool CanTransition(
        WorkflowInstance instance, 
        WorkflowEvent workflowEvent, 
        string? userRole = null);
    
    /// <summary>
    /// Check if a step transition is valid
    /// </summary>
    bool CanStepTransition(
        WorkflowInstance instance, 
        string stepId, 
        StepEvent stepEvent, 
        string? userRole = null);
    
    /// <summary>
    /// Get the current step status
    /// </summary>
    string GetStepStatus(WorkflowInstance instance, string stepId);
    
    /// <summary>
    /// Get transition audit history for a workflow instance
    /// </summary>
    Task<List<TransitionAuditRecord>> GetTransitionHistoryAsync(Guid instanceId);
    
    /// <summary>
    /// Get workflow status display info
    /// </summary>
    WorkflowStatusInfo GetStatusInfo(WorkflowInstance instance);
}

/// <summary>
/// Workflow status display information
/// </summary>
public class WorkflowStatusInfo
{
    public string Status { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty; // For UI display
    public bool CanEdit { get; set; }
    public bool CanSubmit { get; set; }
    public bool CanCancel { get; set; }
    public List<string> AvailableActions { get; set; } = new();
}
