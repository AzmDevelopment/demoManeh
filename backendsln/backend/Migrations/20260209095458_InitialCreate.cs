using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WorkflowInstances",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DefinitionId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    WorkflowType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CurrentStep = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    AssignedActor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CurrentData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SendBackInfo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StepHistory = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SLADeadline = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    Tags = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkflowInstances", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StepHistoryDetails",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkflowInstanceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StepId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ActorRole = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DataSnapshot = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ChangedFields = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Decision = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProcessingTimeMinutes = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StepHistoryDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StepHistoryDetails_WorkflowInstances_WorkflowInstanceId",
                        column: x => x.WorkflowInstanceId,
                        principalTable: "WorkflowInstances",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TransitionAudits",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkflowInstanceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StepId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TransitionType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FromState = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ToState = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Event = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TriggeredBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TriggeredByRole = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataSnapshotJson = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransitionAudits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransitionAudits_WorkflowInstances_WorkflowInstanceId",
                        column: x => x.WorkflowInstanceId,
                        principalTable: "WorkflowInstances",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StepHistory_CompletedAt",
                table: "StepHistoryDetails",
                column: "CompletedAt");

            migrationBuilder.CreateIndex(
                name: "IX_StepHistory_Workflow_Step",
                table: "StepHistoryDetails",
                columns: new[] { "WorkflowInstanceId", "StepId" });

            migrationBuilder.CreateIndex(
                name: "IX_TransitionAudits_Timestamp",
                table: "TransitionAudits",
                column: "Timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_TransitionAudits_TriggeredBy",
                table: "TransitionAudits",
                column: "TriggeredBy");

            migrationBuilder.CreateIndex(
                name: "IX_TransitionAudits_Workflow_Step",
                table: "TransitionAudits",
                columns: new[] { "WorkflowInstanceId", "StepId" });

            migrationBuilder.CreateIndex(
                name: "IX_TransitionAudits_WorkflowInstanceId",
                table: "TransitionAudits",
                column: "WorkflowInstanceId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowInstances_CreatedBy",
                table: "WorkflowInstances",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowInstances_DefinitionId",
                table: "WorkflowInstances",
                column: "DefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowInstances_SLADeadline",
                table: "WorkflowInstances",
                column: "SLADeadline",
                filter: "[Status] = 'in_progress'");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowInstances_Status_Actor",
                table: "WorkflowInstances",
                columns: new[] { "Status", "AssignedActor" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StepHistoryDetails");

            migrationBuilder.DropTable(
                name: "TransitionAudits");

            migrationBuilder.DropTable(
                name: "WorkflowInstances");
        }
    }
}
