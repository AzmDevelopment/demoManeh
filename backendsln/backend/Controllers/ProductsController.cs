using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

/// <summary>
/// Products API for workflow step hooks - provides product data
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ProductsController : ControllerBase
{
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(ILogger<ProductsController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Get all available products (mock data)
    /// </summary>
    /// <returns>List of product options for dropdown</returns>
    /// <response code="200">Returns the list of products</response>
    [HttpGet]
    [ProducesResponseType(typeof(List<ProductDto>), StatusCodes.Status200OK)]
    public ActionResult<List<ProductDto>> GetProducts()
    {
        _logger.LogInformation("GetProducts called - returning all mock product data");

        var products = GetMockProducts();
        return Ok(products);
    }

    /// <summary>
    /// Get products filtered by type
    /// </summary>
    /// <param name="type">The product type to filter by (e.g., IEC, COC, SASO)</param>
    /// <returns>List of products matching the specified type</returns>
    /// <response code="200">Returns the filtered list of products</response>
    [HttpGet("by-type/{type}")]
    [ProducesResponseType(typeof(List<ProductDto>), StatusCodes.Status200OK)]
    public ActionResult<List<ProductDto>> GetProductsByType(string type)
    {
        _logger.LogInformation("GetProductsByType called for type: {Type}", type);

        var products = GetMockProducts();
        var filtered = products.Where(p => 
            p.ProductType.Equals(type, StringComparison.OrdinalIgnoreCase)
        ).ToList();

        _logger.LogInformation("Found {Count} products for type {Type}", filtered.Count, type);
        return Ok(filtered);
    }

    /// <summary>
    /// Get a specific product by ID
    /// </summary>
    /// <param name="productId">The product ID</param>
    /// <returns>Product details</returns>
    /// <response code="200">Returns the product</response>
    /// <response code="404">If product not found</response>
    [HttpGet("{productId}")]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<ProductDto> GetProduct(string productId)
    {
        _logger.LogInformation("GetProduct called for productId: {ProductId}", productId);

        var products = GetMockProducts();
        var product = products.FirstOrDefault(p => p.ProductId == productId);

        if (product == null)
        {
            return NotFound(new { message = $"Product not found: {productId}" });
        }

        return Ok(product);
    }

    /// <summary>
    /// Search products by name
    /// </summary>
    /// <param name="query">Search query</param>
    /// <param name="type">Optional type filter</param>
    /// <returns>Matching products</returns>
    [HttpGet("search")]
    [ProducesResponseType(typeof(List<ProductDto>), StatusCodes.Status200OK)]
    public ActionResult<List<ProductDto>> SearchProducts(
        [FromQuery] string? query,
        [FromQuery] string? type)
    {
        _logger.LogInformation("SearchProducts called with query: {Query}, type: {Type}", query, type);

        var products = GetMockProducts();

        // Filter by type if provided
        if (!string.IsNullOrWhiteSpace(type))
        {
            products = products.Where(p => 
                p.ProductType.Equals(type, StringComparison.OrdinalIgnoreCase)
            ).ToList();
        }

        // Filter by search query if provided
        if (!string.IsNullOrWhiteSpace(query))
        {
            products = products.Where(p =>
                p.ProductName.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                p.Label.Contains(query, StringComparison.OrdinalIgnoreCase)
            ).ToList();
        }

        return Ok(products);
    }

    private static List<ProductDto> GetMockProducts()
    {
        return new List<ProductDto>
        {
            // IEC Products - Electrical/Electronic
            new ProductDto 
            { 
                ProductId = "prod_001", 
                ProductName = "LED Television 55 inch",
                ProductType = "IEC",
                Label = "LED Television 55 inch (IEC)"
            },
            new ProductDto 
            { 
                ProductId = "prod_002", 
                ProductName = "Washing Machine Front Load",
                ProductType = "IEC",
                Label = "Washing Machine Front Load (IEC)"
            },
            new ProductDto 
            { 
                ProductId = "prod_003", 
                ProductName = "Air Conditioner Split Unit",
                ProductType = "IEC",
                Label = "Air Conditioner Split Unit (IEC)"
            },
            new ProductDto 
            { 
                ProductId = "prod_004", 
                ProductName = "Refrigerator Double Door",
                ProductType = "IEC",
                Label = "Refrigerator Double Door (IEC)"
            },
            new ProductDto 
            { 
                ProductId = "prod_005", 
                ProductName = "Microwave Oven",
                ProductType = "IEC",
                Label = "Microwave Oven (IEC)"
            },

            // COC Products - Consumer Goods
            new ProductDto 
            { 
                ProductId = "prod_006", 
                ProductName = "Children Toys Set",
                ProductType = "COC",
                Label = "Children Toys Set (COC)"
            },
            new ProductDto 
            { 
                ProductId = "prod_007", 
                ProductName = "Baby Stroller",
                ProductType = "COC",
                Label = "Baby Stroller (COC)"
            },
            new ProductDto 
            { 
                ProductId = "prod_008", 
                ProductName = "Safety Helmet",
                ProductType = "COC",
                Label = "Safety Helmet (COC)"
            },

            // SASO Products - Saudi Standards
            new ProductDto 
            { 
                ProductId = "prod_009", 
                ProductName = "Electric Cooker 4 Burner",
                ProductType = "SASO",
                Label = "Electric Cooker 4 Burner (SASO)"
            },
            new ProductDto 
            { 
                ProductId = "prod_010", 
                ProductName = "Gas Stove with Oven",
                ProductType = "SASO",
                Label = "Gas Stove with Oven (SASO)"
            },
            new ProductDto 
            { 
                ProductId = "prod_011", 
                ProductName = "Water Heater Electric",
                ProductType = "SASO",
                Label = "Water Heater Electric (SASO)"
            },
            new ProductDto 
            { 
                ProductId = "prod_012", 
                ProductName = "Ceramic Cookware Set",
                ProductType = "SASO",
                Label = "Ceramic Cookware Set (SASO)"
            },

            // QML Products - Quality Management
            new ProductDto 
            { 
                ProductId = "prod_013", 
                ProductName = "Industrial Motor",
                ProductType = "QML",
                Label = "Industrial Motor (QML)"
            },
            new ProductDto 
            { 
                ProductId = "prod_014", 
                ProductName = "Power Generator",
                ProductType = "QML",
                Label = "Power Generator (QML)"
            },

            // GCC Products - Gulf Standards
            new ProductDto 
            { 
                ProductId = "prod_015", 
                ProductName = "Car Battery 12V",
                ProductType = "GCC",
                Label = "Car Battery 12V (GCC)"
            },
            new ProductDto 
            { 
                ProductId = "prod_016", 
                ProductName = "Automotive Tires",
                ProductType = "GCC",
                Label = "Automotive Tires (GCC)"
            },
            new ProductDto 
            { 
                ProductId = "prod_017", 
                ProductName = "Lubricant Oil",
                ProductType = "GCC",
                Label = "Lubricant Oil (GCC)"
            }
        };
    }
}

/// <summary>
/// Product data transfer object
/// </summary>
public class ProductDto
{
    /// <summary>
    /// Unique identifier for the product
    /// </summary>
    public string ProductId { get; set; } = string.Empty;

    /// <summary>
    /// Product name
    /// </summary>
    public string ProductName { get; set; } = string.Empty;

    /// <summary>
    /// Product type/category (e.g., IEC, COC, SASO, QML, GCC)
    /// </summary>
    public string ProductType { get; set; } = string.Empty;

    /// <summary>
    /// Display label for dropdown (combines name and type)
    /// </summary>
    public string Label { get; set; } = string.Empty;
}
