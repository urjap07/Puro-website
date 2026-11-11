"use client";

import { create } from "zustand";
import type { Product } from "@/db/queries/products";

interface QuickLookState {
  /** The products the shopper can step through (the row or grid they opened it from). */
  list: Product[];
  index: number;
  isOpen: boolean;
  open: (list: Product[], product: Product) => void;
  step: (by: number) => void;
  close: () => void;
}

/** Quick look: a product brought to centre stage without leaving the page. */
export const useQuickLook = create<QuickLookState>()((set) => ({
  list: [],
  index: 0,
  isOpen: false,
  open: (list, product) => {
    const items = list.length ? list : [product];
    set({ list: items, index: Math.max(0, items.findIndex((item) => item.id === product.id)), isOpen: true });
  },
  step: (by) => set((state) => ({ index: (state.index + by + state.list.length) % state.list.length })),
  close: () => set({ isOpen: false }),
}));

/** The image area of a product's card, where quick look rises from and returns to. */
export function quickLookOrigin(slug: string): DOMRect | null {
  const nodes = document.querySelectorAll<HTMLElement>(`[data-quicklook="${CSS.escape(slug)}"]`);
  for (const node of nodes) {
    const rect = node.getBoundingClientRect();
    // Only a card that is actually on screen.
    if (rect.width > 0 && rect.bottom > 0 && rect.top < window.innerHeight) return rect;
  }
  return null;
}
