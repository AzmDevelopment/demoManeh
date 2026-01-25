# API Endpoint Flow: Form Submission to Database

## ?? Main Endpoint for Form Submission

**Endpoint**: `POST /api/workflow/instances/{instanceId}/submit`

**Controller**: `WorkflowController.SubmitStep()` (line 216)

---

## ?? Complete Flow Diagram

```
???????????????????????????????????????????????????????????????????????
?                         CLIENT/FRONTEND                              ?
?  POST /api/workflow/instances/{instanceId}/submit                   ?
?  {                                                                   ?
?    "certificationId": "CT401_lithium_battery_new",                  ?
?    "stepId": "CT401_step1_data_entry",                              ?
?    "formData": {                                                     ?
?      "applicantName": "John Doe",                                   ?
?      "companyName": "ABC Corp",                                     ?
?      "category": "lithium_ion",                                     ?
?      "productModel": "Model-X"                                      ?
?    },                                                                ?
?    "submittedBy": "user@example.com"                                ?
?  }                                                                   ?
???????????????????????????????????????????????????????????????????????
                                  ?
                                  ?
???????????????????????????????????????????????????????????????????????
?               1. CONTROLLER (WorkflowController.cs)                  ?
?  SubmitStep(instanceId, submission)                                 ?
?  Line 216-237                                                        ?
?                                                                      ?
?  • Receives HTTP POST request                                       ?
?  • Extracts instanceId and WorkflowSubmission                       ?
?  • Calls WorkflowEngine.SubmitStepAsync()                           ?
???????????????????????????????????????????????????????????????????????
                                  ?
                                  ?
???????????????????????????????????????????????????????????????????????
?               2. WORKFLOW ENGINE (WorkflowEngine.cs)                 ?
?  SubmitStepAsync(instanceId, submission)                            ?
?  Line 158-230                                                        ?
?                                                                      ?
?  Step 2a: Load Workflow Instance                                    ?
?  • Calls _repository.GetWorkflowInstanceAsync(instanceId)           ?
?  • Loads from SQL Server LocalDB                                    ?
?                                                                      ?
?  Step 2b: VALIDATE THE DATA                                         ?
?  • Calls ValidateStepAsync(instanceId, stepId, formData)            ?
?    ??> Goes to Step 3 (Validation)                                  ?
?                                                                      ?
?  Step 2c: If validation fails                                       ?
?  • Throws InvalidOperationException                                 ?
?  • Returns 400 Bad Request to client                                ?
?                                                                      ?
?  Step 2d: If validation passes, continue...                         ?
???????????????????????????????????????????????????????????????????????
                                  ?
                                  ?
???????????????????????????????????????????????????????????????????????
?            3. VALIDATION (WorkflowEngine.ValidateStepAsync)          ?
?  Line 82-152                                                         ?
?                                                                      ?
?  Step 3a: Load Step Definition from File System                     ?
?  • Calls _definitionProvider.GetDefinitionAsync()                   ?
?  • Calls _definitionProvider.GetStepDefinitionAsync()               ?
?  • Loads JSON from:                                                 ?
?    frontend/src/assets/forms/workflows/Steps/.../stepId.json        ?
?                                                                      ?
?  Step 3b: Create Validation Rules                                   ?
?  • Calls _validationFactory.CreateRulesFromStep(stepDefinition)    ?
?  • Creates rules based on field requirements:                       ?
?    - RequiredFieldRule (for required fields)                        ?
?    - RequiredIfRule (conditional required)                          ?
?    - NumericRangeRule (range validation)                            ?
?                                                                      ?
?  Step 3c: Execute Validation Rules                                  ?
?  • Loops through each rule                                          ?
?  • Calls rule.ValidateAsync(formData, context)                     ?
?  • Collects all validation errors                                   ?
?                                                                      ?
?  Step 3d: Execute Business Rules                                    ?
?  • Calls ExecuteBusinessRulesAsync()                                ?
?  • Custom validation logic per step                                 ?
?                                                                      ?
?  Step 3e: Return Validation Result                                  ?
?  • If errors exist: ValidationResult.Failure(errors)                ?
?  • If no errors: ValidationResult.Success()                         ?
???????????????????????????????????????????????????????????????????????
                                  ?
                                  ?
???????????????????????????????????????????????????????????????????????
?          4. UPDATE WORKFLOW DATA (WorkflowEngine.SubmitStepAsync)    ?
?  Line 172-227                                                        ?
?                                                                      ?
?  Step 4a: Track Field Changes                                       ?
?  • Calls TrackFieldChanges(oldData, newData)                       ?
?  • Records what changed from previous submission                    ?
?                                                                      ?
?  Step 4b: Merge Form Data into Workflow Instance                    ?
?  • foreach (var kvp in submission.FormData)                         ?
?  •   instance.CurrentData[kvp.Key] = kvp.Value;                     ?
?                                                                      ?
?  Step 4c: Create History Entry                                      ?
?  • Creates StepHistoryEntry with:                                   ?
?    - StepId, CompletedAt, CompletedBy                               ?
?    - DataSnapshot (complete data state)                             ?
?    - ChangedFields (what changed)                                   ?
?    - Decision, Comments                                             ?
?  • Adds to instance.StepHistory                                     ?
?                                                                      ?
?  Step 4d: Determine Next Step                                       ?
?  • Reads workflow definition                                        ?
?  • Gets nextStep from step overrides                                ?
?  • If nextStep == "completed":                                      ?
?    - Sets instance.Status = "completed"                             ?
?  • Else:                                                            ?
?    - Loads next step definition                                     ?
?    - Updates instance.CurrentStep                                   ?
?    - Updates instance.AssignedActor                                 ?
???????????????????????????????????????????????????????????????????????
                                  ?
                                  ?
???????????????????????????????????????????????????????????????????????
?            5. SAVE TO DATABASE (EfCoreWorkflowRepository.cs)         ?
?  SaveWorkflowInstanceAsync(instance)                                ?
?  Line 31-60                                                          ?
?                                                                      ?
?  Step 5a: Convert Domain Model to Entity                            ?
?  • WorkflowInstanceEntity.FromModel(instance)                       ?
?  • Serializes CurrentData, StepHistory to JSON                      ?
?                                                                      ?
?  Step 5b: Check if Exists                                           ?
?  • Queries database for existing record                             ?
?  • If not found: INSERT new record                                  ?
?  • If found: UPDATE existing record                                 ?
?                                                                      ?
?  Step 5c: Save to SQL Server LocalDB                                ?
?  • await _context.SaveChangesAsync()                                ?
?  • Writes to WorkflowInstances table                                ?
?                                                                      ?
?  Step 5d: Save Detailed Step History (Optional)                     ?
?  • Calls SaveStepHistoryDetailsAsync()                              ?
?  • Writes to StepHistoryDetails table                               ?
?  • For reporting and audit trail                                    ?
???????????????????????????????????????????????????????????????????????
                                  ?
                                  ?
???????????????????????????????????????????????????????????????????????
?                     6. RETURN RESPONSE TO CLIENT                     ?
?                                                                      ?
?  HTTP 200 OK                                                         ?
?  {                                                                   ?
?    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",                    ?
?    "currentStep": "CT401_step2_document_upload",  ? MOVED TO NEXT!  ?
?    "status": "in_progress",                                         ?
?    "currentData": {                                                  ?
?      "applicantName": "John Doe",                                   ?
?      "companyName": "ABC Corp",                                     ?
?      "category": "lithium_ion",                                     ?
?      "productModel": "Model-X"                                      ?
?    },                                                                ?
?    "stepHistory": [                                                  ?
?      {                                                               ?
?        "stepId": "CT401_step1_data_entry",                          ?
?        "completedAt": "2024-01-25T16:30:00Z",                       ?
?        "completedBy": "user@example.com",                           ?
?        "decision": "approve"                                        ?
?      }                                                               ?
?    ]                                                                 ?
?  }                                                                   ?
???????????????????????????????????????????????????????????????????????
```

