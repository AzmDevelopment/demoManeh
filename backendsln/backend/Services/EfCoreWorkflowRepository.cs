using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Data;

namespace backend.Services;

/// <summary>
/// Entity Framework Core implementation of workflow repository using SQL Server LocalDB
/// </summary>
public class EfCoreWorkflowRepository : IWorkflowRepository
{
    private readonly WorkflowDbContext _context;
    private readonly ILogger<EfCoreWorkflowRepository> _logger;

    public EfCoreWorkflowRepository(
        WorkflowDbContext context,
        ILogger<EfCoreWorkflowRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<WorkflowInstance?> GetWorkflowInstanceAsync(Guid instanceId)
    {
        var entity = await _context.WorkflowInstances
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.Id == instanceId);

        return entity?.ToModel();
    }

    public async Task SaveWorkflowInstanceAsync(WorkflowInstance instance)
    {
        try
        {
            var entity = WorkflowInstanceEntity.FromModel(instance);

            var existingEntity = await _context.WorkflowInstances
                .FirstOrDefaultAsync(w => w.Id == instance.Id);

            if (existingEntity == null)
            {
                // Insert new
                _context.WorkflowInstances.Add(entity);
                _logger.LogInformation("Creating new workflow instance {InstanceId}", instance.Id);
            }
            else
            {
                // Update existing
                _context.Entry(existingEntity).CurrentValues.SetValues(entity);
                existingEntity.CurrentDataJson = entity.CurrentDataJson;
                existingEntity.SendBackInfoJson = entity.SendBackInfoJson;
                existingEntity.StepHistoryJson = entity.StepHistoryJson;
                _logger.LogInformation("Updating workflow instance {InstanceId}", instance.Id);
            }

            await _context.SaveChangesAsync();

            // Optionally save detailed step history
            await SaveStepHistoryDetailsAsync(instance);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving workflow instance {InstanceId}", instance.Id);
            throw;
        }
    }

    public async Task<List<WorkflowInstance>> GetWorkflowsByStatusAsync(string status, string? actor = null)
    {
        var query = _context.WorkflowInstances
            .AsNoTracking()
            .Where(w => w.Status == status);

        if (!string.IsNullOrEmpty(actor))
        {
            query = query.Where(w => w.AssignedActor == actor);
        }

        var entities = await query
            .OrderByDescending(w => w.StartedAt)
            .ToListAsync();

        return entities.Select(e => e.ToModel()).ToList();
    }

    public async Task<List<WorkflowInstance>> GetWorkflowsByCreatorAsync(string createdBy)
    {
        var entities = await _context.WorkflowInstances
            .AsNoTracking()
            .Where(w => w.CreatedBy == createdBy)
            .OrderByDescending(w => w.StartedAt)
            .ToListAsync();

        return entities.Select(e => e.ToModel()).ToList();
    }

    public async Task<List<WorkflowInstance>> GetAllWorkflowInstancesAsync()
    {
        var entities = await _context.WorkflowInstances
            .AsNoTracking()
            .OrderByDescending(w => w.StartedAt)
            .ToListAsync();

        return entities.Select(e => e.ToModel()).ToList();
    }

    /// <summary>
    /// Save detailed step history for reporting and auditing
    /// </summary>
    private async Task SaveStepHistoryDetailsAsync(WorkflowInstance instance)
    {
        try
        {
            // Get the latest step history entry
            var latestEntry = instance.StepHistory.LastOrDefault();
            if (latestEntry == null) return;

            // Check if this entry already exists
            var exists = await _context.StepHistoryDetails.AnyAsync(h =>
                h.WorkflowInstanceId == instance.Id &&
                h.StepId == latestEntry.StepId &&
                h.CompletedAt == latestEntry.CompletedAt);

            if (!exists)
            {
                var detailEntity = new StepHistoryDetailEntity
                {
                    WorkflowInstanceId = instance.Id,
                    StepId = latestEntry.StepId,
                    CompletedAt = latestEntry.CompletedAt,
                    CompletedBy = latestEntry.CompletedBy,
                    ActorRole = latestEntry.ActorRole,
                    DataSnapshotJson = System.Text.Json.JsonSerializer.Serialize(latestEntry.DataSnapshot),
                    ChangedFieldsJson = latestEntry.ChangedFields != null
                        ? System.Text.Json.JsonSerializer.Serialize(latestEntry.ChangedFields)
                        : null,
                    Decision = latestEntry.Decision,
                    Comments = latestEntry.Comments,
                    ProcessingTimeMinutes = latestEntry.ProcessingTimeMinutes
                };

                _context.StepHistoryDetails.Add(detailEntity);
                await _context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error saving step history details for instance {InstanceId}", instance.Id);
            // Don't throw - this is supplementary data
        }
    }
}
