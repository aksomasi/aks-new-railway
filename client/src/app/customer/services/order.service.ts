import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Order, OrderResponse, MenuItem } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'https://api.wienerschnitzel.com'; // Replace with actual API

  constructor(private http: HttpClient) {}

  getMenuItems(): Observable<{[key: string]: MenuItem[]}> {
    // Mock API call - replace with actual API
    const menuItems = {
      'Hot Dogs': [
        { id: 1, name: 'Chili Cheese Dog', price: 3.99, desc: 'Signature chili, shredded cheddar on a grilled dog', image: 'https://images.unsplash.com/photo-1612392062798-2407339f5834?w=400&h=300&fit=crop&q=80' },
        { id: 2, name: 'Original Mustard Dog', price: 2.79, desc: 'Classic yellow mustard on a steamed bun', image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&h=300&fit=crop&q=80' },
        { id: 3, name: 'Deluxe Dog', price: 4.49, desc: 'Loaded with chili, cheese, onions, and mustard', image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=400&h=300&fit=crop&q=80' }
      ],
      'Burgers': [
        { id: 5, name: 'Chili Cheeseburger', price: 5.99, desc: '100% beef patty with chili and melted cheese', image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop&q=80' },
        { id: 6, name: 'Deluxe Cheeseburger', price: 5.49, desc: 'Lettuce, tomato, onions, pickles, and special sauce', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&q=80' }
      ],
      'Fries & Sides': [
        { id: 7, name: 'Chili Cheese Fries', price: 4.49, desc: 'Crispy fries topped with chili and cheese', image: 'https://images.unsplash.com/photo-1630384082262-14b2a2a4e505?w=400&h=300&fit=crop&q=80' },
        { id: 8, name: 'French Fries', price: 2.99, desc: 'Golden crispy french fries', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop&q=80' }
      ],
      'Drinks': [
        { id: 10, name: 'Soft Drink', price: 1.99, desc: 'Coca-Cola products', image: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop&q=80' },
        { id: 11, name: 'Lemonade', price: 2.49, desc: 'Fresh squeezed lemonade', image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop&q=80' }
      ],
      'Desserts': [
        { id: 12, name: 'Chocolate Shake', price: 3.99, desc: 'Rich and creamy chocolate shake', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop&q=80' },
        { id: 13, name: 'Vanilla Shake', price: 3.99, desc: 'Classic vanilla shake', image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop&q=80' }
      ]
    };
    
    return of(menuItems).pipe(delay(500));
    // return this.http.get<{[key: string]: MenuItem[]}>(`${this.apiUrl}/menu`);
  }

  placeOrder(order: Order): Observable<OrderResponse> {
    // Mock API call - replace with actual API
    const response: OrderResponse = {
      orderNumber: 'WG' + Math.floor(10000 + Math.random() * 90000),
      estimatedTime: '10-15 minutes',
      status: 'confirmed'
    };
    
    return of(response).pipe(delay(1000));
    // return this.http.post<OrderResponse>(`${this.apiUrl}/orders`, order);
  }
}