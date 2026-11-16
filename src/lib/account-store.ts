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

interface AccountState {
  profile: Profile;
  addresses: Address[];
  saveProfile: (profile: Profile) => void;
  /** Adds (no id) or updates an address. The first address becomes the default. */
  saveAddress: (input: AddressInput, id?: string) => Address;
  removeAddress: (id: string) => void;
  setDefault: (id: string) => void;
  /** Forget everything stored for this account on this device. */
  clear: () => void;
}

const EMPTY_PROFILE: Profile = { name: "", email: "", phone: "" };

export const useAccount = create<AccountState>()(
  persist(
    (set, get) => ({
      profile: EMPTY_PROFILE,
      addresses: [],
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
