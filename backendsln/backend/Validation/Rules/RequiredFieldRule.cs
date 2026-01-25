using backend.Models;

namespace backend.Validation.Rules;

public class RequiredFieldRule : ValidationRuleBase
{
    public string TargetField { get; set; } = string.Empty;

    public override Task<ValidationResult> ValidateAsync(
        Dictionary<string, object> data,
        Dictionary<string, object> context)
    {
        if (!data.ContainsKey(TargetField) || string.IsNullOrWhiteSpace(data[TargetField]?.ToString()))
        {
            return Task.FromResult(Failure($"{TargetField} is required"));
        }

        return Task.FromResult(Success());
    }
}
