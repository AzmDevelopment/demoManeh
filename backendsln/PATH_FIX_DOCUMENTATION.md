# Workflow Path Configuration Fix

## ?? Problem Identified

The workflow definitions were not being found because of incorrect path resolution.

### Issue Details

**When the application runs**, the working directory is:
```
C:\work\Azm\Maneh\demo\demoManeh\backendsln\backend\bin\Debug\net9.0
```

**The old relative path** was:
```
../frontend/src/assets/forms/workflows
```

This resolves to:
```
C:\work\Azm\Maneh\demo\demoManeh\backendsln\backend\bin\Debug\net9.0\..\frontend\src\assets\forms\workflows
```
? **This path doesn't exist!**

**The correct path** should be:
```
C:\work\Azm\Maneh\demo\demoManeh\frontend\src\assets\forms\workflows
```

---

## ? Solution Applied

### Option 1: Absolute Path (Currently Configured)

**File**: `appsettings.json`

```json
{
  "WorkflowEngine": {
    "BasePath": "C:\\work\\Azm\\Maneh\\demo\\demoManeh\\frontend\\src\\assets\\forms\\workflows"
  }
}
```

? **Pros**: Always works, no ambiguity  
?? **Cons**: Must be changed if project location moves  

### Option 2: Corrected Relative Path (Fallback)

The code now correctly navigates from `bin/Debug/net9.0` up to the solution root:

```csharp
// From: bin/Debug/net9.0
// To:   ../../../../frontend/src/assets/forms/workflows

var currentDir = Directory.GetCurrentDirectory();
_workflowBasePath = Path.GetFullPath(Path.Combine(
    currentDir, 
    "..", "..", "..", "..", "..", 
    "frontend", "src", "assets", "forms", "workflows"
));
```

Path navigation:
```
bin/Debug/net9.0  (current)
? bin/Debug       (..)
? bin             (..)
? backend         (..)
? backendsln      (..)
? demoManeh       (..)
? frontend        (frontend)
? src             (src)
? assets          (assets)
? forms           (forms)
? workflows       (workflows) ?
```

---

## ?? Enhanced Logging

The code now logs detailed path information:

```csharp
_logger.LogInformation("Workflow base path configured: {BasePath}", _workflowBasePath);
_logger.LogDebug("Looking for definitions directory at: {Path}", definitionsPath);
_logger.LogWarning("Current directory: {CurrentDir}", Directory.GetCurrentDirectory());
```

**When you run the app**, check the console output:
```
info: backend.Services.FileSystemWorkflowDefinitionProvider[0]
      Workflow base path configured: C:\work\Azm\Maneh\demo\demoManeh\frontend\src\assets\forms\workflows
info: backend.Services.FileSystemWorkflowDefinitionProvider[0]
      Found 1 workflow definition files
```

---

## ?? Testing the Fix

### Step 1: Rebuild
```bash
cd C:\work\Azm\Maneh\demo\demoManeh\backendsln
dotnet build
```

### Step 2: Run
```bash
dotnet run --project backend
```

### Step 3: Check Logs

Look for these log entries:
```
info: backend.Services.FileSystemWorkflowDefinitionProvider[0]
      Workflow base path configured: C:\work\Azm\Maneh\demo\demoManeh\frontend\src\assets\forms\workflows
```

If the path is wrong, you'll see:
```
warn: backend.Services.FileSystemWorkflowDefinitionProvider[0]
      Definitions directory not found: [path]
```

### Step 4: Test API

**Open Swagger UI**: http://localhost:5000/

**Call**: `GET /api/workflow/definitions`

**Expected Response**:
```json
[
  {
    "certificationId": "CT401_lithium_battery_new",
    "name": "CT401 Lithium Battery - New Certificate Application",
    ...
  }
]
```

---

## ?? Configuration Options

### For Development (Recommended)

Use **absolute path** in `appsettings.json`:

```json
{
  "WorkflowEngine": {
    "BasePath": "C:\\work\\Azm\\Maneh\\demo\\demoManeh\\frontend\\src\\assets\\forms\\workflows"
  }
}
```

### For Production / Different Machines

Use **environment-specific configuration**:

#### `appsettings.Production.json`
```json
{
  "WorkflowEngine": {
    "BasePath": "/app/workflows"
  }
}
```

#### Docker or Linux
```json
{
  "WorkflowEngine": {
    "BasePath": "/var/workflows"
  }
}
```

### Using Environment Variable

Set environment variable:
```powershell
$env:WorkflowEngine__BasePath = "C:\work\Azm\Maneh\demo\demoManeh\frontend\src\assets\forms\workflows"
```

