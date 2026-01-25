namespace backend.Models;

public class ValidationResult
{
    public bool IsValid { get; set; }
    public string? ErrorMessage { get; set; }
    public List<ValidationError> Errors { get; set; } = new();

    public static ValidationResult Success() => new ValidationResult { IsValid = true };
    
    public static ValidationResult Failure(string message) => new ValidationResult 
    { 
        IsValid = false, 
        ErrorMessage = message,
        Errors = new List<ValidationError> { new ValidationError { Message = message } }
    };

    public static ValidationResult Failure(List<ValidationError> errors) => new ValidationResult
    {
        IsValid = false,
        Errors = errors,
        ErrorMessage = errors.FirstOrDefault()?.Message
    };
}

public class ValidationError
{
    public string? RuleId { get; set; }
    public string? Field { get; set; }
    public string Message { get; set; } = string.Empty;
}
