import { Component, OnInit, OnChanges, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem, CustomizationOption } from '../../models/interfaces';
import { OrderService } from '../../services/order.service';
import { CartService } from '../../services/cart.service';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnChanges {
  @Input() selectedCategory: string = '';
  @Output() showCart = new EventEmitter<void>();
  @Output() showCustomize = new EventEmitter<{item: MenuItem, options: any[]}>();
  @Output() categoryChanged = new EventEmitter<string>();

  menuItems: { [key: string]: MenuItem[] } = {};
  currentCategory = '';
  customizationOptions: { [key: string]: CustomizationOption[] } = {};

  constructor(
    private orderService: OrderService,
    private cartService: CartService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadMenuItems();
  }

  ngOnChanges(): void {
    if (this.selectedCategory && this.categories.includes(this.selectedCategory)) {
      this.currentCategory = this.selectedCategory;
    }
  }

  private loadAddons(): void {
    this.apiService.getAddons().subscribe((addons: any) => {
      const mappedAddons = addons.map((addon: any) => ({
        id: addon.id.toString(),
        name: addon.name,
        price: parseFloat(addon.price),
        available: addon.available !== undefined ? Boolean(addon.available) : true
      }));
      
      // Set addons for all categories
      this.categories.forEach(category => {
        this.customizationOptions[category] = mappedAddons;
      });
    });
  }

  private loadMenuItems(): void {
    // Load categories first
    this.apiService.getCategories().subscribe((categories: any) => {
      // Load menu items
      this.apiService.getMenuItems().subscribe((items: any) => {
        // Group items by category_name, only include categories with items
        this.menuItems = {};
        categories.forEach((category: any) => {
          const categoryItems = items
            .filter((item: any) => item.category_id === category.id)
            .map((item: any) => ({
              id: item.id,
              name: item.name,
              description: item.description,
              price: parseFloat(item.price),
              image: item.image_url,
              image_url: item.image_url,
              category: category.name,
              available: item.available,
              addons: item.addons
            }));
          
          // Only add category if it has items
          if (categoryItems.length > 0) {
            this.menuItems[category.name] = categoryItems;
          }
        });
        
        // Set category from input or first category as current
        if (this.selectedCategory && this.categories.includes(this.selectedCategory)) {
          this.currentCategory = this.selectedCategory;
        } else if (this.categories.length > 0) {
          this.currentCategory = this.categories[0];
        }
        
        // Load addons after categories are loaded
        this.loadAddons();
      });
    });
  }

  get categories(): string[] {
    return Object.keys(this.menuItems);
  }

  get currentMenuItems(): MenuItem[] {
    return this.menuItems[this.currentCategory] || [];
  }

  get hasCustomizations(): boolean {
    return !!this.customizationOptions[this.currentCategory];
  }

  hasAvailableCustomizations(item: MenuItem): boolean {
    return !!(item.addons && item.addons.filter(addon => addon.available !== false).length > 0);
  }

  get cartCount(): number {
    return this.cartService.cartCount;
  }

  get cartTotal(): number {
    return this.cartService.cartTotal;
  }

  setCategory(category: string): void {
    this.currentCategory = category;
    this.categoryChanged.emit(category);
    this.scrollToSelectedTab();
  }

  private scrollToSelectedTab(): void {
    setTimeout(() => {
      const tabsContainer = document.querySelector('.category-tabs');
      const selectedTab = document.querySelector('.category-tab.active');
      
      if (tabsContainer && selectedTab) {
        const containerRect = tabsContainer.getBoundingClientRect();
        const tabRect = selectedTab.getBoundingClientRect();
        
        if (tabRect.right > containerRect.right - 50) {
          tabsContainer.scrollLeft += 150;
        } else if (tabRect.left < containerRect.left + 50) {
          tabsContainer.scrollLeft -= 150;
        }
      }
    }, 50);
  }

  addToCart(item: MenuItem): void {
    if (!item.available) {
      return; // Don't add unavailable items
    }
    
    if (this.hasAvailableCustomizations(item)) {
      this.showCustomize.emit({
        item: item,
        options: item.addons || []
      });
    } else {
      this.cartService.addItem({ ...item, qty: 1, customizations: [], customPrice: 0 });
    }
  }

  getFullImageUrl(imagePath: any): string {
  return this.apiService.getImageUrl(imagePath);
}

}