using backend.Models;

namespace backend.Services;

/// <summary>
/// Interface for file storage operations
/// </summary>
public interface IFileStorageService
{
    /// <summary>
    /// Save an uploaded file
    /// </summary>
    Task<FileMetadata> SaveFileAsync(IFormFile file, string fieldKey, string uploadedBy);

    /// <summary>
    /// Save multiple uploaded files
    /// </summary>
    Task<List<FileMetadata>> SaveFilesAsync(IEnumerable<IFormFile> files, string fieldKey, string uploadedBy);

    /// <summary>
    /// Get file by stored filename
    /// </summary>
    Task<(Stream FileStream, string ContentType, string FileName)?> GetFileAsync(string storedFileName);

    /// <summary>
    /// Delete a file
    /// </summary>
    Task<bool> DeleteFileAsync(string storedFileName);

    /// <summary>
    /// Check if file exists
    /// </summary>
    Task<bool> FileExistsAsync(string storedFileName);
}
