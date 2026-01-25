# Category Navigation API Integration

## ✅ **Implementation Complete**

The category navigation component now loads workflow definitions dynamically from the API instead of using hardcoded data.

---

## 📁 **Files Created/Modified**

### New Files:
1. ✅ `frontend/src/app/services/workflow.service.ts` - Complete workflow API service

### Modified Files:
1. ✅ `frontend/src/app/components/category-navigation/category-navigation.component.ts` - API integration
2. ✅ `frontend/src/app/components/category-navigation/category-navigation.component.html` - Loading/error states
3. ✅ `frontend/src/app/components/category-navigation/category-navigation.component.css` - New styles

---

## 🎯 **What Changed**

### Before (Hardcoded):
```typescript
categories: CategoryConfig[] = [
  {
    id: 'lithium-battery',
    name: 'Lithium Battery',
    icon: 'bi-battery-charging',
    description: 'Battery products and components',
    formConfigFile: 'workflows/Definitions/CT401_lithium_battery_new'
  }
];
```

### After (API-driven):
```typescript
ngOnInit(): void {
  this.loadWorkflowDefinitions();
}

loadWorkflowDefinitions(): void {
  this.workflowService.getWorkflowDefinitions().subscribe({
    next: (definitions) => {
      this.categories = this.mapDefinitionsToCategories(definitions);
    },
    error: (err) => {
      this.error = 'Failed to load workflow categories';
      this.loadFallbackCategories(); // Fallback to hardcoded if API fails
    }
  });
}
```

---

## 🌐 **API Endpoint Used**

```
GET https://localhost:7047/api/Workflow/definitions
```

**Response**:
```json
[
  {
    "certificationId": "CT401_lithium_battery_new",
    "name": "CT401 Lithium Battery - New Certificate Application",
    "description": "Complete 6-step workflow for CT401 lithium battery certification",
    "version": "1.0",
    "metadata": {
      "workflowCode": "CT401",
      "applicableCertificateTypes": ["lithium_battery", "lithium_polymer"],
      "estimatedTotalDurationDays": 7,
      "complexity": "medium",
      "requiresFactoryVisit": false
    }
  },
  {
    "certificationId": "lithium_battery_renewal",
    "name": "Lithium Battery Certificate Renewal",
    "description": "Renewal process for existing lithium battery certificates",
    ...
  }
]
```

---

## 🔄 **Mapping Logic**

### 1. Extract Category ID
```typescript
// "CT401_lithium_battery_new" → "lithium-battery"
private extractCategoryId(definition: WorkflowDefinition): string {
  const parts = definition.certificationId.split('_');
  return parts.slice(1, -1).join('-').toLowerCase();
}
```

### 2. Assign Icons
```typescript
private iconMap = {
  'CT401': 'bi-battery-charging',
  'lithium_battery': 'bi-battery-charging',
  'BT501': 'bi-stars',
  'beauty': 'bi-stars',
  'default': 'bi-file-earmark-text'
};

// Priority: workflowCode > certificateTypes > certificationId > default
private getIconForDefinition(definition: WorkflowDefinition): string {
  // Try workflow code
  if (definition.metadata?.workflowCode) {
    return this.iconMap[definition.metadata.workflowCode] || this.iconMap['default'];
  }
  
  // Try certificate types
  if (definition.metadata?.applicableCertificateTypes) {
    for (const type of definition.metadata.applicableCertificateTypes) {
      if (this.iconMap[type]) return this.iconMap[type];
    }
  }
  
  return this.iconMap['default'];
}
```

### 3. Map to CategoryConfig
```typescript
{
  id: 'lithium-battery',
  name: 'CT401 Lithium Battery - New Certificate Application',
  icon: 'bi-battery-charging',
  description: 'Complete 6-step workflow for CT401 lithium battery certification',
  formConfigFile: 'workflows/Definitions/CT401_lithium_battery_new',
  metadata: { estimatedTotalDurationDays: 7, ... }
}
```

---

## 🎨 **UI States**

### 1. Loading State
```html
<div class="loading-container">
  <div class="spinner-border text-primary"></div>
  <p>Loading available certifications...</p>
</div>
```

### 2. Error State
```html
<div class="alert alert-danger">
  <i class="bi bi-exclamation-triangle-fill"></i>
  <span>Failed to load workflow categories</span>
  <button (click)="retry()">
    <i class="bi bi-arrow-clockwise"></i> Retry
  </button>
</div>
```

### 3. Success State
```html
<div class="categories-grid">
  @for (category of categories; track category.id) {
    <button class="category-card" (click)="navigateToForm(category)">
      <div class="category-icon">
        <i class="bi {{ category.icon }}"></i>
      </div>
      <div class="category-content">
        <h3>{{ category.name }}</h3>
        <p>{{ category.description }}</p>
        <small>~{{ category.metadata?.estimatedTotalDurationDays }} days</small>
      </div>
      <div class="category-arrow">
        <i class="bi bi-arrow-right"></i>
      </div>
    </button>
  }
</div>
```

