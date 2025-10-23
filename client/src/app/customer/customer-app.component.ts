import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { LandingComponent } from './components/landing/landing.component';
import { MenuComponent } from './components/menu/menu.component';
import { CartComponent } from './components/cart/cart.component';
import { ConfirmationComponent } from './components/confirmation/confirmation.component';
import { CustomizeModalComponent } from './components/customize-modal/customize-modal.component';
import { Customer, MenuItem, CustomizationOption } from './models/interfaces';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-customer-app',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    LandingComponent,
    MenuComponent,
    CartComponent,
    ConfirmationComponent,
    CustomizeModalComponent
  ],
  templateUrl: './customer-app.component.html',
  styleUrls: ['./customer-app.component.scss']
})
export class CustomerAppComponent {
  currentView = 'landing';
  selectedCategory = '';

  constructor(private apiService: ApiService) {}
  customer: Customer = {
    fullName: '',
    plate: '',
    carDetails: ''
  };
  orderNumber = '';
  currentCustomizeItem: MenuItem | null = null;
  currentCustomizeOptions: CustomizationOption[] = [];

  onContinue(customer: Customer): void {
    this.customer = customer;
    this.currentView = 'menu';
  }

  onShowCart(): void {
    this.currentView = 'cart';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onShowMenu(): void {
    this.currentView = 'menu';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onShowCustomize(data: {item: MenuItem, options: CustomizationOption[]}): void {
    this.currentCustomizeItem = data.item;
    this.currentCustomizeOptions = data.options;
    this.currentView = 'customize';
  }

  onCloseCustomize(): void {
    this.currentView = 'menu';
    this.currentCustomizeItem = null;
    this.currentCustomizeOptions = [];
  }

  onOrderPlaced(orderNumber: string): void {
    this.orderNumber = orderNumber;
    this.currentView = 'confirmation';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onNewOrder(): void {
    this.currentView = 'menu';
  }

  onCategoryChanged(category: string): void {
    this.selectedCategory = category;
  }

  onResetOrder(): void {
    this.currentView = 'landing';
    this.customer = {
      fullName: '',
      plate: '',
      carDetails: ''
    };
  }
}