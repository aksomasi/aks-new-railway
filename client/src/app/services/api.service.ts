import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  // Helper method to get full image URL
  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath; // External URLs
    return `/${imagePath}`;
  }

  // Categories
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categories`);
  }

  createCategory(category: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/categories`, category);
  }

  updateCategory(id: number, category: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/categories/${id}`, category);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/categories/${id}`);
  }

  // Menu Items
  getMenuItems(categoryId?: number): Observable<any[]> {
    const url = categoryId ? `${this.baseUrl}/menu?category=${categoryId}` : `${this.baseUrl}/menu`;
    return this.http.get<any[]>(url);
  }

  createMenuItem(item: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/menu`, item);
  }

  createMenuItemWithImage(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/menu`, formData);
  }

  updateMenuItem(id: number, item: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/menu/${id}`, item);
  }

  deleteMenuItem(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/menu/${id}`);
  }

  // Add-ons
  getAddons(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/addons`);
  }

  createAddon(addon: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/addons`, addon);
  }

  updateAddon(id: number, addon: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/addons/${id}`, addon);
  }

  deleteAddon(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/addons/${id}`);
  }

  // Orders
  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/orders`);
  }

  createOrder(order: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/orders`, order);
  }

  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/orders/${id}`, { status });
  }
}