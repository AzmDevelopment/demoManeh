import { FormlyFieldConfig } from '@ngx-formly/core';
import { WorkflowFunctions, WorkflowFunctionContext } from '../workflow-function.interface';
import { Brand } from '../../form-config.service';

/**
 * Workflow-specific functions for SASO Test Workflow
 * Handles brand table building, product management, and related functionality
 */
export class SASOTestWorkflowFunctions implements WorkflowFunctions {
  workflowId = 'saso_test_workflow';

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

    // Add selected brand from dropdown
    if (model['selectedBrand']) {
      const brand = loadedBrands.find(b => b.id === model['selectedBrand']);
      if (brand) {
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
      model['newBrand'].forEach((newBrand: any) => {
        // Skip null/undefined items
        if (!newBrand) return;

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
          tableData.push({
            nameEn: newBrand.brandNameEn || '',
            nameAr: newBrand.brandNameAr || '',
            fileCount: fileCount,
            source: 'New'
          });
        }
      });
    }

    // Update the brandTable field
    model['brandTable'] = tableData;

    // Update the table field's value (emitEvent: false prevents infinite loop)
    const tableField = fields.find(f => f.key === 'brandTable');
    if (tableField && tableField.formControl) {
      tableField.formControl.setValue(tableData, { emitEvent: false });
    }
  }
}

/**
 * Export singleton instance for use in the workflow function handler
 */
export const sasoTestWorkflowFunctions = new SASOTestWorkflowFunctions();
