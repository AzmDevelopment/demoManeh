# Step API - Correct Usage Guide

## ? **What You Tried (Doesn't Work)**

You tried:
```
https://localhost:7047/api/Workflow/steps/CT401_step1_data_entry
```

**Result**: 404 Not Found

**Why it failed**: This endpoint expects the full path, not just the step name.

---

## ? **Correct Way 1: Use step-by-name (EASIEST)**

### URL:
```
https://localhost:7047/api/Workflow/step-by-name/CT401_step1_data_entry
```

### Swagger UI:
1. Expand: `GET /api/workflow/step-by-name/{stepName}`
2. Click: "Try it out"
3. Enter in stepName field: `CT401_step1_data_entry`
4. Click: "Execute"

### cURL:
```bash
curl -X GET "https://localhost:7047/api/Workflow/step-by-name/CT401_step1_data_entry" ^
  -H "accept: application/json"
```

### Response:
```json
{
  "stepId": "CT401_step1_data_entry",
  "name": "Basic Information - Step 1",
  "actor": "customer",
  "type": "data_entry",
  "fields": [...]
}
```

? **This is the recommended approach!**

---

## ? **Correct Way 2: Use Full Path**

### URL (URL-encoded):
```
https://localhost:7047/api/Workflow/steps/workflows%2FSteps%2Fcertificate_specific%2FCT401_new%2FCT401_step1_data_entry
```

**Note**: The `/` characters are encoded as `%2F`

### Swagger UI:
1. Expand: `GET /api/workflow/steps/{*stepRef}`
2. Click: "Try it out"
3. Enter in stepRef field: `workflows/Steps/certificate_specific/CT401_new/CT401_step1_data_entry`
   (Swagger will encode it automatically)
4. Click: "Execute"

### cURL:
```bash
curl -X GET "https://localhost:7047/api/Workflow/steps/workflows%2FSteps%2Fcertificate_specific%2FCT401_new%2FCT401_step1_data_entry" ^
  -H "accept: application/json"
```

### Response:
```json
{
  "stepId": "CT401_step1_data_entry",
  "name": "Basic Information - Step 1",
  "actor": "customer",
  "type": "data_entry",
  "fields": [...]
}
```

---

## ?? **Testing Steps**

### 1. Start the Application
```bash
cd C:\work\Azm\Maneh\demo\demoManeh\backendsln
dotnet run --project backend
```

### 2. Open Swagger UI
```
https://localhost:7047/
```

### 3. Test with step-by-name (Easiest)

**Endpoint**: `GET /api/workflow/step-by-name/{stepName}`

**Test with these step names**:
- `CT401_step1_data_entry` ?
- `CT401_step2_document_upload` ?
- `CT401_step3_initial_review` ?
- `CT401_step4_factory_inspection` ?
- `CT401_step5_technical_evaluation` ?
- `CT401_step6_final_approval` ?

### 4. Verify Response

You should see JSON with:
- `stepId` - The step identifier
- `name` - Human-readable name
- `actor` - Who performs this step
- `fields` - Array of form fields with validation rules

---

## ?? **Frontend Integration**

### Angular/TypeScript

```typescript
// Service
export class WorkflowService {
  private apiUrl = 'https://localhost:7047/api/Workflow';

  constructor(private http: HttpClient) {}

  // ? Recommended: Use step-by-name
  getStepByName(stepName: string): Observable<WorkflowStep> {
    return this.http.get<WorkflowStep>(
      `${this.apiUrl}/step-by-name/${stepName}`
    );
  }
}

// Component
ngOnInit() {
  this.workflowService
    .getStepByName('CT401_step1_data_entry')
    .subscribe(step => {
      console.log('Step loaded:', step);
      this.renderForm(step.fields);
    });
}
```

### JavaScript/Fetch

```javascript
// ? Recommended: Use step-by-name
async function loadStep(stepName) {
  const response = await fetch(
    `https://localhost:7047/api/Workflow/step-by-name/${stepName}`
  );
  
  if (!response.ok) {
    throw new Error(`Step not found: ${stepName}`);
  }
  
  const step = await response.json();
  console.log('Step loaded:', step);
  return step;
}

