namespace backend.Models;

/// <summary>
/// Represents a product type (Type 1, Type 2, Type 3)
/// </summary>
public class ProductType
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DescriptionAr { get; set; } = string.Empty;
    public string WorkflowDefinition { get; set; } = string.Empty;
}

/// <summary>
/// Represents a sector (industry category)
/// </summary>
public class Sector
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
}

/// <summary>
/// Represents a product classification
/// </summary>
public class Classification
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public List<Measurement>? Measurements { get; set; }
    public List<ProductModel>? Models { get; set; }
}

/// <summary>
/// Represents a measurement for a classification
/// </summary>
public class Measurement
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
}

/// <summary>
/// Represents a product model
/// </summary>
public class ProductModel
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string ModelNumber { get; set; } = string.Empty;
    public string Barcode { get; set; } = string.Empty;
    public string ClassificationId { get; set; } = string.Empty;
    public string? ClassificationName { get; set; }
    public List<Measurement>? Measurements { get; set; }
}

/// <summary>
/// Represents a product entity
/// </summary>
public class Product
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string BrandId { get; set; } = string.Empty;
    public string? BrandName { get; set; }
    public string SectorId { get; set; } = string.Empty;
    public string? SectorName { get; set; }
    public string TypeId { get; set; } = string.Empty;
    public List<Classification> Classifications { get; set; } = new();
    public List<ProductModel> Models { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Request model for creating a product
/// </summary>
public class CreateProductRequest
{
    public string BrandId { get; set; } = string.Empty;
    public string SectorId { get; set; } = string.Empty;
    public string TypeId { get; set; } = string.Empty;
    public List<Classification>? Classifications { get; set; }
    public List<ProductModel>? Models { get; set; }
}

/// <summary>
/// Request model for updating a product
/// </summary>
public class UpdateProductRequest
{
    public string? BrandId { get; set; }
    public string? SectorId { get; set; }
    public List<Classification>? Classifications { get; set; }
    public List<ProductModel>? Models { get; set; }
}
