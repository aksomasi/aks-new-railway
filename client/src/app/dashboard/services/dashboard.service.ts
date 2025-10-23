import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DashboardOrder, DashboardMenuItem, DashboardAddon, DashboardCategory } from '../models/dashboard.interfaces';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private ordersSubject = new BehaviorSubject<DashboardOrder[]>([
    {
      id: 'WG12345',
      status: 'new',
      full_name: 'John Doe',
      plate: 'ABC-1234',
      car_details: 'Black SUV',
      items: [
        { name: 'Chili Cheese Dog', qty: 2, price: 3.99, customizations: ['Extra Cheese'] },
        { name: 'French Fries', qty: 1, price: 2.99, customizations: [] }
      ],
      total: 11.85,
      timestamp: new Date(Date.now() - 5 * 60000),
      estimatedTime: 12
    },
    {
      id: 'WG12346',
      status: 'new',
      full_name: 'Sarah Wilson',
      plate: 'XYZ-9876',
      car_details: 'White Sedan',
      items: [
        { name: 'Deluxe Cheeseburger', qty: 1, price: 5.49, customizations: [] }
      ],
      total: 5.92,
      timestamp: new Date(Date.now() - 3 * 60000),
      estimatedTime: 15
    },
    {
      id: 'WG12344',
      status: 'preparing',
      full_name: 'Jane Smith',
      plate: 'XYZ-5678',
      car_details: 'Red Sedan',
      items: [
        { name: 'Deluxe Cheeseburger', qty: 1, price: 5.49, customizations: ['Extra Bacon'] },
        { name: 'Chili Cheese Fries', qty: 1, price: 4.49, customizations: [] },
        { name: 'Chocolate Shake', qty: 1, price: 3.99, customizations: [] }
      ],
      total: 15.09,
      timestamp: new Date(Date.now() - 12 * 60000),
      estimatedTime: 5
    },
    {
      id: 'WG12343',
      status: 'ready',
      full_name: 'Mike Johnson',
      plate: 'DEF-9012',
      car_details: 'Blue Truck',
      items: [
        { name: 'Chicago Dog', qty: 3, price: 4.79, customizations: [] }
      ],
      total: 15.52,
      timestamp: new Date(Date.now() - 18 * 60000),
      estimatedTime: 0
    }
  ]);

  private completedOrdersSubject = new BehaviorSubject<DashboardOrder[]>([
    {
      id: 'WG12340',
      status: 'completed',
      full_name: 'Tom Brown',
      plate: 'GHI-3456',
      car_details: 'Silver Sedan',
      items: [{ name: 'Original Mustard Dog', qty: 2, price: 2.79, customizations: [] }],
      total: 6.02,
      timestamp: new Date(Date.now() - 60 * 60000),
      estimatedTime: 0,
      completedAt: new Date(Date.now() - 30 * 60000)
    }
  ]);

  orders$ = this.ordersSubject.asObservable();
  completedOrders$ = this.completedOrdersSubject.asObservable();

  getMenuItems(): Observable<DashboardMenuItem[]> {
    return of([
      { id: 1, name: 'Chili Cheese Dog', price: 3.99, category: 'Hot Dogs', available: true, description: 'Signature chili, shredded cheddar on a grilled dog', customizationIds: ['c1', 'c2', 'c3'] },
      { id: 2, name: 'Original Mustard Dog', price: 2.79, category: 'Hot Dogs', available: true, description: 'Classic yellow mustard on a steamed bun', customizationIds: ['c4', 'c5'] },
      { id: 3, name: 'Chicago Dog', price: 4.79, category: 'Hot Dogs', available: false, description: 'Dragged through the garden with all the fixings', customizationIds: [] },
      { id: 4, name: 'Deluxe Cheeseburger', price: 5.49, category: 'Burgers', available: true, description: 'Lettuce, tomato, pickles, special sauce', customizationIds: ['c9'] },
      { id: 5, name: 'Chocolate Shake', price: 3.99, category: 'Drinks', available: true, description: 'Rich and creamy', customizationIds: ['c10', 'c11'] }
    ]);
  }

  getAddons(): Observable<DashboardAddon[]> {
    return of([
      { id: 'c1', name: 'Extra Cheese', price: 0.50, available: true },
      { id: 'c2', name: 'Extra Chili', price: 0.75, available: true },
      { id: 'c3', name: 'No Onions', price: 0, available: true },
      { id: 'c4', name: 'Extra Mustard', price: 0, available: true },
      { id: 'c5', name: 'Add Relish', price: 0.25, available: true },
      { id: 'c9', name: 'Extra Bacon', price: 1.50, available: true },
      { id: 'c10', name: 'Extra Thick', price: 0.50, available: true },
      { id: 'c11', name: 'Whipped Cream', price: 0.25, available: true }
    ]);
  }

  getCategories(): Observable<DashboardCategory[]> {
    return of([
      { id: 'cat1', name: 'Hot Dogs', description: 'Classic hot dogs and specialty sausages', available: true, itemCount: 3 },
      { id: 'cat2', name: 'Burgers', description: 'Juicy beef burgers with fresh toppings', available: true, itemCount: 2 },
      { id: 'cat3', name: 'Fries & Sides', description: 'Crispy fries and delicious side dishes', available: true, itemCount: 2 },
      { id: 'cat4', name: 'Drinks', description: 'Refreshing beverages and shakes', available: true, itemCount: 2 },
      { id: 'cat5', name: 'Desserts', description: 'Sweet treats and desserts', available: false, itemCount: 1 },
      { id: 'cat6', name: 'Breakfast', description: 'Morning favorites', available: false, itemCount: 0 }
    ]);
  }

  changeOrderStatus(orderId: string, newStatus: 'preparing' | 'ready' | 'completed'): void {
    const orders = this.ordersSubject.value;
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
      if (newStatus === 'completed') {
        order.completedAt = new Date();
        order.status = 'completed';
        const completedOrders = this.completedOrdersSubject.value;
        this.completedOrdersSubject.next([order, ...completedOrders]);
        this.ordersSubject.next(orders.filter(o => o.id !== orderId));
      } else {
        order.status = newStatus;
        this.ordersSubject.next([...orders]);
      }
    }
  }

  get newOrdersCount(): number {
    return this.ordersSubject.value.filter(o => o.status === 'new').length;
  }

  get totalOrdersCount(): number {
    return this.ordersSubject.value.length;
  }
}