using backend.Models;

namespace backend.Validation;

public interface IValidationRule
{
    string RuleId { get; }
    string ErrorMessage { get; }
    Task<ValidationResult> ValidateAsync(Dictionary<string, object> data, Dictionary<string, object> context);
}
