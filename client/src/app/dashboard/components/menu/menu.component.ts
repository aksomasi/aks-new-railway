import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardMenuItem, DashboardAddon } from '../../models/dashboard.interfaces';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-menu-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuDashboardComponent implements OnInit {
  menuItems: DashboardMenuItem[] = [];
  addons: DashboardAddon[] = [];
  categories: any[] = [];
  showModal = false;
  editingMenuItem: DashboardMenuItem | null = null;
  selectedCustomizations: string[] = [];
  selectedFile: File | null = null;
  showErrors = false;
  showErrorModal = false;
  errorMessage = '';
  searchTerm = '';
  categoryFilter = 'all';
  availabilityFilter = 'all';
  menuForm = {
    name: '',
    price: 0,
    category: 'Hot Dogs',
    description: ''
  };

  constructor(
    private dashboardService: DashboardService,
    public apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMenuItems();
    this.loadAddons();
    this.loadCategories();
  }

  private loadMenuItems(): void {
    this.apiService.getMenuItems().subscribe((items: any) => {
      this.menuItems = items.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        category: item.category_name || 'Other',
        available: item.available,
        description: item.description || '',
        imageUrl: item.image_url,
        customizationIds: item.addons ? item.addons.map((addon: any) => addon.id.toString()) : []
      }));
    });
  }

  private loadAddons(): void {
    this.apiService.getAddons().subscribe((addons: any) => {
      this.addons = addons.map((addon: any) => ({
        id: addon.id.toString(),
        name: addon.name,
        price: parseFloat(addon.price),
        available: addon.available !== undefined ? addon.available : true
      }));
      });
  }

  get availableCount(): number {
    return this.menuItems.filter(item => item.available).length;
  }

  get filteredMenuItems(): DashboardMenuItem[] {
    return this.menuItems.filter(item => {
      const matchesSearch = !this.searchTerm ||
        item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesCategory = this.categoryFilter === 'all' || item.category === this.categoryFilter;

      const matchesAvailability = this.availabilityFilter === 'all' ||
        (this.availabilityFilter === 'available' && item.available) ||
        (this.availabilityFilter === 'unavailable' && !item.available);

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }

  onSearchChange(): void {
    // Trigger change detection for search
  }

  onCategoryFilterChange(): void {
    // Trigger change detection for category filter
  }

  onAvailabilityFilterChange(): void {
    // Trigger change detection for availability filter
  }

  toggleAvailability(itemId: number): void {
    const item = this.menuItems.find(i => i.id === itemId);
    if (item) {
      const formData = new FormData();
      formData.append('name', item.name);
      formData.append('description', item.description);
      formData.append('price', item.price.toString());
      formData.append('category_id', (this.categories.find(cat => cat.name === item.category)?.id || 1).toString());
      formData.append('available', (!item.available).toString());
      formData.append('addons', JSON.stringify(item.customizationIds.map(id => parseInt(id))));
      
      this.apiService.updateMenuItem(itemId, formData).subscribe({
        next: () => {
          item.available = !item.available;
        },
        error: (error) => {
          console.error('Error updating availability:', error);
        }
      });
    }
  }

  openModal(): void {
    this.editingMenuItem = null;
    this.selectedCustomizations = [];
    this.menuForm = { name: '', price: 0, category: 'Hot Dogs', description: '' };
    this.selectedFile = null;
    this.showErrors = false;
    
    // Fetch latest categories and addons
    this.loadCategories();
    this.loadAddons();
    
    this.showModal = true;
  }

  private loadCategories(): void {
    this.apiService.getCategories().subscribe((categories: any) => {
      this.categories = categories;
      if (categories.length > 0 && !this.editingMenuItem) {
        this.menuForm.category = categories[0].name;
      }
    });
  }

  editMenuItem(item: DashboardMenuItem): void {
    this.editingMenuItem = item;
    this.selectedCustomizations = [...item.customizationIds];
    this.menuForm = {
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description
    };
    this.loadCategories();
    this.loadAddons();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingMenuItem = null;
    this.selectedCustomizations = [];
    this.selectedFile = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  toggleCustomization(addonId: string): void {
    const index = this.selectedCustomizations.indexOf(addonId);
    if (index > -1) {
      this.selectedCustomizations.splice(index, 1);
    } else {
      this.selectedCustomizations.push(addonId);
    }
  }

  isCustomizationSelected(addonId: string): boolean {
    return this.selectedCustomizations.includes(addonId);
  }

  saveMenuItem(): void {
    this.showErrors = true;
    
    if (!this.menuForm.name?.trim() || !this.menuForm.price || this.menuForm.price <= 0 || 
        !this.menuForm.category?.trim() || (!this.selectedFile && !this.editingMenuItem)) {
      return;
    }

    // Find category ID by name
    const selectedCategory = this.categories.find(cat => cat.name === this.menuForm.category);
    if (!selectedCategory) {
      alert('Please select a valid category');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.menuForm.name);
    formData.append('description', this.menuForm.description);
    formData.append('price', this.menuForm.price.toString());
    formData.append('category_id', selectedCategory.id.toString());
    formData.append('available', 'true');
    formData.append('addons', JSON.stringify(this.selectedCustomizations.map(id => parseInt(id))));
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    if (this.editingMenuItem) {
      // Update existing item using FormData
      const updateFormData = new FormData();
      updateFormData.append('name', this.menuForm.name);
      updateFormData.append('description', this.menuForm.description);
      updateFormData.append('price', this.menuForm.price.toString());
      updateFormData.append('category_id', selectedCategory.id.toString());
      updateFormData.append('available', 'true');
      updateFormData.append('addons', JSON.stringify(this.selectedCustomizations.map(id => parseInt(id))));
      if (this.selectedFile) {
        updateFormData.append('image', this.selectedFile);
      }
      
      this.apiService.updateMenuItem(this.editingMenuItem.id, updateFormData).subscribe({
        next: () => {
          this.loadMenuItems();
          this.closeModal();
        },
        error: (error) => {
          if (error.status === 409) {
            this.showDuplicateError(error.error.error);
          } else {
            console.error('Error updating menu item:', error);
            alert('Failed to update menu item');
          }
        }
      });
    } else {
      // Create new item with file upload
      this.apiService.createMenuItemWithImage(formData).subscribe({
        next: () => {
          this.loadMenuItems();
          this.closeModal();
        },
        error: (error) => {
          if (error.status === 409) {
            this.showDuplicateError(error.error.error);
          } else {
            console.error('Error creating menu item:', error);
            alert('Failed to create menu item');
          }
        }
      });
    }
  }

  deleteMenuItem(itemId: number): void {
    if (confirm('Are you sure you want to delete this menu item?')) {
      this.apiService.deleteMenuItem(itemId).subscribe({
        next: () => {
          this.loadMenuItems();
        },
        error: (error) => {
          console.error('Error deleting menu item:', error);
          alert('Failed to delete menu item');
        }
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

  getImageUrl(imageUrl?: string): string {
    return this.apiService.getImageUrl(imageUrl || '');
  }

  get isAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === 'admin';
  }
}