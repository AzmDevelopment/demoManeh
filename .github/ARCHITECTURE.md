# Workflow System Architecture Guide

> **For AI Agents**: Follow these patterns strictly when modifying this codebase. This document MUST be referenced for all code changes.

---

## Core Principle: 100% JSON-Driven with JSON Forms

**CRITICAL**: All workflow components are **completely generic**. They render forms using **@jsonforms/angular** with Angular Material renderers based on JSON step configurations using **JSON Schema** and **UI Schema**. **DO NOT** add field-type-specific code to workflow components.

---

## Project Structure

```
demoManeh/
├── frontend/                           # Angular 17+ Frontend
│   └── src/
│       ├── app/
│       │   ├── components/
│       │   │   ├── workflow-step/              # GENERIC - renders JSON Forms
│       │   │   ├── workflow-selector/          # Workflow selection UI
│       │   │   ├── json-form/                  # JSON Forms wrapper component
│       │   │   ├── custom-renderers/           # Custom JSON Forms renderers
│       │   │   │   └── custom-button.renderer.ts
│       │   │   └── workflow-code/
│       │   │       └── definition/
│       │   │           └── {WorkflowId}/       # Step-specific TypeScript hooks
│       │   │               ├── index.ts        # Workflow registration
│       │   │               └── {step_id}.ts    # Step hooks
│       │   └── services/
│       │       ├── workflow.service.ts
│       │       ├── workflow-hooks.service.ts
│       │       └── state-machine.service.ts
│       └── assets/forms/workflows/
│           ├── Definitions/                    # Workflow definition JSON files
│           │   └── {WorkflowId}.json
│           └── Steps/certificate_specific/
│               └── {WorkflowId}/               # Step JSON configurations
│                   └── {step_id}.json
│
├── backendsln/backend/                 # .NET 8 Backend
│   ├── Controllers/
│   │   ├── WorkflowController.cs
│   │   ├── BrandsController.cs
│   │   ├── ProductsController.cs
│   │   └── StateMachineController.cs
│   ├── Models/
│   │   ├── WorkflowStep.cs
│   │   ├── WorkflowInstance.cs
│   │   └── WorkflowStateModels.cs
│   ├── Services/
│   │   ├── IWorkflowEngine.cs
│   │   ├── WorkflowEngine.cs
│   │   ├── FileSystemWorkflowDefinitionProvider.cs
│   │   ├── IWorkflowStateMachine.cs
│   │   ├── WorkflowStateMachine.cs
│   │   └── LocalFileStorageService.cs
│   ├── Data/
│   │   ├── WorkflowDbContext.cs
│   │   └── TransitionAuditEntity.cs
│   └── Validation/
│       ├── ValidationRuleFactory.cs
│       └── Rules/
│           └── MinTableEntriesRule.cs
│
└── uploads/                            # File uploads directory (created automatically)
```

---

## Rendering Architecture

### How It Works

```
Step JSON Configuration
├── schema: JSON Schema (data structure)
└── uischema: UI Schema (layout & controls)
        ↓
workflow-step.component.ts (GENERIC)
        ↓
json-form.component.ts (wrapper)
        ↓
<jsonforms [schema]="schema" [uischema]="uischema" [data]="data">
        ↓
@jsonforms/angular-material renders using:
  - Built-in renderers (text, number, select, array, etc.)
  - Custom renderers (CustomButton)
```

### Registered Custom Renderers

```typescript
// json-form.component.ts
import { angularMaterialRenderers } from '@jsonforms/angular-material';
import { CustomButtonRenderer, customButtonTester } from '../custom-renderers/custom-button.renderer';

renderers: JsonFormsRendererRegistryEntry[] = [
  ...angularMaterialRenderers,
  { tester: customButtonTester, renderer: CustomButtonRenderer }
];
```

---

## Step JSON Structure (Current Pattern)

Each step uses **JSON Schema** for data structure and **UI Schema** for layout:

