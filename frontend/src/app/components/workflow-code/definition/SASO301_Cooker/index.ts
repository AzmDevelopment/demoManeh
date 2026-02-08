/**
 * SASO301_Cooker Workflow Hooks Index
 * 
 * This file exports all step hooks for the SASO301_Cooker workflow.
 * Add new step imports here when creating new steps.
 */

// Step 1: Type Selection
export * as step1_types from './saso_test_step1_types';

// Step 2: Brand Management
export * as step2_brands from './saso_test_step2_brands';

// Step 3: Product Management
export * as step3_products from './saso_test_step3_products';

// Workflow metadata
export const WORKFLOW_ID = 'SASO301_Cooker';
export const WORKFLOW_NAME = 'SASO 301 Cooker Certification';

/**
 * All steps in this workflow with their hooks
 * This is auto-generated from the exports above
 */
import * as step1 from './saso_test_step1_types';
import * as step2 from './saso_test_step2_brands';
import * as step3 from './saso_test_step3_products';

export const ALL_STEPS = [
  { stepId: step1.STEP_ID, hooks: step1.hooks },
  { stepId: step2.STEP_ID, hooks: step2.hooks },
  { stepId: step3.STEP_ID, hooks: step3.hooks },
];
