using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

/// <summary>
/// Workflow management API for certificate processing
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class WorkflowController : ControllerBase
{
    private readonly IWorkflowEngine _workflowEngine;
    private readonly IWorkflowDefinitionProvider _definitionProvider;
    private readonly ILogger<WorkflowController> _logger;

    public WorkflowController(
        IWorkflowEngine workflowEngine,
        IWorkflowDefinitionProvider definitionProvider,
        ILogger<WorkflowController> logger)
    {
        _workflowEngine = workflowEngine;
        _definitionProvider = definitionProvider;
        _logger = logger;
    }

    /// <summary>
    /// Get all available workflow definitions
    /// </summary>
    /// <returns>List of workflow definitions</returns>
    /// <response code="200">Returns the list of workflow definitions</response>
    [HttpGet("definitions")]
    [ProducesResponseType(typeof(List<WorkflowDefinition>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<WorkflowDefinition>>> GetWorkflowDefinitions()
    {
        var definitions = await _definitionProvider.GetAllDefinitionsAsync();
        return Ok(definitions);
    }

    /// <summary>
    /// Get a specific workflow definition by certification ID
    /// </summary>
    /// <param name="certificationId">The certification ID (e.g., CT401_lithium_battery_new)</param>
    /// <returns>The workflow definition</returns>
    /// <response code="200">Returns the workflow definition</response>
    /// <response code="404">If the workflow definition is not found</response>
    [HttpGet("definitions/{certificationId}")]
    [ProducesResponseType(typeof(WorkflowDefinition), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WorkflowDefinition>> GetWorkflowDefinition(string certificationId)
    {
        var definition = await _definitionProvider.GetDefinitionAsync(certificationId);
        if (definition == null)
        {
            return NotFound(new { message = $"Workflow definition not found: {certificationId}" });
        }

        return Ok(definition);
    }

    /// <summary>
    /// Get a specific step definition
    /// </summary>
    /// <param name="stepRef">The step reference path (e.g., workflows/Steps/certificate_specific/CT401_new/CT401_step1_data_entry)</param>
    /// <returns>The step definition with form fields</returns>
    /// <response code="200">Returns the step definition</response>
    /// <response code="404">If the step definition is not found</response>
    [HttpGet("steps/{*stepRef}")]
    [ProducesResponseType(typeof(WorkflowStep), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WorkflowStep>> GetStepDefinition(string stepRef)
    {
        // Decode URL-encoded characters
        stepRef = Uri.UnescapeDataString(stepRef);
        
        _logger.LogDebug("Getting step definition for: {StepRef}", stepRef);
        
        var step = await _definitionProvider.GetStepDefinitionAsync(stepRef);
        if (step == null)
        {
            return NotFound(new { 
                message = $"Step definition not found: {stepRef}",
                hint = "Use /api/workflow/step-by-name/{stepName} for simpler access"
            });
        }

        return Ok(step);
    }

    /// <summary>
    /// Get a step definition by step name only (searches all workflows)
    /// </summary>
    /// <param name="stepName">The step name (e.g., CT401_step1_data_entry)</param>
    /// <returns>The step definition with form fields</returns>
    /// <response code="200">Returns the step definition</response>
    /// <response code="404">If the step definition is not found</response>
    [HttpGet("step-by-name/{stepName}")]
    [ProducesResponseType(typeof(WorkflowStep), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WorkflowStep>> GetStepDefinitionByName(string stepName)
    {
        // Try to find the step by searching common patterns
        var searchPaths = new[]
        {
            $"workflows/Steps/certificate_specific/CT401_new/{stepName}",
            $"workflows/Steps/certificate_specific/CT401/{stepName}",
            $"workflows/Steps/common/{stepName}",
            $"workflows/Steps/shared/{stepName}"
        };

        foreach (var searchPath in searchPaths)
        {
            var step = await _definitionProvider.GetStepDefinitionAsync(searchPath);
            if (step != null)
            {
                _logger.LogInformation("Found step {StepName} at path {Path}", stepName, searchPath);
                return Ok(step);
            }
        }

        return NotFound(new { 
            message = $"Step definition not found: {stepName}",
            hint = "Try using the full path: /api/workflow/steps/workflows/Steps/certificate_specific/CT401_new/{stepName}"
        });
    }

    /// <summary>
    /// Create a new workflow instance
    /// </summary>
    /// <param name="request">The workflow creation request</param>
    /// <returns>The created workflow instance</returns>
    /// <response code="201">Returns the newly created workflow instance</response>
    /// <response code="400">If the request is invalid</response>
    /// <response code="500">If there was an internal server error</response>
    [HttpPost("instances")]
    [ProducesResponseType(typeof(WorkflowInstance), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<WorkflowInstance>> CreateWorkflowInstance(
        [FromBody] WorkflowInstanceCreateRequest request)
    {
        try
        {
            var instance = await _workflowEngine.CreateWorkflowInstanceAsync(request);
            return CreatedAtAction(
                nameof(GetWorkflowInstance),
                new { instanceId = instance.Id },
                instance);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating workflow instance");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get a workflow instance by ID
    /// </summary>
    /// <param name="instanceId">The workflow instance ID</param>
    /// <returns>The workflow instance</returns>
    /// <response code="200">Returns the workflow instance</response>
    /// <response code="404">If the workflow instance is not found</response>
    [HttpGet("instances/{instanceId}")]
    [ProducesResponseType(typeof(WorkflowInstance), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WorkflowInstance>> GetWorkflowInstance(Guid instanceId)
    {
        var instance = await _workflowEngine.GetWorkflowInstanceAsync(instanceId);
        if (instance == null)
        {
            return NotFound(new { message = $"Workflow instance not found: {instanceId}" });
        }

        return Ok(instance);
    }

    /// <summary>
    /// Get workflow instances by status and optional actor
    /// </summary>
    /// <param name="status">The workflow status (e.g., in_progress, completed, rejected, on_hold)</param>
    /// <param name="actor">Optional actor filter (e.g., customer, inspector, manager)</param>
    /// <returns>List of matching workflow instances</returns>
    /// <response code="200">Returns the list of workflow instances</response>
    /// <response code="400">If the status parameter is missing</response>
    [HttpGet("instances")]
    [ProducesResponseType(typeof(List<WorkflowInstance>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<List<WorkflowInstance>>> GetWorkflowsByStatus(
        [FromQuery] string? status = null,
        [FromQuery] string? actor = null)
    {
        if (string.IsNullOrEmpty(status))
        {
            return BadRequest(new { message = "Status parameter is required" });
        }

        var instances = await _workflowEngine.GetWorkflowsByStatusAsync(status, actor);
        return Ok(instances);
    }

    /// <summary>
    /// Validate form data for a specific step (without submitting)
    /// </summary>
    /// <param name="instanceId">The workflow instance ID</param>
    /// <param name="stepId">The step ID to validate</param>
    /// <param name="formData">The form data to validate</param>
    /// <returns>Validation result</returns>
    /// <response code="200">Returns the validation result</response>
    /// <response code="500">If there was an internal server error</response>
    [HttpPost("instances/{instanceId}/steps/{stepId}/validate")]
    [ProducesResponseType(typeof(ValidationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ValidationResult>> ValidateStep(
        Guid instanceId,
        string stepId,
        [FromBody] Dictionary<string, object> formData)
    {
        try
        {
            var result = await _workflowEngine.ValidateStepAsync(instanceId, stepId, formData);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating step {StepId} for instance {InstanceId}", stepId, instanceId);
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>
    /// Submit form data for a workflow step
    /// </summary>
    /// <param name="instanceId">The workflow instance ID</param>
    /// <param name="submission">The workflow submission data</param>
    /// <returns>Updated workflow instance</returns>
    /// <response code="200">Returns the updated workflow instance</response>
    /// <response code="400">If validation fails or the request is invalid</response>
    /// <response code="404">If the workflow instance is not found</response>
    /// <response code="500">If there was an internal server error</response>
    [HttpPost("instances/{instanceId}/submit")]
    [ProducesResponseType(typeof(WorkflowInstance), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<WorkflowInstance>> SubmitStep(
        Guid instanceId,
        [FromBody] WorkflowSubmission submission)
    {
        try
        {
            var instance = await _workflowEngine.SubmitStepAsync(instanceId, submission);
            return Ok(instance);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting step for instance {InstanceId}", instanceId);
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get the current step definition for a workflow instance
    /// </summary>
    /// <param name="instanceId">The workflow instance ID</param>
    /// <returns>Current step information including form fields and current data</returns>
    /// <response code="200">Returns the current step details</response>
    /// <response code="404">If the workflow instance or step is not found</response>
    /// <response code="500">If there was an internal server error</response>
    [HttpGet("instances/{instanceId}/current-step")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<object>> GetCurrentStep(Guid instanceId)
    {
        try
        {
            var instance = await _workflowEngine.GetWorkflowInstanceAsync(instanceId);
            if (instance == null)
            {
                return NotFound(new { message = $"Workflow instance not found: {instanceId}" });
            }

            var definition = await _definitionProvider.GetDefinitionAsync(instance.DefinitionId);
            if (definition == null)
            {
                return NotFound(new { message = "Workflow definition not found" });
            }

            var currentStepRef = definition.Steps.FirstOrDefault(s =>
                s.StepRef.EndsWith(instance.CurrentStep) || s.StepId == instance.CurrentStep);

            if (currentStepRef == null)
            {
                return NotFound(new { message = "Current step reference not found" });
            }

            var stepDefinition = await _definitionProvider.GetStepDefinitionAsync(currentStepRef.StepRef);
            if (stepDefinition == null)
            {
                return NotFound(new { message = "Step definition not found" });
            }

            return Ok(new
            {
                instance = instance,
                stepDefinition = stepDefinition,
                currentData = instance.CurrentData
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current step for instance {InstanceId}", instanceId);
            return StatusCode(500, new { message = "Internal server error" });
        }
    }
}
