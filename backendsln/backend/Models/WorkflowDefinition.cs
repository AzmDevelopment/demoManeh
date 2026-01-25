namespace backend.Models;

public class WorkflowDefinition
{
    public string CertificationId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    
    public WorkflowMetadata Metadata { get; set; } = new();
    public List<StepReference> Steps { get; set; } = new();
    public WorkflowConfig WorkflowConfig { get; set; } = new();
    public SlaConfig SlaConfig { get; set; } = new();
    public NotificationConfig Notifications { get; set; } = new();
    public Dictionary<string, PermissionSet> Permissions { get; set; } = new();
    public IntegrationConfig Integrations { get; set; } = new();
}

public class WorkflowMetadata
{
    public string WorkflowCode { get; set; } = string.Empty;
    public List<string> ApplicableCertificateTypes { get; set; } = new();
    public int EstimatedTotalDurationDays { get; set; }
    public string Complexity { get; set; } = string.Empty;
    public bool RequiresFactoryVisit { get; set; }
}

public class StepReference
{
    public string StepRef { get; set; } = string.Empty;
    public string? StepId { get; set; }
    public string? Name { get; set; }
    public string? Actor { get; set; }
    public string? Type { get; set; }
    public string? SystemAction { get; set; }
    public string? Status { get; set; }
    public StepOverrides? Overrides { get; set; }
}

public class StepOverrides
{
    public string? NextStep { get; set; }
}

public class WorkflowConfig
{
    public bool IsLinear { get; set; }
    public bool AllowParallelExecution { get; set; }
    public bool RequiresApprovalAtEachStep { get; set; }
    public bool AutoEscalationEnabled { get; set; }
}

public class SlaConfig
{
    public int TotalSLADays { get; set; }
    public Dictionary<string, int> StepSLAs { get; set; } = new();
}

public class NotificationConfig
{
    public bool OnStepComplete { get; set; }
    public bool OnWorkflowComplete { get; set; }
    public bool OnSendBack { get; set; }
    public List<string> Recipients { get; set; } = new();
}

public class PermissionSet
{
    public bool? CanStartWorkflow { get; set; }
    public List<string>? CanEditSteps { get; set; }
    public bool? CanSendBack { get; set; }
    public bool? CanCancel { get; set; }
    public bool? CanRequestInfo { get; set; }
    public bool? CanApprove { get; set; }
    public bool? CanReject { get; set; }
    public bool? CanReassign { get; set; }
}

public class IntegrationConfig
{
    public DocumentManagementConfig? DocumentManagement { get; set; }
    public NotificationServiceConfig? NotificationService { get; set; }
}

public class DocumentManagementConfig
{
    public bool Required { get; set; }
    public bool AutoArchive { get; set; }
    public int RetentionYears { get; set; }
}

public class NotificationServiceConfig
{
    public bool Email { get; set; }
    public bool Sms { get; set; }
    public bool Portal { get; set; }
}
