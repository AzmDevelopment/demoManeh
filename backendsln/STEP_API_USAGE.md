# Step Definition API Usage Guide

## ?? Problem Solved

You were calling:
```
https://localhost:7047/api/Workflow/steps/CT401_step1_data_entry
```

But the API expected the **full step reference path**.

---

## ? Solution: Two Ways to Get Step Definitions

### Option 1: Use Step Name Only (NEW - Recommended)

**Endpoint**: `GET /api/workflow/step-by-name/{stepName}`

**Example**:
```
GET https://localhost:7047/api/Workflow/step-by-name/CT401_step1_data_entry
```

**Response**:
```json
{
  "stepId": "CT401_step1_data_entry",
  "name": "Basic Information - Step 1",
  "actor": "customer",
  "type": "data_entry",
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
}
```

? **Benefits**:
- Simple to use
- Just pass the step name
- Automatically searches common directories

---

### Option 2: Use Full Step Reference Path (Original)

**Endpoint**: `GET /api/workflow/steps/{*stepRef}`

**Example**:
```
GET https://localhost:7047/api/Workflow/steps/workflows/Steps/certificate_specific/CT401_new/CT401_step1_data_entry
```

**Response**: Same as Option 1

? **Benefits**:
- Exact path lookup (faster)
- Works for custom directory structures
- No ambiguity

---

## ?? Testing in Swagger UI

### Test Option 1: By Step Name

1. Open Swagger UI: `https://localhost:7047/`
2. Find endpoint: `GET /api/workflow/step-by-name/{stepName}`
3. Click "Try it out"
4. Enter: `CT401_step1_data_entry`
5. Click "Execute"

**Expected**: Returns step definition ?

---

### Test Option 2: By Full Path

1. Open Swagger UI: `https://localhost:7047/`
2. Find endpoint: `GET /api/workflow/steps/{*stepRef}`
3. Click "Try it out"
4. Enter: `workflows/Steps/certificate_specific/CT401_new/CT401_step1_data_entry`
5. Click "Execute"

**Expected**: Returns step definition ?

---

## ?? All Available Step Names

For CT401 workflow, you can use these step names:

| Step Name | Endpoint |
|-----------|----------|
| `CT401_step1_data_entry` | `/api/workflow/step-by-name/CT401_step1_data_entry` |
| `CT401_step2_document_upload` | `/api/workflow/step-by-name/CT401_step2_document_upload` |
| `CT401_step3_initial_review` | `/api/workflow/step-by-name/CT401_step3_initial_review` |
| `CT401_step4_factory_inspection` | `/api/workflow/step-by-name/CT401_step4_factory_inspection` |
| `CT401_step5_technical_evaluation` | `/api/workflow/step-by-name/CT401_step5_technical_evaluation` |
| `CT401_step6_final_approval` | `/api/workflow/step-by-name/CT401_step6_final_approval` |

---

## ?? How the Search Works

The new endpoint searches these directories in order:

1. `workflows/Steps/certificate_specific/CT401_new/{stepName}`
2. `workflows/Steps/certificate_specific/CT401/{stepName}`
3. `workflows/Steps/common/{stepName}`
4. `workflows/Steps/shared/{stepName}`

It returns the **first match** found.

**Example Search Flow**:
```
Looking for: CT401_step1_data_entry

1. Try: workflows/Steps/certificate_specific/CT401_new/CT401_step1_data_entry
   ? FOUND! Return this.

2. If not found, try: workflows/Steps/certificate_specific/CT401/CT401_step1_data_entry
   
3. If not found, try: workflows/Steps/common/CT401_step1_data_entry

4. If not found, try: workflows/Steps/shared/CT401_step1_data_entry

5. If still not found: Return 404
```

---

## ?? Complete API Examples

### Example 1: Get Step by Name (Simple)

**cURL**:
```bash
curl -X GET "https://localhost:7047/api/Workflow/step-by-name/CT401_step1_data_entry" -H "accept: application/json"
```

**JavaScript (Fetch)**:
```javascript
fetch('https://localhost:7047/api/Workflow/step-by-name/CT401_step1_data_entry')
  .then(response => response.json())
  .then(data => console.log(data));
```

**C# (HttpClient)**:
```csharp
var client = new HttpClient();
var response = await client.GetAsync("https://localhost:7047/api/Workflow/step-by-name/CT401_step1_data_entry");
var stepDefinition = await response.Content.ReadFromJsonAsync<WorkflowStep>();
```

---

### Example 2: Get Step by Full Path (Exact)

