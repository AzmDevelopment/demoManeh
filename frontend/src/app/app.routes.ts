import { Routes } from '@angular/router';
import { CategoryNavigationComponent } from './components/category-navigation/category-navigation.component';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';

export const routes: Routes = [
  {
    path: '',
    component: CategoryNavigationComponent,
    title: 'Select Category'
  },
  {
    path: 'form/:formId',
    component: DynamicFormComponent,
    title: 'Product Form'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
