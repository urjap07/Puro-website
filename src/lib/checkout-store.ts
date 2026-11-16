"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CheckoutStep = "contact" | "address" | "delivery" | "payment";

interface CheckoutState {
  step: CheckoutStep;
  email: string;
  addressId: string | null;
  giftEnabled: boolean;
  giftMessage: string;
  instructions: string;
  setStep: (step: CheckoutStep) => void;
  update: (patch: Partial<Omit<CheckoutState, "setStep" | "update" | "reset">>) => void;
  reset: () => void;
}

const INITIAL = { step: "contact" as CheckoutStep, email: "", addressId: null, giftEnabled: false, giftMessage: "", instructions: "" };

/** Checkout progress, kept for this browser tab only (sessionStorage). */
export const useCheckout = create<CheckoutState>()(
  persist(
    (set) => ({
      ...INITIAL,
      setStep: (step) => set({ step }),
      update: (patch) => set(patch),
      reset: () => set(INITIAL),
    }),
    { name: "puro-checkout", storage: createJSONStorage(() => sessionStorage), skipHydration: true },
  ),
);
