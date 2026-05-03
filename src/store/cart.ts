import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, User } from '@/lib/types';

// ── Cart store ────────────────────────────────────────────
interface CartStore {
  items: CartItem[];
  kitchenId: string | null;
  kitchenName: string | null;
  selectedPlan: 'DAILY' | 'WEEKLY' | 'MONTHLY' | null;
  selectedDays: string[];
  addItem: (item: CartItem, kitchenId: string, kitchenName: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQty: (menuItemId: string, qty: number) => void;
  setPlan: (plan: 'DAILY' | 'WEEKLY' | 'MONTHLY') => void;
  setDays: (days: string[]) => void;
  clearCart: () => void;
  totalAmount: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      kitchenId: null,
      kitchenName: null,
      selectedPlan: null,
      selectedDays: ['Wed'],

      addItem: (item, kitchenId, kitchenName) => {
        const { items, kitchenId: currentKitchen } = get();
        // If adding from a different kitchen, clear first
        if (currentKitchen && currentKitchen !== kitchenId) {
          set({ items: [item], kitchenId, kitchenName });
          return;
        }
        const existing = items.find(i => i.menuItemId === item.menuItemId);
        if (existing) {
          set({ items: items.map(i => i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + 1 } : i) });
        } else {
          set({ items: [...items, item], kitchenId, kitchenName });
        }
      },

      removeItem: (menuItemId) =>
        set(s => ({ items: s.items.filter(i => i.menuItemId !== menuItemId) })),

      updateQty: (menuItemId, qty) => {
        if (qty <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        set(s => ({ items: s.items.map(i => i.menuItemId === menuItemId ? { ...i, quantity: qty } : i) }));
      },

      setPlan: (plan) => set({ selectedPlan: plan }),
      setDays: (days) => set({ selectedDays: days }),

      clearCart: () => set({ items: [], kitchenId: null, kitchenName: null, selectedPlan: null }),

      totalAmount: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'tiffingo-cart' }
  )
);

// ── Auth store ────────────────────────────────────────────
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
