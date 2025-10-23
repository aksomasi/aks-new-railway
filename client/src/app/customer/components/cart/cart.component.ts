import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem, Customer, Order } from '../../models/interfaces';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  @Input() customer!: Customer;
  @Output() showMenu = new EventEmitter<void>();
  @Output() orderPlaced = new EventEmitter<string>();

  isProcessing = false;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private apiService: ApiService
  ) {}

  get cartItems(): CartItem[] {
    return this.cartService.getCartItems();
  }

  get subtotal(): number {
    return this.cartService.cartTotal;
  }

  get tax(): number {
    return this.subtotal * 0.08;
  }

  get total(): number {
    return this.subtotal + this.tax;
  }

  updateQty(index: number, delta: number): void {
    this.cartService.updateQuantity(index, delta);
  }

  checkout(): void {
    if (this.cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    this.isProcessing = true;
    
    const order: Order = {
      customer: this.customer,
      items: this.cartItems,
      subtotal: this.subtotal,
      tax: this.tax,
      total: this.total
    };

    

    const orderData = {
      customer: {
        name: this.customer.fullName,
        phone: '',
        email: '',
        carType: '',
        carColor: '',
        plate: this.customer.plate || '',
        carDetails: this.customer.carDetails || ''
      },
      items: this.cartItems.map(item => ({
        menu_item_id: item.id,
        quantity: item.qty,
        price: item.price,
        addons: item.customizations || []
      })),
      total: this.total
    };

    this.apiService.createOrder(orderData).subscribe({
      next: (response: any) => {
        this.isProcessing = false;
        this.cartService.clearCart();
        this.orderPlaced.emit(`#${response.id}`);
      },
      error: (error: any) => {
        this.isProcessing = false;
        alert('Failed to place order. Please try again.');
        console.error('Order failed:', error);
      }
    });
  }
}