// Usage
loadStep('CT401_step1_data_entry')
  .then(step => {
    // Render form with step.fields
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

---

## ?? **All Available CT401 Steps**

| Step Name | Endpoint |
|-----------|----------|
| CT401_step1_data_entry | `/api/workflow/step-by-name/CT401_step1_data_entry` |
| CT401_step2_document_upload | `/api/workflow/step-by-name/CT401_step2_document_upload` |
| CT401_step3_initial_review | `/api/workflow/step-by-name/CT401_step3_initial_review` |
| CT401_step4_factory_inspection | `/api/workflow/step-by-name/CT401_step4_factory_inspection` |
| CT401_step5_technical_evaluation | `/api/workflow/step-by-name/CT401_step5_technical_evaluation` |
| CT401_step6_final_approval | `/api/workflow/step-by-name/CT401_step6_final_approval` |

---

## ?? **Understanding the Error**

Your error message:
```json
{
  "message": "Step definition not found: https:%2F%2Flocalhost:7047%2Fapi%2FWorkflow%2Fsteps%2Fworkflows%2FSteps%2Fcertificate_specific%2FCT401_new%2FCT401_step1_data_entry"
}
```

**What happened**:
- You passed the **entire URL** as the step name
- The API tried to find a file with that URL as the name
- Obviously, no such file exists

**The fix**:
- Use only the **step name**: `CT401_step1_data_entry`
- Or use the **step reference path**: `workflows/Steps/certificate_specific/CT401_new/CT401_step1_data_entry`
- **Never** include the full URL in the parameter

---

## ? **Quick Reference**

### ? WRONG
```
https://localhost:7047/api/Workflow/steps/CT401_step1_data_entry
```

### ? CORRECT (Simple)
```
https://localhost:7047/api/Workflow/step-by-name/CT401_step1_data_entry
```

### ? CORRECT (Full Path)
```
https://localhost:7047/api/Workflow/steps/workflows%2FSteps%2Fcertificate_specific%2FCT401_new%2FCT401_step1_data_entry
```

---

## ?? **Best Practice**

### For Frontend Development
? **Always use**: `/api/workflow/step-by-name/{stepName}`

**Reasons**:
1. Simple and clean
2. No URL encoding issues
3. No need to know directory structure
4. Less prone to errors

### Example
```typescript
// ? Good
this.http.get('/api/workflow/step-by-name/CT401_step1_data_entry')

// ? Avoid (complex)
this.http.get('/api/workflow/steps/workflows%2FSteps%2F...')
```

---

## ?? **Troubleshooting**

### Issue: 404 Not Found

**Check**:
1. Is the application running?
2. Are you using the correct endpoint?
3. Is the step name spelled correctly?

**Try**:
```bash
# Test if API is running
curl https://localhost:7047/api/Workflow/definitions

# Test step-by-name endpoint
curl https://localhost:7047/api/Workflow/step-by-name/CT401_step1_data_entry
```

### Issue: SSL Certificate Error

**Solution**:
```bash
# Add -k flag to skip certificate validation in development
curl -k https://localhost:7047/api/Workflow/step-by-name/CT401_step1_data_entry
```

---

## ?? **Summary**

| What You Want | Correct Endpoint | Example |
|---------------|------------------|---------|
| Get step by name | `/api/workflow/step-by-name/{stepName}` | `/api/workflow/step-by-name/CT401_step1_data_entry` |
| Get step by path | `/api/workflow/steps/{*stepRef}` | `/api/workflow/steps/workflows%2FSteps%2F...` |
| Get all definitions | `/api/workflow/definitions` | `/api/workflow/definitions` |
| Get specific workflow | `/api/workflow/definitions/{id}` | `/api/workflow/definitions/CT401_lithium_battery_new` |

---

**Use the step-by-name endpoint for simplicity!** ??
