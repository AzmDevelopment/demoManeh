/**
 * Template Workflow Hooks Index
 * 
 * INSTRUCTIONS:
 * 1. Copy this folder and rename to your workflow ID
 * 2. Update WORKFLOW_ID and WORKFLOW_NAME below
 * 3. Create step files and import them here
 * 4. Register workflow in workflow-hooks.service.ts
 */

// Import your step hooks here
// import * as step1 from './step1_name';
// import * as step2 from './step2_name';

// Workflow identification
export const WORKFLOW_ID = '_TEMPLATE_WORKFLOW';  // Change this!
export const WORKFLOW_NAME = 'Template Workflow'; // Change this!

/**
 * All steps in this workflow
 * Add your steps here after creating the step files
 */
export const ALL_STEPS: Array<{ stepId: string; hooks: any }> = [
  // { stepId: step1.STEP_ID, hooks: step1.hooks },
  // { stepId: step2.STEP_ID, hooks: step2.hooks },
];