```json
{
  "stepId": "saso_test_step1_types",
  "name": "Type Selection",
  "actor": "customer",
  "description": "Select the certification type for your product",

  "schema": {
    "type": "object",
    "properties": {
      "applicantName": {
        "type": "string",
        "title": "Applicant Name"
      },
      "companyName": {
        "type": "string",
        "title": "Company Name"
      },
      "selectedType": {
        "type": "string",
        "title": "Certification Type"
      }
    },
    "required": ["applicantName", "companyName", "selectedType"]
  },

  "uischema": {
    "type": "VerticalLayout",
    "elements": [
      {
        "type": "Control",
        "scope": "#/properties/applicantName",
        "label": "Applicant Name",
        "options": {
          "placeholder": "Enter applicant name..."
        }
      },
      {
        "type": "Control",
        "scope": "#/properties/companyName",
        "label": "Company Name",
        "options": {
          "placeholder": "Enter company name..."
        }
      },
      {
        "type": "Control",
        "scope": "#/properties/selectedType",
        "label": "Certification Type",
        "options": {
          "placeholder": "Choose a certification type..."
        }
      }
    ]
  },

  "hooks": {
    "onInit": ["loadTypes"],
    "onChange": {
      "selectedType": "onTypeSelected"
    }
  },

  "stateMachine": {
    "initialStatus": "not_started",
    "allowedEvents": ["Enter", "Save", "Submit", "GoBack"],
    "transitions": {
      "onEnter": { "from": "not_started", "to": "active" },
      "onSave": { "from": ["active", "in_progress"], "to": "in_progress" },
      "onSubmit": { "from": ["active", "in_progress"], "to": "completed" }
    },
    "requiredForSubmit": ["applicantName", "companyName", "selectedType"],
    "canGoBack": false
  },

  "context": {
    "provides": ["applicantName", "companyName", "selectedType"],
    "requires": []
  },

  "stepConfig": {
    "canSendBack": false,
    "nextStep": "saso_test_step2_brands",
    "previousStep": null,
    "estimatedDurationHours": 24,
    "isFirstStep": true,
    "validation": {
      "type": "fieldName",
      "minRequired": 1,
      "message": "Validation message to display"
    }
  }
}
```

---

## JSON Schema Patterns

### Basic Field Types

```json
{
  "schema": {
    "type": "object",
    "properties": {
      "textField": {
        "type": "string",
        "title": "Text Input",
        "maxLength": 100
      },
      "numberField": {
        "type": "number",
        "title": "Number Input",
        "minimum": 0,
        "maximum": 100
      },
      "selectField": {
        "type": "string",
        "title": "Select Dropdown",
        "enum": ["option1", "option2", "option3"]
      },
      "booleanField": {
        "type": "boolean",
        "title": "Checkbox"
      },
      "dateField": {
        "type": "string",
        "format": "date",
        "title": "Date Picker"
      }
    },
    "required": ["textField", "selectField"]
  }
}
```

### Array/Table Field

```json
{
  "schema": {
    "type": "object",
    "properties": {
      "brandTable": {
        "type": "array",
        "title": "Selected Brands",
        "items": {
          "type": "object",
          "properties": {
            "nameEn": {
              "type": "string",
              "title": "Brand Name (English)"
            },
            "nameAr": {
              "type": "string",
              "title": "Brand Name (Arabic)"
            },
            "source": {
              "type": "string",
              "title": "Source"
            }
          },
          "required": ["nameEn", "nameAr"]
        }
      }
    }
  }
}
```

---

## UI Schema Patterns

### Layout Types

```json
{
  "uischema": {
    "type": "VerticalLayout",
    "elements": [
      {
        "type": "Control",
        "scope": "#/properties/fieldName"
      }
    ]
  }
}
```

```json
{
  "uischema": {
    "type": "HorizontalLayout",
    "elements": [
      { "type": "Control", "scope": "#/properties/field1" },
      { "type": "Control", "scope": "#/properties/field2" }
    ]
  }
}
```

### Group Layout

```json
{
  "type": "Group",
  "label": "Section Title",
  "elements": [
    { "type": "Control", "scope": "#/properties/field1" },
    { "type": "Control", "scope": "#/properties/field2" }
  ]
}
```

### Control Options

```json
{
  "type": "Control",
  "scope": "#/properties/fieldName",
  "label": "Custom Label",
  "options": {
    "placeholder": "Enter value...",
    "showSortButtons": false,
    "detail": "DEFAULT"
  }
}
```

