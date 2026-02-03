# Workflow Functions Architecture

This folder contains the refactored workflow function system for the dynamic form component. The architecture separates workflow-specific logic from the main component, making the codebase cleaner, more maintainable, and easier to scale.

## Folder Structure

```
workflow-functions/
├── README.md (this file)
├── workflow-function.interface.ts     # Interface definition for workflow functions
├── workflow-function-handler.service.ts  # Central orchestration service
├── common/                            # Common utilities used by all workflows
│   ├── expression-evaluator.service.ts  # Evaluates JSON expressions
│   ├── option-loader.service.ts         # Handles data loading for select fields
│   └── field-converter.service.ts       # Converts JSON fields to Formly fields
└── workflows/                         # Workflow-specific function implementations
    ├── BT501_shampoo_new.functions.ts
    ├── CT401_lithium_battery_new.functions.ts
    └── SASO_demo_brand_product.functions.ts
```

## Architecture Overview

### 1. Common Services

#### ExpressionEvaluatorService
Evaluates dynamic expressions from JSON configurations:
- `hideExpression`: Controls field visibility
- `expressionProperties`: Dynamic property values
- Supports equality, inequality, ternary, and array includes operations

#### OptionLoaderService
Centralizes data loading for select fields:
- Handles `onInit` hooks (loadBrands, loadSectors, loadClassifications, etc.)
- Manages options caching
- Loads dependent options (e.g., products by category)
- Provides access to loaded brand data for table building

#### FieldConverterService
Converts JSON field definitions to Formly field configurations:
- Maps field types (input, select, textarea, file, etc.)
- Applies field-specific properties
- Sets up validators and validation messages
- Handles expression properties and hide expressions

### 2. Workflow-Specific Functions

Each workflow can implement the `WorkflowFunctions` interface with custom logic:

```typescript
export interface WorkflowFunctions {
  workflowId: string;
  buildTables?(model, fields, context): void;
  onModelChange?(model, fields, context): void;
  handleFieldChange?(fieldKey, value, model, fields): void;
  customValidation?(model, fields): { valid: boolean; message?: string };
  beforeSubmit?(model, stepIndex): Record<string, any>;
  afterSubmit?(result, model): void;
}
```

### 3. Workflow Function Handler Service

The `WorkflowFunctionHandlerService` orchestrates all workflow-specific functions:
- Maintains a registry of workflow implementations
- Routes function calls to the appropriate workflow
- Provides a clean API for the dynamic form component

## How to Add a New Workflow

### Step 1: Create Workflow Function File

Create a new file in `workflows/` folder (e.g., `MY_NEW_WORKFLOW.functions.ts`):

```typescript
import { FormlyFieldConfig } from '@ngx-formly/core';
import { WorkflowFunctions, WorkflowFunctionContext } from '../workflow-function.interface';

export class MyNewWorkflowFunctions implements WorkflowFunctions {
  workflowId = 'MY_NEW_WORKFLOW';

  // Implement only the methods you need
  customValidation(model: Record<string, any>, fields: FormlyFieldConfig[]): { valid: boolean; message?: string } {
    // Your validation logic
    return { valid: true };
  }

  beforeSubmit(model: Record<string, any>, stepIndex: number): Record<string, any> {
    // Transform data before submission
    return model;
  }
}

export const myNewWorkflowFunctions = new MyNewWorkflowFunctions();
```

### Step 2: Register Workflow

Add your workflow to `workflow-function-handler.service.ts`:

```typescript
// Import your workflow
import { myNewWorkflowFunctions } from './workflows/MY_NEW_WORKFLOW.functions';

// In registerWorkflows() method
private registerWorkflows(): void {
  // ... existing registrations
  this.register(myNewWorkflowFunctions);
}
```

### Step 3: Use Workflow-Specific Logic

The dynamic form component will automatically call your workflow functions when:
- Model changes occur (`onModelChange`)
- Fields change (`handleFieldChange`)
- Form is submitted (`customValidation`, `beforeSubmit`)
- Tables need to be built (`buildTables`)

## Example: Brand Table Building

The `SASO_demo_brand_product` workflow implements custom table building:

```typescript
buildTables(model, fields, context): void {
  // Access loaded brands from context
  const loadedBrands = context?.loadedBrands || [];

  // Build table data
  const tableData = [];

  // Add existing selected brand
  if (model['selectedBrand']) {
    const brand = loadedBrands.find(b => b.id === model['selectedBrand']);
    if (brand) {
      tableData.push({
        nameEn: brand.nameEn,
        nameAr: brand.nameAr,
        fileCount: brand.attachments?.length || 0,
        source: 'Existing'
      });
    }
  }

  // Update model and field
  model['brandTable'] = tableData;
  const tableField = fields.find(f => f.key === 'brandTable');
  if (tableField?.formControl) {
    tableField.formControl.setValue(tableData);
  }
}
```

## Benefits of This Architecture

1. **Separation of Concerns**: Workflow-specific logic is isolated from common form logic
2. **Scalability**: Easy to add new workflows without modifying existing code
3. **Maintainability**: Each workflow has its own file (~50-100 lines vs 730+ lines)
4. **Testability**: Services can be unit tested independently
5. **Reusability**: Common services are shared across all workflows
6. **Clarity**: Clear structure makes it easy to find and modify workflow logic

## Component Size Comparison

**Before refactoring:**
- dynamic-form.component.ts: ~730 lines
- All logic mixed together
- Difficult to navigate and maintain

**After refactoring:**
- dynamic-form.component.ts: ~350 lines (52% reduction!)
- ExpressionEvaluatorService: ~70 lines
- OptionLoaderService: ~200 lines
- FieldConverterService: ~200 lines
- Each workflow file: ~50-100 lines

## Migration Notes

- Original component backed up as `dynamic-form.component.backup.ts`
- All functionality preserved
- Same template and styles
- No changes required to JSON configuration files
- Backward compatible with existing workflows

## Future Enhancements

- Add workflow-specific form actions (buttons, custom UI)
- Implement workflow-level state management
- Add workflow testing utilities
- Create workflow generator CLI tool
