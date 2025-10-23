import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardAddon } from '../../models/dashboard.interfaces';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-addons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './addons.component.html',
  styleUrls: ['./addons.component.scss']
})
export class AddonsComponent implements OnInit {
  addons: DashboardAddon[] = [];
  showModal = false;
  editingAddon: DashboardAddon | null = null;
  showErrors = false;
  showErrorModal = false;
  errorMessage = '';
  searchTerm = '';
  availabilityFilter = 'all';
  addonForm: {
    name: string;
    price: number | null;
  } = {
    name: '',
    price: null
  };

  constructor(
    private dashboardService: DashboardService,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAddons();
  }

  private loadAddons(): void {
    this.apiService.getAddons().subscribe((addons: any) => {
      this.addons = addons.map((addon: any) => ({
        id: addon.id.toString(),
        name: addon.name,
        price: parseFloat(addon.price),
        available: addon.available !== undefined ? Boolean(addon.available) : true
      }));
    });
  }

  get availableCount(): number {
    return this.addons.filter(addon => addon.available).length;
  }

  get filteredAddons(): DashboardAddon[] {
    return this.addons.filter(addon => {
      const matchesSearch = !this.searchTerm ||
        addon.name.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesAvailability = this.availabilityFilter === 'all' ||
        (this.availabilityFilter === 'available' && addon.available) ||
        (this.availabilityFilter === 'unavailable' && !addon.available);

      return matchesSearch && matchesAvailability;
    });
  }

  onSearchChange(): void {
    // Trigger change detection
  }

  onAvailabilityFilterChange(): void {
    // Trigger change detection
  }

  toggleAvailability(addonId: string): void {
    const addon = this.addons.find(a => a.id === addonId);
    if (addon) {
      const newAvailability = !addon.available;
      this.apiService.updateAddon(parseInt(addonId), {
        name: addon.name,
        price: addon.price,
        available: newAvailability
      }).subscribe({
        next: () => {
          addon.available = newAvailability;
        },
        error: (error) => {
          console.error('Error updating addon availability:', error);
        }
      });
    }
  }

  openModal(): void {
    this.editingAddon = null;
    this.addonForm = { name: '', price: null };
    this.showErrors = false;
    this.showModal = true;
  }

  editAddon(addon: DashboardAddon): void {
    this.editingAddon = addon;
    this.addonForm = { name: addon.name, price: addon.price };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingAddon = null;
    this.addonForm = { name: '', price: null };
  }

  saveAddon(): void {
    this.showErrors = true;
    
    if (!this.addonForm.name?.trim() || this.addonForm.price === null || this.addonForm.price === undefined || this.addonForm.price < 0) {
      return;
    }

    if (this.editingAddon) {
      this.apiService.updateAddon(parseInt(this.editingAddon.id), this.addonForm).subscribe({
        next: () => {
          this.loadAddons();
          this.closeModal();
        },
        error: (error) => {
          if (error.status === 409) {
            this.showDuplicateError(error.error.error);
          }
        }
      });
    } else {
      this.apiService.createAddon(this.addonForm).subscribe({
        next: () => {
          this.loadAddons();
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

  deleteAddon(addonId: string): void {
    if (confirm('Are you sure? This will remove this customization from all menu items.')) {
      this.apiService.deleteAddon(parseInt(addonId)).subscribe(() => {
        this.loadAddons();
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