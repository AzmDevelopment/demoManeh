namespace backend.Models;

/// <summary>
/// Represents a brand entity
/// </summary>
public class Brand
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string NameEn { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public List<BrandAttachment> Attachments { get; set; } = new();
    public bool IsNew { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Represents a file attachment for a brand (one-to-many relationship)
/// </summary>
public class BrandAttachment
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string BrandId { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    public string UploadedBy { get; set; } = string.Empty;
}

/// <summary>
/// Request model for creating a brand
/// </summary>
public class CreateBrandRequest
{
    public string NameEn { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public List<string>? AttachmentIds { get; set; }
}

/// <summary>
/// Request model for updating a brand
/// </summary>
public class UpdateBrandRequest
{
    public string? NameEn { get; set; }
    public string? NameAr { get; set; }
    public List<string>? AttachmentIds { get; set; }
}

/// <summary>
/// Response model for file upload
/// </summary>
public class FileUploadResponse
{
    public string Id { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime UploadedAt { get; set; }
}
