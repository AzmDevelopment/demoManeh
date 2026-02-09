using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Data;

/// <summary>
/// Entity for storing state machine transition audit records
/// Tracks all workflow and step state transitions for audit trail
/// </summary>
public class TransitionAuditEntity
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Required]
    public Guid WorkflowInstanceId { get; set; }

    /// <summary>
    /// Optional - only set for step transitions
    /// </summary>
    [MaxLength(100)]
    public string? StepId { get; set; }

    /// <summary>
    /// Type of transition: "workflow" or "step"
    /// </summary>
    [Required]
    [MaxLength(20)]
    public string TransitionType { get; set; } = "workflow";

    /// <summary>
    /// The state/status before the transition
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string FromState { get; set; } = string.Empty;

    /// <summary>
    /// The state/status after the transition
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string ToState { get; set; } = string.Empty;

    /// <summary>
    /// The event that triggered the transition (e.g., "Submit", "Approve", "Reject")
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string Event { get; set; } = string.Empty;

    /// <summary>
    /// Who triggered the transition (email or user ID)
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string TriggeredBy { get; set; } = string.Empty;

    /// <summary>
    /// Role of the user who triggered the transition
    /// </summary>
    [MaxLength(50)]
    public string? TriggeredByRole { get; set; }

    /// <summary>
    /// When the transition occurred
    /// </summary>
    [Required]
    public DateTime Timestamp { get; set; }

    /// <summary>
    /// Optional comments or notes about the transition
    /// </summary>
    [Column(TypeName = "nvarchar(max)")]
    public string? Comments { get; set; }

    /// <summary>
    /// Optional JSON data snapshot at the time of transition
    /// </summary>
    [Column(TypeName = "nvarchar(max)")]
    public string? DataSnapshotJson { get; set; }
}
