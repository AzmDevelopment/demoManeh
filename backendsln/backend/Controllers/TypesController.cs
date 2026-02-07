using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

/// <summary>
/// Types API for workflow step hooks - provides certification type data
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class TypesController : ControllerBase
{
    private readonly ILogger<TypesController> _logger;

    public TypesController(ILogger<TypesController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Get all available certification types (mock data)
    /// </summary>
    /// <returns>List of type options for dropdown</returns>
    /// <response code="200">Returns the list of types</response>
    [HttpGet]
    [ProducesResponseType(typeof(List<TypeDto>), StatusCodes.Status200OK)]
    public ActionResult<List<TypeDto>> GetTypes()
    {
        _logger.LogInformation("GetTypes called - returning mock type data");

        var types = GetMockTypes();
        return Ok(types);
    }

    /// <summary>
    /// Get a specific type by value
    /// </summary>
    /// <param name="typeValue">The type value</param>
    /// <returns>Type details</returns>
    /// <response code="200">Returns the type</response>
    /// <response code="404">If type not found</response>
    [HttpGet("{typeValue}")]
    [ProducesResponseType(typeof(TypeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<TypeDto> GetType(string typeValue)
    {
        _logger.LogInformation("GetType called for typeValue: {TypeValue}", typeValue);

        var types = GetMockTypes();
        var type = types.FirstOrDefault(t => t.Value == typeValue);

        if (type == null)
        {
            return NotFound(new { message = $"Type not found: {typeValue}" });
        }

        return Ok(type);
    }

    private static List<TypeDto> GetMockTypes()
    {
        return new List<TypeDto>
        {
            new TypeDto { Value = "IEC", Label = "IEC - International Electrotechnical Commission" },
            new TypeDto { Value = "COC", Label = "COC - Certificate of Conformity" },
            new TypeDto { Value = "QML", Label = "QML - Quality Management License" },
            new TypeDto { Value = "SASO", Label = "SASO - Saudi Standards" },
            new TypeDto { Value = "GCC", Label = "GCC - Gulf Cooperation Council" }
        };
    }
}

/// <summary>
/// Type data transfer object
/// </summary>
public class TypeDto
{
    /// <summary>
    /// Unique identifier/value for the type
    /// </summary>
    public string Value { get; set; } = string.Empty;

    /// <summary>
    /// Display label for the type
    /// </summary>
    public string Label { get; set; } = string.Empty;
}
