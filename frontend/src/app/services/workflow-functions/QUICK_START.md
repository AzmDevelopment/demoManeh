# Quick Start Guide - Workflow Functions

## TL;DR

**Before:** Everything in one 730-line file
**After:** Clean architecture with separate files for each workflow

## 5-Minute Setup for New Workflow

### 1. Create Your Function File

```bash
# Create file: workflows/YOUR_WORKFLOW_ID.functions.ts
```

```typescript
import { FormlyFieldConfig } from '@ngx-formly/core';
import { WorkflowFunctions, WorkflowFunctionContext } from '../workflow-function.interface';

export class YourWorkflowFunctions implements WorkflowFunctions {
  workflowId = 'YOUR_WORKFLOW_ID'; // Must match JSON workflow ID

  // Add only the methods you need:

  // 1. Custom validation before submit
  customValidation(model: Record<string, any>, fields: FormlyFieldConfig[]) {
    // Example: Check if value is in valid range
    if (model['someField'] < 0) {
      return { valid: false, message: 'Value must be positive' };
    }
    return { valid: true };
  }

  // 2. Transform data before submission
  beforeSubmit(model: Record<string, any>, stepIndex: number) {
    return {
      ...model,
      timestamp: new Date().toISOString()
    };
  }

  // 3. Build custom tables (like brand table)
  buildTables(model: Record<string, any>, fields: FormlyFieldConfig[], context?: WorkflowFunctionContext) {
    const tableData = [];
    // Your table building logic
    model['yourTable'] = tableData;

    const tableField = fields.find(f => f.key === 'yourTable');
    if (tableField?.formControl) {
      tableField.formControl.setValue(tableData);
    }
  }

  // 4. React to model changes
  onModelChange(model: Record<string, any>, fields: FormlyFieldConfig[], context?: WorkflowFunctionContext) {
    // Update dependent data when model changes
    if (fields.some(f => f.key === 'yourTable')) {
      this.buildTables(model, fields, context);
    }
  }

  // 5. Handle specific field changes
  handleFieldChange(fieldKey: string, value: any, model: Record<string, any>, fields: FormlyFieldConfig[]) {
    if (fieldKey === 'specificField') {
      // React to this specific field changing
      model['dependentField'] = value * 2; // Example
    }
  }

  // 6. After submission processing
  afterSubmit(result: any, model: Record<string, any>) {
    // Handle post-submission logic
    console.log('Submitted successfully:', result);
  }
}

export const yourWorkflowFunctions = new YourWorkflowFunctions();
```

### 2. Register Your Workflow

Edit `workflow-function-handler.service.ts`:

```typescript
// Add import at top
import { yourWorkflowFunctions } from './workflows/YOUR_WORKFLOW_ID.functions';

// In registerWorkflows() method
private registerWorkflows(): void {
  this.register(sasoDemoBrandProductFunctions);
  this.register(bt501ShampooFunctions);
  this.register(ct401LithiumBatteryFunctions);
  this.register(yourWorkflowFunctions); // Add this line
}
```

### 3. Done!

Your workflow functions will automatically be called when:
- Form is validated (before submit)
- Form is submitted
- Model changes
- Fields change
- Tables need to be built

## Common Use Cases

### Use Case 1: Simple Validation

```typescript
export class SimpleWorkflow implements WorkflowFunctions {
  workflowId = 'simple_workflow';

  customValidation(model: Record<string, any>) {
    if (!model['email']?.includes('@')) {
      return { valid: false, message: 'Invalid email' };
    }
    return { valid: true };
  }
}
```

### Use Case 2: Add Timestamp

```typescript
export class TimestampWorkflow implements WorkflowFunctions {
  workflowId = 'timestamp_workflow';

  beforeSubmit(model: Record<string, any>, stepIndex: number) {
    return {
      ...model,
      submittedAt: new Date().toISOString(),
      stepNumber: stepIndex + 1
    };
  }
}
```

### Use Case 3: Build Summary Table

