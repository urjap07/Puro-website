"use client";

import { create } from "zustand";

export interface Flight {
  id: number;
  image: string;
  from: { x: number; y: number; width: number; height: number };
}

interface FlightState {
  flights: Flight[];
  /** Bumps whenever something lands, so the basket can bounce. */
  landed: number;
  launch: (flight: Omit<Flight, "id">) => void;
  land: (id: number) => void;
}

let nextId = 1;

/** Products currently flying from where they were added into the basket. */
export const useFlights = create<FlightState>()((set) => ({
  flights: [],
  landed: 0,
  launch: (flight) => set((state) => ({ flights: [...state.flights, { ...flight, id: nextId++ }] })),
  land: (id) => set((state) => ({ flights: state.flights.filter((f) => f.id !== id), landed: state.landed + 1 })),
}));

/**
 * Send a product flying into the basket from the element that was clicked.
 * Uses the nearest [data-fly-source] image if there is one.
 */
export function flyToBasket(trigger: Element | null, image: string | null) {
  if (!trigger || !image || typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const source = trigger.closest("[data-fly-source]")?.querySelector("img") ?? trigger;
  const rect = source.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height, 220);
  useFlights.getState().launch({
    image,
    from: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, width: size, height: size },
  });
}