### Custom Button

```json
{
  "type": "CustomButton",
  "label": "💾 Save Brand",
  "hookName": "saveNewBrand",
  "buttonClass": "btn-primary",
  "validateHook": "canSaveNewBrand"
}
```

---

## Step TypeScript Hooks

Hooks are **step-specific logic** stored in separate files:

```
frontend/src/app/components/workflow-code/definition/{WorkflowId}/{step_id}.ts
```

### Hook File Structure

```typescript
import { HttpClient } from '@angular/common/http';

/**
 * Step code for: {step_id}
 */

// Export step ID constant
export const STEP_ID = 'step_id_name';

/**
 * Load data hook - called on step initialization
 */
export async function loadData(
  field: any,
  model: any,
  formState: any,
  http: HttpClient
): Promise<void> {
  const data = await http.get<any[]>('/api/endpoint').toPromise();
  
  // For dropdowns, update the schema enum
  if (field.schema?.properties?.fieldName) {
    field.schema.properties.fieldName.enum = data.map(item => item.label);
  }
  
  // Store data for later use
  model._loadedData = data;
}

/**
 * OnChange hook - called when field value changes
 */
export function onFieldChange(
  field: any,
  model: any,
  formState: any,
  http: HttpClient
): void {
  // React to field changes
  const selectedValue = model.fieldName;
  // ... handle change
}

/**
 * Custom action hook - called by CustomButton
 */
export function customAction(
  field: any,
  model: any,
  formState: any,
  http: HttpClient
): boolean {
  // Perform action
  // Return false to indicate failure
  return true;
}

/**
 * Validation hook - used by CustomButton validateHook
 */
export function canPerformAction(
  field: any,
  model: any,
  formState: any,
  http: HttpClient
): boolean {
  return !!(model.requiredField && model.requiredField.trim());
}

// Export all hooks
export const hooks = {
  loadData,
  onFieldChange,
  customAction,
  canPerformAction
};

export default {
  stepId: STEP_ID,
  hooks
};
```

### Workflow Index File

Each workflow needs an `index.ts` to register all steps:

```typescript
// frontend/src/app/components/workflow-code/definition/{WorkflowId}/index.ts

// Import step modules
import * as step1 from './step1_name';
import * as step2 from './step2_name';
import * as step3 from './step3_name';

// Re-export for external access
export * as step1_name from './step1_name';
export * as step2_name from './step2_name';
export * as step3_name from './step3_name';

// Workflow metadata
export const WORKFLOW_ID = 'WorkflowId';
export const WORKFLOW_NAME = 'Human Readable Workflow Name';

// All steps registration
export const ALL_STEPS = [
  { stepId: step1.STEP_ID, hooks: step1.hooks },
  { stepId: step2.STEP_ID, hooks: step2.hooks },
  { stepId: step3.STEP_ID, hooks: step3.hooks },
];
```

### Registering New Workflows

Add workflow import to `workflow-hooks.service.ts`:

```typescript
// workflow-hooks.service.ts

// Add import
import * as NewWorkflow from '../components/workflow-code/definition/NewWorkflowId';

// Add to registrations array
const WORKFLOW_REGISTRATIONS = [
  SASO301_Cooker,
  NewWorkflow,  // Add here
];
```

---

## Workflow Definition JSON

