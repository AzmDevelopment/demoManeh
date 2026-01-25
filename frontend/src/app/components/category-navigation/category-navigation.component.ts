import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { WorkflowService, WorkflowDefinition } from '../../services/workflow.service';

export interface CategoryConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  formConfigFile: string;
  metadata?: any;
}

@Component({
  selector: 'app-category-navigation',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [WorkflowService],
  templateUrl: './category-navigation.component.html',
  styleUrl: './category-navigation.component.css'
})
export class CategoryNavigationComponent implements OnInit {
  categories: CategoryConfig[] = [];
  loading = false;
  error: string | null = null;

  // Icon mapping based on workflow code or certificate type
  private iconMap: { [key: string]: string } = {
    'CT401': 'bi-battery-charging',
    'lithium_battery': 'bi-battery-charging',
    'lithium_polymer': 'bi-battery-half',
    'BT501': 'bi-stars',
    'beauty': 'bi-stars',
    'cosmetics': 'bi-droplet',
    'shampoo': 'bi-droplet',
    'default': 'bi-file-earmark-text'
  };

  constructor(
    private router: Router,
    private workflowService: WorkflowService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadWorkflowDefinitions();
  }

  /**
   * Load workflow definitions from API
   */
  loadWorkflowDefinitions(): void {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges(); // Force change detection

    this.workflowService.getWorkflowDefinitions().subscribe({
      next: (definitions: WorkflowDefinition[]) => {
        console.log('Raw API response:', definitions);
        this.categories = this.mapDefinitionsToCategories(definitions);
        console.log('Mapped categories:', this.categories);
        this.loading = false;
        this.cdr.detectChanges(); // Force change detection after data loads
      },
      error: (err) => {
        console.error('Error loading workflow definitions:', err);
        this.error = 'Failed to load workflow categories. Please try again later.';
        this.loading = false;
        this.cdr.detectChanges(); // Force change detection
        
        // Fallback to hardcoded categories if API fails
        this.loadFallbackCategories();
      }
    });
  }

  /**
   * Map API workflow definitions to category config format
   */
  private mapDefinitionsToCategories(definitions: WorkflowDefinition[]): CategoryConfig[] {
    console.log('Mapping definitions, count:', definitions.length);
    
    return definitions.map(def => {
      const category = {
        id: this.extractCategoryId(def),
        name: def.name,
        icon: this.getIconForDefinition(def),
        description: def.description || 'No description available',
        formConfigFile: `workflows/Definitions/${def.certificationId}`,
        metadata: def.metadata
      };
      
      console.log('Mapped category:', category);
      return category;
    });
  }

  /**
   * Extract a simple category ID from certification ID
   */
  private extractCategoryId(definition: WorkflowDefinition): string {
    // Convert "CT401_lithium_battery_new" to "lithium-battery"
    // or "BT501_shampoo" to "shampoo"
    const parts = definition.certificationId.split('_');
    console.log('Extracting category ID from:', definition.certificationId, 'parts:', parts);
    
    if (parts.length > 2) {
      // Format: CT401_lithium_battery_new -> remove first and last
      const categoryParts = parts.slice(1, -1);
      return categoryParts.join('-').toLowerCase();
    } else if (parts.length === 2) {
      // Format: BT501_shampoo -> remove first part
      return parts[1].toLowerCase();
    }
    
    // Fallback to full ID
    return definition.certificationId.toLowerCase();
  }

  /**
   * Get appropriate icon for workflow definition
   */
  private getIconForDefinition(definition: WorkflowDefinition): string {
    // Try to match by workflow code
    if (definition.metadata?.workflowCode) {
      const icon = this.iconMap[definition.metadata.workflowCode];
      if (icon) return icon;
    }

    // Try to match by certificate types
    if (definition.metadata?.applicableCertificateTypes) {
      for (const type of definition.metadata.applicableCertificateTypes) {
        const icon = this.iconMap[type];
        if (icon) return icon;
      }
    }

    // Try to match by certification ID
    for (const key in this.iconMap) {
      if (definition.certificationId.toLowerCase().includes(key.toLowerCase())) {
        return this.iconMap[key];
      }
    }

    // Default icon
    return this.iconMap['default'];
  }

