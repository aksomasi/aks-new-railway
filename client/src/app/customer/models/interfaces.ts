export interface MenuItem {
  id: number;
  name: string;
  price: number;
  desc?: string;
  description?: string;
  image: string;
  image_url?: string;
  available?: boolean;
  category?: string;
  addons?: any[];
}

export interface CartItem extends MenuItem {
  qty: number;
  customizations: CustomizationOption[];
  customPrice: number;
  cartId?: number;
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
  available?: boolean;
}

export interface Customer {
  fullName: string;
  plate: string;
  carDetails: string;
}

export interface Order {
  customer: Customer;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export interface OrderResponse {
  orderNumber: string;
  estimatedTime: string;
  status: string;
}