```json
{
  "certificationId": "SASO301_Cooker",
  "name": "SASO Test - Brand & Product Registration",
  "description": "Test workflow description",
  "version": "1.0",

  "metadata": {
    "workflowCode": "SASO_TEST",
    "applicableCertificateTypes": ["test_type"],
    "estimatedTotalDurationDays": 3,
    "complexity": "medium",
    "requiresFactoryVisit": false
  },

  "steps": [
    {
      "stepRef": "workflows/Steps/certificate_specific/SASO_demo/saso_test_step1_types",
      "overrides": {
        "nextStep": "saso_test_step2_brands"
      }
    },
    {
      "stepRef": "workflows/Steps/certificate_specific/SASO_demo/saso_test_step2_brands",
      "overrides": {
        "nextStep": "saso_test_step3_products"
      }
    },
    {
      "stepRef": "workflows/Steps/certificate_specific/SASO_demo/saso_test_step3_products",
      "overrides": {
        "nextStep": "completed"
      }
    },
    {
      "stepId": "completed",
      "name": "Application Submitted",
      "actor": "system",
      "type": "system_action",
      "systemAction": "submitApplication",
      "status": "completed"
    }
  ],

  "workflowConfig": {
    "isLinear": true,
    "allowParallelExecution": false,
    "requiresApprovalAtEachStep": false,
    "autoEscalationEnabled": false
  },

  "slaConfig": {
    "totalSLADays": 3,
    "stepSLAs": {
      "step1_id": 24,
      "step2_id": 48
    }
  },

  "notifications": {
    "onStepComplete": true,
    "onWorkflowComplete": true,
    "onSendBack": false,
    "recipients": ["applicant"]
  },

  "permissions": {
    "customer": {
      "canStartWorkflow": true,
      "canEditSteps": ["step1_id", "step2_id"],
      "canSendBack": false,
      "canCancel": true
    }
  }
}
```

---

## Backend Configuration

### appsettings.json

```json
{
  "WorkflowEngine": {
    "BasePath": "../frontend/src/assets/forms/workflows"
  },
  "FileStorage": {
    "LocalPath": "../uploads"
  }
}
```

**IMPORTANT**:
- Paths are **relative to the backend project directory** (`backendsln/backend/`)
- **DO NOT** use absolute paths - they break portability

---

## Anti-Patterns (NEVER DO)

### ❌ Adding field-type-specific HTML to workflow component

```html
<!-- WRONG - in workflow-step.component.html -->
@if (field.type === 'table') {
  <table>...</table>
}
@if (field.type === 'custom') {
  <div>...</div>
}
```

### ❌ Adding field-type-specific logic to workflow component

```typescript
// WRONG - in workflow-step.component.ts
removeTableRow(key: string, index: number) { ... }
toggleAddForm(key: string) { ... }
handleCustomField(field: any) { ... }
```

### ❌ Using deprecated patterns

```json
// WRONG - old formly-style fields array
{
  "fields": [
    {
      "key": "fieldName",
      "type": "input",
      "templateOptions": { ... }
    }
  ]
}
```

### ✅ CORRECT: Use JSON Schema + UI Schema

All form configuration uses JSON Schema for data structure and UI Schema for layout:

```json
{
  "schema": { ... },
  "uischema": { ... }
}
```

### ✅ CORRECT: Use custom renderers for special UI

Create custom JSON Forms renderers for specialized controls:

```typescript
// custom-renderers/my-renderer.ts
@Component({...})
export class MyRenderer extends JsonFormsControl { ... }

export const myRendererTester = rankWith(10, uiTypeIs('MyType'));
```

---

## Adding New Features

### Adding a New Field to a Step

1. **Update schema** - Add property to `schema.properties`:
   ```json
   "newField": {
     "type": "string",
     "title": "New Field"
   }
   ```

2. **Update required** (if needed) - Add to `schema.required` array

3. **Update uischema** - Add control to `uischema.elements`:
   ```json
   {
     "type": "Control",
     "scope": "#/properties/newField",
     "label": "New Field",
     "options": { "placeholder": "Enter value..." }
   }
   ```

4. **Update context.provides** (if data should be passed to next steps)

5. **Update stateMachine.requiredForSubmit** (if required for submission)

### Adding a New Step to Workflow

1. **Create step JSON** in `frontend/src/assets/forms/workflows/Steps/certificate_specific/{WorkflowId}/`

2. **Create step hooks file** in `frontend/src/app/components/workflow-code/definition/{WorkflowId}/`

3. **Update workflow index.ts** - Import and register the new step

4. **Update workflow definition JSON** - Add stepRef to steps array

### Adding a New Workflow

1. **Create workflow folder** in `frontend/src/assets/forms/workflows/Steps/certificate_specific/{NewWorkflowId}/`

2. **Create step JSON files** for each step

3. **Create workflow definition** in `frontend/src/assets/forms/workflows/Definitions/{NewWorkflowId}.json`

4. **Create hooks folder** in `frontend/src/app/components/workflow-code/definition/{NewWorkflowId}/`

