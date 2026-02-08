using backend.Models;

namespace backend.Services;

public interface IWorkflowEngine
{
    Task<WorkflowInstance> CreateWorkflowInstanceAsync(WorkflowInstanceCreateRequest request);
    Task<WorkflowInstance?> GetWorkflowInstanceAsync(Guid instanceId);
    Task<ValidationResult> ValidateStepAsync(Guid instanceId, string stepId, Dictionary<string, object> formData);
    Task<WorkflowInstance> SubmitStepAsync(Guid instanceId, WorkflowSubmission submission);
    Task<List<WorkflowInstance>> GetWorkflowsByStatusAsync(string status, string? actor = null);
    Task<WorkflowInstance?> SaveDraftDataAsync(Guid instanceId, Dictionary<string, object> formData);
    Task<WorkflowInstance?> AdvanceToNextStepAsync(Guid instanceId, string currentStepId, string nextStepId, Dictionary<string, object> formData, string submittedBy);
    Task<WorkflowInstance?> GoToPreviousStepAsync(Guid instanceId, string previousStepId);
    Task<StepHistoryEntry?> GetStepHistoryAsync(Guid instanceId, string stepId);
}
