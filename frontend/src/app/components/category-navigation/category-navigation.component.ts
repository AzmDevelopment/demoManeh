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
      id: 'beauty',
      name: 'Beauty',
      icon: 'bi-stars',
      description: 'Cosmetics and beauty products',
      formConfigFile: 'workflows/Definitions/BT501_shampoo'
    }
  ];

  constructor(private router: Router) {}

  navigateToForm(category: CategoryConfig): void {
    this.router.navigate(['/form', category.formConfigFile]);
  }
}