  /**
   * Fallback categories if API fails
   */
  private loadFallbackCategories(): void {
    this.categories = [
      {
        id: 'lithium-battery',
        name: 'Lithium Battery',
        icon: 'bi-battery-charging',
        description: 'Battery products and components',
        formConfigFile: 'workflows/Definitions/CT401_lithium_battery_new'
      },
      {
        id: 'beauty',
        name: 'Beauty',
        icon: 'bi-stars',
        description: 'Cosmetics and beauty products',
        formConfigFile: 'workflows/Definitions/BT501_shampoo'
      }
    ];
  }

  /**
   * Navigate to workflow form
   */
  async navigateToForm(category: CategoryConfig): Promise<void> {
    try {
      // Extract certification ID from formConfigFile
      // e.g., "workflows/Definitions/CT401_lithium_battery_new" -> "CT401_lithium_battery_new"
      const certificationId = category.formConfigFile.split('/').pop() || category.id;
      
      console.log('=== NAVIGATION DEBUG ===');
      console.log('Category clicked:', category.name);
      console.log('Certification ID:', certificationId);
      
      // Check if user has an in-progress workflow for this certification
      const existingInstance = await this.checkForExistingInstance(certificationId);
      
      if (existingInstance) {
        console.log('=== FOUND EXISTING INSTANCE ===');
        console.log('Instance ID:', existingInstance.id);
        console.log('Definition ID:', existingInstance.definitionId);
        console.log('Current Step:', existingInstance.currentStep);
        console.log('Status:', existingInstance.status);
        console.log('Full instance object:', existingInstance);
        
        // Navigate to the current step of existing instance
        this.navigateToCurrentStep(existingInstance);
      } else {
        console.log('=== NO EXISTING INSTANCE - CREATING NEW ===');
        // Create new workflow instance
        await this.createNewWorkflowInstance(certificationId);
      }
    } catch (error) {
      console.error('Error navigating to workflow:', error);
      this.error = 'Failed to start workflow. Please try again.';
    }
  }

  /**
   * Check if user has an in-progress workflow instance for this certification
   */
  private async checkForExistingInstance(certificationId: string): Promise<any | null> {
    try {
      console.log('=== CHECKING FOR EXISTING INSTANCES ===');
      console.log('Looking for certification ID:', certificationId);
      
      // Get all in-progress workflows (you might want to filter by user)
      const instances = await this.workflowService.getWorkflowsByStatus('in_progress').toPromise();
      
      console.log('All in-progress instances:', instances);
      console.log('Number of in-progress instances:', instances?.length || 0);
      
      // Find instance matching this certification ID
      const matchingInstance = instances?.find(
        (instance: any) => {
          console.log(`Comparing: "${instance.definitionId}" === "${certificationId}"`);
          return instance.definitionId === certificationId;
        }
      );
      
      if (matchingInstance) {
        console.log('=== MATCH FOUND ===');
        console.log('Matching instance:', matchingInstance);
      } else {
        console.log('=== NO MATCH FOUND ===');
      }
      
      return matchingInstance || null;
    } catch (error) {
      console.error('Error checking for existing instance:', error);
      return null;
    }
  }

  /**
   * Create a new workflow instance
   */
  private async createNewWorkflowInstance(certificationId: string): Promise<void> {
    try {
      const userEmail = this.getCurrentUserEmail();
      
      const newInstance = await this.workflowService.createWorkflowInstance({
        certificationId: certificationId,
        createdBy: userEmail,
        priority: 3
      }).toPromise();
      
      console.log('Created new workflow instance:', newInstance);
      
      if (newInstance) {
        this.navigateToCurrentStep(newInstance);
      }
    } catch (error) {
      console.error('Error creating workflow instance:', error);
      throw error;
    }
  }

  /**
   * Navigate to the current step of a workflow instance
   */
  private navigateToCurrentStep(instance: any): void {
    const instanceId = instance.id;
    const currentStep = instance.currentStep;
    
    console.log(`=== NAVIGATING TO STEP ===`);
    console.log(`Instance ID: ${instanceId}`);
    console.log(`Current Step: ${currentStep}`);
    console.log(`Full URL: /workflow/${instanceId}/step/${currentStep}`);
    
    // Force navigation refresh to ensure component reloads with correct data
    // First navigate away (without changing displayed URL)
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      // Then navigate to the correct step
      this.router.navigate(['/workflow', instanceId, 'step', currentStep]).then(() => {
        console.log('=== NAVIGATION COMPLETE ===');
      });
    });
  }

  /**
   * Get current user email (replace with your auth service)
   */
  private getCurrentUserEmail(): string {
    // TODO: Get from your authentication service
    return 'user@example.com';
  }
}
