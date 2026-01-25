# Debugging: Wrong Step Loading Issue

## 🐛 **Problem**

User has instance ID `2e1de5c2-9726-4173-9ce9-61c5cb3f428a` in database with:
- DefinitionId: `CT401_lithium_battery_new`
- CurrentStep: `CT401_step2_initial_review` (Step 2)

But the UI is showing `CT401_step1_data_entry` (Step 1)

---

## 🔍 **Diagnostic Steps**

### Step 1: Check Browser Console

Open browser console (F12) and look for these logs:

```
=== NAVIGATION DEBUG ===
Category clicked: CT401 Lithium Battery - New Certificate Application
Certification ID: CT401_lithium_battery_new

=== CHECKING FOR EXISTING INSTANCES ===
Looking for certification ID: CT401_lithium_battery_new
All in-progress instances: Array(1)
Number of in-progress instances: 1
Comparing: "CT401_lithium_battery_new" === "CT401_lithium_battery_new"

=== MATCH FOUND ===
Matching instance: {id: "2e1de5c2-9726-4173-9ce9-61c5cb3f428a", currentStep: "CT401_step2_initial_review", ...}

=== FOUND EXISTING INSTANCE ===
Instance ID: 2e1de5c2-9726-4173-9ce9-61c5cb3f428a
Definition ID: CT401_lithium_battery_new
Current Step: CT401_step2_initial_review    ← Should be step 2!
Status: in_progress

Navigating to instance 2e1de5c2-9726-4173-9ce9-61c5cb3f428a, step CT401_step2_initial_review
```

**What to check**:
- Does "Current Step" show `CT401_step2_initial_review`?
- Does navigation URL show the correct step ID?

---

### Step 2: Check URL

After clicking the category, check the browser URL bar:

**Expected**:
```
http://localhost:4200/workflow/2e1de5c2-9726-4173-9ce9-61c5cb3f428a/step/CT401_step2_initial_review
```

**If you see**:
```
http://localhost:4200/workflow/2e1de5c2-9726-4173-9ce9-61c5cb3f428a/step/CT401_step1_data_entry
```

**Then**: The API is returning wrong step

---

### Step 3: Check API Response

In browser console, look for:

```
=== WORKFLOW STEP COMPONENT INIT ===
Instance ID from route: 2e1de5c2-9726-4173-9ce9-61c5cb3f428a
Step ID from route: CT401_step2_initial_review    ← Should be step 2

=== LOADING CURRENT STEP ===
API call: getCurrentStep(2e1de5c2-9726-4173-9ce9-61c5cb3f428a)

=== API RESPONSE ===
Full response: {instance: {...}, stepDefinition: {...}, currentData: {...}}

=== PARSED DATA ===
Instance: {id: "...", currentStep: "CT401_step2_initial_review", ...}
Instance Current Step: CT401_step2_initial_review    ← Should be step 2
Step Definition: {stepId: "CT401_step2_initial_review", name: "Initial Review - Step 2", ...}
Step Definition ID: CT401_step2_initial_review       ← Should be step 2
```

**What to check**:
- Does "Step ID from route" match database?
- Does API response have correct step?
- Does step definition match?

---

### Step 4: Check Database

Query the database directly:

```sql
SELECT 
    Id,
    DefinitionId,
    CurrentStep,
    Status,
    AssignedActor,
    CurrentData
FROM WorkflowInstances
WHERE Id = '2e1de5c2-9726-4173-9ce9-61c5cb3f428a'
```

**Expected Result**:
```
Id: 2e1de5c2-9726-4173-9ce9-61c5cb3f428a
DefinitionId: CT401_lithium_battery_new
CurrentStep: CT401_step2_initial_review    ← Should match what you see
Status: in_progress
```

---

### Step 5: Test API Directly

Use Swagger or Postman to test the API:

#### Test 1: Get Workflow Instances
```
GET https://localhost:7047/api/Workflow/instances?status=in_progress
```

**Check Response**:
```json
[
  {
    "id": "2e1de5c2-9726-4173-9ce9-61c5cb3f428a",
    "definitionId": "CT401_lithium_battery_new",
    "currentStep": "CT401_step2_initial_review",  ← Should be step 2
    "status": "in_progress"
  }
]
```

#### Test 2: Get Specific Instance
```
GET https://localhost:7047/api/Workflow/instances/2e1de5c2-9726-4173-9ce9-61c5cb3f428a
```

**Check**: Does `currentStep` field have correct value?

