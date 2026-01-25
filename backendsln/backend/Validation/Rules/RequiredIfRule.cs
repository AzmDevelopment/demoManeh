using backend.Models;

namespace backend.Validation.Rules;

public class RequiredIfRule : ValidationRuleBase
{
    public string DependentField { get; set; } = string.Empty;
    public string[] RequiredValues { get; set; } = Array.Empty<string>();
    public string[] TargetFields { get; set; } = Array.Empty<string>();

    public override Task<ValidationResult> ValidateAsync(
        Dictionary<string, object> data,
        Dictionary<string, object> context)
    {
        if (!data.ContainsKey(DependentField) || RequiredValues == null || TargetFields == null)
            return Task.FromResult(Success());

        var dependentValue = data[DependentField]?.ToString();

        if (Array.Exists(RequiredValues, v => v == dependentValue))
        {
            foreach (var targetField in TargetFields)
            {
                if (!data.ContainsKey(targetField) || string.IsNullOrWhiteSpace(data[targetField]?.ToString()))
                {
                    return Task.FromResult(Failure($"{targetField} is required when {DependentField} is {dependentValue}"));
                }
            }
        }

        return Task.FromResult(Success());
    }
}
