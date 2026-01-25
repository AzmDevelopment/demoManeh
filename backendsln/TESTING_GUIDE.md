# Quick Start Testing Guide

## ?? Start Testing in 5 Minutes

### Step 1: Verify LocalDB

```powershell
# Check LocalDB is installed
sqllocaldb info

# If not running, start it
sqllocaldb start MSSQLLocalDB
```

### Step 2: Build and Run

```bash
cd C:\work\Azm\Maneh\demo\demoManeh\backendsln
dotnet build
dotnet run --project backend
```

**Expected output:**
```
info: Program[0]
      Ensuring database is created and migrated...
info: Program[0]
      Database migration completed successfully
...
Now listening on: http://localhost:5000
Now listening on: https://localhost:5001
```

### Step 3: Open Swagger UI

Open browser: **http://localhost:5000/**

---

## ?? Test Scenario: Complete Workflow

### 1. Get Available Workflows

**Swagger**: `GET /api/workflow/definitions`

**Expected**: List including `CT401_lithium_battery_new`

---

### 2. Create Workflow Instance

**Swagger**: `POST /api/workflow/instances`

**Request Body**:
```json
{
  "certificationId": "CT401_lithium_battery_new",
  "createdBy": "test@example.com",
  "priority": 2,
  "tags": "test,lithium"
}
```

**Copy the `id` from response!** Example: `3fa85f64-5717-4562-b3fc-2c963f66afa6`

---

### 3. Get Current Step

**Swagger**: `GET /api/workflow/instances/{instanceId}/current-step`

Paste the instance ID from step 2.

**Expected Response**:
```json
{
  "instance": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "currentStep": "CT401_step1_data_entry",
    "status": "in_progress",
    "assignedActor": "customer"
  },
  "stepDefinition": {
    "stepId": "CT401_step1_data_entry",
    "name": "Basic Information - Step 1",
    "fields": [
      {
        "key": "applicantName",
        "type": "input",
        "templateOptions": {
          "label": "Applicant Full Name",
          "required": true
        }
      },
      {
        "key": "companyName",
        "type": "input",
        "templateOptions": {
          "label": "Company Name",
          "required": true
        }
      },
      {
        "key": "category",
        "type": "select",
        "templateOptions": {
          "label": "Product Category",
          "required": true
        }
      },
      {
        "key": "productModel",
        "type": "input",
        "templateOptions": {
          "label": "Product Model",
          "required": true
        }
      }
    ]
  },
  "currentData": {}
}
```

---

### 4. Validate Form Data (Optional)

**Swagger**: `POST /api/workflow/instances/{instanceId}/steps/CT401_step1_data_entry/validate`

**Request Body**:
```json
{
  "applicantName": "John Doe",
  "companyName": "ABC Corporation",
  "category": "lithium_ion",
  "productModel": "LI-X1000"
}
```

**Expected**: `"isValid": true`

**Test Invalid Data**:
```json
{
  "companyName": "ABC Corporation"
}
```

**Expected**: 
```json
{
  "isValid": false,
  "errors": [
    {
      "ruleId": "required",
      "field": "applicantName",
      "message": "Applicant Full Name is required"
    }
  ]
}
```

---

### 5. Submit Step 1

**Swagger**: `POST /api/workflow/instances/{instanceId}/submit`

**Request Body**:
```json
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
  "comments": "All basic information is complete",
  "submittedBy": "test@example.com"
}
```

**Expected Response**:
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "currentStep": "CT401_step2_document_upload",  // ? Moved to next step!
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
      "completedAt": "2024-01-25T16:30:00Z",
      "completedBy": "test@example.com",
      "actorRole": "customer",
      "decision": "approve",
      "comments": "All basic information is complete"
    }
  ]
}
```

---

### 6. Verify Data Persisted

**Stop the application** (Ctrl+C) and **restart it**:

```bash
dotnet run --project backend
```

**Then check the instance again**:

**Swagger**: `GET /api/workflow/instances/{instanceId}`

**Expected**: All data is still there! ??

---

### 7. Check Database

Connect to LocalDB using:
- **SQL Server Management Studio (SSMS)**
- **Visual Studio SQL Server Object Explorer**
- **Azure Data Studio**

**Server**: `(localdb)\mssqllocaldb`  
**Database**: `WorkflowEngineDb`

**Query**:
```sql
-- View all instances
SELECT 
    Id,
    DefinitionId,
    CurrentStep,
    Status,
    JSON_VALUE(CurrentData, '$.applicantName') as ApplicantName,
    JSON_VALUE(CurrentData, '$.companyName') as CompanyName,
    StartedAt,
    CreatedBy
FROM WorkflowInstances;

-- View step history
SELECT 
    Id,
    WorkflowInstanceId,
    StepId,
    CompletedBy,
    CompletedAt,
    Decision,
    Comments
FROM StepHistoryDetails
ORDER BY CompletedAt DESC;
```

---

## ?? Testing Multiple Workflows

### Create Multiple Instances

```json
// Instance 1 - High Priority
{
  "certificationId": "CT401_lithium_battery_new",
  "createdBy": "alice@example.com",
  "priority": 1,
  "tags": "urgent"
}

// Instance 2 - Normal Priority
{
  "certificationId": "CT401_lithium_battery_new",
  "createdBy": "bob@example.com",
  "priority": 3,
  "tags": "standard"
}

// Instance 3 - Low Priority
{
  "certificationId": "CT401_lithium_battery_new",
  "createdBy": "charlie@example.com",
  "priority": 5,
  "tags": "backlog"
}
```

### Query by Status

**Swagger**: `GET /api/workflow/instances?status=in_progress`

**Expected**: List of all active workflows

### Query by Status and Actor

**Swagger**: `GET /api/workflow/instances?status=in_progress&actor=customer`

**Expected**: Only workflows assigned to customers

---

## ? Verification Checklist

- [ ] LocalDB is running
- [ ] Application starts without errors
- [ ] Database migration completed
- [ ] Swagger UI loads successfully
- [ ] Can create workflow instance
- [ ] Can get current step definition
- [ ] Can validate form data
- [ ] Can submit a step
- [ ] Workflow moves to next step
- [ ] Data persists after restart
- [ ] Can query database directly
- [ ] Step history is recorded

---

## ?? Common Issues

### Issue: "Cannot connect to LocalDB"

**Solution**:
```powershell
sqllocaldb start MSSQLLocalDB
```

### Issue: "Migration failed"

**Solution**:
```bash
cd backendsln/backend
dotnet ef database drop --force
dotnet run
```

### Issue: "Validation failed"

**Cause**: Missing required fields

**Solution**: Check step definition for required fields and provide all mandatory data

### Issue: "Invalid step"

**Cause**: Trying to submit wrong step

**Solution**: Use `GET /current-step` to verify the current step ID

---

## ?? Next Steps

1. **Test all 6 steps** of CT401 workflow
2. **Test different users** (customer, inspector, manager)
3. **Test send-back functionality** (when implemented)
4. **Test SLA tracking** (check deadline calculations)
5. **Create custom queries** for reporting
6. **Implement authentication** for role-based access
7. **Add file upload** for document management

---

## ?? Need Help?

Check the documentation:
- `LOCALDB_IMPLEMENTATION.md` - Full database details
- `README.md` - General workflow engine guide
- `SWAGGER_GUIDE.md` - API endpoint examples

Happy Testing! ??
