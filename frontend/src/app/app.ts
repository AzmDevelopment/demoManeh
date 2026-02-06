import { Component, inject, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, FormlyModule],
  templateUrl: './app.html'
})
export class App {
  private http = inject(HttpClient);

  form = new FormGroup({});
  model = {};
  fields = signal<FormlyFieldConfig[]>([]);

  configUrl = 'assets/forms/workflows/Steps/certificate_specific/SASO_demo/saso_test_step1_types.json';


  constructor() {
    this.loadForm();
  }

  loadForm() {
    this.http.get<any>(this.configUrl).subscribe(config => {
      this.fields.set(config.fields);
    });
  }

  onSubmit() {
    if (this.form.valid) {
      console.log(this.model);
    }
  }
}
