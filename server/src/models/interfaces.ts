export interface Customer {
  id?: number;
  firstName: string;
  lastName: string;
  phone: string;
  plate: string;
  carType: string;
  carColor: string;
  createdAt?: Date;
}

export interface Category {
  id?: number;
  name: string;
  description?: string;
  available: boolean;
  createdAt?: Date;
}

export interface MenuItem {
  id?: number;
  name: string;
  price: number;
  description: string;
  categoryId: number;
  available: boolean;
  image?: string;
  createdAt?: Date;
}

export interface Addon {
  id?: number;
  name: string;
  price: number;
  available: boolean;
  createdAt?: Date;
}

export interface Order {
  id?: number;
  customerId: number;
  status: 'new' | 'preparing' | 'ready' | 'completed';
  subtotal: number;
  tax: number;
  total: number;
  estimatedTime: number;
  createdAt?: Date;
  completedAt?: Date;
}

export interface OrderItem {
  id?: number;
  orderId: number;
  menuItemId: number;
  quantity: number;
  price: number;
  customizations?: string;
}

export interface MenuItemAddon {
  id?: number;
  menuItemId: number;
  addonId: number;
}