# Generic Workflow Engine Backend

## Overview

This is a **proof-of-concept** generic workflow engine backend for the Saso Maneh certificate management system. The system is designed to handle dynamic certification workflows without code changes by reading workflow definitions and step configurations from JSON files.

## ?? Quick Start

### Running the Application

```bash
cd backendsln
dotnet build
dotnet run --project backend
```

The API will be available at:
- **HTTP**: `http://localhost:5000`
- **HTTPS**: `https://localhost:5001`
- **Swagger UI**: `http://localhost:5000/` or `https://localhost:5001/`

### Accessing Swagger Documentation

Once the application is running, open your browser and navigate to:
- **http://localhost:5000/** (Development mode)

The Swagger UI provides:
- ? Interactive API documentation
- ? Try-it-out functionality for all endpoints
- ? Request/response examples
- ? Schema definitions
- ? Authentication support (when configured)

## Architecture

### Core Components

1. **Models** (`backend/Models/`)
   - `WorkflowDefinition.cs` - Represents the overall workflow configuration
   - `WorkflowStep.cs` - Represents individual step definitions with ngx-formly style fields
   - `WorkflowInstance.cs` - Runtime instance of a workflow execution
   - `ValidationResult.cs` - Validation results and errors

2. **Services** (`backend/Services/`)
   - `IWorkflowDefinitionProvider` / `FileSystemWorkflowDefinitionProvider` - Loads workflow definitions from JSON files
   - `IWorkflowEngine` / `WorkflowEngine` - Orchestrates workflow execution, validation, and transitions
   - `IWorkflowRepository` / `InMemoryWorkflowRepository` - Persists workflow instances (in-memory for POC)

3. **Validation Framework** (`backend/Validation/`)
   - `IValidationRule` - Base interface for all validation rules
   - `ValidationRuleBase` - Abstract base class for validation rules
   - `ValidationRuleFactory` - Creates validation rules from step configurations
   - **Rules**:
     - `RequiredFieldRule` - Validates required fields
     - `RequiredIfRule` - Conditional required validation based on another field
     - `NumericRangeRule` - Validates numeric values within a range

4. **API Controller** (`backend/Controllers/`)
   - `WorkflowController` - RESTful API for workflow management

## API Endpoints

### Workflow Definitions

- `GET /api/workflow/definitions` - Get all workflow definitions
- `GET /api/workflow/definitions/{certificationId}` - Get a specific workflow definition
- `GET /api/workflow/steps/{*stepRef}` - Get a step definition

### Workflow Instances

- `POST /api/workflow/instances` - Create a new workflow instance
  ```json
  {
    "certificationId": "CT401_lithium_battery_new",
    "createdBy": "user@example.com",
    "priority": 3,
    "tags": "urgent,lithium"
  }
  ```

- `GET /api/workflow/instances/{instanceId}` - Get a workflow instance
- `GET /api/workflow/instances?status={status}&actor={actor}` - Query workflows by status/actor
- `GET /api/workflow/instances/{instanceId}/current-step` - Get current step details with form fields

### Workflow Execution

- `POST /api/workflow/instances/{instanceId}/steps/{stepId}/validate` - Validate form data without submitting
  ```json
  {
    "applicantName": "John Doe",
    "companyName": "ABC Corp",
    "category": "lithium_ion"
  }
  ```

- `POST /api/workflow/instances/{instanceId}/submit` - Submit a workflow step
  ```json
  {
    "certificationId": "CT401_lithium_battery_new",
    "stepId": "CT401_step1_data_entry",
    "formData": {
      "applicantName": "John Doe",
      "companyName": "ABC Corp",
      "category": "lithium_ion",
      "productModel": "Model-X"
    },
    "decision": "approve",
    "comments": "All data looks good",
    "submittedBy": "user@example.com"
  }
  ```

## Configuration

The workflow engine reads JSON configurations from the frontend directory. Configure the path in `appsettings.json`:

```json
{
  "WorkflowEngine": {
    "BasePath": "../frontend/src/assets/forms/workflows"
  }
}
```

