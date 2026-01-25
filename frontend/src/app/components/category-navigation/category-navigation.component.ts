import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface CategoryConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  formConfigFile: string;
}

@Component({
  selector: 'app-category-navigation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-navigation.component.html',
  styleUrl: './category-navigation.component.css'
})
export class CategoryNavigationComponent {
  categories: CategoryConfig[] = [
    {
      id: 'lithium-battery',
      name: 'Lithium Battery',
      icon: 'bi-battery-charging',
      description: 'Battery products and components',
      formConfigFile: 'workflows/Definitions/CT401_lithium_battery_new'
    },
    {
      id: 'cement',
      name: 'Cement',
      icon: 'bi-building',
      description: 'Construction and cement products',
      formConfigFile: 'cement-local'
    },
    {
      id: 'beauty',
      name: 'Beauty',
      icon: 'bi-stars',
      description: 'Cosmetics and beauty products',
      formConfigFile: 'beauty-local'
    },
    {
      id: 'paper',
      name: 'Paper',
      icon: 'bi-file-earmark',
      description: 'Paper and stationery products',
      formConfigFile: 'paper-local'
    },
    {
      id: 'textiles',
      name: 'Textiles',
      icon: 'bi-basket',
      description: 'Fabric and textile products',
      formConfigFile: 'textiles-local'
    },
    {
      id: 'food-beverages',
      name: 'Food & Beverages',
      icon: 'bi-cup-hot',
      description: 'Food and beverage products',
      formConfigFile: 'food-beverages-local'
    },
    {
      id: 'pharmaceuticals',
      name: 'Pharmaceuticals',
      icon: 'bi-capsule',
      description: 'Medical and pharmaceutical products',
      formConfigFile: 'pharmaceuticals-local'
    }
  ];

  constructor(private router: Router) {}

  navigateToForm(category: CategoryConfig): void {
    this.router.navigate(['/form', category.formConfigFile]);
  }
}
