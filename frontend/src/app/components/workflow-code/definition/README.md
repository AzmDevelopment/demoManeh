# Workflow Hooks Template

This folder contains a template for creating new workflow hooks.

## Quick Start

1. Copy the `_TEMPLATE_WORKFLOW` folder
2. Rename it to your workflow ID (e.g., `CT401_Battery`)
3. Update `index.ts` with your workflow ID and name
4. Create step files following the naming convention
5. Register the workflow in `workflow-hooks.service.ts`

## Folder Structure

```
workflow-code/
└── definition/
    └── {WorkflowId}/
        ├── index.ts           # Workflow index - exports all steps
        ├── {stepId}.ts        # Step hook file
        └── ...
```

## Step Hook File Template

Each step file should export:
- `STEP_ID`: string constant
- `hooks`: object with hook functions

```typescript
import { HttpClient } from '@angular/common/http';

export const STEP_ID = 'my_step_id';

export async function loadData(field: any, model: any, formState: any, http: HttpClient): Promise<void> {
  // Your hook logic here
}

export const hooks = {
  loadData,
  // Add more hooks as needed
};

export default { stepId: STEP_ID, hooks };
```

## Registering a New Workflow

In `workflow-hooks.service.ts`:

```typescript
// Add import
import * as MyNewWorkflow from '../components/workflow-code/definition/MyNewWorkflow';

// Add to WORKFLOW_REGISTRATIONS array
const WORKFLOW_REGISTRATIONS = [
  SASO301_Cooker,
  MyNewWorkflow,  // Add here
];
```
