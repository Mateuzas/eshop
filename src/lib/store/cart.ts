import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  name: string;
  priceCents: number;
  image: string | null;
  quantity: number;
  // Optional because not every product has size variants; the schema has
  // no per-size inventory, so this is purely a display/line-item key.
  size?: string;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  totalCents: () => number;
  totalItems: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          // Same product in a different size is a distinct line item.
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.size === item.size
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i === existing ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },

      removeItem: (productId, size) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.size === size)
          ),
        }));
      },

      updateQuantity: (productId, quantity, size) => {
        if (quantity <= 0) {
          get().removeItem(productId, size);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.size === size
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalCents: () =>
        get().items.reduce(
          (sum, item) => sum + item.priceCents * item.quantity,
          0
        ),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "eshop-cart",
    }
  )
);

// The store is persisted to localStorage, which only exists on the client —
// the server always sees an empty cart. Reading `hasHydrated()` through
// useSyncExternalStore (rather than useState+useEffect) lets React reconcile
// the mismatch itself instead of us calling setState after mount, so
// consumers can render the SSR-safe empty state until this flips to true.
export function useCartHydrated() {
  return useSyncExternalStore(
    (callback) => useCartStore.persist.onFinishHydration(callback),
    () => useCartStore.persist.hasHydrated(),
    () => false
  );
}