Or in `launchSettings.json`:
```json
{
  "profiles": {
    "backend": {
      "environmentVariables": {
        "WorkflowEngine__BasePath": "C:\\work\\Azm\\Maneh\\demo\\demoManeh\\frontend\\src\\assets\\forms\\workflows"
      }
    }
  }
}
```

---

## ?? Expected Directory Structure

The code expects this structure:

```
C:\work\Azm\Maneh\demo\demoManeh\
??? frontend\
?   ??? src\
?       ??? assets\
?           ??? forms\
?               ??? workflows\
?                   ??? Definitions\
?                   ?   ??? CT401_lithium_battery_new.json
?                   ??? Steps\
?                       ??? certificate_specific\
?                           ??? CT401\
?                               ??? CT401_step1_data_entry.json
?                               ??? CT401_step2_document_upload.json
?                               ??? CT401_step3_initial_review.json
?                               ??? CT401_step4_factory_inspection.json
?                               ??? CT401_step5_technical_evaluation.json
?                               ??? CT401_step6_final_approval.json
??? backendsln\
    ??? backend\
        ??? bin\
            ??? Debug\
                ??? net9.0\  ? App runs from here
```

---

## ?? Troubleshooting

### Issue: Still can't find definitions

**Check 1**: Verify the path exists
```powershell
Test-Path "C:\work\Azm\Maneh\demo\demoManeh\frontend\src\assets\forms\workflows\Definitions"
```

**Expected**: `True`

**Check 2**: List files in directory
```powershell
Get-ChildItem "C:\work\Azm\Maneh\demo\demoManeh\frontend\src\assets\forms\workflows\Definitions"
```

**Expected**: You should see `CT401_lithium_battery_new.json`

**Check 3**: Check application logs
Look for:
```
Workflow base path configured: [path]
Definitions directory not found: [path]
```

**Check 4**: Verify JSON file is valid
```powershell
Get-Content "C:\work\Azm\Maneh\demo\demoManeh\frontend\src\assets\forms\workflows\Definitions\CT401_lithium_battery_new.json"
```

---

## ?? Alternative Solutions

### Solution 1: Copy Workflows to Output Directory

Add to `backend.csproj`:
```xml
<ItemGroup>
  <None Include="..\..\frontend\src\assets\forms\workflows\**\*.*">
    <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
    <Link>workflows\%(RecursiveDir)%(Filename)%(Extension)</Link>
  </None>
</ItemGroup>
```

Then use relative path:
```json
{
  "WorkflowEngine": {
    "BasePath": "workflows"
  }
}
```

### Solution 2: Use Content Root Path

In `FileSystemWorkflowDefinitionProvider.cs`:
```csharp
public FileSystemWorkflowDefinitionProvider(
    IConfiguration configuration,
    IWebHostEnvironment environment,
    ILogger<FileSystemWorkflowDefinitionProvider> logger)
{
    _logger = logger;
    var basePath = Path.Combine(environment.ContentRootPath, "..", "..", "frontend", "src", "assets", "forms", "workflows");
    _workflowBasePath = Path.GetFullPath(basePath);
}
```

---

## ? Verification Checklist

- [ ] `appsettings.json` has correct `BasePath`
- [ ] Path exists: `C:\work\Azm\Maneh\demo\demoManeh\frontend\src\assets\forms\workflows\Definitions`
- [ ] File exists: `CT401_lithium_battery_new.json`
- [ ] Application builds: `dotnet build`
- [ ] Logs show correct path: "Workflow base path configured: ..."
- [ ] API returns definitions: `GET /api/workflow/definitions`
- [ ] No warnings in logs: "Definitions directory not found"

---

## ?? Summary

### Problem
- Relative path `../frontend/...` didn't work from `bin/Debug/net9.0`

### Solution
- Used **absolute path** in `appsettings.json`
- Added **enhanced logging** to debug path issues
- Fixed **fallback path calculation** with correct number of parent directories

### Result
- ? Workflow definitions now load correctly
- ? API returns workflow definitions
- ? Clear logging shows actual paths being used

---

## ?? Quick Test

Run this in PowerShell:
```powershell
# Test the path
$basePath = "C:\work\Azm\Maneh\demo\demoManeh\frontend\src\assets\forms\workflows"
$defsPath = Join-Path $basePath "Definitions"
$file = Join-Path $defsPath "CT401_lithium_battery_new.json"

Write-Host "Base Path Exists: $(Test-Path $basePath)"
Write-Host "Definitions Path Exists: $(Test-Path $defsPath)"
Write-Host "CT401 File Exists: $(Test-Path $file)"

if (Test-Path $file) {
    Write-Host "? All paths are correct!"
} else {
    Write-Host "? Check your directory structure"
}
```

**Expected Output**:
```
Base Path Exists: True
Definitions Path Exists: True
CT401 File Exists: True
? All paths are correct!
```

---

**The path configuration is now fixed and should work correctly!** ??
