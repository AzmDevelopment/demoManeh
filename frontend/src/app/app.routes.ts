import { Routes } from '@angular/router';
import { CategoryNavigationComponent } from './components/category-navigation/category-navigation.component';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';
import { WorkflowStepComponent } from './components/workflow-step/workflow-step.component';
import { WorkflowSelectorComponent } from './components/workflow-selector/workflow-selector.component';

export const routes: Routes = [
  {
    path: '',
    component: WorkflowSelectorComponent,
    title: 'Select Workflow'
  },
  {
    path: 'categories',
    component: CategoryNavigationComponent,
    title: 'Select Category'
  },
  {
    path: 'form/:formId',
    component: DynamicFormComponent,
    title: 'Product Form'
  },
  {
    path: 'workflow/:instanceId/step/:stepId',
    component: WorkflowStepComponent,
    title: 'Workflow Step'
  },
  {
    path: 'workflow/:instanceId/completed',
    component: WorkflowStepComponent,
    title: 'Workflow Completed'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
