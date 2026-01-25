using Microsoft.EntityFrameworkCore;
using backend.Models;
using System.Text.Json;

namespace backend.Data;

public class WorkflowDbContext : DbContext
{
    public WorkflowDbContext(DbContextOptions<WorkflowDbContext> options)
        : base(options)
    {
    }

    public DbSet<WorkflowInstanceEntity> WorkflowInstances { get; set; } = null!;
    public DbSet<StepHistoryDetailEntity> StepHistoryDetails { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure WorkflowInstanceEntity
        modelBuilder.Entity<WorkflowInstanceEntity>(entity =>
        {
            entity.ToTable("WorkflowInstances");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.DefinitionId)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.WorkflowType)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.CurrentStep)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(e => e.AssignedActor)
                .HasMaxLength(100);

            entity.Property(e => e.CreatedBy)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Tags)
                .HasMaxLength(500);

            // JSON columns for complex data
            entity.Property(e => e.CurrentDataJson)
                .HasColumnName("CurrentData")
                .HasColumnType("nvarchar(max)")
                .IsRequired();

            entity.Property(e => e.SendBackInfoJson)
                .HasColumnName("SendBackInfo")
                .HasColumnType("nvarchar(max)");

            entity.Property(e => e.StepHistoryJson)
                .HasColumnName("StepHistory")
                .HasColumnType("nvarchar(max)")
                .IsRequired();

            // Indexes
            entity.HasIndex(e => new { e.Status, e.AssignedActor })
                .HasDatabaseName("IX_WorkflowInstances_Status_Actor");

            entity.HasIndex(e => e.SLADeadline)
                .HasDatabaseName("IX_WorkflowInstances_SLADeadline")
                .HasFilter("[Status] = 'in_progress'");

            entity.HasIndex(e => e.DefinitionId)
                .HasDatabaseName("IX_WorkflowInstances_DefinitionId");

            entity.HasIndex(e => e.CreatedBy)
                .HasDatabaseName("IX_WorkflowInstances_CreatedBy");
        });

        // Configure StepHistoryDetailEntity
        modelBuilder.Entity<StepHistoryDetailEntity>(entity =>
        {
            entity.ToTable("StepHistoryDetails");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.StepId)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.CompletedBy)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.ActorRole)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.Decision)
                .HasMaxLength(50);

            entity.Property(e => e.Comments)
                .HasColumnType("nvarchar(max)");

            // JSON columns
            entity.Property(e => e.DataSnapshotJson)
                .HasColumnName("DataSnapshot")
                .HasColumnType("nvarchar(max)")
                .IsRequired();

            entity.Property(e => e.ChangedFieldsJson)
                .HasColumnName("ChangedFields")
                .HasColumnType("nvarchar(max)");

            // Foreign key
            entity.HasOne<WorkflowInstanceEntity>()
                .WithMany()
                .HasForeignKey(e => e.WorkflowInstanceId)
                .OnDelete(DeleteBehavior.Cascade);

            // Indexes
            entity.HasIndex(e => new { e.WorkflowInstanceId, e.StepId })
                .HasDatabaseName("IX_StepHistory_Workflow_Step");

            entity.HasIndex(e => e.CompletedAt)
                .HasDatabaseName("IX_StepHistory_CompletedAt");
        });
    }
}
