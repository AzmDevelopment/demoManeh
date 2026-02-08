namespace backend.Models;

public class WorkflowInstance
{
    public Guid Id { get; set; }
    public string DefinitionId { get; set; } = string.Empty;
    public string WorkflowType { get; set; } = string.Empty;
    public string CurrentStep { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // in_progress, completed, rejected, on_hold
    public string? AssignedActor { get; set; }
    
    public Dictionary<string, object> CurrentData { get; set; } = new();
    public SendBackInfo? SendBackInfo { get; set; }
    public List<StepHistoryEntry> StepHistory { get; set; } = new();
    
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? SLADeadline { get; set; }
    
    public string CreatedBy { get; set; } = string.Empty;
    public int Priority { get; set; } = 3; // 1=Urgent, 2=High, 3=Normal
    public string? Tags { get; set; }
}

public class SendBackInfo
{
    public List<string> EditableFields { get; set; } = new();
    public string Comments { get; set; } = string.Empty;
    public string SentBackBy { get; set; } = string.Empty;
    public DateTime SentBackAt { get; set; }
}

public class StepHistoryEntry
{
    public string StepId { get; set; } = string.Empty;
    public DateTime CompletedAt { get; set; }
    public string CompletedBy { get; set; } = string.Empty;
    public string ActorRole { get; set; } = string.Empty;
    public Dictionary<string, object> DataSnapshot { get; set; } = new();
    public Dictionary<string, FieldChange>? ChangedFields { get; set; }
    public string? Decision { get; set; } // approve, reject, send_back, clarification
    public string? Comments { get; set; }
    public int? ProcessingTimeMinutes { get; set; }
}

public class FieldChange
{
    public object? OldValue { get; set; }
    public object? NewValue { get; set; }
}

public class WorkflowSubmission
{
    public string CertificationId { get; set; } = string.Empty;
    public string StepId { get; set; } = string.Empty;
    public Dictionary<string, object> FormData { get; set; } = new();
    public string? Decision { get; set; }
    public string? Comments { get; set; }
    public string SubmittedBy { get; set; } = string.Empty;
}

public class WorkflowInstanceCreateRequest
{
    public string CertificationId { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
    public int Priority { get; set; } = 3;
    public string? Tags { get; set; }
}

public class SaveDraftDataRequest
{
    public Dictionary<string, object> FormData { get; set; } = new();
}

public class AdvanceStepRequest
{
    public string CurrentStepId { get; set; } = string.Empty;
    public string NextStepId { get; set; } = string.Empty;
    public Dictionary<string, object> FormData { get; set; } = new();
    public string SubmittedBy { get; set; } = string.Empty;
}

public class GoBackRequest
{
    public string PreviousStepId { get; set; } = string.Empty;
}
