using backend.Models;
using backend.Validation.Rules;

namespace backend.Validation;

public class ValidationRuleFactory
{
    private readonly Dictionary<string, Func<Dictionary<string, object>, IValidationRule>> _ruleCreators;

    public ValidationRuleFactory()
    {
        _ruleCreators = new()
        {
            ["required"] = config => new RequiredFieldRule
            {
                RuleId = "required",
                TargetField = config["targetField"].ToString() ?? string.Empty,
                ErrorMessage = config.ContainsKey("errorMessage") && config["errorMessage"] != null
                    ? config["errorMessage"].ToString() ?? "Field is required"
                    : "Field is required"
            },

            ["requiredIf"] = config => new RequiredIfRule
            {
                RuleId = "requiredIf",
                DependentField = config["dependentField"]?.ToString() ?? string.Empty,
                RequiredValues = config.ContainsKey("requiredValues")
                    ? (config["requiredValues"] as string[]) ?? Array.Empty<string>()
                    : Array.Empty<string>(),
                TargetFields = config.ContainsKey("targetFields")
                    ? (config["targetFields"] as string[]) ?? Array.Empty<string>()
                    : Array.Empty<string>(),
                ErrorMessage = config.ContainsKey("errorMessage")
                    ? config["errorMessage"]?.ToString() ?? "Field is conditionally required"
                    : "Field is conditionally required"
            },

            ["numericRange"] = config => new NumericRangeRule
            {
                RuleId = "numericRange",
                TargetField = config["targetField"]?.ToString() ?? string.Empty,
                MinValue = config.ContainsKey("minValue") ? Convert.ToDecimal(config["minValue"]) : 0,
                MaxValue = config.ContainsKey("maxValue") ? Convert.ToDecimal(config["maxValue"]) : decimal.MaxValue,
                DependentField = config.ContainsKey("dependentField") ? config["dependentField"]?.ToString() : null,
                ErrorMessage = config.ContainsKey("errorMessage")
                    ? config["errorMessage"]?.ToString() ?? "Value out of range"
                    : "Value out of range"
            }
        };
    }

    public IValidationRule CreateRule(string ruleType, Dictionary<string, object> config)
    {
        if (!_ruleCreators.ContainsKey(ruleType))
            throw new ArgumentException($"Unknown validation rule type: {ruleType}");

        return _ruleCreators[ruleType](config);
    }

    public List<IValidationRule> CreateRulesFromStep(WorkflowStep step)
    {
        var rules = new List<IValidationRule>();

        // Create required field rules from field definitions
        foreach (var field in step.Fields)
        {
            if (field.TemplateOptions.Required)
            {
                var config = new Dictionary<string, object>
                {
                    ["targetField"] = field.Key,
                    ["errorMessage"] = field.Validation?.Messages?.ContainsKey("required") == true
                        ? field.Validation.Messages["required"]
                        : $"{field.TemplateOptions.Label} is required"
                };

                rules.Add(CreateRule("required", config));
            }
        }

        // Create rules from step validations
        foreach (var validationRef in step.Validations ?? new List<string>())
        {
            var parts = validationRef.Split(':');
            var ruleType = parts[0];

            var config = new Dictionary<string, object>
            {
                ["errorMessage"] = step.ValidationMessages?.FirstOrDefault(m => m.RuleId == ruleType)?.Message
            };

            switch (ruleType)
            {
                case "requiredIf":
                    if (parts.Length >= 4)
                    {
                        config["dependentField"] = parts[1];
                        config["requiredValues"] = parts[2].Split(',');
                        config["targetFields"] = parts[3].Split(',');
                        rules.Add(CreateRule(ruleType, config));
                    }
                    break;

                case "numericRange":
                    if (parts.Length >= 4)
                    {
                        config["targetField"] = parts[1];
                        config["minValue"] = decimal.Parse(parts[2]);
                        config["maxValue"] = decimal.Parse(parts[3]);
                        if (parts.Length > 4)
                            config["dependentField"] = parts[4];
                        rules.Add(CreateRule(ruleType, config));
                    }
                    break;
            }
        }

        return rules;
    }
}
