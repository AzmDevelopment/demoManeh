# Workflow System Architecture Guide

> **For AI Agents**: Follow these patterns strictly when modifying this codebase.

## Core Principle: 100% JSON-Driven with ngx-formly

**CRITICAL**: All workflow components are **completely generic**. They render forms using **ngx-formly** based on JSON step configurations. **DO NOT** add field-type-specific code to workflow components.

---

## Project Structure

```
demoManeh/
├── frontend/                           # Angular 17+ Frontend
│   └── src/app/
│       ├── components/
│       │   ├── workflow-step/          # GENERIC - uses ngx-formly (NO field-specific code)
│       │   ├── dynamic-form/           # Custom formly field types
│       │   │   ├── formly-field-table.type.ts
│       │   │   ├── formly-field-add-to-table.type.ts
│       │   │   ├── formly-field-file.type.ts
│       │   │   └── formly-field-repeat.type.ts
│       │   └── workflow-code/
│       │       └── definition/
│       │           └── {WorkflowId}/   # Step-specific TypeScript hooks
│       └── services/
│           ├── workflow.service.ts
│           └── workflow-hooks.service.ts
│   └── src/assets/forms/workflows/
│       ├── Definitions/                # Workflow definition JSON files
│       └── Steps/certificate_specific/
│           └── {WorkflowId}/           # Step JSON configurations
│
├── backendsln/backend/                 # .NET 8 Backend
│   ├── Controllers/
│   │   ├── WorkflowController.cs
│   │   └── BrandsController.cs
│   ├── Models/
│   │   └── WorkflowStep.cs
│   ├── Services/
│   │   ├── FileSystemWorkflowDefinitionProvider.cs
│   │   └── LocalFileStorageService.cs
│   └── Validation/
│       ├── ValidationRuleFactory.cs
│       └── Rules/
│           └── MinTableEntriesRule.cs
│
└── uploads/                            # File uploads directory (created automatically)
```

---

## Configuration

### Backend Configuration (`appsettings.json`)

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
- Both services handle relative paths using `Path.GetFullPath()`
- **DO NOT** use absolute paths - they break portability

---

## Rendering Architecture

### How It Works

```
JSON Step Definition
        ↓
workflow-step.component.ts (GENERIC)
        ↓
Converts JSON fields → FormlyFieldConfig[]
        ↓
<formly-form [fields]="fields" [model]="model">
        ↓
ngx-formly renders using:
  - Built-in types (input, select, textarea, etc.)
  - Custom types (table, add-to-table, file, repeat)
```

### Registered Formly Types

```typescript
// app.config.ts
FormlyModule.forRoot({
  types: [
    { name: 'file', component: FormlyFieldFile },
    { name: 'table', component: FormlyFieldTable },
    { name: 'repeat', component: FormlyFieldRepeat },
    { name: 'add-to-table', component: FormlyFieldAddToTable }
  ]
})
```

---

## Step JSON Structure

```json
{
  "stepId": "saso_test_step2_brands",
  "name": "Brand Management",
  "actor": "customer",
  "description": "Step description",

  "fields": [
    {
      "key": "selectedBrand",
      "type": "select",
      "templateOptions": {
        "label": "Select Existing Brand",
        "placeholder": "Choose a brand...",
        "required": false,
        "options": []
      },
      "hooks": {
        "onInit": "loadBrands",
        "onChange": "onBrandSelected"
      }
    },
    {
      "key": "brandTable",
      "type": "table",
      "templateOptions": {
        "label": "Brand Summary",
        "columns": ["nameEn", "nameAr", "source"],
        "columnHeaders": {
          "nameEn": "Brand (English)",
          "nameAr": "Brand (Arabic)",
          "source": "Source"
        },
        "emptyMessage": "No brands added yet.",
        "badgeColumns": {
          "source": {
            "Existing": "bg-info",
            "New": "bg-success"
          }
        }
      }
    },
    {
      "key": "newBrand",
      "type": "add-to-table",
      "templateOptions": {
        "addText": "➕ Add New Brand",
        "saveText": "💾 Save",
        "cancelText": "✕ Cancel",
        "targetTableKey": "brandTable",
        "fieldMapping": {
          "brandNameEn": "nameEn",
          "brandNameAr": "nameAr"
        },
        "defaults": {
          "source": "New"
        }
      },
      "fieldGroup": [
        {
          "key": "brandNameEn",
          "type": "input",
          "templateOptions": {
            "label": "Brand Name (English)",
            "required": true
          }
        }
      ]
    }
  ],

  "stepConfig": {
    "canSendBack": false,
    "nextStep": "saso_test_step3_products",
    "validation": {
      "type": "brandTable",
      "minRequired": 1,
      "message": "Please add at least one brand"
    }
  }
}
```

---

## Supported Field Types

| Type | Description | Rendered By |
|------|-------------|-------------|
| `input` | Text/number input | ngx-formly/bootstrap |
| `select` | Dropdown | ngx-formly/bootstrap |
| `textarea` | Multi-line text | ngx-formly/bootstrap |
| `radio` | Radio buttons | ngx-formly/bootstrap |
| `checkbox` | Single checkbox | ngx-formly/bootstrap |
| `multicheckbox` | Multiple checkboxes | ngx-formly/bootstrap |
| `table` | Display-only table | FormlyFieldTable |
| `add-to-table` | Form to add rows | FormlyFieldAddToTable |
| `file` | File upload | FormlyFieldFile |
| `repeat` | Repeatable section | FormlyFieldRepeat |