---

## ?? Database Tables Written

### WorkflowInstances Table
```sql
UPDATE WorkflowInstances
SET 
    CurrentStep = 'CT401_step2_document_upload',
    CurrentData = '{"applicantName":"John Doe","companyName":"ABC Corp",...}',
    StepHistory = '[{"stepId":"CT401_step1_data_entry","completedAt":"..."}]',
    AssignedActor = 'customer'
WHERE Id = '3fa85f64-5717-4562-b3fc-2c963f66afa6'
```

### StepHistoryDetails Table (Optional)
```sql
INSERT INTO StepHistoryDetails (
    WorkflowInstanceId,
    StepId,
    CompletedAt,
    CompletedBy,
    ActorRole,
    DataSnapshot,
    ChangedFields,
    Decision,
    Comments
) VALUES (
    '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    'CT401_step1_data_entry',
    '2024-01-25 16:30:00',
    'user@example.com',
    'customer',
    '{"applicantName":"John Doe",...}',
    '{"applicantName":{"oldValue":null,"newValue":"John Doe"},...}',
    'approve',
    'All data complete'
)
```

---

## ?? Validation Process Details

### Step Definition Loading (from File System)

**Location**: `FileSystemWorkflowDefinitionProvider.cs`

1. **Gets workflow definition** from:
   ```
   frontend/src/assets/forms/workflows/Definitions/CT401_lithium_battery_new.json
   ```

