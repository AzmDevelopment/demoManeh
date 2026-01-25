using backend.Models;

namespace backend.Validation.Rules;

/// <summary>
/// Validates file uploads including size, type, and count
/// </summary>
public class FileUploadValidationRule : ValidationRuleBase
{
    public string TargetField { get; set; } = string.Empty;
    public long? MaxFileSizeBytes { get; set; }
    public List<string> AllowedExtensions { get; set; } = new();
    public bool Multiple { get; set; }
    public int? MaxFileCount { get; set; }

    public override Task<ValidationResult> ValidateAsync(
        Dictionary<string, object> formData,
        Dictionary<string, object> context)
    {
        var errors = new List<ValidationError>();

        // Check if field exists in form data
        if (!formData.ContainsKey(TargetField))
        {
            return Task.FromResult(ValidationResult.Success());
        }

        var fieldValue = formData[TargetField];
        
        // Handle both single file and multiple files
        var files = new List<FileMetadata>();
        
        if (fieldValue is FileMetadata singleFile)
        {
            files.Add(singleFile);
        }
        else if (fieldValue is List<FileMetadata> multipleFiles)
        {
            files.AddRange(multipleFiles);
        }
        else if (fieldValue is IEnumerable<FileMetadata> fileEnumerable)
        {
            files.AddRange(fileEnumerable);
        }
        else
        {
            // Not a file field, skip validation
            return Task.FromResult(ValidationResult.Success());
        }

        // Validate file count
        if (!Multiple && files.Count > 1)
        {
            errors.Add(new ValidationError
            {
                RuleId = RuleId,
                Field = TargetField,
                Message = $"{TargetField} accepts only one file"
            });
        }

        if (MaxFileCount.HasValue && files.Count > MaxFileCount.Value)
        {
            errors.Add(new ValidationError
            {
                RuleId = RuleId,
                Field = TargetField,
                Message = $"{TargetField} accepts maximum {MaxFileCount.Value} files"
            });
        }

        // Validate each file
        foreach (var file in files)
        {
            // Check file size
            if (MaxFileSizeBytes.HasValue && file.FileSizeBytes > MaxFileSizeBytes.Value)
            {
                errors.Add(new ValidationError
                {
                    RuleId = RuleId,
                    Field = TargetField,
                    Message = $"{file.OriginalFileName}: File size ({FormatBytes(file.FileSizeBytes)}) exceeds maximum allowed size ({FormatBytes(MaxFileSizeBytes.Value)})"
                });
            }

            // Check file extension
            if (AllowedExtensions.Any() && !AllowedExtensions.Contains(file.FileExtension.ToLowerInvariant()))
            {
                errors.Add(new ValidationError
                {
                    RuleId = RuleId,
                    Field = TargetField,
                    Message = $"{file.OriginalFileName}: File type '{file.FileExtension}' is not allowed. Allowed types: {string.Join(", ", AllowedExtensions)}"
                });
            }
        }

        if (errors.Any())
        {
            return Task.FromResult(ValidationResult.Failure(errors));
        }

        return Task.FromResult(ValidationResult.Success());
    }

    private static string FormatBytes(long bytes)
    {
        string[] sizes = { "B", "KB", "MB", "GB" };
        double len = bytes;
        int order = 0;
        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len = len / 1024;
        }
        return $"{len:0.##} {sizes[order]}";
    }
}
