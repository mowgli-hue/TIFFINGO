export type Kitchen = {
  id: string;
  name: string;
  tagline: string;
  description: string;
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
  deliverySlots: string[];
  cutoffTime: string;
  pricePerMeal: number;
  weeklyPrice: number;
  weeklySavingsPct: number;
};

export type CartItem = {
  kitchenId: string;
  kitchenName: string;
  mealName: string;
  day: string;
  date: string;
  price: number;
  deliverySlot: string;
  isWeekly: boolean;
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
