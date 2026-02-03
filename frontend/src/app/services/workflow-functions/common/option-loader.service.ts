import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormConfigService, FormFieldOption, Brand } from '../../form-config.service';

/**
 * Service to handle loading options for select fields based on hooks
 * Centralizes all data loading logic (categories, brands, sectors, etc.)
 */
@Injectable({
  providedIn: 'root'
})
export class OptionLoaderService {
  private formConfigService = inject(FormConfigService);
  private optionsCache: Record<string, Record<string, FormFieldOption[]>> = {};
  private loadedBrands: Brand[] = [];

  /**
   * Load initial options for all select fields in a form
   */
  loadInitialOptions(
    fields: FormlyFieldConfig[],
    formConfig: any,
    destroy$: Subject<void>
  ): void {
    if (!formConfig) return;

    formConfig.fields.forEach((field: any) => {
      if (field.type === 'select') {
        // Load based on onInit hook
        if (field.hooks?.['onInit']) {
          this.loadOptionsForField(field.key, field.hooks['onInit'], fields, destroy$);
        }
        // Load VAT categories for VAT fields
        if (field.key.toLowerCase().includes('vat')) {
          this.loadVatOptions(field.key, fields, destroy$);
        }
      }
    });
  }

  /**
   * Load options for a specific field based on hook name
   */
  loadOptionsForField(
    fieldKey: string,
    hookName: string,
    fields: FormlyFieldConfig[],
    destroy$: Subject<void>
  ): void {
    const formlyField = fields.find(f => f.key === fieldKey);
    if (!formlyField) return;

    formlyField.props!.placeholder = 'Loading...';

    switch (hookName) {
      case 'loadLocalCategories':
      case 'loadBatteryCategories':
        this.loadCategories(formlyField, destroy$);
        break;
      case 'loadBrands':
      case 'loadSelectedBrands':
        this.loadBrands(formlyField, destroy$);
        break;
      case 'loadSectors':
        this.loadSectors(formlyField, destroy$);
        break;
      case 'loadClassifications':
        this.loadClassifications(formlyField, destroy$);
        break;
      case 'loadProducts':
        this.loadProducts(formlyField, destroy$);
        break;
      default:
        console.warn(`Unknown hook: ${hookName}`);
        formlyField.props!.placeholder = `Select ${formlyField.props!.label?.toLowerCase() || 'option'}`;
    }
  }

  /**
   * Load categories (for battery, local products, etc.)
   */
  private loadCategories(formlyField: FormlyFieldConfig, destroy$: Subject<void>): void {
    this.formConfigService.getCategories()
      .pipe(takeUntil(destroy$))
      .subscribe({
        next: (options) => {
          formlyField.props!.options = options;
          formlyField.props!.placeholder = `Select ${formlyField.props!.label?.toLowerCase() || 'option'}`;
          formlyField.props!['loading'] = false;
        },
        error: () => {
          formlyField.props!.placeholder = 'Failed to load options';
          formlyField.props!['loading'] = false;
        }
      });
  }

  /**
   * Load brands (both dropdown options and full data for table)
   */
  private loadBrands(formlyField: FormlyFieldConfig, destroy$: Subject<void>): void {
    this.formConfigService.getBrands()
      .pipe(takeUntil(destroy$))
      .subscribe({
        next: (options) => {
          formlyField.props!.options = options;
          formlyField.props!.placeholder = `Select ${formlyField.props!.label?.toLowerCase() || 'brand'}`;
          formlyField.props!['loading'] = false;
        },
        error: () => {
          formlyField.props!.placeholder = 'Failed to load brands';
          formlyField.props!['loading'] = false;
        }
      });

    // Also load full brand data for table display
    this.formConfigService.getBrandsFullData()
      .pipe(takeUntil(destroy$))
      .subscribe(brands => this.loadedBrands = brands);
  }

  /**
   * Load sectors
   */
  private loadSectors(formlyField: FormlyFieldConfig, destroy$: Subject<void>): void {
    this.formConfigService.getSectors()
      .pipe(takeUntil(destroy$))
      .subscribe({
        next: (options) => {
          formlyField.props!.options = options;
          formlyField.props!.placeholder = `Select ${formlyField.props!.label?.toLowerCase() || 'sector'}`;
          formlyField.props!['loading'] = false;
        },
        error: () => {
          formlyField.props!.placeholder = 'Failed to load sectors';
          formlyField.props!['loading'] = false;
        }
      });
  }

  /**
   * Load classifications
   */
  private loadClassifications(formlyField: FormlyFieldConfig, destroy$: Subject<void>): void {
    this.formConfigService.getClassifications()
      .pipe(takeUntil(destroy$))
      .subscribe({
        next: (options) => {
          formlyField.props!.options = options;
          formlyField.props!.placeholder = `Select ${formlyField.props!.label?.toLowerCase() || 'classification'}`;
          formlyField.props!['loading'] = false;
        },
        error: () => {
          formlyField.props!.placeholder = 'Failed to load classifications';
          formlyField.props!['loading'] = false;
        }
      });
  }

  /**
   * Load products
   */
  private loadProducts(formlyField: FormlyFieldConfig, destroy$: Subject<void>): void {
    // TODO: Implement loadProducts if API exists
    formlyField.props!.placeholder = `Select ${formlyField.props!.label?.toLowerCase() || 'product'}`;
    formlyField.props!['loading'] = false;
  }

  /**
   * Load VAT categories for VAT-related fields
   */
  private loadVatOptions(
    fieldKey: string,
    fields: FormlyFieldConfig[],
    destroy$: Subject<void>
  ): void {
    const formlyField = fields.find(f => f.key === fieldKey);
    if (!formlyField) return;

    this.formConfigService.getVatCategories()
      .pipe(takeUntil(destroy$))
      .subscribe(options => formlyField.props!.options = options);
  }

  /**
   * Load dependent options (e.g., products based on category)
   */
  loadDependentOptions(
    parentKey: string,
    parentValue: string,
    fields: FormlyFieldConfig[],
    destroy$: Subject<void>
  ): void {
    const parentIndex = fields.findIndex(f => f.key === parentKey);
    const dependentField = fields.find((f, index) => index > parentIndex && f.type === 'select');

    if (!dependentField) return;

    const cacheKey = `${parentKey}_${parentValue}`;
    if (this.optionsCache[dependentField.key as string]?.[cacheKey]) {
      dependentField.props!.options = this.optionsCache[dependentField.key as string][cacheKey];
      dependentField.props!.disabled = false;
      return;
    }

    dependentField.props!.placeholder = 'Loading...';
    dependentField.props!.disabled = true;
    dependentField.props!.options = [];

    this.formConfigService.getProductsByCategory(parentValue)
      .pipe(takeUntil(destroy$))
      .subscribe({
        next: (options) => {
          if (!this.optionsCache[dependentField.key as string]) {
            this.optionsCache[dependentField.key as string] = {};
          }
          this.optionsCache[dependentField.key as string][cacheKey] = options;
          dependentField.props!.options = options;
          dependentField.props!.placeholder = `Select ${dependentField.props!.label?.toLowerCase() || 'option'}`;
          dependentField.props!.disabled = false;
        },
        error: () => {
          dependentField.props!.placeholder = 'Failed to load options';
          dependentField.props!.disabled = false;
        }
      });
  }

  /**
   * Get loaded brands for table building
   */
  getLoadedBrands(): Brand[] {
    return this.loadedBrands;
  }

  /**
   * Clear options cache
   */
  clearCache(): void {
    this.optionsCache = {};
    this.loadedBrands = [];
  }
}
