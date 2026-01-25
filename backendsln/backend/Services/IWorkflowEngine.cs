using backend.Models;

namespace backend.Services;

public interface IWorkflowEngine
{
    Task<WorkflowInstance> CreateWorkflowInstanceAsync(WorkflowInstanceCreateRequest request);
    Task<WorkflowInstance?> GetWorkflowInstanceAsync(Guid instanceId);
    Task<ValidationResult> ValidateStepAsync(Guid instanceId, string stepId, Dictionary<string, object> formData);
    Task<WorkflowInstance> SubmitStepAsync(Guid instanceId, WorkflowSubmission submission);
    Task<List<WorkflowInstance>> GetWorkflowsByStatusAsync(string status, string? actor = null);
}
