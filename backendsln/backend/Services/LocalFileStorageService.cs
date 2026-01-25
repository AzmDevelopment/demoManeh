using backend.Models;

namespace backend.Services;

/// <summary>
/// Local file system storage implementation
/// </summary>
public class LocalFileStorageService : IFileStorageService
{
    private readonly string _storagePath;
    private readonly ILogger<LocalFileStorageService> _logger;
    private readonly IConfiguration _configuration;

    public LocalFileStorageService(
        IConfiguration configuration,
        ILogger<LocalFileStorageService> logger)
    {
        _configuration = configuration;
        _logger = logger;

        // Get storage path from configuration or use default
        _storagePath = configuration["FileStorage:LocalPath"]
            ?? Path.Combine(Directory.GetCurrentDirectory(), "uploads");

        // Ensure directory exists
        if (!Directory.Exists(_storagePath))
        {
            Directory.CreateDirectory(_storagePath);
            _logger.LogInformation("Created file storage directory: {Path}", _storagePath);
        }

        _logger.LogInformation("File storage initialized at: {Path}", _storagePath);
    }

    public async Task<FileMetadata> SaveFileAsync(IFormFile file, string fieldKey, string uploadedBy)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File is empty", nameof(file));
        }

        // Generate unique filename
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var storedFileName = $"{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(_storagePath, storedFileName);

        // Save file to disk
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        _logger.LogInformation("File saved: {FileName} as {StoredFileName}", file.FileName, storedFileName);

        // Create metadata
        var metadata = new FileMetadata
        {
            FieldKey = fieldKey,
            OriginalFileName = file.FileName,
            StoredFileName = storedFileName,
            ContentType = file.ContentType,
            FileSizeBytes = file.Length,
            FileExtension = fileExtension,
            UploadedAt = DateTime.UtcNow,
            UploadedBy = uploadedBy,
            StoragePath = filePath,
            Url = $"/api/workflow/files/{storedFileName}"
        };

        return metadata;
    }

    public async Task<List<FileMetadata>> SaveFilesAsync(
        IEnumerable<IFormFile> files,
        string fieldKey,
        string uploadedBy)
    {
        var metadata = new List<FileMetadata>();

        foreach (var file in files)
        {
            var fileMeta = await SaveFileAsync(file, fieldKey, uploadedBy);
            metadata.Add(fileMeta);
        }

        return metadata;
    }

    public async Task<(Stream FileStream, string ContentType, string FileName)?> GetFileAsync(string storedFileName)
    {
        var filePath = Path.Combine(_storagePath, storedFileName);

        if (!File.Exists(filePath))
        {
            _logger.LogWarning("File not found: {FileName}", storedFileName);
            return null;
        }

        var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
        var contentType = GetContentType(storedFileName);

        return (stream, contentType, storedFileName);
    }

    public Task<bool> DeleteFileAsync(string storedFileName)
    {
        try
        {
            var filePath = Path.Combine(_storagePath, storedFileName);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                _logger.LogInformation("File deleted: {FileName}", storedFileName);
                return Task.FromResult(true);
            }

            return Task.FromResult(false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file: {FileName}", storedFileName);
            return Task.FromResult(false);
        }
    }

    public Task<bool> FileExistsAsync(string storedFileName)
    {
        var filePath = Path.Combine(_storagePath, storedFileName);
        return Task.FromResult(File.Exists(filePath));
    }

    private static string GetContentType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch
        {
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xls" => "application/vnd.ms-excel",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".txt" => "text/plain",
            _ => "application/octet-stream"
        };
    }
}
