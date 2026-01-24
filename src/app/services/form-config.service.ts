import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormField {
  key: string;
  type: 'input' | 'select';
  templateOptions: Record<string, any>;
  hooks?: Record<string, string>;
  validation?: { messages?: Record<string, string> };
  validators?: { validation?: string[] };
  expressionProperties?: Record<string, string>;
  hideExpression?: string;
}

export interface FormConfig {
  certificationId: string;
  title: string;
  fields: FormField[];
}

export interface FormData {
  categories: FormFieldOption[];
  products: Record<string, FormFieldOption[]>;
  vatCategories: FormFieldOption[];
  requiredProductCategories: string[];
}

@Injectable({
  providedIn: 'root'
})
export class FormConfigService {
  private http = inject(HttpClient);
  private formData$: Observable<FormData> | null = null;

  loadFormConfig(formId: string): Observable<FormConfig> {
    return this.http.get<FormConfig>(`assets/forms/${formId}.json`);
  }

  private loadFormData(): Observable<FormData> {
    if (!this.formData$) {
      this.formData$ = this.http.get<FormData>('assets/data/form-data.json').pipe(
        shareReplay(1)
      );
    }
    return this.formData$;
  }

  getCategories(): Observable<FormFieldOption[]> {
    return this.loadFormData().pipe(map(data => data.categories));
  }

  getProductsByCategory(categoryId: string): Observable<FormFieldOption[]> {
    return this.loadFormData().pipe(map(data => data.products[categoryId] || []));
  }

  getVatCategories(): Observable<FormFieldOption[]> {
    return this.loadFormData().pipe(map(data => data.vatCategories));
  }

  getRequiredProductCategories(): Observable<string[]> {
    return this.loadFormData().pipe(map(data => data.requiredProductCategories));
  }
}
