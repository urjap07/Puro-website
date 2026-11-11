"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  variantId: number;
  productId: number;
  slug: string;
  name: string;
  variantName: string;
  price: number;
  image: string | null;
  quantity: number;
}

export type BagView = "bag" | "saved";

/** The most recent add, shown in the "Added to your bag" pop-up. */
export interface AddedNotice {
  item: CartItem;
  quantity: number;
  at: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  view: BagView;
  lastAdded: AddedNotice | null;
  dismissNotice: () => void;
  open: (view?: BagView) => void;
  setView: (view: BagView) => void;
  close: () => void;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (variantId: number, quantity: number) => void;
  remove: (variantId: number) => void;
}

const MAX_QUANTITY = 10;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      view: "bag",
      lastAdded: null,
      dismissNotice: () => set({ lastAdded: null }),
      open: (view = "bag") => set({ isOpen: true, view, lastAdded: null }),
      setView: (view) => set({ view }),
      close: () => set({ isOpen: false }),

      add: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find(
            (cartItem) => cartItem.variantId === item.variantId
          );
          const items = existing
            ? state.items.map((cartItem) =>
                cartItem.variantId === item.variantId
                  ? {
                      ...cartItem,
                      quantity: Math.min(cartItem.quantity + quantity, MAX_QUANTITY),
                    }
                  : cartItem
              )
            : [...state.items, { ...item, quantity }];
          const added = items.find((cartItem) => cartItem.variantId === item.variantId)!;
          return { items, lastAdded: { item: added, quantity, at: Date.now() } };
        }),

      setQuantity: (variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.variantId !== variantId)
              : state.items.map((item) =>
                  item.variantId === variantId
                    ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY) }
                    : item
                ),
        })),

      remove: (variantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        })),
    }),
    {
      name: "puro-bag",
      partialize: (state) => ({ items: state.items }),
      // Rehydrated on mount by <CartDrawer /> to avoid SSR mismatches.
      skipHydration: true,
    }
  )
);

export function cartCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

/** Orders at or above this subtotal ship free. */
export const FREE_DELIVERY_THRESHOLD = 500;
