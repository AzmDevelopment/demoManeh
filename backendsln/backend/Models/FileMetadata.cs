namespace backend.Models;

/// <summary>
/// Represents metadata for an uploaded file
/// </summary>
public class FileMetadata
{
    public string FieldKey { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string FileExtension { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; }
    public string UploadedBy { get; set; } = string.Empty;
    public string StoragePath { get; set; } = string.Empty;
    public string? Url { get; set; }
}

/// <summary>
/// File upload request for a specific field
/// </summary>
public class FileUploadRequest
{
    public string FieldKey { get; set; } = string.Empty;
    public IFormFile File { get; set; } = null!;
}
