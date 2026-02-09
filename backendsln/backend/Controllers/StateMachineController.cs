using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

/// <summary>
/// State Machine API for workflow state transitions
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class StateMachineController : ControllerBase
{
    private readonly IWorkflowStateMachine _stateMachine;
    private readonly IWorkflowRepository _repository;
    private readonly ILogger<StateMachineController> _logger;

    public StateMachineController(
        IWorkflowStateMachine stateMachine,
        IWorkflowRepository repository,
        ILogger<StateMachineController> logger)
    {
        _stateMachine = stateMachine;
        _repository = repository;
        _logger = logger;
    }

    /// <summary>
    /// Trigger a workflow state transition
    /// </summary>
    /// <param name="instanceId">Workflow instance ID</param>
    /// <param name="request">Transition request details</param>
    [HttpPost("{instanceId}/transition")]
    [ProducesResponseType(typeof(TransitionResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TransitionResult>> TriggerTransition(
        Guid instanceId,
        [FromBody] WorkflowTransitionRequest request)
    {
        var instance = await _repository.GetWorkflowInstanceAsync(instanceId);
        if (instance == null)
        {
            return NotFound(new { message = $"Workflow instance not found: {instanceId}" });
        }

        // Parse event
        if (!Enum.TryParse<WorkflowEvent>(request.Event, true, out var workflowEvent))
        {
            return BadRequest(new { message = $"Invalid workflow event: {request.Event}" });
        }

        var result = await _stateMachine.TryTransitionAsync(
            instance,
            workflowEvent,
            request.TriggeredBy,
            request.TriggeredByRole,
            request.Comments);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Trigger a step state transition
    /// </summary>
    /// <param name="instanceId">Workflow instance ID</param>
    /// <param name="request">Step transition request details</param>
    [HttpPost("{instanceId}/step-transition")]
    [ProducesResponseType(typeof(StepTransitionResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<StepTransitionResult>> TriggerStepTransition(
        Guid instanceId,
        [FromBody] StepTransitionRequest request)
    {
        var instance = await _repository.GetWorkflowInstanceAsync(instanceId);
        if (instance == null)
        {
            return NotFound(new { message = $"Workflow instance not found: {instanceId}" });
        }

        // Parse event
        if (!Enum.TryParse<StepEvent>(request.Event, true, out var stepEvent))
        {
            return BadRequest(new { message = $"Invalid step event: {request.Event}" });
        }

        var result = await _stateMachine.TryStepTransitionAsync(
            instance,
            request.StepId,
            stepEvent,
            request.TriggeredBy,
            request.TriggeredByRole,
            request.FormData);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Get available workflow transitions for current state
    /// </summary>
    /// <param name="instanceId">Workflow instance ID</param>
    /// <param name="userRole">Optional user role to filter available transitions</param>
    [HttpGet("{instanceId}/available-transitions")]
    [ProducesResponseType(typeof(IEnumerable<TransitionDefinition>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IEnumerable<TransitionDefinition>>> GetAvailableTransitions(
        Guid instanceId,
        [FromQuery] string? userRole = null)
    {
        var instance = await _repository.GetWorkflowInstanceAsync(instanceId);
        if (instance == null)
        {
            return NotFound(new { message = $"Workflow instance not found: {instanceId}" });
        }

        var transitions = _stateMachine.GetAvailableTransitions(instance, userRole);
        return Ok(transitions);
    }

    /// <summary>
    /// Get available step events for a specific step
    /// </summary>
    /// <param name="instanceId">Workflow instance ID</param>
    /// <param name="stepId">Step ID</param>
    /// <param name="userRole">Optional user role</param>
    [HttpGet("{instanceId}/steps/{stepId}/available-events")]
    [ProducesResponseType(typeof(IEnumerable<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IEnumerable<string>>> GetAvailableStepEvents(
        Guid instanceId,
        string stepId,
        [FromQuery] string? userRole = null)
    {
        var instance = await _repository.GetWorkflowInstanceAsync(instanceId);
        if (instance == null)
        {
            return NotFound(new { message = $"Workflow instance not found: {instanceId}" });
        }

        var events = _stateMachine.GetAvailableStepEvents(instance, stepId, userRole);
        return Ok(events);
    }

    /// <summary>
    /// Check if a workflow transition is valid
    /// </summary>
    /// <param name="instanceId">Workflow instance ID</param>
    /// <param name="eventName">Event name to check</param>
    /// <param name="userRole">Optional user role</param>
    [HttpGet("{instanceId}/can-transition/{eventName}")]
    [ProducesResponseType(typeof(CanTransitionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CanTransitionResponse>> CanTransition(
        Guid instanceId,
        string eventName,
        [FromQuery] string? userRole = null)
    {
        var instance = await _repository.GetWorkflowInstanceAsync(instanceId);
        if (instance == null)
        {
            return NotFound(new { message = $"Workflow instance not found: {instanceId}" });
        }

        if (!Enum.TryParse<WorkflowEvent>(eventName, true, out var workflowEvent))
        {
            return Ok(new CanTransitionResponse { CanTransition = false, Reason = "Invalid event name" });
        }

        var canTransition = _stateMachine.CanTransition(instance, workflowEvent, userRole);
        return Ok(new CanTransitionResponse 
        { 
            CanTransition = canTransition,
            CurrentState = instance.Status,
            Event = eventName
        });
    }

    /// <summary>
    /// Get workflow status information
    /// </summary>
    /// <param name="instanceId">Workflow instance ID</param>
    [HttpGet("{instanceId}/status-info")]
    [ProducesResponseType(typeof(WorkflowStatusInfo), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WorkflowStatusInfo>> GetStatusInfo(Guid instanceId)
    {
        var instance = await _repository.GetWorkflowInstanceAsync(instanceId);
        if (instance == null)
        {
            return NotFound(new { message = $"Workflow instance not found: {instanceId}" });
        }

        var statusInfo = _stateMachine.GetStatusInfo(instance);
        return Ok(statusInfo);
    }

    /// <summary>
    /// Get step status
    /// </summary>
    /// <param name="instanceId">Workflow instance ID</param>
    /// <param name="stepId">Step ID</param>
    [HttpGet("{instanceId}/steps/{stepId}/status")]
    [ProducesResponseType(typeof(StepStatusResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<StepStatusResponse>> GetStepStatus(
        Guid instanceId,
        string stepId)
    {
        var instance = await _repository.GetWorkflowInstanceAsync(instanceId);
        if (instance == null)
        {
            return NotFound(new { message = $"Workflow instance not found: {instanceId}" });
        }

        var status = _stateMachine.GetStepStatus(instance, stepId);
        var availableEvents = _stateMachine.GetAvailableStepEvents(instance, stepId);

        return Ok(new StepStatusResponse
        {
            StepId = stepId,
            Status = status,
            IsCurrentStep = instance.CurrentStep == stepId,
            AvailableEvents = availableEvents.ToList()
        });
    }

    /// <summary>
    /// Get transition audit history
    /// </summary>
    /// <param name="instanceId">Workflow instance ID</param>
    [HttpGet("{instanceId}/audit-history")]
    [ProducesResponseType(typeof(List<TransitionAuditRecord>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<TransitionAuditRecord>>> GetAuditHistory(Guid instanceId)
    {
        var history = await _stateMachine.GetTransitionHistoryAsync(instanceId);
        return Ok(history);
    }

    /// <summary>
    /// Get all valid workflow events
    /// </summary>
    [HttpGet("workflow-events")]
    [ProducesResponseType(typeof(IEnumerable<string>), StatusCodes.Status200OK)]
    public ActionResult<IEnumerable<string>> GetWorkflowEvents()
    {
        var events = Enum.GetNames<WorkflowEvent>();
        return Ok(events);
    }

    /// <summary>
    /// Get all valid step events
    /// </summary>
    [HttpGet("step-events")]
    [ProducesResponseType(typeof(IEnumerable<string>), StatusCodes.Status200OK)]
    public ActionResult<IEnumerable<string>> GetStepEvents()
    {
        var events = Enum.GetNames<StepEvent>();
        return Ok(events);
    }
}

/// <summary>
/// Response for can transition check
/// </summary>
public class CanTransitionResponse
{
    public bool CanTransition { get; set; }
    public string? CurrentState { get; set; }
    public string? Event { get; set; }
    public string? Reason { get; set; }
}

/// <summary>
/// Response for step status
/// </summary>
public class StepStatusResponse
{
    public string StepId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool IsCurrentStep { get; set; }
    public List<string> AvailableEvents { get; set; } = new();
}
