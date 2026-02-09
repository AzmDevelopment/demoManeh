using System.Text.Json;
using System.Text.Json.Serialization;

namespace backend.Models;

public class WorkflowStep
{
    public string StepId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Actor { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // Legacy fields format (for backward compatibility)
    public List<FormField>? Fields { get; set; }

    // JSON Forms format (new)
    [JsonPropertyName("schema")]
    public JsonElement? Schema { get; set; }

    [JsonPropertyName("uischema")]
    public JsonElement? Uischema { get; set; }

    // Hooks configuration
    public StepHooks? Hooks { get; set; }

    // Custom actions (buttons) configuration
    public List<CustomAction>? CustomActions { get; set; }

    // Context configuration for inter-step data passing
    public StepContext? Context { get; set; }

    // State machine configuration
    public StepStateMachine? StateMachine { get; set; }

    public StepConfiguration StepConfig { get; set; } = new();
    public List<string> Validations { get; set; } = new();
    public List<ValidationMessage>? ValidationMessages { get; set; }
}

public class StepContext
{
    /// <summary>
    /// Keys that this step provides to subsequent steps
    /// </summary>
    public List<string>? Provides { get; set; }

    /// <summary>
    /// Keys that this step requires from previous steps
    /// </summary>
    public List<string>? Requires { get; set; }

    /// <summary>
    /// Filter configurations for dropdowns based on previous step data
    /// </summary>
    public Dictionary<string, StepContextFilter>? Filters { get; set; }
}

public class StepContextFilter
{
    /// <summary>
    /// The context key to filter by (e.g., "selectedTypeValue")
    /// </summary>
    public string? FilterBy { get; set; }

    /// <summary>
    /// API endpoint to call with the filter value (e.g., "/api/Products/by-type/{value}")
    /// </summary>
    public string? ApiEndpoint { get; set; }

    /// <summary>
    /// The source field in the data to use for filtering
    /// </summary>
    public string? SourceField { get; set; }
}

public class StepStateMachine
{
    public string? InitialStatus { get; set; }
    public List<string>? AllowedEvents { get; set; }
    public Dictionary<string, object>? Transitions { get; set; }
    public List<string>? RequiredForSubmit { get; set; }
    public bool CanGoBack { get; set; }
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
    public string? OnChange { get; set; }
}

public class StepHooks
{
    public List<string>? OnInit { get; set; }
    public Dictionary<string, string>? OnChange { get; set; }
}

public class CustomAction
{
    public string Label { get; set; } = string.Empty;
    public string HookName { get; set; } = string.Empty;
    public string? ButtonClass { get; set; }
    public string? ValidateHook { get; set; }
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
    public string? PreviousStep { get; set; }
    public bool? IsFirstStep { get; set; }
    public bool? IsLastStep { get; set; }
    public bool IsMandatory { get; set; }
    public Dictionary<string, object>? Validation { get; set; }
}

public class ValidationMessage
{
    public string RuleId { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
