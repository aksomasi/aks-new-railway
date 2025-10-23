import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardOrder } from '../../models/dashboard.interfaces';
import { ApiService } from '../../../services/api.service';
import { WebsocketService } from '../../../services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: DashboardOrder[] = [];
  filteredOrders: DashboardOrder[] = [];
  searchTerm: string = '';
  statusFilter: string = 'all';
  private subscriptions: Subscription[] = [];

  constructor(
    private dashboardService: DashboardService,
    private apiService: ApiService,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.loadInitialOrders();
    this.setupWebSocketListeners();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.websocketService.disconnect();
  }

  private loadInitialOrders(): void {
    const sub = this.apiService.getOrders().subscribe((orders: any) => {
      const today = new Date();
      this.orders = orders
      
        .filter((order: any) => {
          const orderDate = new Date(order.created_at);
          return orderDate.toDateString() === today.toDateString();
        })
        
        .map((order: any) => ({
           
          id: order.id.toString(),
          status: order.status === 'pending' ? 'new' : order.status,
          full_name: order.full_name || '',
          plate: order.plate || '',
          car_details: order.car_details || '',
          items: (order.items || []).map((item: any) => ({
            name: item.menu_item_name || item.name,
            qty: item.quantity,
            price: item.price,
            customizations: this.parseAddons(item.customizations)
          })),
          total: parseFloat(order.total),
          timestamp: new Date(order.created_at),
          estimatedTime: 15
        }));
      this.applyFilters();
    });
    this.subscriptions.push(sub);
  }

  private setupWebSocketListeners(): void {
    const newOrderSub = this.websocketService.onNewOrder().subscribe((order: any) => {
      const dashboardOrder: DashboardOrder = {
        id: order.id.toString(),
        status: order.status === 'pending' ? 'new' : order.status,
        full_name: order.full_name || order.customer?.name || '',
        plate: order.plate || '',
        car_details: order.car_details || '',
        items: (order.items || []).map((item: any) => ({
          name: item.name,
          qty: item.quantity,
          price: item.price,
          customizations: this.parseAddons(item.addons)
        })),
        total: parseFloat(order.total),
        timestamp: new Date(),
        estimatedTime: 15
      };
      this.orders.unshift(dashboardOrder);
      this.applyFilters();
    });

    const orderUpdateSub = this.websocketService.onOrderUpdate().subscribe((update: any) => {
      const orderIndex = this.orders.findIndex(o => o.id === update.id.toString());
      if (orderIndex !== -1) {
        this.orders[orderIndex].status = update.status;
      }
    });

    this.subscriptions.push(newOrderSub, orderUpdateSub);
  }

  getOrdersByStatus(status: string): DashboardOrder[] {
    return this.filteredOrders.filter(order => order.status === status);
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.orders];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(order => {
        return order.id.toLowerCase().includes(term) ||
               (order.full_name || '').toLowerCase().includes(term) ||
               (order.plate || '').toLowerCase().includes(term);
      });
    }

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }

    this.filteredOrders = filtered;
  }

  changeOrderStatus(orderId: string, newStatus: 'preparing' | 'ready' | 'completed'): void {
    this.apiService.updateOrderStatus(parseInt(orderId), newStatus).subscribe({
      next: () => {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
          order.status = newStatus;
        }
      },
      error: (error: any) => {
        console.error('Failed to update order status:', error);
      }
    });
  }

  getStatusConfig() {
    return [
      { id: 'new', title: 'New Orders', subtitle: 'Need to accept', class: 'new' },
      { id: 'preparing', title: 'Preparing', subtitle: 'In the kitchen', class: 'preparing' },
      { id: 'ready', title: 'Ready for Pickup', subtitle: 'Waiting for customer', class: 'ready' }
    ];
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private parseAddons(addons: any): string[] {
    if (!addons) return [];
    if (typeof addons === 'string') {
      try {
        const parsed = JSON.parse(addons);
        return Array.isArray(parsed) ? parsed.map(String) : [];
      } catch {
        return [];
      }
    }
    if (Array.isArray(addons)) {
      return addons.map(addon => {
        if (typeof addon === 'object' && addon.name) {
          return addon.name;
        }
        return String(addon);
      });
    }
    return [];
  }

  getNewOrdersCount(): number {
    return this.filteredOrders.filter(order => order.status === 'new').length;
  }
}