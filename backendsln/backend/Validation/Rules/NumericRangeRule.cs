using backend.Models;

namespace backend.Validation.Rules;

public class NumericRangeRule : ValidationRuleBase
{
    public string TargetField { get; set; } = string.Empty;
    public decimal MinValue { get; set; }
    public decimal MaxValue { get; set; }
    public string? DependentField { get; set; }

    public override Task<ValidationResult> ValidateAsync(
        Dictionary<string, object> data,
        Dictionary<string, object> context)
    {
        // Skip if dependent field specified but not present
        if (!string.IsNullOrEmpty(DependentField) && !data.ContainsKey(DependentField))
            return Task.FromResult(Success());

        if (!data.ContainsKey(TargetField))
            return Task.FromResult(Success());

        var value = data[TargetField];
        if (value == null) return Task.FromResult(Success());

        if (!decimal.TryParse(value.ToString(), out var numericValue))
            return Task.FromResult(Failure($"{TargetField} must be a valid number"));

        if (numericValue < MinValue || numericValue > MaxValue)
            return Task.FromResult(Failure($"{TargetField} must be between {MinValue} and {MaxValue}"));

        return Task.FromResult(Success());
    }
}
