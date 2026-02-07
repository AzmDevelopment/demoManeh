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
            },

            ["pattern"] = config => new PatternValidationRule
            {
                RuleId = "pattern",
                TargetField = config["targetField"]?.ToString() ?? string.Empty,
                Pattern = config["pattern"]?.ToString() ?? string.Empty,
                ErrorMessage = config.ContainsKey("errorMessage")
                    ? config["errorMessage"]?.ToString() ?? "Invalid format"
                    : "Invalid format"
            },

            ["numeric"] = config => new NumericValidationRule
            {
                RuleId = "numeric",
                TargetField = config["targetField"]?.ToString() ?? string.Empty,
                Min = config.ContainsKey("min") ? Convert.ToDecimal(config["min"]) : null,
                Max = config.ContainsKey("max") ? Convert.ToDecimal(config["max"]) : null,
                ErrorMessage = config.ContainsKey("errorMessage")
                    ? config["errorMessage"]?.ToString() ?? "Invalid numeric value"
                    : "Invalid numeric value"
            },

            ["fileUpload"] = config => new FileUploadValidationRule
            {
                RuleId = "fileUpload",
                TargetField = config["targetField"]?.ToString() ?? string.Empty,
                MaxFileSizeBytes = config.ContainsKey("maxFileSizeBytes")
                    ? Convert.ToInt64(config["maxFileSizeBytes"])
                    : null,
                AllowedExtensions = config.ContainsKey("allowedExtensions")
                    ? (config["allowedExtensions"] as List<string>) ?? new List<string>()
                    : new List<string>(),
                Multiple = config.ContainsKey("multiple") && Convert.ToBoolean(config["multiple"]),
                MaxFileCount = config.ContainsKey("maxFileCount")
                    ? Convert.ToInt32(config["maxFileCount"])
                    : null,
                ErrorMessage = config.ContainsKey("errorMessage")
                    ? config["errorMessage"]?.ToString() ?? "Invalid file upload"
                    : "Invalid file upload"
            },

            ["minTableEntries"] = config => new MinTableEntriesRule
            {
                RuleId = "minTableEntries",
                TargetField = config["targetField"]?.ToString() ?? string.Empty,
                MinRequired = config.ContainsKey("minRequired")
                    ? Convert.ToInt32(config["minRequired"])
                    : 1,
                ErrorMessage = config.ContainsKey("errorMessage")
                    ? config["errorMessage"]?.ToString()
                    : null
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

        // Create rules from field definitions
        foreach (var field in step.Fields)
        {
            // 1. Required field rule
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

            // 2. Numeric validation (for number inputs)
            if (field.TemplateOptions.Type == "number" || 
                field.Type == "input" && field.TemplateOptions.Type == "number")
            {
                var numericConfig = new Dictionary<string, object>
                {
                    ["targetField"] = field.Key,
                    ["errorMessage"] = $"{field.TemplateOptions.Label} must be a valid number"
                };

                // Add min value if specified
                if (field.TemplateOptions.Min.HasValue)
                {
                    numericConfig["min"] = field.TemplateOptions.Min.Value;
                }

                // Add max value if specified
                if (field.TemplateOptions.Max.HasValue)
                {
                    numericConfig["max"] = field.TemplateOptions.Max.Value;
                }

                rules.Add(CreateRule("numeric", numericConfig));
            }

            // 3. Pattern validation
            if (!string.IsNullOrEmpty(field.TemplateOptions.Pattern))
            {
                var patternConfig = new Dictionary<string, object>
                {
                    ["targetField"] = field.Key,
                    ["pattern"] = field.TemplateOptions.Pattern,
                    ["errorMessage"] = field.Validation?.Messages?.ContainsKey("pattern") == true
                        ? field.Validation.Messages["pattern"]
                        : $"{field.TemplateOptions.Label} has invalid format"
                };

                rules.Add(CreateRule("pattern", patternConfig));
            }

            // 4. File upload validation (for file type fields)
            if (field.Type == "file")
            {
                var fileConfig = new Dictionary<string, object>
                {
                    ["targetField"] = field.Key,
                    ["multiple"] = field.TemplateOptions.Multiple ?? false
                };

                // Add max file size if specified
                if (field.TemplateOptions.MaxFileSize.HasValue)
                {
                    fileConfig["maxFileSizeBytes"] = field.TemplateOptions.MaxFileSize.Value;
                }

                // Add allowed extensions if specified
                if (!string.IsNullOrEmpty(field.TemplateOptions.Accept))
                {
                    var extensions = field.TemplateOptions.Accept.Split(',')
                        .Select(ext => ext.Trim().ToLowerInvariant())
                        .ToList();
                    fileConfig["allowedExtensions"] = extensions;
                }

                fileConfig["errorMessage"] = field.Validation?.Messages?.ContainsKey("fileUpload") == true
                    ? field.Validation.Messages["fileUpload"]
                    : $"{field.TemplateOptions.Label} has invalid file upload";

                rules.Add(CreateRule("fileUpload", fileConfig));
            }
        }

        // NEW: Create rule from stepConfig validation
        if (step.StepConfig?.Validation != null)
        {
            var validationConfig = step.StepConfig.Validation;
            
            // Handle table/array validation (e.g., brandTable, productTable)
            if (validationConfig.TryGetValue("type", out var validationType))
            {
                var typeStr = validationType?.ToString();
                
                // For brandTable or similar table validations
                if (typeStr == "brandTable" || typeStr == "productTable" || typeStr == "products" || typeStr == "table")
                {
                    var targetField = typeStr switch
                    {
                        "brandTable" => "brandTable",
                        "productTable" => "productTable",
                        "products" => "productTable",
                        "table" => validationConfig.TryGetValue("targetField", out var tf) ? tf?.ToString() : null,
                        _ => null
                    };

                    if (!string.IsNullOrEmpty(targetField))
                    {
                        var tableConfig = new Dictionary<string, object>
                        {
                            ["targetField"] = targetField
                        };

                        if (validationConfig.TryGetValue("minRequired", out var minReq))
                        {
                            tableConfig["minRequired"] = minReq;
                        }

                        if (validationConfig.TryGetValue("message", out var msg))
                        {
                            tableConfig["errorMessage"] = msg?.ToString();
                        }

                        rules.Add(CreateRule("minTableEntries", tableConfig));
                    }
                }
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
