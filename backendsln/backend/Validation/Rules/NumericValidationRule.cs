using backend.Models;

namespace backend.Validation.Rules;

/// <summary>
/// Validates that a field value is a valid number and within min/max range
/// </summary>
public class NumericValidationRule : ValidationRuleBase
{
    public string TargetField { get; set; } = string.Empty;
    public decimal? Min { get; set; }
    public decimal? Max { get; set; }

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

        // Try to parse as decimal
        if (!decimal.TryParse(value, out decimal numericValue))
        {
            return Task.FromResult(ValidationResult.Failure(new List<ValidationError>
            {
                new ValidationError
                {
                    RuleId = RuleId,
                    Field = TargetField,
                    Message = $"{TargetField} must be a valid number"
                }
            }));
        }

        // Check min value
        if (Min.HasValue && numericValue < Min.Value)
        {
            return Task.FromResult(ValidationResult.Failure(new List<ValidationError>
            {
                new ValidationError
                {
                    RuleId = RuleId,
                    Field = TargetField,
                    Message = $"{TargetField} must be at least {Min.Value}"
                }
            }));
        }

        // Check max value
        if (Max.HasValue && numericValue > Max.Value)
        {
            return Task.FromResult(ValidationResult.Failure(new List<ValidationError>
            {
                new ValidationError
                {
                    RuleId = RuleId,
                    Field = TargetField,
                    Message = $"{TargetField} must not exceed {Max.Value}"
                }
            }));
        }

        return Task.FromResult(ValidationResult.Success());
    }
}
