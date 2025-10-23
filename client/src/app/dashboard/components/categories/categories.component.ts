import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardCategory } from '../../models/dashboard.interfaces';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  categories: DashboardCategory[] = [];
  showModal = false;
  editingCategory: DashboardCategory | null = null;
  showErrors = false;
  showErrorModal = false;
  errorMessage = '';
  searchTerm = '';
  availabilityFilter = 'all';
  categoryForm = {
    name: '',
    description: ''
  };

  constructor(
    private dashboardService: DashboardService,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.apiService.getCategories().subscribe((categories: any) => {
      this.categories = categories.map((cat: any) => ({
        id: cat.id.toString(),
        name: cat.name,
        description: cat.description || '',
        available: cat.available !== undefined ? Boolean(cat.available) : true,
        itemCount: cat.itemCount || 0
      }));
    });
  }

  get availableCount(): number {
    return this.categories.filter(cat => cat.available).length;
  }

  get filteredCategories(): DashboardCategory[] {
    return this.categories.filter(category => {
      const matchesSearch = !this.searchTerm ||
        category.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesAvailability = this.availabilityFilter === 'all' ||
        (this.availabilityFilter === 'available' && category.available) ||
        (this.availabilityFilter === 'unavailable' && !category.available);

      return matchesSearch && matchesAvailability;
    });
  }

  onSearchChange(): void {
    // Trigger change detection
  }

  onAvailabilityFilterChange(): void {
    // Trigger change detection
  }

  toggleAvailability(categoryId: string): void {
    const category = this.categories.find(c => c.id === categoryId);
    if (category) {
      const newAvailability = !category.available;
      
      this.apiService.updateCategory(parseInt(categoryId), {
        name: category.name,
        description: category.description,
        available: newAvailability
      }).subscribe({
        next: () => {
          category.available = newAvailability;
          this.loadCategories(); // Reload to get updated item counts
        },
        error: (error) => {
          console.error('Error updating category availability:', error);
        }
      });
    }
  }

  openModal(): void {
    this.editingCategory = null;
    this.categoryForm = { name: '', description: '' };
    this.showErrors = false;
    this.showModal = true;
  }

  editCategory(category: DashboardCategory): void {
    this.editingCategory = category;
    this.categoryForm = { name: category.name, description: category.description };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingCategory = null;
    this.categoryForm = { name: '', description: '' };
  }

  saveCategory(): void {
    this.showErrors = true;
    
    if (!this.categoryForm.name?.trim()) {
      return;
    }

    if (this.editingCategory) {
      this.apiService.updateCategory(parseInt(this.editingCategory.id), this.categoryForm).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
        },
        error: (error) => {
          if (error.status === 409) {
            this.showDuplicateError(error.error.error);
          }
        }
      });
    } else {
      this.apiService.createCategory(this.categoryForm).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
        },
        error: (error) => {
          if (error.status === 409) {
            this.showDuplicateError(error.error.error);
          }
        }
      });
    }
  }

  deleteCategory(categoryId: string): void {
    const category = this.categories.find(c => c.id === categoryId);
    if (category && category.itemCount > 0) {
      alert(`Cannot delete category "${category.name}" because it has ${category.itemCount} menu items. Please move or delete the items first.`);
      return;
    }

    if (confirm('Are you sure you want to delete this category?')) {
      this.apiService.deleteCategory(parseInt(categoryId)).subscribe(() => {
        this.loadCategories();
      });
    }
  }

  showDuplicateError(message: string): void {
    this.errorMessage = message;
    this.showErrorModal = true;
  }

  closeErrorModal(): void {
    this.showErrorModal = false;
    this.errorMessage = '';
  }

  get isAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === 'admin';
  }
}