### Workflow Definition Structure

Located in: `frontend/src/assets/forms/workflows/Definitions/{certificationId}.json`

Example: `CT401_lithium_battery_new.json`

```json
{
  "certificationId": "CT401_lithium_battery_new",
  "name": "CT401 Lithium Battery - New Certificate Application",
  "steps": [
    {
      "stepRef": "workflows/Steps/certificate_specific/CT401/CT401_step1_data_entry",
      "overrides": {
        "nextStep": "CT401_step2_document_upload"
      }
    }
  ],
  "slaConfig": {
    "totalSLADays": 7
  }
}
```

### Step Definition Structure

Located in: `frontend/src/assets/forms/workflows/Steps/certificate_specific/{workflow}/{stepId}.json`

Example: `CT401_step1_data_entry.json`

```json
{
  "stepId": "CT401_step1_data_entry",
  "name": "Basic Information - Step 1",
  "actor": "customer",
  "fields": [
    {
      "key": "applicantName",
      "type": "input",
      "templateOptions": {
        "label": "Applicant Full Name",
        "required": true
      }
    }
  ],
  "stepConfig": {
    "nextStep": "CT401_step2_document_upload"
  }
}
```

## How It Works

### 1. Creating a Workflow Instance

```csharp
POST /api/workflow/instances
{
  "certificationId": "CT401_lithium_battery_new",
  "createdBy": "user@example.com"
}
```

The engine:
- Loads the workflow definition
- Identifies the first step
- Creates a new `WorkflowInstance` with status "in_progress"
- Assigns the instance to the appropriate actor
- Calculates SLA deadline

### 2. Getting Current Step

```csharp
GET /api/workflow/instances/{id}/current-step
```

Returns:
- The workflow instance data
- Current step definition with all form fields (ngx-formly format)
- Previously submitted data for this workflow

### 3. Validating Form Data

```csharp
POST /api/workflow/instances/{id}/steps/{stepId}/validate
{ formData }
```

The engine:
- Extracts validation rules from step definition
- Creates validators using `ValidationRuleFactory`
- Runs all validation rules
- Executes business rules
- Returns validation result

### 4. Submitting a Step

```csharp
POST /api/workflow/instances/{id}/submit
{ stepId, formData, decision, comments }
```

The engine:
- Validates the submission
- Tracks field changes
- Merges form data into workflow instance
- Adds entry to step history
- Transitions to next step
- Updates assigned actor

## Validation Rules

### Built-in Rules

1. **Required Field**
   - Automatically created from `templateOptions.required: true`
   - Validates that field has a non-empty value

2. **Required If**
   - Format: `"requiredIf:dependentField:value1,value2:targetField1,targetField2"`
   - Example: `"requiredIf:category:CAT001,CAT002:productSpec"`
   - Makes fields required based on another field's value

3. **Numeric Range**
   - Format: `"numericRange:targetField:minValue:maxValue"`
   - Example: `"numericRange:costPrice:0:10000"`
   - Validates numeric values within a range

### Business Rules

Complex business logic can be added in `WorkflowEngine.ExecuteBusinessRulesAsync()`:

```csharp
private ValidationResult ExecuteBusinessRulesAsync(
    string stepId,
    Dictionary<string, object> formData,
    Dictionary<string, object> currentData)
{
    switch (stepId)
    {
        case "final_approval":
            // Custom validation logic
            if (safetyScore < 60)
                return ValidationResult.Failure("Safety score too low");
            break;
    }
    return ValidationResult.Success();
}
```

## Data Persistence

### Current Implementation (POC)

Uses `InMemoryWorkflowRepository` - stores all data in memory (lost on restart).

### Production Implementation

Replace with database implementation:

1. **SQL Server / PostgreSQL** - Using Entity Framework Core
2. **MongoDB** - For flexible schema
3. **Cosmos DB** - For cloud-scale applications

### Suggested Database Schema