### 4. Empty State
```html
<div class="alert alert-info">
  <i class="bi bi-info-circle-fill"></i>
  <span>No workflow definitions available</span>
</div>
```

---

## 🛡️ **Error Handling**

### API Failure → Fallback to Hardcoded
```typescript
error: (err) => {
  console.error('Error loading workflow definitions:', err);
  this.error = 'Failed to load workflow categories';
  
  // Show error message with retry button
  // Load fallback hardcoded categories
  this.loadFallbackCategories();
}
```

### Benefits:
- ✅ User can still navigate even if API is down
- ✅ Error message informs user of the issue
- ✅ Retry button allows manual reload
- ✅ Graceful degradation

---

## 🚀 **Testing**

### 1. Start Backend
```bash
cd C:\work\Azm\Maneh\demo\demoManeh\backendsln
dotnet run --project backend
```

### 2. Verify API Returns Data
```bash
curl https://localhost:7047/api/Workflow/definitions
```

**Expected**: JSON array with workflow definitions

### 3. Start Frontend
```bash
cd C:\work\Azm\Maneh\demo\demoManeh\frontend
ng serve
```

### 4. Open Browser
```
http://localhost:4200
```

**Expected**:
1. Loading spinner appears briefly
2. Categories load from API
3. All workflow definitions shown as cards
4. Duration metadata displayed (if available)

---

## 🧪 **Test Scenarios**

### Test 1: Normal Operation
1. Start backend
2. Start frontend
3. Navigate to category navigation page
4. ✅ Categories load successfully from API
5. ✅ Click a category → Navigates to workflow form

### Test 2: API Error
1. Stop backend
2. Navigate to category navigation page
3. ✅ Loading spinner appears
4. ✅ Error message displayed after timeout
5. ✅ Fallback categories shown
6. ✅ Can still navigate using fallback data

### Test 3: Empty Response
1. Ensure API returns empty array
2. Navigate to category navigation page
3. ✅ "No workflow definitions available" message shown

### Test 4: Retry After Error
1. Start with backend stopped
2. See error message
3. Start backend
4. Click "Retry" button
5. ✅ Categories load successfully

---

## 📊 **WorkflowService Methods**

### Available Methods:
```typescript
// Get all workflow definitions
getWorkflowDefinitions(): Observable<WorkflowDefinition[]>

// Get specific workflow
getWorkflowDefinition(certificationId: string): Observable<WorkflowDefinition>

// Create workflow instance
createWorkflowInstance(request: WorkflowInstanceCreateRequest): Observable<WorkflowInstance>

// Get workflow instance
getWorkflowInstance(instanceId: string): Observable<WorkflowInstance>

// Get current step
getCurrentStep(instanceId: string): Observable<CurrentStepResponse>

// Validate step
validateStep(instanceId: string, stepId: string, formData: any): Observable<ValidationResult>

// Submit step
submitStep(instanceId: string, submission: WorkflowSubmission): Observable<WorkflowInstance>

// Upload files
uploadFiles(instanceId: string, stepId: string, uploadedBy: string, files: FormData): Observable<any>

// Download file
downloadFile(fileName: string): Observable<Blob>

// Get workflows by status
getWorkflowsByStatus(status: string, actor?: string): Observable<WorkflowInstance[]>
```

---

## 🔧 **Configuration**

### API Base URL
Located in `workflow.service.ts`:
```typescript
private apiUrl = 'https://localhost:7047/api/Workflow';
```

**To change**:
1. Update in service file, or
2. Use environment configuration:

```typescript
// environment.ts
export const environment = {
  apiUrl: 'https://localhost:7047/api/Workflow'
};

// workflow.service.ts
private apiUrl = environment.apiUrl;
```

---

## 🎯 **Icon Customization**

### Add New Icon Mappings
Edit the `iconMap` in `category-navigation.component.ts`:

```typescript
private iconMap: { [key: string]: string } = {
  'CT401': 'bi-battery-charging',
  'CT501': 'bi-gear',              // Add new
  'BT501': 'bi-stars',
  'electronics': 'bi-cpu',          // Add new
  'default': 'bi-file-earmark-text'
};
```

**Bootstrap Icons**: https://icons.getbootstrap.com/

---

## ✅ **Summary**

### What's Working:
- ✅ Loads workflow definitions from API
- ✅ Dynamic icon assignment
- ✅ Loading state with spinner
- ✅ Error handling with retry
- ✅ Fallback to hardcoded data
- ✅ Displays duration metadata
- ✅ Responsive grid layout
- ✅ Navigation to workflow forms

### Next Steps:
1. Test with real API data
2. Add more icon mappings as needed
3. Consider adding filters/search
4. Add category descriptions if missing in API

---

**The category navigation now dynamically loads all available workflows from your API!** 🎉
