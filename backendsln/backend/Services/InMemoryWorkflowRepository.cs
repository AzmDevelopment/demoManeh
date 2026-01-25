using System.Collections.Concurrent;
using backend.Models;

namespace backend.Services;

/// <summary>
/// In-memory implementation of workflow repository for POC.
/// we will change this to database , using EF Core
/// Replace with database implementation
/// </summary>
public class InMemoryWorkflowRepository : IWorkflowRepository
{
    private readonly ConcurrentDictionary<Guid, WorkflowInstance> _instances = new();
    private readonly ILogger<InMemoryWorkflowRepository> _logger;

    public InMemoryWorkflowRepository(ILogger<InMemoryWorkflowRepository> logger)
    {
        _logger = logger;
    }

    public Task<WorkflowInstance?> GetWorkflowInstanceAsync(Guid instanceId)
    {
        _instances.TryGetValue(instanceId, out var instance);
        return Task.FromResult(instance);
    }

    public Task SaveWorkflowInstanceAsync(WorkflowInstance instance)
    {
        _instances[instance.Id] = instance;
        _logger.LogDebug("Saved workflow instance {InstanceId}", instance.Id);
        return Task.CompletedTask;
    }

    public Task<List<WorkflowInstance>> GetWorkflowsByStatusAsync(string status, string? actor = null)
    {
        var query = _instances.Values.Where(w => w.Status == status);

        if (!string.IsNullOrEmpty(actor))
        {
            query = query.Where(w => w.AssignedActor == actor);
        }

        return Task.FromResult(query.ToList());
    }

    public Task<List<WorkflowInstance>> GetWorkflowsByCreatorAsync(string createdBy)
    {
        var workflows = _instances.Values
            .Where(w => w.CreatedBy == createdBy)
            .ToList();

        return Task.FromResult(workflows);
    }

    public Task<List<WorkflowInstance>> GetAllWorkflowInstancesAsync()
    {
        return Task.FromResult(_instances.Values.ToList());
    }
}
