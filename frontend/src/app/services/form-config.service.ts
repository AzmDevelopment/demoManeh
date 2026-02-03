import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, of, catchError, forkJoin } from 'rxjs';

/* =========================================================
 * SHARED INTERFACES
 * ========================================================= */
export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormField {
  key: string;
  type:
    | 'input'
    | 'select'
    | 'textarea'
    | 'radio'
    | 'checkbox'
    | 'multicheckbox'
    | 'file'
    | 'repeat'
    | 'table';
  templateOptions: Record<string, any>;
  hooks?: Record<string, string>;
  validation?: { messages?: Record<string, string> };
  validators?: { validation?: string[] };
  expressionProperties?: Record<string, string>;
  hideExpression?: string;
  fieldArray?: any;
  fieldGroup?: FormField[];
}

export interface FormConfig {
  certificationId?: string;
  stepId?: string;
  title?: string;
  name?: string;
  fields: FormField[];
  stepConfig?: Record<string, any>;
  hooks?: Record<string, string | string[]>;
}

export interface FormData {
  categories: FormFieldOption[];
  products: Record<string, FormFieldOption[]>;
  vatCategories: FormFieldOption[];
  requiredProductCategories: string[];
}

/* =========================================================
 * SASO DEMO INTERFACES
 * ========================================================= */
export interface Brand {
  id: string;
  nameEn: string;
  nameAr: string;
  attachments: { id: string; fileName: string }[];
  isNew?: boolean;
}

export interface Sector {
  id: string;
  name: string;
  nameAr: string;
}

export interface Classification {
  id: string;
  name: string;
  nameAr: string;
}

@Injectable({ providedIn: 'root' })
export class FormConfigService {
  private http = inject(HttpClient);
  private formData$: Observable<FormData> | null = null;

  /* =========================================================
   * FORM CONFIG LOADERS
   * ========================================================= */
  loadFormConfig(formId: string): Observable<FormConfig> {
    return this.http.get<FormConfig>(`assets/forms/${formId}.json`);
  }

  loadWorkflowDefinition(workflowId: string): Observable<any> {
    return this.http.get<any>(
      `assets/forms/workflows/Definitions/${workflowId}.json`
    );
  }

  loadStepDefinition(stepRef: string): Observable<FormConfig> {
    return this.http.get<FormConfig>(`assets/forms/${stepRef}.json`);
  }

  private loadFormData(): Observable<FormData> {
    if (!this.formData$) {
      this.formData$ = this.http
        .get<FormData>('assets/data/form-data.json')
        .pipe(shareReplay(1));
    }
    return this.formData$;
  }

  getCategories(): Observable<FormFieldOption[]> {
    return this.loadFormData().pipe(map(d => d.categories));
  }

  getProductsByCategory(categoryId: string): Observable<FormFieldOption[]> {
    return this.loadFormData().pipe(
      map(d => d.products[categoryId] || [])
    );
  }

  getVatCategories(): Observable<FormFieldOption[]> {
    return this.loadFormData().pipe(map(d => d.vatCategories));
  }

  getRequiredProductCategories(): Observable<string[]> {
    return this.loadFormData().pipe(
      map(d => d.requiredProductCategories)
    );
  }

  /* =========================================================
   * BRANDS
   * ========================================================= */
  getBrands(): Observable<FormFieldOption[]> {
    return this.http.get<Brand[]>('/api/Brand').pipe(
      map(brands =>
        brands.map(b => ({
          value: b.id,
          label: `${b.nameEn} (${b.nameAr})`
        }))
      ),
      catchError(() => this.getMockBrands())
    );
  }

  getBrandsFullData(): Observable<Brand[]> {
    return this.http.get<Brand[]>('/api/Brand').pipe(
      catchError(() => of(this.getMockBrandsData()))
    );
  }

  private getMockBrands(): Observable<FormFieldOption[]> {
    return of(
      this.getMockBrandsData().map(b => ({
        value: b.id,
        label: `${b.nameEn} (${b.nameAr})`
      }))
    );
  }

  private getMockBrandsData(): Brand[] {
    return [
      {
        id: '1',
        nameEn: 'Samsung',
        nameAr: 'سامسونج',
        attachments: [{ id: 'att1', fileName: 'samsung_trademark.pdf' }]
      },
      {
        id: '2',
        nameEn: 'Apple',
        nameAr: 'أبل',
        attachments: [{ id: 'att2', fileName: 'apple_certificate.pdf' }]
      },
      { id: '3', nameEn: 'Sony', nameAr: 'سوني', attachments: [] }
    ];
  }

  /* =========================================================
   * BRAND FILE UPLOAD / DELETE  ✅ ADDED
   * ========================================================= */

  /** Upload multiple brand files */
  uploadBrandFiles(
    files: File[]
  ): Observable<{ fileId: string; fileName: string }[]> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    return this.http
      .post<{ fileId: string; fileName: string }[]>(
        '/api/files/brand',
        formData
      )
      .pipe(
        catchError(() =>
          of(
            files.map(f => ({
              fileId:
                'mock_' +
                Date.now() +
                '_' +
                Math.random().toString(36).slice(2),
              fileName: f.name
            }))
          )
        )
      );
  }

  /** Delete brand file */
  deleteBrandFile(fileId: string): Observable<void> {
    return this.http.delete<void>(`/api/files/${fileId}`).pipe(
      catchError(() => of(undefined))
    );
  }

  /* =========================================================
   * SECTORS
   * ========================================================= */
  getSectors(): Observable<FormFieldOption[]> {
    return this.http.get<Sector[]>('/api/Product/sectors').pipe(
      map(s =>
        s.map(x => ({
          value: x.id,
          label: `${x.name} (${x.nameAr})`
        }))
      ),
      catchError(() => of([
        { value: '1', label: 'Electronics (الإلكترونيات)' },
        { value: '2', label: 'Cosmetics (مستحضرات التجميل)' }
      ]))
    );
  }

  /* =========================================================
   * CLASSIFICATIONS
   * ========================================================= */
  getClassifications(): Observable<FormFieldOption[]> {
    return this.http
      .get<Classification[]>('/api/Product/classifications')
      .pipe(
        map(c =>
          c.map(x => ({
            value: x.id,
            label: `${x.name} (${x.nameAr})`
          }))
        ),
        catchError(() => of([
          { value: 'A', label: 'Class A (عالية السلامة)' },
          { value: 'B', label: 'Class B (متوسطة السلامة)' }
        ]))
      );
  }
}
