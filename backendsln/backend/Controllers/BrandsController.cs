using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

/// <summary>
/// Brands API for workflow step hooks - provides brand data
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class BrandsController : ControllerBase
{
    private readonly ILogger<BrandsController> _logger;

    public BrandsController(ILogger<BrandsController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Get all available brands (mock data)
    /// </summary>
    /// <returns>List of brand options for dropdown</returns>
    /// <response code="200">Returns the list of brands</response>
    [HttpGet]
    [ProducesResponseType(typeof(List<BrandDto>), StatusCodes.Status200OK)]
    public ActionResult<List<BrandDto>> GetBrands()
    {
        _logger.LogInformation("GetBrands called - returning mock brand data");

        var brands = GetMockBrands();
        return Ok(brands);
    }

    /// <summary>
    /// Get a specific brand by ID
    /// </summary>
    /// <param name="brandId">The brand ID</param>
    /// <returns>Brand details</returns>
    /// <response code="200">Returns the brand</response>
    /// <response code="404">If brand not found</response>
    [HttpGet("{brandId}")]
    [ProducesResponseType(typeof(BrandDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<BrandDto> GetBrand(string brandId)
    {
        _logger.LogInformation("GetBrand called for brandId: {BrandId}", brandId);

        var brands = GetMockBrands();
        var brand = brands.FirstOrDefault(b => b.Value == brandId);

        if (brand == null)
        {
            return NotFound(new { message = $"Brand not found: {brandId}" });
        }

        return Ok(brand);
    }

    /// <summary>
    /// Search brands by name
    /// </summary>
    /// <param name="query">Search query</param>
    /// <returns>Matching brands</returns>
    [HttpGet("search")]
    [ProducesResponseType(typeof(List<BrandDto>), StatusCodes.Status200OK)]
    public ActionResult<List<BrandDto>> SearchBrands([FromQuery] string? query)
    {
        _logger.LogInformation("SearchBrands called with query: {Query}", query);

        var brands = GetMockBrands();

        if (string.IsNullOrWhiteSpace(query))
        {
            return Ok(brands);
        }

        var filtered = brands.Where(b =>
            b.Label.Contains(query, StringComparison.OrdinalIgnoreCase) ||
            b.LabelAr.Contains(query, StringComparison.OrdinalIgnoreCase)
        ).ToList();

        return Ok(filtered);
    }

    private static List<BrandDto> GetMockBrands()
    {
        return new List<BrandDto>
        {
            new BrandDto { Value = "brand_001", Label = "Samsung Electronics", LabelAr = "??????? ??????????" },
            new BrandDto { Value = "brand_002", Label = "LG Electronics", LabelAr = "?? ?? ??????????" },
            new BrandDto { Value = "brand_003", Label = "Philips", LabelAr = "??????" },
            new BrandDto { Value = "brand_004", Label = "Panasonic", LabelAr = "?????????" },
            new BrandDto { Value = "brand_005", Label = "Sony Corporation", LabelAr = "????" },
            new BrandDto { Value = "brand_006", Label = "Bosch", LabelAr = "???" },
            new BrandDto { Value = "brand_007", Label = "Siemens", LabelAr = "?????" },
            new BrandDto { Value = "brand_008", Label = "Whirlpool", LabelAr = "???????" },
            new BrandDto { Value = "brand_009", Label = "Electrolux", LabelAr = "??????????" },
            new BrandDto { Value = "brand_010", Label = "Haier", LabelAr = "????" }
        };
    }
}

/// <summary>
/// Brand data transfer object
/// </summary>
public class BrandDto
{
    /// <summary>
    /// Unique identifier for the brand
    /// </summary>
    public string Value { get; set; } = string.Empty;

    /// <summary>
    /// Brand name in English
    /// </summary>
    public string Label { get; set; } = string.Empty;

    /// <summary>
    /// Brand name in Arabic
    /// </summary>
    public string LabelAr { get; set; } = string.Empty;
}
