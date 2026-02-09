namespace backend.Models;

/// <summary>
/// Workflow status states
/// </summary>
public enum WorkflowStatus
{
    Draft = 0,
    InProgress = 1,
    OnHold = 2,
    PendingApproval = 3,
    Revision = 4,
    Completed = 5,
    Cancelled = 6,
    Failed = 7,
    Expired = 8
}

/// <summary>
/// Step status states
/// </summary>
public enum StepStatus
{
    NotStarted = 0,
    Active = 1,
    InProgress = 2,
    SentBack = 3,
    PendingApproval = 4,
    Completed = 5,
    Skipped = 6,
    Failed = 7
}

/// <summary>
/// Events that trigger workflow state transitions
/// </summary>
public enum WorkflowEvent
{
    Create,
    Start,
    Submit,
    Approve,
    Reject,
    SendBack,
    Cancel,
    Resume,
    Hold,
    Complete,
    Fail,
    Expire,
    Reset
}

/// <summary>
/// Events that trigger step state transitions
/// </summary>
public enum StepEvent
{
    Enter,
    Save,
    Submit,
    Approve,
    Reject,
    SendBack,
    Skip,
    GoBack,
    Complete,
    Fail,
    Reset
}

/// <summary>
/// Result of a workflow state transition attempt
/// </summary>
public class TransitionResult
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public string? PreviousState { get; set; }
    public string? NewState { get; set; }
    public string? TransitionDescription { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    public static TransitionResult Ok(string from, string to, string? description = null) => new()
    {
        Success = true,
        PreviousState = from,
        NewState = to,
        TransitionDescription = description
    };
    
    public static TransitionResult Fail(string message) => new()
    {
        Success = false,
        ErrorMessage = message
    };
}

/// <summary>
/// Result of a step state transition attempt
/// </summary>
public class StepTransitionResult
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public string? PreviousStepStatus { get; set; }
    public string? NewStepStatus { get; set; }
    public string? NextStepId { get; set; }
    public bool WorkflowCompleted { get; set; }
    
    public static StepTransitionResult Ok(string from, string to, string? nextStepId = null) => new()
    {
        Success = true,
        PreviousStepStatus = from,
        NewStepStatus = to,
        NextStepId = nextStepId
    };
    
    public static StepTransitionResult Completed() => new()
    {
        Success = true,
        WorkflowCompleted = true,
        NewStepStatus = "completed"
    };
    
    public static StepTransitionResult Fail(string message) => new()
    {
        Success = false,
        ErrorMessage = message
    };
}

/// <summary>
/// Represents a state transition definition
/// </summary>
public class TransitionDefinition
{
    public string FromState { get; set; } = string.Empty;
    public string Event { get; set; } = string.Empty;
    public string ToState { get; set; } = string.Empty;
    public string? RequiredRole { get; set; }
    public string? Description { get; set; }
    public List<string>? RequiredConditions { get; set; }
}

/// <summary>
/// Audit record for state transitions
/// </summary>
public class TransitionAuditRecord
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid WorkflowInstanceId { get; set; }
    public string? StepId { get; set; }
    public string TransitionType { get; set; } = "workflow"; // "workflow" or "step"
    public string FromState { get; set; } = string.Empty;
    public string ToState { get; set; } = string.Empty;
    public string Event { get; set; } = string.Empty;
    public string TriggeredBy { get; set; } = string.Empty;
    public string? TriggeredByRole { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? Comments { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
}

/// <summary>
/// Step state tracking within a workflow instance
/// </summary>
public class StepState
{
    public string StepId { get; set; } = string.Empty;
    public string Status { get; set; } = "not_started";
    public DateTime? EnteredAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? AssignedTo { get; set; }
    public int AttemptCount { get; set; } = 0;
}

/// <summary>
/// Request to trigger a workflow transition
/// </summary>
public class WorkflowTransitionRequest
{
    public string Event { get; set; } = string.Empty;
    public string TriggeredBy { get; set; } = string.Empty;
    public string? TriggeredByRole { get; set; }
    public string? Comments { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
}

/// <summary>
/// Request to trigger a step transition
/// </summary>
public class StepTransitionRequest
{
    public string StepId { get; set; } = string.Empty;
    public string Event { get; set; } = string.Empty;
    public string TriggeredBy { get; set; } = string.Empty;
    public string? TriggeredByRole { get; set; }
    public Dictionary<string, object>? FormData { get; set; }
    public string? Comments { get; set; }
}
