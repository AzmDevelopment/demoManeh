using backend.Models;
using backend.Validation;

namespace backend.Services;

public class WorkflowEngine : IWorkflowEngine
{
    private readonly IWorkflowDefinitionProvider _definitionProvider;
    private readonly IWorkflowRepository _repository;
    private readonly ValidationRuleFactory _validationFactory;
    private readonly ILogger<WorkflowEngine> _logger;

    public WorkflowEngine(
        IWorkflowDefinitionProvider definitionProvider,
        IWorkflowRepository repository,
        ValidationRuleFactory validationFactory,
        ILogger<WorkflowEngine> logger)
    {
        _definitionProvider = definitionProvider;
        _repository = repository;
        _validationFactory = validationFactory;
        _logger = logger;
    }

    public async Task<WorkflowInstance> CreateWorkflowInstanceAsync(WorkflowInstanceCreateRequest request)
    {
        var definition = await _definitionProvider.GetDefinitionAsync(request.CertificationId);
        if (definition == null)
        {
            throw new ArgumentException($"Workflow definition not found: {request.CertificationId}");
        }

        // Get the first step
        var firstStepRef = definition.Steps.FirstOrDefault()?.StepRef;
        if (string.IsNullOrEmpty(firstStepRef))
        {
            throw new InvalidOperationException("Workflow has no steps defined");
        }

        var firstStep = await _definitionProvider.GetStepDefinitionAsync(firstStepRef);
        if (firstStep == null)
        {
            throw new InvalidOperationException($"First step not found: {firstStepRef}");
        }

        var instance = new WorkflowInstance
        {
            Id = Guid.NewGuid(),
            DefinitionId = request.CertificationId,
            WorkflowType = "new_application",
            CurrentStep = firstStep.StepId,
            Status = "in_progress",
            AssignedActor = firstStep.Actor,
            StartedAt = DateTime.UtcNow,
            CreatedBy = request.CreatedBy,
            Priority = request.Priority,
            Tags = request.Tags,
            CurrentData = new Dictionary<string, object>(),
            StepHistory = new List<StepHistoryEntry>()
        };

        // Calculate SLA deadline
        if (definition.SlaConfig?.TotalSLADays > 0)
        {
            instance.SLADeadline = DateTime.UtcNow.AddDays(definition.SlaConfig.TotalSLADays);
        }

        await _repository.SaveWorkflowInstanceAsync(instance);
        
        _logger.LogInformation("Created workflow instance {InstanceId} for {CertificationId}", 
            instance.Id, request.CertificationId);

        return instance;
    }

    public async Task<WorkflowInstance?> GetWorkflowInstanceAsync(Guid instanceId)
    {
        return await _repository.GetWorkflowInstanceAsync(instanceId);
    }

    public async Task<ValidationResult> ValidateStepAsync(
        Guid instanceId,
        string stepId,
        Dictionary<string, object> formData)
    {
        var instance = await _repository.GetWorkflowInstanceAsync(instanceId);
        if (instance == null)
        {
            return ValidationResult.Failure("Workflow instance not found");
        }

        if (instance.CurrentStep != stepId)
        {
            return ValidationResult.Failure($"Invalid step. Current step is {instance.CurrentStep}");
        }

        var definition = await _definitionProvider.GetDefinitionAsync(instance.DefinitionId);
        if (definition == null)
        {
            return ValidationResult.Failure("Workflow definition not found");
        }

        var stepRef = definition.Steps.FirstOrDefault(s => 
            s.StepRef.EndsWith(stepId) || s.StepId == stepId)?.StepRef;
        
        if (string.IsNullOrEmpty(stepRef))
        {
            return ValidationResult.Failure($"Step definition not found: {stepId}");
        }

        var stepDefinition = await _definitionProvider.GetStepDefinitionAsync(stepRef);
        if (stepDefinition == null)
        {
            return ValidationResult.Failure($"Step definition not found: {stepRef}");
        }

        // Create validation rules from step configuration
        var rules = _validationFactory.CreateRulesFromStep(stepDefinition);
        var context = new Dictionary<string, object>
        {
            ["_workflowId"] = instance.Id,
            ["_certificateType"] = instance.DefinitionId,
            ["_currentData"] = instance.CurrentData
        };

        // Execute all validation rules
        var errors = new List<ValidationError>();
        foreach (var rule in rules)
        {
            var result = await rule.ValidateAsync(formData, context);
            if (!result.IsValid)
            {
                errors.AddRange(result.Errors);
            }
        }

        // Run business rule validations
        var businessResult = ExecuteBusinessRulesAsync(stepId, formData, instance.CurrentData);
        if (!businessResult.IsValid)
        {
            errors.AddRange(businessResult.Errors);
        }

        if (errors.Any())
        {
            return ValidationResult.Failure(errors);
        }

        return ValidationResult.Success();
    }

