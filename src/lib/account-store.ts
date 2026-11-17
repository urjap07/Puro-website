"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * The shopper's account details. There's no sign-in yet, so these are kept on
 * this device only. When customer accounts open they can be moved into the
 * `users` and `addresses` tables.
 */

export {
  AddressSchema,
  INDIAN_STATES,
  ProfileSchema,
  type Address,
  type AddressInput,
  type Profile,
} from "./account-schema";
import type { Address, AddressInput, Profile } from "./account-schema";

/** An order placed from this device: enough to list it and reopen its page. */
export interface SavedOrder {
  number: string;
  /** Private token for the order's confirmation page. */
  token: string;
  placedAt: string;
  total: number;
  itemCount: number;
  /** e.g. "Glow Up Pithi Pack + 2 more" */
  summary: string;
  paymentMethod: "cod";
}

/** Link to an order's confirmation page. */
export const orderHref = (order: Pick<SavedOrder, "number" | "token">) => `/orders/${order.number}?t=${order.token}`;

interface AccountState {
  profile: Profile;
  addresses: Address[];
  /** Orders placed from this device, newest first. */
  orders: SavedOrder[];
  addOrder: (order: SavedOrder) => void;
  saveProfile: (profile: Profile) => void;
  /** Adds (no id) or updates an address. The first address becomes the default. */
  saveAddress: (input: AddressInput, id?: string) => Address;
  removeAddress: (id: string) => void;
  setDefault: (id: string) => void;
  /** Forget the profile and addresses on this device (orders are kept, so their pages stay reachable). */
  clear: () => void;
}

const EMPTY_PROFILE: Profile = { name: "", email: "", phone: "" };

export const useAccount = create<AccountState>()(
  persist(
    (set, get) => ({
      profile: EMPTY_PROFILE,
      addresses: [],
      orders: [],
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders.filter((item) => item.number !== order.number)].slice(0, 50) })),
      saveProfile: (profile) => set({ profile }),
      saveAddress: (input, id) => {
        const existing = id ? get().addresses.find((address) => address.id === id) : undefined;
        const address: Address = {
          ...input,
          id: existing?.id ?? (globalThis.crypto?.randomUUID?.() ?? `a${Date.now()}`),
          isDefault: existing?.isDefault ?? get().addresses.length === 0,
        };
        set((state) => ({
          addresses: existing ? state.addresses.map((item) => (item.id === address.id ? address : item)) : [...state.addresses, address],
        }));
        return address;
      },
      removeAddress: (id) =>
        set((state) => {
          const removed = state.addresses.find((address) => address.id === id);
          const rest = state.addresses.filter((address) => address.id !== id);
          // Keep one default if the default was removed.
          if (removed?.isDefault && rest.length) rest[0] = { ...rest[0], isDefault: true };
          return { addresses: rest };
        }),
      setDefault: (id) => set((state) => ({ addresses: state.addresses.map((address) => ({ ...address, isDefault: address.id === id })) })),
      clear: () => set({ profile: EMPTY_PROFILE, addresses: [] }),
    }),
    { name: "puro-account", version: 1, skipHydration: true },
  ),
);

/** The address delivery should go to by default. */
export function defaultAddress(addresses: Address[]) {
  return addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;
}
