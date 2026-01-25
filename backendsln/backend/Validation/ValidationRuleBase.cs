using backend.Models;

namespace backend.Validation;

public abstract class ValidationRuleBase : IValidationRule
{
    public string RuleId { get; set; } = string.Empty;
    public string ErrorMessage { get; set; } = string.Empty;

    public abstract Task<ValidationResult> ValidateAsync(
        Dictionary<string, object> data,
        Dictionary<string, object> context);

    protected ValidationResult Success() =>
        new ValidationResult { IsValid = true };

    protected ValidationResult Failure(string? message = null) =>
        new ValidationResult
        {
            IsValid = false,
            ErrorMessage = message ?? ErrorMessage,
            Errors = new List<ValidationError>
            {
                new ValidationError
                {
                    RuleId = RuleId,
                    Message = message ?? ErrorMessage
                }
            }
        };
}
