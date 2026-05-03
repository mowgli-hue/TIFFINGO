export type Kitchen = {
  id: string;
  name: string;
  description?: string;
  cuisine: string;
  type: 'tiffin' | 'restaurant';
  address: string;
  city: string;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  isHalal: boolean;
  isVeg: boolean;
  deliveryTime?: string; // "25–35 min"
  pricePerMeal?: number;
  menuItems?: MenuItem[];
};

export type MenuItem = {
  id: string;
  kitchenId: string;
  name: string;
  description?: string;
  price: number;
  calories?: number;
  protein?: number;
  imageUrl?: string;
  isAvailable: boolean;
  tags: string[];
};

export type Order = {
  id: string;
  kitchenId: string;
  kitchenName: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'ON_THE_WAY' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  items: CartItem[];
  address: string;
  driverName?: string;
  estimatedEta?: string;
  createdAt: string;
};

export type Subscription = {
  id: string;
  kitchenId: string;
  kitchenName: string;
  plan: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  mealsPerWeek: number;
  pricePerWeek: number;
  deliveryDays: string[];
  deliveryTime: string;
  nextBillingDate?: string;
};

export type CartItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
};

export type User = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  goals?: string[];
};

export type PlannerMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type WeeklyMeal = {
  day: string;
  name: string;
  kitchen: string;
  protein: string;
  calories: number;
};
