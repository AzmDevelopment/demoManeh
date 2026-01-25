# Step Definition Path Fix

## ?? Issue Identified

The workflow definition was referencing steps in directory `CT401`, but the actual step files are in `CT401_new`.

---

## ?? Directory Structure

### Actual File Location:
```
C:\work\Azm\Maneh\demo\demoManeh\frontend\src\assets\forms\workflows\
??? Steps\
    ??? certificate_specific\
        ??? CT401_new\              ? Directory is CT401_new
            ??? CT401_step1_data_entry.json
            ??? CT401_step2_document_upload.json
            ??? CT401_step3_initial_review.json
            ??? CT401_step4_factory_inspection.json
            ??? CT401_step5_technical_evaluation.json
            ??? CT401_step6_final_approval.json
```

### Workflow Definition Was Referencing:
```json
"stepRef": "workflows/Steps/certificate_specific/CT401/CT401_step1_data_entry"
                                                    ^^^^^ Wrong!
```

---

## ? Fix Applied

Updated `CT401_lithium_battery_new.json` to reference the correct directory:

### Before:
```json
{
  "stepRef": "workflows/Steps/certificate_specific/CT401/CT401_step1_data_entry"
}
```

### After:
```json
{
  "stepRef": "workflows/Steps/certificate_specific/CT401_new/CT401_step1_data_entry"
                                                    ^^^^^^^^^^ Correct!
}
```

---

## ?? Enhanced Logging Added

The `GetStepDefinitionAsync` method now provides detailed diagnostics:

```csharp
_logger.LogDebug("Looking for step definition at: {Path}", fullPath);
_logger.LogDebug("Step reference: {StepRef}", stepRef);
_logger.LogDebug("Base path: {BasePath}", _workflowBasePath);

if (!File.Exists(fullPath))
{
    // List files in directory to help diagnose
    var filesInDir = Directory.GetFiles(directory, "*.json");
    foreach (var file in filesInDir)
    {
        _logger.LogWarning("  - {FileName}", Path.GetFileName(file));
    }
}
```

**Benefits**:
- Shows exactly which path is being checked
- Lists available files if step not found
- Helps diagnose path mismatches quickly

---

## ?? Testing

### Step 1: Rebuild
```bash
cd C:\work\Azm\Maneh\demo\demoManeh\backendsln
dotnet build
```

### Step 2: Run Application
```bash
dotnet run --project backend
```

### Step 3: Test in Swagger UI

**URL**: http://localhost:5000/

#### Test 1: Get All Definitions
```
GET /api/workflow/definitions
```

**Expected**: Returns all workflow definitions including `CT401_lithium_battery_new`

#### Test 2: Get Specific Definition
```
GET /api/workflow/definitions/CT401_lithium_battery_new
```

**Expected**: Returns workflow with steps referencing `CT401_new`

#### Test 3: Get Step Definition
```
GET /api/workflow/steps/workflows/Steps/certificate_specific/CT401_new/CT401_step1_data_entry
```

**Expected**: Returns step definition for data entry step

#### Test 4: Create Workflow Instance
```
POST /api/workflow/instances
{
  "certificationId": "CT401_lithium_battery_new",
  "createdBy": "test@example.com",
  "priority": 3
}
```

**Expected**: Instance created with first step = `CT401_step1_data_entry`

#### Test 5: Get Current Step
```
GET /api/workflow/instances/{instanceId}/current-step
```

**Expected**: Returns step definition with all form fields:
```json
{
  "instance": { ... },
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
      ...
    ]
  },
  "currentData": {}
}
```

---

## ?? Logs to Watch For

### Successful Loading
```
info: backend.Services.FileSystemWorkflowDefinitionProvider[0]
      Workflow base path configured: C:\work\Azm\Maneh\demo\demoManeh\frontend\src\assets\forms\workflows
info: backend.Services.FileSystemWorkflowDefinitionProvider[0]
      Successfully loaded step definition: workflows/Steps/certificate_specific/CT401_new/CT401_step1_data_entry
```