    public async Task<WorkflowInstance> SubmitStepAsync(Guid instanceId, WorkflowSubmission submission)
    {
        var instance = await _repository.GetWorkflowInstanceAsync(instanceId);
        if (instance == null)
        {
            throw new ArgumentException("Workflow instance not found");
        }

        // Validate the submission
        var validationResult = await ValidateStepAsync(instanceId, submission.StepId, submission.FormData);
        if (!validationResult.IsValid)
        {
            throw new InvalidOperationException($"Validation failed: {validationResult.ErrorMessage}");
        }

        var definition = await _definitionProvider.GetDefinitionAsync(instance.DefinitionId);
        if (definition == null)
        {
            throw new InvalidOperationException("Workflow definition not found");
        }

        // Track changes
        var changedFields = TrackFieldChanges(instance.CurrentData, submission.FormData);

        // Update instance data
        foreach (var kvp in submission.FormData)
        {
            instance.CurrentData[kvp.Key] = kvp.Value;
        }

        // Add to history
        var historyEntry = new StepHistoryEntry
        {
            StepId = submission.StepId,
            CompletedAt = DateTime.UtcNow,
            CompletedBy = submission.SubmittedBy,
            ActorRole = GetCurrentStepActor(definition, submission.StepId),
            DataSnapshot = new Dictionary<string, object>(instance.CurrentData),
            ChangedFields = changedFields,
            Decision = submission.Decision,
            Comments = submission.Comments
        };

        instance.StepHistory.Add(historyEntry);

        // Move to next step
        var currentStepRef = definition.Steps.FirstOrDefault(s => 
            s.StepRef.EndsWith(submission.StepId) || s.StepId == submission.StepId);

        if (currentStepRef?.Overrides?.NextStep != null)
        {
            var nextStepId = currentStepRef.Overrides.NextStep;
            
            if (nextStepId == "completed")
            {
                instance.Status = "completed";
                instance.CompletedAt = DateTime.UtcNow;
                instance.CurrentStep = "completed";
                _logger.LogInformation("Workflow instance {InstanceId} completed", instance.Id);
            }
            else
            {
                // Find next step definition
                var nextStepRef = definition.Steps.FirstOrDefault(s => 
                    s.StepRef.EndsWith(nextStepId) || s.StepId == nextStepId);

                if (nextStepRef != null)
                {
                    var nextStepDef = await _definitionProvider.GetStepDefinitionAsync(nextStepRef.StepRef);
                    if (nextStepDef != null)
                    {
                        instance.CurrentStep = nextStepDef.StepId;
                        instance.AssignedActor = nextStepDef.Actor;
                        _logger.LogInformation("Workflow instance {InstanceId} moved to step {StepId}", 
                            instance.Id, nextStepDef.StepId);
                    }
                }
            }
        }

        await _repository.SaveWorkflowInstanceAsync(instance);

        return instance;
    }

    public async Task<List<WorkflowInstance>> GetWorkflowsByStatusAsync(string status, string? actor = null)
    {
        return await _repository.GetWorkflowsByStatusAsync(status, actor);
    }

    public async Task<WorkflowInstance?> SaveDraftDataAsync(Guid instanceId, Dictionary<string, object> formData)
    {
        var instance = await _repository.GetWorkflowInstanceAsync(instanceId);
        if (instance == null)
        {
            return null;
        }

        // Merge new data with existing data
        foreach (var kvp in formData)
        {
            instance.CurrentData[kvp.Key] = kvp.Value;
        }

        await _repository.SaveWorkflowInstanceAsync(instance);
        
        _logger.LogInformation("Saved draft data for workflow instance {InstanceId}", instanceId);

        return instance;
    }

    public async Task<WorkflowInstance?> AdvanceToNextStepAsync(
        Guid instanceId, 
        string currentStepId, 
        string nextStepId, 
        Dictionary<string, object> formData,
        string submittedBy)
    {
        var instance = await _repository.GetWorkflowInstanceAsync(instanceId);
        if (instance == null)
        {
            return null;
        }

        var definition = await _definitionProvider.GetDefinitionAsync(instance.DefinitionId);
        if (definition == null)
        {
            throw new InvalidOperationException("Workflow definition not found");
        }

        // Track changes
        var changedFields = TrackFieldChanges(instance.CurrentData, formData);

        // Update instance data
        foreach (var kvp in formData)
        {
            instance.CurrentData[kvp.Key] = kvp.Value;
        }

        // Add to history - save the current step's data before moving to next
        var historyEntry = new StepHistoryEntry
        {
            StepId = currentStepId,
            CompletedAt = DateTime.UtcNow,
            CompletedBy = submittedBy,
            ActorRole = GetCurrentStepActor(definition, currentStepId),
            DataSnapshot = new Dictionary<string, object>(formData), // Save only this step's data
            ChangedFields = changedFields,
            Decision = "advance",
            Comments = null
        };

        instance.StepHistory.Add(historyEntry);

        // Update current step to next step
        instance.CurrentStep = nextStepId;

        // Update assigned actor for next step
        var nextStepRef = definition.Steps.FirstOrDefault(s => 
            s.StepRef?.EndsWith(nextStepId) == true || s.StepId == nextStepId);
        if (nextStepRef != null)
        {
            var nextStepDef = await _definitionProvider.GetStepDefinitionAsync(nextStepRef.StepRef);
            if (nextStepDef != null)
            {
                instance.AssignedActor = nextStepDef.Actor;
            }
        }

        await _repository.SaveWorkflowInstanceAsync(instance);
        
        _logger.LogInformation("Advanced workflow instance {InstanceId} from step {CurrentStep} to {NextStep}", 
            instanceId, currentStepId, nextStepId);

        return instance;
    }

