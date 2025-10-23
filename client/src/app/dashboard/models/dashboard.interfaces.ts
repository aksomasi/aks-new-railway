export interface DashboardOrder {
  id: string;
  status: 'new' | 'preparing' | 'ready' | 'completed';
  full_name: string;
  plate?: string;
  car_details?: string;
  items: DashboardOrderItem[];
  total: number;
  timestamp: Date;
  estimatedTime: number;
  completedAt?: Date;
}

export interface DashboardOrderItem {
  name: string;
  qty: number;
  price: number;
  customizations: string[];
}

export interface DashboardMenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  available: boolean;
  description: string;
  imageUrl?: string;
  customizationIds: string[];
}

export interface DashboardAddon {
  id: string;
  name: string;
  price: number;
  available: boolean;
}

export interface DashboardCategory {
  id: string;
  name: string;
  description: string;
  available: boolean;
  itemCount: number;
}