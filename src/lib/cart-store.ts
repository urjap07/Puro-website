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
  /**
   * Brings the bag in line with the server's quote: current prices and names,
   * quantities lowered to what's in stock, and lines that are no longer sold
   * removed. Sold-out lines stay (flagged) so the shopper can decide.
   */
  reconcile: (lines: ReconcileLine[]) => void;
}

/** The parts of a server quote line the bag needs (see lib/cart-pricing.ts). */
export interface ReconcileLine {
  variantId: number;
  name: string | null;
  variantName: string | null;
  slug: string | null;
  image: string | null;
  price: number;
  quantity: number;
  status: "ok" | "price_changed" | "reduced" | "sold_out" | "unavailable";
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

      reconcile: (lines) =>
        set((state) => {
          const byId = new Map(lines.map((line) => [line.variantId, line]));
          let changed = false;
          const items = state.items.flatMap((item) => {
            const line = byId.get(item.variantId);
            if (!line) return [item];
            if (line.status === "unavailable") {
              changed = true;
              return [];
            }
            const next: CartItem = {
              ...item,
              price: line.price,
              name: line.name ?? item.name,
              variantName: line.variantName ?? item.variantName,
              slug: line.slug ?? item.slug,
              image: line.image ?? item.image,
              // Sold out: keep the shopper's quantity so they see what they wanted.
              quantity: line.status === "reduced" ? Math.max(1, line.quantity) : item.quantity,
            };
            if (
              next.price !== item.price ||
              next.quantity !== item.quantity ||
              next.name !== item.name ||
              next.image !== item.image
            )
              changed = true;
            return [next];
          });
          // Only write when something actually changed, so a quote can't loop.
          return changed ? { items } : state;
        }),
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