```sql
-- Workflow Instances
CREATE TABLE WorkflowInstances (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    DefinitionId NVARCHAR(100) NOT NULL,
    CurrentStep NVARCHAR(100) NOT NULL,
    Status NVARCHAR(20) NOT NULL,
    AssignedActor NVARCHAR(100) NULL,
    CurrentData NVARCHAR(MAX) NOT NULL, -- JSON
    StepHistory NVARCHAR(MAX) NOT NULL, -- JSON
    StartedAt DATETIME2 NOT NULL,
    CompletedAt DATETIME2 NULL,
    SLADeadline DATETIME2 NULL,
    CreatedBy NVARCHAR(100) NOT NULL,
    Priority INT NOT NULL DEFAULT 3
);

-- Step History (optional, can also use JSON in WorkflowInstances)
CREATE TABLE StepHistoryDetails (
    Id BIGINT IDENTITY PRIMARY KEY,
    WorkflowInstanceId UNIQUEIDENTIFIER NOT NULL,
    StepId NVARCHAR(100) NOT NULL,
    CompletedAt DATETIME2 NOT NULL,
    CompletedBy NVARCHAR(100) NOT NULL,
    DataSnapshot NVARCHAR(MAX) NOT NULL, -- JSON
    Decision NVARCHAR(50) NULL,
    Comments NVARCHAR(MAX) NULL
);
```

## Extending the System

### Adding New Validation Rules

1. Create a new rule class:

```csharp
public class EmailValidationRule : ValidationRuleBase
{
    public string TargetField { get; set; }
    
    public override Task<ValidationResult> ValidateAsync(
        Dictionary<string, object> data,
        Dictionary<string, object> context)
    {
        if (!data.ContainsKey(TargetField))
            return Task.FromResult(Success());
            
        var email = data[TargetField]?.ToString();
        if (!IsValidEmail(email))
            return Task.FromResult(Failure($"{TargetField} is not a valid email"));
            
        return Task.FromResult(Success());
    }
}
```

2. Register in `ValidationRuleFactory`:

```csharp
["email"] = config => new EmailValidationRule
{
    RuleId = "email",
    TargetField = config["targetField"]?.ToString() ?? string.Empty,
    ErrorMessage = config["errorMessage"]?.ToString() ?? "Invalid email format"
}
```

### Adding New Workflows

1. Create workflow definition JSON in `frontend/src/assets/forms/workflows/Definitions/`
2. Create step definition JSONs in `frontend/src/assets/forms/workflows/Steps/certificate_specific/{workflowCode}/`
3. No code changes needed!

## Running the Application

```bash
cd backendsln
dotnet build
dotnet run --project backend
```

The API will be available at: `https://localhost:5001` or `http://localhost:5000`

## Testing with cURL

### Create a workflow instance
```bash
curl -X POST https://localhost:5001/api/workflow/instances \
  -H "Content-Type: application/json" \
  -d '{"certificationId":"CT401_lithium_battery_new","createdBy":"test@example.com"}'
```

### Get current step
```bash
curl https://localhost:5001/api/workflow/instances/{instanceId}/current-step
```

### Submit a step
```bash
curl -X POST https://localhost:5001/api/workflow/instances/{instanceId}/submit \
  -H "Content-Type: application/json" \
  -d '{
    "certificationId":"CT401_lithium_battery_new",
    "stepId":"CT401_step1_data_entry",
    "formData":{"applicantName":"John Doe","companyName":"ABC Corp"},
    "submittedBy":"test@example.com"
  }'
```

## Future Enhancements

1. **Database Integration** - Replace in-memory storage
2. **Authentication & Authorization** - Add JWT/OAuth support
3. **Notification System** - Email/SMS notifications on step completion
4. **Document Management** - File upload and storage integration
5. **Audit Trail** - Detailed logging and audit capabilities
6. **Dynamic Field Loading** - Support for dependent dropdown options
7. **Conditional Visibility** - Hide/show fields based on expressions
8. **Send Back Functionality** - Return workflow to previous step
9. **Parallel Steps** - Support for non-linear workflows
10. **Reporting & Analytics** - Dashboard for workflow metrics

## License

Internal use - Saso Maneh Certificate Management System
