using backend.Models;
using System.Text.Json;

namespace backend.Validation.Rules;

/// <summary>
/// Validates that a table/array field has a minimum number of entries
/// Used for validating that users have added required data to tables (e.g., brandTable, productTable)
/// </summary>
public class MinTableEntriesRule : ValidationRuleBase
{
    public string TargetField { get; set; } = string.Empty;
    public int MinRequired { get; set; } = 1;

    public override Task<ValidationResult> ValidateAsync(
        Dictionary<string, object> data,
        Dictionary<string, object> context)
    {
        // Check if field exists
        if (!data.ContainsKey(TargetField))
        {
            return Task.FromResult(Failure(
                ErrorMessage ?? $"Please add at least {MinRequired} entry to {TargetField}"
            ));
        }

        var value = data[TargetField];
        
        // Handle null value
        if (value == null)
        {
            return Task.FromResult(Failure(
                ErrorMessage ?? $"Please add at least {MinRequired} entry to {TargetField}"
            ));
        }

        int count = 0;

        // Handle different value types
        if (value is JsonElement jsonElement)
        {
            // Handle JSON array from deserialization
            if (jsonElement.ValueKind == JsonValueKind.Array)
            {
                count = jsonElement.GetArrayLength();
            }
        }
        else if (value is System.Collections.IList list)
        {
            // Handle List or Array
            count = list.Count;
        }
        else if (value is System.Collections.IEnumerable enumerable)
        {
            // Handle any other enumerable
            count = enumerable.Cast<object>().Count();
        }

        // Validate count
        if (count < MinRequired)
        {
            return Task.FromResult(Failure(
                ErrorMessage ?? $"Please add at least {MinRequired} entry to {TargetField}. Currently {count} entries found."
            ));
        }

        return Task.FromResult(Success());
    }
}
