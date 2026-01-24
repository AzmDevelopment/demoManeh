import { Component } from '@angular/core';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-root',
  imports: [DynamicFormComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