#### Test 3: Get Current Step
```
GET https://localhost:7047/api/Workflow/instances/2e1de5c2-9726-4173-9ce9-61c5cb3f428a/current-step
```

**Check**:
```json
{
  "instance": {
    "currentStep": "CT401_step2_initial_review"  ← Should be step 2
  },
  "stepDefinition": {
    "stepId": "CT401_step2_initial_review",      ← Should be step 2
    "name": "Initial Review - Step 2"
  }
}
```

---

## 🔧 **Possible Causes**

### Cause 1: Database Has Wrong Value
**Symptom**: Database shows `CT401_step1_data_entry` instead of `CT401_step2_initial_review`

**Solution**: Update database:
```sql
UPDATE WorkflowInstances
SET CurrentStep = 'CT401_step2_initial_review'
WHERE Id = '2e1de5c2-9726-4173-9ce9-61c5cb3f428a'
```

---

### Cause 2: API Returns Wrong Step
**Symptom**: Database is correct, but API returns wrong step

**Check Backend Logs**:
```
Error getting current step for instance 2e1de5c2-9726-4173-9ce9-61c5cb3f428a
```

**Solution**: Check `GetCurrentStep` endpoint logic

---

### Cause 3: Angular Route Caching
**Symptom**: URL is correct but old component data is shown

**Solution**: Force reload in `navigateToCurrentStep`:
```typescript
private navigateToCurrentStep(instance: any): void {
  const instanceId = instance.id;
  const currentStep = instance.currentStep;
  
  console.log(`Navigating to instance ${instanceId}, step ${currentStep}`);
  
  // Navigate and force reload
  this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
    this.router.navigate(['/workflow', instanceId, 'step', currentStep]);
  });
}
```

---

### Cause 4: Multiple Instances
**Symptom**: Finding wrong instance

**Check Console**:
```
All in-progress instances: Array(2)
Comparing: "CT401_lithium_battery_new" === "CT401_lithium_battery_new"
Comparing: "CT401_lithium_battery_new" === "CT401_lithium_battery_new"
```

**Solution**: Filter by user:
```typescript
const matchingInstance = instances
  ?.filter(i => i.createdBy === this.getCurrentUserEmail())
  ?.find(i => i.definitionId === certificationId);
```

---

## ✅ **Quick Fix**

### Option 1: Force Navigation Refresh

Update `category-navigation.component.ts`:

```typescript
private navigateToCurrentStep(instance: any): void {
  const instanceId = instance.id;
  const currentStep = instance.currentStep;
  
  console.log(`Navigating to instance ${instanceId}, step ${currentStep}`);
  
  // First navigate away to force component reload
  this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
    // Then navigate to the correct step
    this.router.navigate(['/workflow', instanceId, 'step', currentStep]);
  });
}
```

### Option 2: Remove Cached Instance

Clear browser cache:
1. Open DevTools (F12)
2. Go to Application tab
3. Clear Storage → Clear site data
4. Refresh page

### Option 3: Check Database Value

Verify database has correct step:
```sql
SELECT CurrentStep FROM WorkflowInstances 
WHERE Id = '2e1de5c2-9726-4173-9ce9-61c5cb3f428a'
```

If wrong, update it:
```sql
UPDATE WorkflowInstances
SET CurrentStep = 'CT401_step2_initial_review'
WHERE Id = '2e1de5c2-9726-4173-9ce9-61c5cb3f428a'
```

---

## 📊 **Debug Checklist**

- [ ] Browser console shows "Current Step: CT401_step2_initial_review"
- [ ] URL shows `/workflow/{id}/step/CT401_step2_initial_review`
- [ ] API response has `currentStep: "CT401_step2_initial_review"`
- [ ] Database has `CurrentStep = 'CT401_step2_initial_review'`
- [ ] Step definition loads for step 2
- [ ] Form shows step 2 fields

---

## 🎯 **Expected Flow**

```
1. User clicks "Lithium Battery" category
   ↓
2. Check API: GET /instances?status=in_progress
   Response: Found instance 2e1de5c2...
   currentStep: "CT401_step2_initial_review"
   ↓
3. Navigate to URL:
   /workflow/2e1de5c2.../step/CT401_step2_initial_review
   ↓
4. WorkflowStepComponent loads
   Route params: instanceId=2e1de5c2..., stepId=CT401_step2_initial_review
   ↓
5. Call API: GET /instances/2e1de5c2.../current-step
   Response: stepDefinition for step 2
   ↓
6. Display step 2 form
```

---

**Check each step above and report which one fails!** 🔍