**cURL**:
```bash
curl -X GET "https://localhost:7047/api/Workflow/steps/workflows/Steps/certificate_specific/CT401_new/CT401_step1_data_entry" -H "accept: application/json"
```

**JavaScript (Fetch)**:
```javascript
const stepRef = 'workflows/Steps/certificate_specific/CT401_new/CT401_step1_data_entry';
fetch(`https://localhost:7047/api/Workflow/steps/${stepRef}`)
  .then(response => response.json())
  .then(data => console.log(data));
```

---

## ?? Frontend Integration

### Angular/TypeScript Example

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WorkflowService {
  private apiUrl = 'https://localhost:7047/api/Workflow';

  constructor(private http: HttpClient) {}

  // Option 1: By step name (simple)
  getStepByName(stepName: string): Observable<WorkflowStep> {
    return this.http.get<WorkflowStep>(`${this.apiUrl}/step-by-name/${stepName}`);
  }

  // Option 2: By full path (exact)
  getStepByPath(stepRef: string): Observable<WorkflowStep> {
    return this.http.get<WorkflowStep>(`${this.apiUrl}/steps/${stepRef}`);
  }
}

// Usage
this.workflowService.getStepByName('CT401_step1_data_entry').subscribe(step => {
  console.log('Step loaded:', step);
  // Render form fields from step.fields
});
```

---

## ?? Error Handling

### 404 Not Found Response

If step is not found, you'll get:

**For step-by-name endpoint**:
```json
{
  "message": "Step definition not found: CT401_step1_data_entry",
  "hint": "Try using the full path: /api/workflow/steps/workflows/Steps/certificate_specific/CT401_new/CT401_step1_data_entry"
}
```

**For full path endpoint**:
```json
{
  "message": "Step definition not found: workflows/Steps/certificate_specific/CT401_new/CT401_step1_data_entry"
}
```

---

## ?? Comparison

| Feature | By Name | By Full Path |
|---------|---------|--------------|
| **Simplicity** | ? Simple | ?? Complex |
| **Speed** | ?? Searches multiple paths | ? Direct lookup |
| **Flexibility** | ? Finds steps anywhere | ? Must know exact path |
| **Use Case** | Frontend/API consumers | Internal/Backend |
| **Example** | `CT401_step1_data_entry` | `workflows/Steps/certificate_specific/CT401_new/CT401_step1_data_entry` |

---

## ?? Recommended Approach

### For Frontend Applications
? **Use**: `GET /api/workflow/step-by-name/{stepName}`
- Simpler
- Easier to maintain
- Less coupling to directory structure

### For Backend Services
? **Use**: `GET /api/workflow/steps/{*stepRef}`
- Faster (no search)
- Exact control
- No ambiguity

---

## ?? Complete Testing Workflow

### Step 1: Get All Workflows
```
GET /api/workflow/definitions
```

### Step 2: Get Specific Workflow
```
GET /api/workflow/definitions/CT401_lithium_battery_new
```

### Step 3: Get Step Definition (NEW WAY)
```
GET /api/workflow/step-by-name/CT401_step1_data_entry
```

### Step 4: Create Workflow Instance
```
POST /api/workflow/instances
{
  "certificationId": "CT401_lithium_battery_new",
  "createdBy": "test@example.com"
}
```

### Step 5: Get Current Step
```
GET /api/workflow/instances/{instanceId}/current-step
```

### Step 6: Submit Step Data
```
POST /api/workflow/instances/{instanceId}/submit
{
  "stepId": "CT401_step1_data_entry",
  "formData": { ... },
  "submittedBy": "test@example.com"
}
```

---

## ? Summary

### Problem
```
? https://localhost:7047/api/Workflow/steps/CT401_step1_data_entry
   (Returns 404 - Not Found)
```

### Solution 1: Use New Endpoint
```
? https://localhost:7047/api/Workflow/step-by-name/CT401_step1_data_entry
   (Works! Returns step definition)
```

### Solution 2: Use Full Path
```
? https://localhost:7047/api/Workflow/steps/workflows/Steps/certificate_specific/CT401_new/CT401_step1_data_entry
   (Works! Returns step definition)
```

---

## ?? Quick Test

Run this in PowerShell or browser:

```powershell
# Test new endpoint
Invoke-RestMethod -Uri "https://localhost:7047/api/Workflow/step-by-name/CT401_step1_data_entry" -Method Get
```

Or in browser:
```
https://localhost:7047/api/Workflow/step-by-name/CT401_step1_data_entry
```

**Expected**: JSON response with step definition ?

---

**The new endpoint makes it easy to get step definitions by name!** ??
