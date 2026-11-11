"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SavedItem {
  productId: number;
  variantId: number;
  slug: string;
  name: string;
  variantName: string;
  price: number;
  image: string | null;
}

interface WishlistState {
  items: SavedItem[];
  toggle: (item: SavedItem) => void;
  remove: (productId: number) => void;
  has: (productId: number) => boolean;
}

/** A simple wishlist kept in this browser only. */
export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) =>
        set((state) => ({
          items: state.items.some((saved) => saved.productId === item.productId)
            ? state.items.filter((saved) => saved.productId !== item.productId)
            : [item, ...state.items],
        })),
      remove: (productId) => set((state) => ({ items: state.items.filter((saved) => saved.productId !== productId) })),
      has: (productId) => get().items.some((saved) => saved.productId === productId),
    }),
    { name: "puro-wishlist", skipHydration: true },
  ),
);