5. **Create step hook files** and `index.ts`

6. **Register workflow** in `workflow-hooks.service.ts`

### Adding a New Custom Renderer

1. **Create renderer component** in `frontend/src/app/components/custom-renderers/`:
   ```typescript
   @Component({...})
   export class MyRenderer extends JsonFormsControl { ... }
   
   export const myRendererTester = rankWith(10, uiTypeIs('MyType'));
   ```

2. **Register in json-form.component.ts**:
   ```typescript
   renderers: JsonFormsRendererRegistryEntry[] = [
     ...angularMaterialRenderers,
     { tester: myRendererTester, renderer: MyRenderer }
   ];
   ```

---

## File Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Workflow Definition | `{WorkflowId}.json` | `SASO301_Cooker.json` |
| Step JSON | `{step_id}.json` | `saso_test_step1_types.json` |
| Step Hooks | `{step_id}.ts` | `saso_test_step1_types.ts` |
| Workflow Index | `index.ts` | `index.ts` |
| Custom Renderer | `{name}.renderer.ts` | `custom-button.renderer.ts` |

---

## Checklist for AI Agents

When modifying workflow code:

- [ ] Workflow components use `<jsonforms>` only (no field-specific HTML)
- [ ] Step configuration uses `schema` and `uischema` (not `fields` array)
- [ ] New fields added to both `schema.properties` and `uischema.elements`
- [ ] Required fields added to `schema.required`
- [ ] Fields for submission added to `stateMachine.requiredForSubmit`
- [ ] Data passed to next steps added to `context.provides`
- [ ] Step hooks export `STEP_ID` and `hooks` object
- [ ] Workflow index exports `WORKFLOW_ID` and `ALL_STEPS`
- [ ] New workflows registered in `workflow-hooks.service.ts`
- [ ] No absolute file paths in configuration
- [ ] Custom UI components use JSON Forms custom renderers

---

## API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/Workflow/definitions` | GET | List all workflow definitions |
| `/api/Workflow/definitions/{certificationId}` | GET | Get workflow definition |
| `/api/Workflow/instances` | GET | List workflow instances by status |
| `/api/Workflow/instances` | POST | Create new workflow instance |
| `/api/Workflow/instances/{id}` | GET | Get workflow instance |
| `/api/Workflow/instances/{id}/current-step` | GET | Get current step with definition |
| `/api/Workflow/instances/{id}/submit` | POST | Submit step data |
| `/api/Workflow/instances/{id}/validate` | POST | Validate step data |
| `/api/Workflow/instances/{id}/advance` | POST | Advance to next step |
| `/api/Workflow/instances/{id}/go-back` | POST | Go to previous step |
| `/api/Workflow/instances/{id}/data` | PATCH | Save draft data |
| `/api/Brands` | GET | List available brands |
| `/api/Products` | GET | List available products |

---

## Quick Reference

### Add a simple text field to existing step:

**In step JSON:**
```json
{
  "schema": {
    "properties": {
      "newTextField": {
        "type": "string",
        "title": "New Text Field"
      }
    }
  },
  "uischema": {
    "elements": [
      {
        "type": "Control",
        "scope": "#/properties/newTextField"
      }
    ]
  }
}
```

### Add a dropdown with API data:

**In step JSON:**
```json
{
  "schema": {
    "properties": {
      "selectedItem": {
        "type": "string",
        "title": "Select Item"
      }
    }
  },
  "uischema": {
    "elements": [
      {
        "type": "Control",
        "scope": "#/properties/selectedItem"
      }
    ]
  },
  "hooks": {
    "onInit": ["loadItems"],
    "onChange": {
      "selectedItem": "onItemSelected"
    }
  }
}
```

**In step hooks:**
```typescript
export async function loadItems(field: any, model: any, formState: any, http: HttpClient): Promise<void> {
  const items = await http.get<any[]>('/api/Items').toPromise();
  if (field.schema?.properties?.selectedItem) {
    field.schema.properties.selectedItem.enum = items.map(i => i.label);
  }
  model._itemsData = items;
}

export function onItemSelected(field: any, model: any): void {
  const selected = model._itemsData?.find(i => i.label === model.selectedItem);
  // Handle selection
}
