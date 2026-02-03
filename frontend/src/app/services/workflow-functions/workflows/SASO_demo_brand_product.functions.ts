import { FormlyFieldConfig } from '@ngx-formly/core';
import { WorkflowFunctions, WorkflowFunctionContext } from '../workflow-function.interface';
import { Brand } from '../../form-config.service';

/**
 * Workflow-specific functions for SASO Demo Brand & Product workflow
 * Handles brand table building, product management, and related functionality
 */
export class SASODemoBrandProductFunctions implements WorkflowFunctions {
  workflowId = 'SASO_demo_brand_product';

  /**
   * Build brand table from selected brand and new brands
   */
  buildTables(
    model: Record<string, any>,
    fields: FormlyFieldConfig[],
    context?: WorkflowFunctionContext
  ): void {
    const loadedBrands = context?.loadedBrands || [];
    this.buildBrandTable(model, fields, loadedBrands);
  }

  /**
   * Handle model changes to update dependent data
   */
  onModelChange(
    model: Record<string, any>,
    fields: FormlyFieldConfig[],
    context?: WorkflowFunctionContext
  ): void {
    // Check if we have brand-related fields and update the table
    if (fields.some(f => f.key === 'brandTable')) {
      this.buildTables(model, fields, context);
    }
  }

  /**
   * Build brand table from selected brand and new brands
   */
  private buildBrandTable(
    model: Record<string, any>,
    fields: FormlyFieldConfig[],
    loadedBrands: Brand[]
  ): void {
    const tableData: any[] = [];

    console.log('SASO_demo: Building brand table with model:', model);
    console.log('SASO_demo: Loaded brands:', loadedBrands);

    // Add selected brand from dropdown
    if (model['selectedBrand']) {
      const brand = loadedBrands.find(b => b.id === model['selectedBrand']);
      if (brand) {
        console.log('SASO_demo: Adding existing brand:', brand);
        tableData.push({
          nameEn: brand.nameEn,
          nameAr: brand.nameAr,
          fileCount: brand.attachments?.length || 0,
          source: 'Existing'
        });
      }
    }

    // Add new brands from repeat field (only saved ones with _saved flag)
    if (model['newBrand'] && Array.isArray(model['newBrand'])) {
      console.log('SASO_demo: Processing new brands:', model['newBrand']);
      model['newBrand'].forEach((newBrand: any, index: number) => {
        console.log(`SASO_demo: New brand ${index}:`, newBrand);
        // Only include brands that have been saved (have _saved flag)
        if (newBrand._saved && (newBrand.brandNameEn || newBrand.brandNameAr)) {
          // Count attachments - handle both array and single file formats
          let fileCount = 0;
          if (newBrand.attachments) {
            if (Array.isArray(newBrand.attachments)) {
              fileCount = newBrand.attachments.length;
            } else if (newBrand.attachments.fileName) {
              fileCount = 1;
            }
          }
          console.log(`SASO_demo: Adding new brand: ${newBrand.brandNameEn}, files: ${fileCount}`);
          tableData.push({
            nameEn: newBrand.brandNameEn || '',
            nameAr: newBrand.brandNameAr || '',
            fileCount: fileCount,
            source: 'New'
          });
        } else {
          console.log(`SASO_demo: Skipping brand ${index} - not saved or missing names`);
        }
      });
    }

    console.log('SASO_demo: Final table data:', tableData);

    // Update the brandTable field
    model['brandTable'] = tableData;

    // Update the table field's value
    const tableField = fields.find(f => f.key === 'brandTable');
    if (tableField && tableField.formControl) {
      tableField.formControl.setValue(tableData);
      console.log('SASO_demo: Table field updated');
    } else {
      console.warn('SASO_demo: Brand table field not found!');
    }
  }
}

/**
 * Export singleton instance for use in the workflow function handler
 */
export const sasoDemoBrandProductFunctions = new SASODemoBrandProductFunctions();
