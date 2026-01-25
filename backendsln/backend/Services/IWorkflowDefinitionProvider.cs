using backend.Models;

namespace backend.Services;

public interface IWorkflowDefinitionProvider
{
    Task<WorkflowDefinition?> GetDefinitionAsync(string certificationId);
    Task<WorkflowStep?> GetStepDefinitionAsync(string stepRef);
    Task<List<WorkflowDefinition>> GetAllDefinitionsAsync();
}
