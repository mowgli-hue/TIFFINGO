import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/lib/types';

interface CartStore {
  kitchenId: string | null;
  kitchenName: string | null;
  mealName: string | null;
  day: string | null;
  isWeekly: boolean;
  deliverySlot: string | null;
  setMealOrder: (data: { kitchenId: string; kitchenName: string; mealName: string; day: string; isWeekly: boolean; deliverySlot: string }) => void;
  clearCart: () => void;
  selectedPlan: 'DAILY' | 'WEEKLY' | 'MONTHLY' | null;
  selectedDays: string[];
  setPlan: (plan: 'DAILY' | 'WEEKLY' | 'MONTHLY') => void;
  setDays: (days: string[]) => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      kitchenId: null,
      kitchenName: null,
      mealName: null,
      day: null,
      isWeekly: false,
      deliverySlot: null,
      selectedPlan: 'WEEKLY',
      selectedDays: ['Wed'],
      setMealOrder: (data) => set(data),
      clearCart: () => set({ kitchenId: null, kitchenName: null, mealName: null, day: null, isWeekly: false }),
      setPlan: (plan) => set({ selectedPlan: plan }),
      setDays: (days) => set({ selectedDays: days }),
    }),
    { name: 'tiffingo-cart' }
  )
);

/* Lightweight per-device preferences. The calorie target drives the
   "% of your day" lines on the planner and home — it is the user's own
   yardstick, not medical advice. */
interface PrefsStore {
  calorieTarget: number;
  setCalorieTarget: (n: number) => void;
}

export const usePrefs = create<PrefsStore>()(
  persist(
    (set) => ({
      calorieTarget: 2000,
      setCalorieTarget: (n) => set({ calorieTarget: n }),
    }),
    { name: 'tiffingo-prefs' }
  )
);

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        set({ user: null });
      },
    }),
    { name: 'tiffingo-auth' }
  )
);