```typescript
export class SummaryWorkflow implements WorkflowFunctions {
  workflowId = 'summary_workflow';

  onModelChange(model: Record<string, any>, fields: FormlyFieldConfig[]) {
    // Build summary whenever model changes
    if (fields.some(f => f.key === 'summaryTable')) {
      this.buildSummary(model, fields);
    }
  }

  private buildSummary(model: Record<string, any>, fields: FormlyFieldConfig[]) {
    const summary = [
      { label: 'Name', value: model['name'] },
      { label: 'Email', value: model['email'] },
      { label: 'Phone', value: model['phone'] }
    ];

    model['summaryTable'] = summary;
    const tableField = fields.find(f => f.key === 'summaryTable');
    if (tableField?.formControl) {
      tableField.formControl.setValue(summary);
    }
  }
}
```

### Use Case 4: Calculate Totals

```typescript
export class CalculationWorkflow implements WorkflowFunctions {
  workflowId = 'calculation_workflow';

  handleFieldChange(fieldKey: string, value: any, model: Record<string, any>) {
    // Recalculate total when quantity or price changes
    if (fieldKey === 'quantity' || fieldKey === 'price') {
      model['total'] = (model['quantity'] || 0) * (model['price'] || 0);
    }
  }
}
```

## Access Context Data

The `context` parameter provides access to useful data:

```typescript
buildTables(model: Record<string, any>, fields: FormlyFieldConfig[], context?: WorkflowFunctionContext) {
  // Access loaded brands
  const brands = context?.loadedBrands || [];

  // Access current step
  const stepIndex = context?.currentStepIndex || 0;

  // Access all workflow steps
  const steps = context?.workflowSteps || [];

  // Your logic here
}
```

## Available Services

Your workflow functions can access data through the context, which is populated by:

### OptionLoaderService
- `loadedBrands`: Array of brands with full data
- Called automatically when hooks like `loadBrands` are in JSON

### Current State
- `currentStepIndex`: Which step user is on (0-based)
- `workflowSteps`: Array of all step configurations

## Method Reference

| Method | When Called | Use For |
|--------|-------------|---------|
| `buildTables()` | Model changes | Building summary/display tables |
| `onModelChange()` | Form data changes | Reacting to data updates |
| `handleFieldChange()` | Specific field changes | Field-specific logic |
| `customValidation()` | Before submit | Workflow-specific validation |
| `beforeSubmit()` | Before submission | Data transformation |
| `afterSubmit()` | After submission | Post-submission actions |

## Tips

1. **Keep it focused**: Each workflow file should be 50-100 lines
2. **Use TypeScript**: Full type safety with interfaces
3. **Return early**: Check conditions early and return
4. **Don't modify fields array**: Read-only, modify model instead
5. **Use context**: Access shared data through context parameter
6. **Test locally**: Each workflow is independently testable

## Example: Real-World Brand Table (from SASO)

```typescript
buildTables(model: Record<string, any>, fields: FormlyFieldConfig[], context?: WorkflowFunctionContext) {
  const loadedBrands = context?.loadedBrands || [];
  const tableData: any[] = [];

  // Add existing brand if selected
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

  // Add new brands from repeat field
  if (model['newBrand'] && Array.isArray(model['newBrand'])) {
    model['newBrand'].forEach((newBrand: any) => {
      if (newBrand._saved && (newBrand.brandNameEn || newBrand.brandNameAr)) {
        tableData.push({
          nameEn: newBrand.brandNameEn || '',
          nameAr: newBrand.brandNameAr || '',
          fileCount: this.countFiles(newBrand.attachments),
          source: 'New'
        });
      }
    });
  }

  // Update model and form control
  model['brandTable'] = tableData;
  const tableField = fields.find(f => f.key === 'brandTable');
  if (tableField?.formControl) {
    tableField.formControl.setValue(tableData);
  }
}

private countFiles(attachments: any): number {
  if (!attachments) return 0;
  if (Array.isArray(attachments)) return attachments.length;
  if (attachments.fileName) return 1;
  return 0;
}
```

## Need Help?

- 📖 Full docs: [README.md](./README.md)
- 🏗️ Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)
- 📊 Summary: [../../REFACTORING_SUMMARY.md](../../REFACTORING_SUMMARY.md)
- 💡 Examples: See existing workflow files in `workflows/` folder

## Checklist for New Workflow

- [ ] Created workflow function file in `workflows/` folder
- [ ] Implemented `workflowId` property (matches JSON)
- [ ] Added needed methods (validation, transformation, etc.)
- [ ] Exported singleton instance
- [ ] Registered in `workflow-function-handler.service.ts`
- [ ] Tested with your workflow JSON files

---

**Remember:** You only need to implement the methods you actually need. Empty interface methods can be omitted!
