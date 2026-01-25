using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using backend.Models;

namespace backend.Data;

/// <summary>
/// Entity Framework entity for WorkflowInstance with JSON serialization
/// </summary>
public class WorkflowInstanceEntity
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string DefinitionId { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string WorkflowType { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string CurrentStep { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? AssignedActor { get; set; }

    [Required]
    [Column(TypeName = "nvarchar(max)")]
    public string CurrentDataJson { get; set; } = "{}";

    [Column(TypeName = "nvarchar(max)")]
    public string? SendBackInfoJson { get; set; }

    [Required]
    [Column(TypeName = "nvarchar(max)")]
    public string StepHistoryJson { get; set; } = "[]";

    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? SLADeadline { get; set; }

    [Required]
    [MaxLength(100)]
    public string CreatedBy { get; set; } = string.Empty;

    public int Priority { get; set; } = 3;

    [MaxLength(500)]
    public string? Tags { get; set; }

    // Navigation properties (not mapped to columns)
    [NotMapped]
    public Dictionary<string, object> CurrentData
    {
        get => string.IsNullOrEmpty(CurrentDataJson)
            ? new Dictionary<string, object>()
            : JsonSerializer.Deserialize<Dictionary<string, object>>(CurrentDataJson) ?? new Dictionary<string, object>();
        set => CurrentDataJson = JsonSerializer.Serialize(value);
    }

    [NotMapped]
    public SendBackInfo? SendBackInfo
    {
        get => string.IsNullOrEmpty(SendBackInfoJson)
            ? null
            : JsonSerializer.Deserialize<SendBackInfo>(SendBackInfoJson);
        set => SendBackInfoJson = value == null ? null : JsonSerializer.Serialize(value);
    }

    [NotMapped]
    public List<StepHistoryEntry> StepHistory
    {
        get => string.IsNullOrEmpty(StepHistoryJson)
            ? new List<StepHistoryEntry>()
            : JsonSerializer.Deserialize<List<StepHistoryEntry>>(StepHistoryJson) ?? new List<StepHistoryEntry>();
        set => StepHistoryJson = JsonSerializer.Serialize(value);
    }

    /// <summary>
    /// Convert entity to domain model
    /// </summary>
    public WorkflowInstance ToModel()
    {
        return new WorkflowInstance
        {
            Id = Id,
            DefinitionId = DefinitionId,
            WorkflowType = WorkflowType,
            CurrentStep = CurrentStep,
            Status = Status,
            AssignedActor = AssignedActor,
            CurrentData = CurrentData,
            SendBackInfo = SendBackInfo,
            StepHistory = StepHistory,
            StartedAt = StartedAt,
            CompletedAt = CompletedAt,
            SLADeadline = SLADeadline,
            CreatedBy = CreatedBy,
            Priority = Priority,
            Tags = Tags
        };
    }

    /// <summary>
    /// Create entity from domain model
    /// </summary>
    public static WorkflowInstanceEntity FromModel(WorkflowInstance model)
    {
        return new WorkflowInstanceEntity
        {
            Id = model.Id,
            DefinitionId = model.DefinitionId,
            WorkflowType = model.WorkflowType,
            CurrentStep = model.CurrentStep,
            Status = model.Status,
            AssignedActor = model.AssignedActor,
            CurrentData = model.CurrentData,
            SendBackInfo = model.SendBackInfo,
            StepHistory = model.StepHistory,
            StartedAt = model.StartedAt,
            CompletedAt = model.CompletedAt,
            SLADeadline = model.SLADeadline,
            CreatedBy = model.CreatedBy,
            Priority = model.Priority,
            Tags = model.Tags
        };
    }
}

/// <summary>
/// Entity Framework entity for detailed step history (optional, for reporting)
/// </summary>
public class StepHistoryDetailEntity
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Required]
    public Guid WorkflowInstanceId { get; set; }

    [Required]
    [MaxLength(100)]
    public string StepId { get; set; } = string.Empty;

    [Required]
    public DateTime CompletedAt { get; set; }

    [Required]
    [MaxLength(100)]
    public string CompletedBy { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string ActorRole { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "nvarchar(max)")]
    public string DataSnapshotJson { get; set; } = "{}";

    [Column(TypeName = "nvarchar(max)")]
    public string? ChangedFieldsJson { get; set; }

    [MaxLength(50)]
    public string? Decision { get; set; }

    [Column(TypeName = "nvarchar(max)")]
    public string? Comments { get; set; }

    public int? ProcessingTimeMinutes { get; set; }
}
