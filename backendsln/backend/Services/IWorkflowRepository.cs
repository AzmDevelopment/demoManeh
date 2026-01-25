using backend.Models;

namespace backend.Services;

public interface IWorkflowRepository
{
    Task<WorkflowInstance?> GetWorkflowInstanceAsync(Guid instanceId);
    Task SaveWorkflowInstanceAsync(WorkflowInstance instance);
    Task<List<WorkflowInstance>> GetWorkflowsByStatusAsync(string status, string? actor = null);
    Task<List<WorkflowInstance>> GetWorkflowsByCreatorAsync(string createdBy);
    Task<List<WorkflowInstance>> GetAllWorkflowInstancesAsync();
}
