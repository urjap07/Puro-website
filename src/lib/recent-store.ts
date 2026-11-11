"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RecentState {
  slugs: string[];
  record: (slug: string) => void;
}

/** Products this visitor has viewed, newest first, kept in the browser. */
export const useRecentlyViewed = create<RecentState>()(
  persist(
    (set) => ({
      slugs: [],
      record: (slug) => set((state) => ({ slugs: [slug, ...state.slugs.filter((s) => s !== slug)].slice(0, 12) })),
    }),
    { name: "puro-recent", skipHydration: true },
  ),
);
