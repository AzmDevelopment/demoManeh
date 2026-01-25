using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Validation.Rules;

/// <summary>
/// Validates that a field value matches a specified regex pattern
/// </summary>
public class PatternValidationRule : ValidationRuleBase
{
    public string TargetField { get; set; } = string.Empty;
    public string Pattern { get; set; } = string.Empty;

    public override Task<ValidationResult> ValidateAsync(
        Dictionary<string, object> formData,
        Dictionary<string, object> context)
    {
        if (!formData.ContainsKey(TargetField))
        {
            return Task.FromResult(ValidationResult.Success());
        }

        var value = formData[TargetField]?.ToString();
        if (string.IsNullOrEmpty(value))
        {
            return Task.FromResult(ValidationResult.Success()); // Empty values are handled by required rule
        }

        try
        {
            var regex = new Regex(Pattern);
            if (!regex.IsMatch(value))
            {
                return Task.FromResult(ValidationResult.Failure(new List<ValidationError>
                {
                    new ValidationError
                    {
                        RuleId = RuleId,
                        Field = TargetField,
                        Message = ErrorMessage
                    }
                }));
            }

            return Task.FromResult(ValidationResult.Success());
        }
        catch (Exception ex)
        {
            return Task.FromResult(ValidationResult.Failure(new List<ValidationError>
            {
                new ValidationError
                {
                    RuleId = RuleId,
                    Field = TargetField,
                    Message = $"Pattern validation error: {ex.Message}"
                }
            }));
        }
    }
}
