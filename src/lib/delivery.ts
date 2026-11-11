"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Orders arrive within this many days of being placed. */
export const DELIVERY_DAYS = { min: 4, max: 7 } as const;

interface PincodeState {
  pincode: string | null;
  setPincode: (pincode: string | null) => void;
}

/** The visitor's delivery pincode, remembered in this browser. */
export const usePincode = create<PincodeState>()(
  persist(
    (set) => ({
      pincode: null,
      setPincode: (pincode) => set({ pincode }),
    }),
    { name: "puro-pincode", skipHydration: true },
  ),
);

export function isValidPincode(value: string) {
  return /^[1-9][0-9]{5}$/.test(value.trim());
}

const DAY = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" });

/** e.g. "Mon, 18 Nov – Thu, 21 Nov", counted from today. */
export function deliveryWindow(from = new Date()) {
  const start = new Date(from);
  start.setDate(start.getDate() + DELIVERY_DAYS.min);
  const end = new Date(from);
  end.setDate(end.getDate() + DELIVERY_DAYS.max);
  return `${DAY.format(start)} – ${DAY.format(end)}`;
}

/**
 * The delivery window, worked out in the browser after the page loads, so
 * server and browser never disagree about "today". Null until then.
 */
export function useDeliveryWindow() {
  const [value, setValue] = useState<string | null>(null);
  useEffect(() => setValue(deliveryWindow()), []);
  return value;
}
