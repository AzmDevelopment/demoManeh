using Microsoft.AspNetCore.Mvc;
using backend.Models;

namespace backend.Controllers;

/// <summary>
/// Brand management API for SASO demo
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class BrandController : ControllerBase
{
    private readonly ILogger<BrandController> _logger;

    // In-memory storage for demo purposes
    private static List<Brand> _brands = new()
    {
        new Brand
        {
            Id = "1",
            NameEn = "Samsung",
            NameAr = "سامسونج",
            Attachments = new()
            {
                new BrandAttachment { Id = "att1", BrandId = "1", FileName = "samsung_trademark.pdf", FileSize = 125000 },
                new BrandAttachment { Id = "att2", BrandId = "1", FileName = "samsung_logo.png", FileSize = 45000 }
            }
        },
        new Brand
        {
            Id = "2",
            NameEn = "Apple",
            NameAr = "أبل",
            Attachments = new()
            {
                new BrandAttachment { Id = "att3", BrandId = "2", FileName = "apple_certificate.pdf", FileSize = 230000 }
            }
        },
        new Brand { Id = "3", NameEn = "Sony", NameAr = "سوني", Attachments = new() },
        new Brand { Id = "4", NameEn = "LG Electronics", NameAr = "إل جي للإلكترونيات", Attachments = new() },
        new Brand { Id = "5", NameEn = "Philips", NameAr = "فيليبس", Attachments = new() },
        new Brand { Id = "6", NameEn = "Huawei", NameAr = "هواوي", Attachments = new() },
        new Brand { Id = "7", NameEn = "Xiaomi", NameAr = "شاومي", Attachments = new() },
        new Brand { Id = "8", NameEn = "Dell", NameAr = "ديل", Attachments = new() },
        new Brand { Id = "9", NameEn = "HP", NameAr = "إتش بي", Attachments = new() },
        new Brand { Id = "10", NameEn = "Lenovo", NameAr = "لينوفو", Attachments = new() },
        new Brand { Id = "11", NameEn = "Panasonic", NameAr = "باناسونيك", Attachments = new() },
        new Brand { Id = "12", NameEn = "Toshiba", NameAr = "توشيبا", Attachments = new() }
    };

    // In-memory file storage for demo
    private static Dictionary<string, BrandAttachment> _uploadedFiles = new();

    public BrandController(ILogger<BrandController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Get all brands
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<Brand>), StatusCodes.Status200OK)]
    public ActionResult<List<Brand>> GetBrands()
    {
        _logger.LogInformation("Getting all brands. Count: {Count}", _brands.Count);
        return Ok(_brands);
    }

    /// <summary>
    /// Get a brand by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(Brand), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<Brand> GetBrand(string id)
    {
        var brand = _brands.FirstOrDefault(b => b.Id == id);
        if (brand == null)
        {
            return NotFound(new { message = $"Brand not found: {id}" });
        }
        return Ok(brand);
    }

    /// <summary>
    /// Create a new brand
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(Brand), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult<Brand> CreateBrand([FromBody] Brand brand)
    {
        if (string.IsNullOrEmpty(brand.NameEn) || string.IsNullOrEmpty(brand.NameAr))
        {
            return BadRequest(new { message = "Brand name in both English and Arabic is required" });
        }

        // Generate ID if not provided
        if (string.IsNullOrEmpty(brand.Id))
        {
            brand.Id = Guid.NewGuid().ToString();
        }

        brand.CreatedAt = DateTime.UtcNow;
        brand.IsNew = true;

        // Link attachments if provided
        if (brand.Attachments != null && brand.Attachments.Any())
        {
            foreach (var attachment in brand.Attachments)
            {
                attachment.BrandId = brand.Id;
            }
        }

        _brands.Add(brand);

        _logger.LogInformation("Created brand: {BrandId} - {BrandName}", brand.Id, brand.NameEn);

        return CreatedAtAction(nameof(GetBrand), new { id = brand.Id }, brand);
    }

    /// <summary>
    /// Update an existing brand
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(Brand), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<Brand> UpdateBrand(string id, [FromBody] UpdateBrandRequest request)
    {
        var brand = _brands.FirstOrDefault(b => b.Id == id);
        if (brand == null)
        {
            return NotFound(new { message = $"Brand not found: {id}" });
        }

        if (!string.IsNullOrEmpty(request.NameEn))
        {
            brand.NameEn = request.NameEn;
        }

        if (!string.IsNullOrEmpty(request.NameAr))
        {
            brand.NameAr = request.NameAr;
        }

        brand.UpdatedAt = DateTime.UtcNow;

        _logger.LogInformation("Updated brand: {BrandId}", id);

        return Ok(brand);
    }

    /// <summary>
    /// Delete a brand
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult DeleteBrand(string id)
    {
        var brand = _brands.FirstOrDefault(b => b.Id == id);
        if (brand == null)
        {
            return NotFound(new { message = $"Brand not found: {id}" });
        }

        _brands.Remove(brand);

        _logger.LogInformation("Deleted brand: {BrandId}", id);

        return NoContent();
    }

    /// <summary>
    /// Upload a single file for a brand
    /// </summary>
    [HttpPost("upload")]
    [ProducesResponseType(typeof(FileUploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<FileUploadResponse>> UploadFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file provided" });
        }

        var attachment = new BrandAttachment
        {
            Id = Guid.NewGuid().ToString(),
            FileName = file.FileName,
            StoredFileName = $"{Guid.NewGuid()}_{file.FileName}",
            FileSize = file.Length,
            ContentType = file.ContentType,
            UploadedAt = DateTime.UtcNow
        };

        // In a real application, save the file to storage
        // For demo, we just store the metadata
        _uploadedFiles[attachment.Id] = attachment;

        _logger.LogInformation("Uploaded file: {FileName} with ID: {FileId}", file.FileName, attachment.Id);

        return Ok(new FileUploadResponse
        {
            Id = attachment.Id,
            FileName = attachment.FileName,
            FileSize = attachment.FileSize,
            UploadedAt = attachment.UploadedAt
        });
    }

    /// <summary>
    /// Upload multiple files for a brand
    /// </summary>
    [HttpPost("upload-multiple")]
    [ProducesResponseType(typeof(List<FileUploadResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<List<FileUploadResponse>>> UploadFiles(List<IFormFile> files)
    {
        if (files == null || !files.Any())
        {
            return BadRequest(new { message = "No files provided" });
        }

        var responses = new List<FileUploadResponse>();

        foreach (var file in files)
        {
            var attachment = new BrandAttachment
            {
                Id = Guid.NewGuid().ToString(),
                FileName = file.FileName,
                StoredFileName = $"{Guid.NewGuid()}_{file.FileName}",
                FileSize = file.Length,
                ContentType = file.ContentType,
                UploadedAt = DateTime.UtcNow
            };

            _uploadedFiles[attachment.Id] = attachment;

            responses.Add(new FileUploadResponse
            {
                Id = attachment.Id,
                FileName = attachment.FileName,
                FileSize = attachment.FileSize,
                UploadedAt = attachment.UploadedAt
            });
        }

        _logger.LogInformation("Uploaded {Count} files", files.Count);

        return Ok(responses);
    }

    /// <summary>
    /// Delete an uploaded file
    /// </summary>
    [HttpDelete("files/{fileId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult DeleteFile(string fileId)
    {
        if (!_uploadedFiles.ContainsKey(fileId))
        {
            // For demo purposes, just return success even if file doesn't exist
            _logger.LogWarning("File not found for deletion: {FileId}", fileId);
        }
        else
        {
            _uploadedFiles.Remove(fileId);
            _logger.LogInformation("Deleted file: {FileId}", fileId);
        }

        return NoContent();
    }

    /// <summary>
    /// Get attachments for a brand
    /// </summary>
    [HttpGet("{brandId}/attachments")]
    [ProducesResponseType(typeof(List<BrandAttachment>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<List<BrandAttachment>> GetBrandAttachments(string brandId)
    {
        var brand = _brands.FirstOrDefault(b => b.Id == brandId);
        if (brand == null)
        {
            return NotFound(new { message = $"Brand not found: {brandId}" });
        }

        return Ok(brand.Attachments ?? new List<BrandAttachment>());
    }
}
