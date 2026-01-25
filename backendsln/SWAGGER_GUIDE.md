# Swagger API Examples

## Accessing Swagger UI

After running the application with `dotnet run --project backend`, open your browser:

**URL**: http://localhost:5000/

You'll see the Swagger UI with all available endpoints organized by controller.

## API Endpoints Overview

### ?? Workflow Definitions

#### Get all workflow definitions
```
GET /api/workflow/definitions
```
Returns all available workflow configurations (CT401, etc.)

#### Get specific workflow definition
```
GET /api/workflow/definitions/CT401_lithium_battery_new
```
Returns the complete workflow definition including all steps and configuration.

#### Get step definition
```
GET /api/workflow/steps/workflows/Steps/certificate_specific/CT401/CT401_step1_data_entry
```
Returns the step definition with ngx-formly field configurations.

---

### ?? Workflow Instances

#### Create a new workflow instance
```http
POST /api/workflow/instances
Content-Type: application/json

{
  "certificationId": "CT401_lithium_battery_new",
  "createdBy": "john.doe@example.com",
  "priority": 3,
  "tags": "urgent,lithium_battery"
}
```

**Response** (201 Created):
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "definitionId": "CT401_lithium_battery_new",
  "workflowType": "new_application",
  "currentStep": "CT401_step1_data_entry",
  "status": "in_progress",
  "assignedActor": "customer",
  "currentData": {},
  "stepHistory": [],
  "startedAt": "2024-01-25T10:00:00Z",
  "createdBy": "john.doe@example.com",
  "priority": 3
}
```

#### Get workflow instance
```http
GET /api/workflow/instances/{instanceId}
```

#### Query workflows by status
```http
GET /api/workflow/instances?status=in_progress&actor=customer
```

Parameters:
- `status` (required): in_progress, completed, rejected, on_hold
- `actor` (optional): customer, inspector, manager

#### Get current step
```http
GET /api/workflow/instances/{instanceId}/current-step
```

Returns the current step definition with form fields and existing data:
```json
{
  "instance": { ... },
  "stepDefinition": {
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
    ]
  },
  "currentData": {}
}
```

---

### ? Validation & Submission

#### Validate step data (without submitting)
```http
POST /api/workflow/instances/{instanceId}/steps/{stepId}/validate
Content-Type: application/json

{
  "applicantName": "John Doe",
  "companyName": "ABC Corp",
  "category": "lithium_ion",
  "productModel": "Model-X"
}
```

**Response** (200 OK):
```json
{
  "isValid": true,
  "errorMessage": null,
  "errors": []
}
```

**Response** (Validation Failed):
```json
{
  "isValid": false,
  "errorMessage": "applicantName is required",
  "errors": [
    {
      "ruleId": "required",
      "field": "applicantName",
      "message": "applicantName is required"
    }
  ]
}
```

#### Submit a step
```http
POST /api/workflow/instances/{instanceId}/submit
Content-Type: application/json

{
  "certificationId": "CT401_lithium_battery_new",
  "stepId": "CT401_step1_data_entry",
  "formData": {
    "applicantName": "John Doe",
    "companyName": "ABC Corporation",
    "category": "lithium_ion",
    "productModel": "LI-X1000"
  },
  "decision": "approve",
  "comments": "All basic information provided",
  "submittedBy": "john.doe@example.com"
}
```

**Response** (200 OK):
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "currentStep": "CT401_step2_document_upload",
  "status": "in_progress",
  "assignedActor": "customer",
  "currentData": {
    "applicantName": "John Doe",
    "companyName": "ABC Corporation",
    "category": "lithium_ion",
    "productModel": "LI-X1000"
  },
  "stepHistory": [
    {
      "stepId": "CT401_step1_data_entry",
      "completedAt": "2024-01-25T10:15:00Z",
      "completedBy": "john.doe@example.com",
      "actorRole": "customer",
      "decision": "approve",
      "comments": "All basic information provided"
    }
  ]
}
```

---

## ?? Testing Workflow with Swagger UI

### Step-by-Step Test

1. **Open Swagger UI**: http://localhost:5000/

2. **Create a workflow instance**:
   - Expand `POST /api/workflow/instances`
   - Click "Try it out"
   - Modify the request body:
     ```json
     {
       "certificationId": "CT401_lithium_battery_new",
       "createdBy": "test@example.com",
       "priority": 3
     }
     ```
   - Click "Execute"
   - Copy the `id` from the response

3. **Get current step**:
   - Expand `GET /api/workflow/instances/{instanceId}/current-step`
   - Click "Try it out"
   - Paste the instance ID
   - Click "Execute"
   - Review the form fields required

4. **Validate form data**:
   - Expand `POST /api/workflow/instances/{instanceId}/steps/{stepId}/validate`
   - Click "Try it out"
   - Enter instance ID and step ID: `CT401_step1_data_entry`
   - Enter form data:
     ```json
     {
       "applicantName": "John Doe",
       "companyName": "ABC Corp",
       "category": "lithium_ion",
       "productModel": "Model-X"
     }
     ```
   - Click "Execute"

5. **Submit the step**:
   - Expand `POST /api/workflow/instances/{instanceId}/submit`
   - Click "Try it out"
   - Enter the submission data:
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
       "submittedBy": "test@example.com"
     }
     ```
   - Click "Execute"
   - Notice the workflow moved to the next step

6. **Check updated workflow**:
   - Expand `GET /api/workflow/instances/{instanceId}`
   - Click "Try it out"
   - Enter the instance ID
   - Click "Execute"
   - Verify `currentStep` is now `CT401_step2_document_upload`

---

## ?? Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created (new workflow instance) |
| 400 | Bad Request (validation failed, invalid parameters) |
| 404 | Not Found (workflow/step not found) |
| 500 | Internal Server Error |

---

## ?? Swagger Configuration

The Swagger UI is configured in `Program.cs`:

```csharp
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title = "Workflow Engine API",
        Version = "v1",
        Description = "Generic workflow engine for certificate management system"
    });
    
    // XML comments are included for better documentation
    options.IncludeXmlComments(xmlPath);
});
```

### Features Enabled:
- ? XML documentation comments
- ? Request/response examples
- ? Schema definitions
- ? Request duration display
- ? Model expansion (depth: 2)
- ? Try-it-out functionality

---

## ?? Tips for Using Swagger

1. **Expand All**: Click "Expand Operations" to see all endpoints at once
2. **Schemas**: Scroll to the bottom to see all data models
3. **Examples**: Click "Example Value" to auto-fill request bodies
4. **Copy cURL**: Each request can be exported as a cURL command
5. **Persistent Session**: Instance IDs persist during the application session (in-memory)

---

## ?? Additional Resources

- **OpenAPI Spec**: Available at `/swagger/v1/swagger.json`
- **API Base URL**: `http://localhost:5000/api/workflow`
- **Frontend Integration**: Use the OpenAPI spec to generate TypeScript clients

---

## ?? Development Mode Only

Swagger UI is only enabled in **Development** mode. For production:

```csharp
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(...);
}
```

To enable in production, add authentication and configure appropriately.
