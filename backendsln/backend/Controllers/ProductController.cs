using Microsoft.AspNetCore.Mvc;
using backend.Models;

namespace backend.Controllers;

/// <summary>
/// Product management API for SASO demo
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ProductController : ControllerBase
{
    private readonly ILogger<ProductController> _logger;

    // In-memory storage for demo purposes
    private static List<ProductType> _productTypes = new()
    {
        new ProductType
        {
            Id = "type1",
            Name = "Type 1 - Standard Product Registration",
            NameAr = "النوع 1 - تسجيل المنتج القياسي",
            Icon = "bi-box-seam",
            Description = "Standard product registration with basic compliance requirements",
            DescriptionAr = "تسجيل المنتج القياسي مع متطلبات الامتثال الأساسية",
            WorkflowDefinition = "SASO_demo_brand_product"
        },
        new ProductType
        {
            Id = "type2",
            Name = "Type 2 - Enhanced Product Certification",
            NameAr = "النوع 2 - شهادة المنتج المحسنة",
            Icon = "bi-award",
            Description = "Enhanced certification with additional testing and quality checks",
            DescriptionAr = "شهادة محسنة مع اختبارات إضافية وفحوصات الجودة",
            WorkflowDefinition = "SASO_demo_brand_product"
        },
        new ProductType
        {
            Id = "type3",
            Name = "Type 3 - Premium Product Approval",
            NameAr = "النوع 3 - الموافقة على المنتج المميز",
            Icon = "bi-shield-check",
            Description = "Premium approval process with comprehensive evaluation",
            DescriptionAr = "عملية الموافقة المميزة مع تقييم شامل",
            WorkflowDefinition = "SASO_demo_brand_product"
        }
    };

    private static List<Sector> _sectors = new()
    {
        new Sector { Id = "1", Name = "Electronics", NameAr = "الإلكترونيات" },
        new Sector { Id = "2", Name = "Cosmetics & Personal Care", NameAr = "مستحضرات التجميل والعناية الشخصية" },
        new Sector { Id = "3", Name = "Food & Beverages", NameAr = "الأغذية والمشروبات" },
        new Sector { Id = "4", Name = "Automotive Parts", NameAr = "قطع غيار السيارات" },
        new Sector { Id = "5", Name = "Textiles & Apparel", NameAr = "المنسوجات والملابس" },
        new Sector { Id = "6", Name = "Home Appliances", NameAr = "الأجهزة المنزلية" },
        new Sector { Id = "7", Name = "Building Materials", NameAr = "مواد البناء" },
        new Sector { Id = "8", Name = "Toys & Children Products", NameAr = "الألعاب ومنتجات الأطفال" }
    };

    private static List<Classification> _classifications = new()
    {
        new Classification { Id = "1", Name = "Class A - High Safety", NameAr = "الفئة أ - سلامة عالية" },
        new Classification { Id = "2", Name = "Class B - Medium Safety", NameAr = "الفئة ب - سلامة متوسطة" },
        new Classification { Id = "3", Name = "Class C - Standard", NameAr = "الفئة ج - قياسية" },
        new Classification { Id = "4", Name = "Class D - Low Risk", NameAr = "الفئة د - منخفضة المخاطر" },
        new Classification { Id = "5", Name = "Class E - Exempt", NameAr = "الفئة هـ - معفاة" }
    };

    private static List<Product> _products = new()
    {
        new Product
        {
            Id = "prod_1",
            BrandId = "1",
            BrandName = "Samsung",
            SectorId = "1",
            SectorName = "Electronics",
            TypeId = "type1",
            Classifications = new()
            {
                new Classification
                {
                    Id = "1",
                    Name = "Class A - High Safety",
                    Measurements = new()
                    {
                        new Measurement { Id = "m1", Name = "Weight", Unit = "kg" },
                        new Measurement { Id = "m2", Name = "Voltage", Unit = "V" }
                    }
                }
            },
            Models = new()
            {
                new ProductModel
                {
                    Id = "model_1",
                    Name = "Galaxy S24 Ultra",
                    ModelNumber = "SM-S928B",
                    Barcode = "8806095360256",
                    ClassificationId = "1",
                    ClassificationName = "Class A - High Safety",
                    Measurements = new()
                    {
                        new Measurement { Id = "m1", Name = "Weight", Unit = "kg" },
                        new Measurement { Id = "m2", Name = "Voltage", Unit = "V" }
                    }
                },
                new ProductModel
                {
                    Id = "model_2",
                    Name = "Galaxy S24+",
                    ModelNumber = "SM-S926B",
                    Barcode = "8806095360249",
                    ClassificationId = "1",
                    ClassificationName = "Class A - High Safety"
                }
            }
        },
        new Product
        {
            Id = "prod_2",
            BrandId = "2",
            BrandName = "Apple",
            SectorId = "1",
            SectorName = "Electronics",
            TypeId = "type2",
            Classifications = new()
            {
                new Classification
                {
                    Id = "1",
                    Name = "Class A - High Safety",
                    Measurements = new()
                    {
                        new Measurement { Id = "m3", Name = "Screen Size", Unit = "inches" }
                    }
                }
            },
            Models = new()
            {
                new ProductModel
                {
                    Id = "model_3",
                    Name = "iPhone 15 Pro Max",
                    ModelNumber = "A3101",
                    Barcode = "0194253941187",
                    ClassificationId = "1",
                    ClassificationName = "Class A - High Safety"
                },
                new ProductModel
                {
                    Id = "model_4",
                    Name = "iPhone 15 Pro",
                    ModelNumber = "A3102",
                    Barcode = "0194253941194",
                    ClassificationId = "1",
                    ClassificationName = "Class A - High Safety"
                }
            }
        },
        new Product
        {
            Id = "prod_3",
            BrandId = "3",
            BrandName = "Sony",
            SectorId = "6",
            SectorName = "Home Appliances",
            TypeId = "type1",
            Classifications = new()
            {
                new Classification
                {
                    Id = "2",
                    Name = "Class B - Medium Safety",
                    Measurements = new()
                    {
                        new Measurement { Id = "m4", Name = "Power Consumption", Unit = "W" },
                        new Measurement { Id = "m5", Name = "Dimensions", Unit = "cm" }
                    }
                }
            },
            Models = new()
            {
                new ProductModel
                {
                    Id = "model_5",
                    Name = "Bravia XR A95L",
                    ModelNumber = "XR-65A95L",
                    Barcode = "4548736142831",
                    ClassificationId = "2",
                    ClassificationName = "Class B - Medium Safety"
                }
            }
        }
    };

    public ProductController(ILogger<ProductController> logger)
    {
        _logger = logger;
    }

    // ============ Product Types ============

    /// <summary>
    /// Get all product types
    /// </summary>
    [HttpGet("types")]
    [ProducesResponseType(typeof(List<ProductType>), StatusCodes.Status200OK)]
    public ActionResult<List<ProductType>> GetProductTypes()
    {
        _logger.LogInformation("Getting all product types. Count: {Count}", _productTypes.Count);
        return Ok(_productTypes);
    }

    /// <summary>
    /// Get a product type by ID
    /// </summary>
    [HttpGet("types/{typeId}")]
    [ProducesResponseType(typeof(ProductType), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<ProductType> GetProductType(string typeId)
    {
        var productType = _productTypes.FirstOrDefault(t => t.Id == typeId);
        if (productType == null)
        {
            return NotFound(new { message = $"Product type not found: {typeId}" });
        }
        return Ok(productType);
    }

    // ============ Sectors ============

    /// <summary>
    /// Get all sectors
    /// </summary>
    [HttpGet("sectors")]
    [ProducesResponseType(typeof(List<Sector>), StatusCodes.Status200OK)]
    public ActionResult<List<Sector>> GetSectors()
    {
        _logger.LogInformation("Getting all sectors. Count: {Count}", _sectors.Count);
        return Ok(_sectors);
    }

    /// <summary>
    /// Get sectors by product type
    /// </summary>
    [HttpGet("types/{typeId}/sectors")]
    [ProducesResponseType(typeof(List<Sector>), StatusCodes.Status200OK)]
    public ActionResult<List<Sector>> GetSectorsByType(string typeId)
    {
        // For demo, return all sectors regardless of type
        return Ok(_sectors);
    }

    // ============ Classifications ============

    /// <summary>
    /// Get all classifications
    /// </summary>
    [HttpGet("classifications")]
    [ProducesResponseType(typeof(List<Classification>), StatusCodes.Status200OK)]
    public ActionResult<List<Classification>> GetClassifications()
    {
        _logger.LogInformation("Getting all classifications. Count: {Count}", _classifications.Count);
        return Ok(_classifications);
    }

    /// <summary>
    /// Get classifications by sector
    /// </summary>
    [HttpGet("sectors/{sectorId}/classifications")]
    [ProducesResponseType(typeof(List<Classification>), StatusCodes.Status200OK)]
    public ActionResult<List<Classification>> GetClassificationsBySector(string sectorId)
    {
        // For demo, return all classifications regardless of sector
        return Ok(_classifications);
    }

    // ============ Products ============

    /// <summary>
    /// Get all products
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<Product>), StatusCodes.Status200OK)]
    public ActionResult<List<Product>> GetProducts()
    {
        _logger.LogInformation("Getting all products. Count: {Count}", _products.Count);
        return Ok(_products);
    }

    /// <summary>
    /// Get products by type
    /// </summary>
    [HttpGet("by-type/{typeId}")]
    [ProducesResponseType(typeof(List<Product>), StatusCodes.Status200OK)]
    public ActionResult<List<Product>> GetProductsByType(string typeId)
    {
        var products = _products.Where(p => p.TypeId == typeId).ToList();
        _logger.LogInformation("Getting products for type {TypeId}. Count: {Count}", typeId, products.Count);
        return Ok(products);
    }

    /// <summary>
    /// Get a product by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(Product), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<Product> GetProduct(string id)
    {
        var product = _products.FirstOrDefault(p => p.Id == id);
        if (product == null)
        {
            return NotFound(new { message = $"Product not found: {id}" });
        }
        return Ok(product);
    }

    /// <summary>
    /// Create a new product
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(Product), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult<Product> CreateProduct([FromBody] Product product)
    {
        if (string.IsNullOrEmpty(product.BrandId) || string.IsNullOrEmpty(product.SectorId))
        {
            return BadRequest(new { message = "Brand ID and Sector ID are required" });
        }

        // Generate ID if not provided
        if (string.IsNullOrEmpty(product.Id))
        {
            product.Id = Guid.NewGuid().ToString();
        }

        product.CreatedAt = DateTime.UtcNow;

        // Set sector name
        var sector = _sectors.FirstOrDefault(s => s.Id == product.SectorId);
        if (sector != null)
        {
            product.SectorName = sector.Name;
        }

        _products.Add(product);

        _logger.LogInformation("Created product: {ProductId} for brand {BrandId}", product.Id, product.BrandId);

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    /// <summary>
    /// Update an existing product
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(Product), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<Product> UpdateProduct(string id, [FromBody] UpdateProductRequest request)
    {
        var product = _products.FirstOrDefault(p => p.Id == id);
        if (product == null)
        {
            return NotFound(new { message = $"Product not found: {id}" });
        }

        if (!string.IsNullOrEmpty(request.BrandId))
        {
            product.BrandId = request.BrandId;
        }

        if (!string.IsNullOrEmpty(request.SectorId))
        {
            product.SectorId = request.SectorId;
            var sector = _sectors.FirstOrDefault(s => s.Id == request.SectorId);
            if (sector != null)
            {
                product.SectorName = sector.Name;
            }
        }

        if (request.Classifications != null)
        {
            product.Classifications = request.Classifications;
        }

        if (request.Models != null)
        {
            product.Models = request.Models;
        }

        product.UpdatedAt = DateTime.UtcNow;

        _logger.LogInformation("Updated product: {ProductId}", id);

        return Ok(product);
    }

    /// <summary>
    /// Delete a product
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult DeleteProduct(string id)
    {
        var product = _products.FirstOrDefault(p => p.Id == id);
        if (product == null)
        {
            return NotFound(new { message = $"Product not found: {id}" });
        }

        _products.Remove(product);

        _logger.LogInformation("Deleted product: {ProductId}", id);

        return NoContent();
    }

    /// <summary>
    /// Add a classification to a product
    /// </summary>
    [HttpPost("{productId}/classifications")]
    [ProducesResponseType(typeof(Product), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<Product> AddClassification(string productId, [FromBody] Classification classification)
    {
        var product = _products.FirstOrDefault(p => p.Id == productId);
        if (product == null)
        {
            return NotFound(new { message = $"Product not found: {productId}" });
        }

        if (string.IsNullOrEmpty(classification.Id))
        {
            classification.Id = Guid.NewGuid().ToString();
        }

        product.Classifications.Add(classification);
        product.UpdatedAt = DateTime.UtcNow;

        _logger.LogInformation("Added classification to product: {ProductId}", productId);

        return Ok(product);
    }

    /// <summary>
    /// Add a model to a product
    /// </summary>
    [HttpPost("{productId}/models")]
    [ProducesResponseType(typeof(Product), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<Product> AddModel(string productId, [FromBody] ProductModel model)
    {
        var product = _products.FirstOrDefault(p => p.Id == productId);
        if (product == null)
        {
            return NotFound(new { message = $"Product not found: {productId}" });
        }

        if (string.IsNullOrEmpty(model.Id))
        {
            model.Id = Guid.NewGuid().ToString();
        }

        product.Models.Add(model);
        product.UpdatedAt = DateTime.UtcNow;

        _logger.LogInformation("Added model to product: {ProductId}", productId);

        return Ok(product);
    }

    /// <summary>
    /// Remove a model from a product
    /// </summary>
    [HttpDelete("{productId}/models/{modelId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult RemoveModel(string productId, string modelId)
    {
        var product = _products.FirstOrDefault(p => p.Id == productId);
        if (product == null)
        {
            return NotFound(new { message = $"Product not found: {productId}" });
        }

        var model = product.Models.FirstOrDefault(m => m.Id == modelId);
        if (model != null)
        {
            product.Models.Remove(model);
            product.UpdatedAt = DateTime.UtcNow;
            _logger.LogInformation("Removed model {ModelId} from product: {ProductId}", modelId, productId);
        }

        return NoContent();
    }
}