### If Step Not Found
```
warn: backend.Services.FileSystemWorkflowDefinitionProvider[0]
      Step definition not found: C:\...\CT401_new\CT401_step1_data_entry.json
warn: backend.Services.FileSystemWorkflowDefinitionProvider[0]
      Directory exists but file not found. Files in directory:
warn: backend.Services.FileSystemWorkflowDefinitionProvider[0]
        - CT401_step1_data_entry.json
        - CT401_step2_document_upload.json
        ...
```

This helps identify:
- Typos in filenames
- Directory mismatches
- Missing files

---

## ?? Path Resolution Flow

```
Step Reference (from workflow definition):
  "workflows/Steps/certificate_specific/CT401_new/CT401_step1_data_entry"
          ?
Remove "workflows/" prefix:
  "Steps/certificate_specific/CT401_new/CT401_step1_data_entry"
          ?
Replace "/" with Path.DirectorySeparatorChar:
  "Steps\certificate_specific\CT401_new\CT401_step1_data_entry"
          ?
Combine with base path:
  C:\work\Azm\Maneh\demo\demoManeh\frontend\src\assets\forms\workflows\
  + Steps\certificate_specific\CT401_new\CT401_step1_data_entry
          ?
Add .json extension:
  C:\work\Azm\Maneh\demo\demoManeh\frontend\src\assets\forms\workflows\Steps\certificate_specific\CT401_new\CT401_step1_data_entry.json
          ?
Check if file exists ?
```

---

## ? Verification Checklist

- [x] Step files exist in `CT401_new` directory
- [x] Workflow definition updated to reference `CT401_new`
- [x] Enhanced logging added for diagnostics
- [x] All 6 step files present:
  - CT401_step1_data_entry.json
  - CT401_step2_document_upload.json
  - CT401_step3_initial_review.json
  - CT401_step4_factory_inspection.json
  - CT401_step5_technical_evaluation.json
  - CT401_step6_final_approval.json

---

## ?? Expected Behavior After Fix

### When Creating Workflow Instance:
1. ? Workflow definition loaded from `CT401_lithium_battery_new.json`
2. ? First step reference: `workflows/Steps/certificate_specific/CT401_new/CT401_step1_data_entry`
3. ? Step definition loaded from `CT401_new\CT401_step1_data_entry.json`
4. ? Instance created with `currentStep = "CT401_step1_data_entry"`
5. ? Form fields loaded for rendering

### When Getting Current Step:
1. ? Load workflow instance from database
2. ? Get workflow definition
3. ? Find step reference for current step
4. ? Load step definition from file system
5. ? Return step definition with form fields

### When Submitting Step:
1. ? Load step definition for validation
2. ? Create validation rules from field definitions
3. ? Validate form data
4. ? Save to database
5. ? Load next step definition
6. ? Transition to next step

---

## ??? Troubleshooting

### Issue: Step still not found

**Check 1**: Verify workflow definition has correct path
```powershell
Get-Content "C:\work\Azm\Maneh\demo\demoManeh\frontend\src\assets\forms\workflows\Definitions\CT401_lithium_battery_new.json" | Select-String "CT401_new"
```

**Expected**: Should show `CT401_new` in step references

**Check 2**: Verify file exists
```powershell
Test-Path "C:\work\Azm\Maneh\demo\demoManeh\frontend\src\assets\forms\workflows\Steps\certificate_specific\CT401_new\CT401_step1_data_entry.json"
```

**Expected**: `True`

**Check 3**: Check application logs
Look for:
```
Successfully loaded step definition: workflows/Steps/certificate_specific/CT401_new/CT401_step1_data_entry
```

---

## ?? Files Modified

1. ? `frontend/src/assets/forms/workflows/Definitions/CT401_lithium_battery_new.json`
   - Updated all 6 step references from `CT401` to `CT401_new`

2. ? `backendsln/backend/Services/FileSystemWorkflowDefinitionProvider.cs`
   - Added enhanced logging for step loading
   - Lists available files when step not found
   - Better error diagnostics

---

## ?? Summary

**Problem**: Step references used `CT401` but files are in `CT401_new` directory

**Solution**: Updated workflow definition to reference correct directory path

**Result**: 
- ? Steps now load correctly
- ? Enhanced logging helps diagnose path issues
- ? Complete workflow can execute from start to finish

---

**The step definitions should now load correctly!** ??
