import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartItems.asObservable();

  get cartCount(): number {
    return this.cartItems.value.reduce((sum, item) => sum + item.qty, 0);
  }

  get cartTotal(): number {
    return this.cartItems.value.reduce((sum, item) => sum + ((item.price + item.customPrice) * item.qty), 0);
  }

  addItem(item: CartItem): void {
    const currentCart = this.cartItems.value;
    const existing = currentCart.find(c => c.id === item.id && !c.customizations.length);
    
    if (existing && !item.customizations.length) {
      existing.qty++;
    } else {
      currentCart.push({ ...item, cartId: Date.now() });
    }
    
    this.cartItems.next([...currentCart]);
  }

  updateQuantity(index: number, delta: number): void {
    const currentCart = this.cartItems.value;
    if (currentCart[index]) {
      currentCart[index].qty += delta;
      if (currentCart[index].qty <= 0) {
        currentCart.splice(index, 1);
      }
    }
    this.cartItems.next([...currentCart]);
  }

  clearCart(): void {
    this.cartItems.next([]);
  }

  getCartItems(): CartItem[] {
    return this.cartItems.value;
  }
}