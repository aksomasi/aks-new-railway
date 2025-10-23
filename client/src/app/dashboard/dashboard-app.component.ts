import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrdersComponent } from './components/orders/orders.component';
import { MenuDashboardComponent } from './components/menu/menu.component';
import { AddonsComponent } from './components/addons/addons.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { HistoryComponent } from './components/history/history.component';
import { DashboardService } from './services/dashboard.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard-app',
  standalone: true,
  imports: [CommonModule, OrdersComponent, MenuDashboardComponent, AddonsComponent, CategoriesComponent, HistoryComponent],
  templateUrl: './dashboard-app.component.html',
  styleUrls: ['./dashboard-app.component.scss']
})
export class DashboardAppComponent implements AfterViewInit {
  currentTab = 'orders';
  @ViewChild(OrdersComponent) ordersComponent!: OrdersComponent;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngAfterViewInit() {}

  get newOrdersCount(): number {
    return this.ordersComponent?.getNewOrdersCount() || 0;
  }

  get totalOrdersCount(): number {
    return this.ordersComponent?.getNewOrdersCount() || 0;
  }

  showTab(tabName: string): void {
    this.currentTab = tabName;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }
}