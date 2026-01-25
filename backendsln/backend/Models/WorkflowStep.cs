namespace backend.Models;

public class WorkflowStep
{
    public string StepId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Actor { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    public List<FormField> Fields { get; set; } = new();
    public StepConfiguration StepConfig { get; set; } = new();
    public List<string> Validations { get; set; } = new();
    public List<ValidationMessage>? ValidationMessages { get; set; }
}

public class FormField
{
    public string Key { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public TemplateOptions TemplateOptions { get; set; } = new();
    public FieldHooks? Hooks { get; set; }
    public string? HideExpression { get; set; }
    public FieldValidation? Validation { get; set; }
}

public class TemplateOptions
{
    public string Label { get; set; } = string.Empty;
    public bool Required { get; set; }
    public List<SelectOption>? Options { get; set; }
    public bool? Loading { get; set; }
    public string? Placeholder { get; set; }
    public string? Type { get; set; }  // "number", "text", "email", etc.
    public decimal? Min { get; set; }  // Changed from int? to decimal? for better numeric support
    public decimal? Max { get; set; }  // Changed from int? to decimal? for better numeric support
    public string? Step { get; set; }  // For number inputs (e.g., "0.01")
    public string? Pattern { get; set; }  // Regex pattern for validation
    public bool? Multiple { get; set; }
    public string? Accept { get; set; }  // File extensions like ".pdf,.doc,.docx"
    public long? MaxFileSize { get; set; }  // Max file size in bytes
}

public class SelectOption
{
    public string Label { get; set; } = string.Empty;
    public object Value { get; set; } = string.Empty;
}

public class FieldHooks
{
    public string? OnInit { get; set; }
}

public class FieldValidation
{
    public Dictionary<string, string>? Messages { get; set; }
}

public class StepConfiguration
{
    public bool CanSendBack { get; set; }
    public int EstimatedDurationHours { get; set; }
    public string? NextStep { get; set; }
    public bool IsMandatory { get; set; }
}

public class ValidationMessage
{
    public string RuleId { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
