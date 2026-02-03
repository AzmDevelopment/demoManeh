import { Routes } from '@angular/router';
import { CategoryNavigationComponent } from './components/category-navigation/category-navigation.component';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';
import { WorkflowStepComponent } from './components/workflow-step/workflow-step.component';

export const routes: Routes = [

  {
    path: '',
    component: CategoryNavigationComponent,
    title: 'Select Category'
  },

  {
    path: 'workflow/:workflowId',
    component: DynamicFormComponent,
    title: 'Workflow Form'
  },
  {
    path: 'form/:formId',
    component: DynamicFormComponent,
    title: 'Product Form'
  },
  {
    path: 'workflow-step/:instanceId/step/:stepId',
    component: WorkflowStepComponent,
    title: 'Workflow Step'
  },
  {
    path: 'workflow-step/:instanceId/completed',
    component: WorkflowStepComponent,
    title: 'Workflow Completed'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