---

## Step TypeScript Hooks

Hooks are **step-specific logic** stored in separate files:

```
frontend/src/app/components/workflow-code/definition/{WorkflowId}/{step_id}.ts
```

### Hook Signature

```typescript
export async function loadBrands(
  field: FormlyFieldConfig,
  model: any,
  formState: any,
  http: HttpClient
): Promise<void> {
  const brands = await http.get('/api/Brands').toPromise();
  field.props.options = brands;
}

export function onBrandSelected(
  field: FormlyFieldConfig,
  model: any,
  formState: any,
  http: HttpClient
): void {
  // Add selected brand to table
  const selected = field.props.options.find(o => o.value === model.selectedBrand);
  if (selected) {
    model.brandTable = [...(model.brandTable || []), {
      nameEn: selected.label,
      nameAr: selected.labelAr,
      source: 'Existing'
    }];
    model.selectedBrand = '';
  }
}

export const hooks = {
  loadBrands,
  onBrandSelected
};
```

### Registering Hooks

```typescript
// workflow-hooks.service.ts
import * as step2Hooks from '../workflow-code/definition/SASO301_Cooker/saso_test_step2_brands';

private static readonly HOOKS_REGISTRY = {
  'SASO301_Cooker/saso_test_step2_brands': step2Hooks.hooks
};
```

---

## Backend Validation

### JSON Configuration

```json
{
  "stepConfig": {
    "validation": {
      "type": "brandTable",
      "minRequired": 1,
      "message": "Please add at least one brand"
    }
  }
}
```

### Backend Rule

```csharp
// MinTableEntriesRule.cs
public class MinTableEntriesRule : ValidationRuleBase
{
    public string TargetField { get; set; }
    public int MinRequired { get; set; } = 1;
}
```

---

## Anti-Patterns (NEVER DO)

### ❌ Adding field-specific HTML to workflow component

```html
<!-- WRONG - in workflow-step.component.html -->
@if (field.type === 'table') {
  <table>...</table>
}
@if (field.type === 'add-to-table') {
  <div>...</div>
}
```

### ❌ Adding field-specific logic to workflow component

```typescript
// WRONG - in workflow-step.component.ts
removeTableRow(key: string, index: number) { ... }
toggleAddForm(key: string) { ... }
```

### ✅ CORRECT: Use ngx-formly custom types

All field-type-specific rendering goes in custom formly types:
- `FormlyFieldTable` - renders tables
- `FormlyFieldAddToTable` - renders add forms
- `FormlyFieldFile` - renders file inputs
- `FormlyFieldRepeat` - renders repeatable sections

---

## Workflow Component Structure

### workflow-step.component.ts (GENERIC)

```typescript
@Component({
  imports: [FormlyModule, FormlyBootstrapModule, ...]
})
export class WorkflowStepComponent {
  form = new FormGroup({});
  model: any = {};
  fields: FormlyFieldConfig[] = [];

  async loadCurrentStep() {
    // 1. Fetch step definition from API
    // 2. Convert JSON to FormlyFieldConfig[]
    // 3. Execute onInit hooks
  }

  buildFormlyFields(jsonFields: any[]): FormlyFieldConfig[] {
    // Convert JSON → FormlyFieldConfig (generic)
  }

  async processFieldHooks(fields: FormlyFieldConfig[]) {
    // Execute hooks defined in JSON
  }
}
```

### workflow-step.component.html (GENERIC)

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <formly-form
    [form]="form"
    [fields]="fields"
    [model]="model">
  </formly-form>
  
  <button type="submit" [disabled]="!canSubmit">Submit</button>
</form>
```

---

## Adding a New Field Type

1. **Create custom formly type**:
```typescript
// formly-field-custom.type.ts
@Component({
  selector: 'formly-field-custom',
  template: `...`
})
export class FormlyFieldCustom extends FieldType<FieldTypeConfig> {
  // Access props via this.props
  // Access value via this.formControl
}
```

2. **Register in app.config.ts**:
```typescript
FormlyModule.forRoot({
  types: [
    { name: 'custom', component: FormlyFieldCustom }
  ]
})
```

3. **Use in JSON**:
```json
{
  "key": "myField",
  "type": "custom",
  "templateOptions": {
    "customProp": "value"
  }
}
```

---

## Checklist for AI Agents

When modifying workflow code:

- [ ] Workflow component uses `<formly-form>` only
- [ ] No field-type-specific HTML in workflow template
- [ ] No field-type-specific logic in workflow component
- [ ] New field types are custom formly components
- [ ] Step-specific logic is in hooks files only
- [ ] JSON defines all field configuration
- [ ] Hooks registered in workflow-hooks.service.ts
- [ ] Backend validation configured in stepConfig

---

## File Locations

| Purpose | Location |
|---------|----------|
| Workflow Component | `frontend/src/app/components/workflow-step/` |
| Custom Formly Types | `frontend/src/app/components/dynamic-form/` |
| Step JSON | `frontend/src/assets/forms/workflows/Steps/certificate_specific/{WorkflowId}/` |
| Step Hooks | `frontend/src/app/components/workflow-code/definition/{WorkflowId}/` |
| Hooks Registry | `frontend/src/app/services/workflow-hooks.service.ts` |
| Formly Config | `frontend/src/app/app.config.ts` |
