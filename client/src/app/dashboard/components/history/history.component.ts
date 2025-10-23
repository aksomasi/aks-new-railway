import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardOrder } from '../../models/dashboard.interfaces';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  completedOrders: DashboardOrder[] = [];
  selectedDate: string = '';
  maxDate: string = '';

  constructor(
    private dashboardService: DashboardService,
    private apiService: ApiService
  ) {
    // Set today's date as default and max date
    const today = new Date().toISOString().split('T')[0];
    this.selectedDate = today;
    this.maxDate = today;
  }

  ngOnInit(): void {
    this.loadOrdersByDate();
  }

  onDateChange(): void {
    this.loadOrdersByDate();
  }

  private loadOrdersByDate(): void {
    this.apiService.getOrders().subscribe((orders: any) => {
      const selectedDateObj = new Date(this.selectedDate);
      this.completedOrders = orders
        .filter((order: any) => {
          const orderDate = new Date(order.created_at);
          return orderDate.toDateString() === selectedDateObj.toDateString();
        })
        .map((order: any) => ({
          id: order.id.toString(),
          status: order.status,
          full_name: order.full_name || 'N/A',
          plate: order.plate || 'N/A',
          car_details: order.car_details || 'N/A',
          items: (order.items || []).map((item: any) => ({
            name: item.menu_item_name || item.name,
            qty: item.quantity,
            price: parseFloat(item.unit_price) || 0,
            customizations: this.parseAddons(item.customizations)
          })),
          total: parseFloat(order.total),
          timestamp: new Date(order.created_at),
          estimatedTime: 15,
          completedAt: order.status === 'completed' ? new Date(order.created_at) : undefined
        }));
    });
  }

  private parseAddons(customizations: any): string[] {
    if (!customizations) return [];
    if (typeof customizations === 'string') {
      try {
        const parsed = JSON.parse(customizations);
        return Array.isArray(parsed) ? parsed.map(addon => addon.name || String(addon)) : [];
      } catch {
        return [];
      }
    }
    if (Array.isArray(customizations)) {
      return customizations.map(addon => {
        if (typeof addon === 'object' && addon.name) {
          return addon.name;
        }
        return String(addon);
      });
    }
    return [];
  }
}