    public async Task<WorkflowInstance?> GoToPreviousStepAsync(Guid instanceId, string previousStepId)
    {
        var instance = await _repository.GetWorkflowInstanceAsync(instanceId);
        if (instance == null)
        {
            return null;
        }

        var definition = await _definitionProvider.GetDefinitionAsync(instance.DefinitionId);
        if (definition == null)
        {
            throw new InvalidOperationException("Workflow definition not found");
        }

        // Update current step to previous step
        instance.CurrentStep = previousStepId;

        // Update assigned actor for previous step
        var prevStepRef = definition.Steps.FirstOrDefault(s => 
            s.StepRef?.EndsWith(previousStepId) == true || s.StepId == previousStepId);
        if (prevStepRef != null)
        {
            var prevStepDef = await _definitionProvider.GetStepDefinitionAsync(prevStepRef.StepRef);
            if (prevStepDef != null)
            {
                instance.AssignedActor = prevStepDef.Actor;
            }
        }

        await _repository.SaveWorkflowInstanceAsync(instance);
        
        _logger.LogInformation("Moved workflow instance {InstanceId} back to step {PreviousStep}", 
            instanceId, previousStepId);

        return instance;
    }

    public async Task<StepHistoryEntry?> GetStepHistoryAsync(Guid instanceId, string stepId)
    {
        var instance = await _repository.GetWorkflowInstanceAsync(instanceId);
        if (instance == null)
        {
            return null;
        }

        // Find the most recent history entry for this step
        var historyEntry = instance.StepHistory
            .Where(h => h.StepId == stepId)
            .OrderByDescending(h => h.CompletedAt)
            .FirstOrDefault();

        return historyEntry;
    }

    private Dictionary<string, FieldChange> TrackFieldChanges(
        Dictionary<string, object> oldData,
        Dictionary<string, object> newData)
    {
        var changes = new Dictionary<string, FieldChange>();

        foreach (var kvp in newData)
        {
            if (!oldData.ContainsKey(kvp.Key))
            {
                changes[kvp.Key] = new FieldChange { OldValue = null, NewValue = kvp.Value };
            }
            else if (!Equals(oldData[kvp.Key], kvp.Value))
            {
                changes[kvp.Key] = new FieldChange { OldValue = oldData[kvp.Key], NewValue = kvp.Value };
            }
        }

        return changes;
    }

    private string GetCurrentStepActor(WorkflowDefinition definition, string stepId)
    {
        var stepRef = definition.Steps.FirstOrDefault(s => 
            s.StepRef.EndsWith(stepId) || s.StepId == stepId);
        
        return stepRef?.Actor ?? "system";
    }

    private ValidationResult ExecuteBusinessRulesAsync(
        string stepId,
        Dictionary<string, object> formData,
        Dictionary<string, object> currentData)
    {
        // Business rules that are too complex for generic rules
        // This can be extended with a plugin architecture
        
        switch (stepId)
        {
            case "CT401_step2_document_upload":
            case "document_upload":
                // Rule: At least one document must be uploaded
                if (!formData.Any(kvp => kvp.Key.Contains("document") || kvp.Key.Contains("file")))
                {
                    return ValidationResult.Failure("At least one document must be uploaded");
                }
                break;

            case "CT401_step6_final_approval":
            case "final_approval":
                // Rule: Cannot approve if safety score < 60
                if (currentData.ContainsKey("safetyScore") && formData.ContainsKey("finalDecision"))
                {
                    var safetyScore = Convert.ToDecimal(currentData["safetyScore"]);
                    var decision = formData["finalDecision"]?.ToString();

                    if (decision == "approve" && safetyScore < 60)
                    {
                        return ValidationResult.Failure("Cannot approve application with safety score below 60");
                    }
                }
                break;
        }

        return ValidationResult.Success();
    }
}