2. **Gets step definition** from:
   ```
   frontend/src/assets/forms/workflows/Steps/certificate_specific/CT401/CT401_step1_data_entry.json
   ```

3. **Reads field configuration**:
   ```json
   {
     "key": "applicantName",
     "type": "input",
     "templateOptions": {
       "label": "Applicant Full Name",
       "required": true  ? Creates RequiredFieldRule
     }
   }
   ```

### Validation Rules Created

**Location**: `ValidationRuleFactory.CreateRulesFromStep()`

For each field:
- **If `required: true`** ? Creates `RequiredFieldRule`
- **If `hideExpression`** ? Creates conditional validation
- **Custom validations** ? From step's `validations` array

Example validation:
```csharp
// Check "applicantName" is required
var rule = new RequiredFieldRule {
    TargetField = "applicantName",
    ErrorMessage = "Applicant Full Name is required"
};

var result = await rule.ValidateAsync(formData, context);
// Returns: { IsValid: false } if missing
```

---

## ?? Key Files in the Flow

| Step | File | Method | Line | Purpose |
|------|------|--------|------|---------|
| 1 | `WorkflowController.cs` | `SubmitStep()` | 216 | Receives HTTP POST |
| 2 | `WorkflowEngine.cs` | `SubmitStepAsync()` | 158 | Orchestrates submission |
| 3 | `WorkflowEngine.cs` | `ValidateStepAsync()` | 82 | Validates form data |
| 3a | `FileSystemWorkflowDefinitionProvider.cs` | `GetStepDefinitionAsync()` | 48 | Loads step JSON |
| 3b | `ValidationRuleFactory.cs` | `CreateRulesFromStep()` | 58 | Creates validators |
| 3c | `ValidationRuleBase.cs` | `ValidateAsync()` | - | Runs validation |
| 4 | `WorkflowEngine.cs` | `TrackFieldChanges()` | 247 | Tracks changes |
| 5 | `EfCoreWorkflowRepository.cs` | `SaveWorkflowInstanceAsync()` | 31 | Saves to DB |
| 5a | `WorkflowInstanceEntity.cs` | `FromModel()` | 104 | Converts to entity |
| 5b | `WorkflowDbContext.cs` | `SaveChangesAsync()` | - | EF Core save |

---

## ?? Example Test Flow

### 1. Create Workflow Instance
```http
POST /api/workflow/instances
{
  "certificationId": "CT401_lithium_battery_new",
  "createdBy": "test@example.com"
}
```
**Result**: Instance created, saved to database

### 2. Get Current Step
```http
GET /api/workflow/instances/{id}/current-step
```
**Result**: Returns step definition from file system with required fields

### 3. Submit Step Data
```http
POST /api/workflow/instances/{id}/submit
{
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

**Internal Flow**:
1. ? Loads instance from database
2. ? Loads step definition from file system
3. ? Creates validation rules from step definition
4. ? Validates all required fields
5. ? Merges form data into instance
6. ? Creates history entry
7. ? Moves to next step
8. ? Saves to database
9. ? Returns updated instance

---

## ?? Where Configuration is Used

### `appsettings.json` ? `FileSystemWorkflowDefinitionProvider`

```json
"WorkflowEngine": {
  "BasePath": "../frontend/src/assets/forms/workflows"
}
```

**Used in**: `FileSystemWorkflowDefinitionProvider.cs` (line 18)
```csharp
_workflowBasePath = configuration["WorkflowEngine:BasePath"]
```

**Purpose**: Locate step definition JSON files for validation

---

## ? Summary

### Main Endpoint
**`POST /api/workflow/instances/{instanceId}/submit`**

### Flow Summary
1. **Controller** receives form data
2. **WorkflowEngine** orchestrates the flow
3. **FileSystemProvider** loads step definition from JSON files
4. **ValidationFactory** creates rules from step definition
5. **Validation rules** execute against form data
6. **Business rules** run custom validation
7. **Data merged** into workflow instance
8. **History entry** created
9. **Next step** determined from workflow definition
10. **Repository** saves to SQL Server LocalDB
11. **Response** returned to client

### Data Persistence
- ? Form data stored in `WorkflowInstances.CurrentData` (JSON)
- ? Step history in `WorkflowInstances.StepHistory` (JSON)
- ? Detailed audit in `StepHistoryDetails` table
- ? All data survives application restart

---

This is a **complete generic workflow engine** that requires no code changes to add new workflows - just add JSON configuration files! ??
