"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";

/**
 * The shopper's account details. There's no sign-in yet, so these are kept on
 * this device only. When customer accounts open they can be moved into the
 * `users` and `addresses` tables.
 */

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
] as const;

const phone = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, "").replace(/^\+?91(?=\d{10}$)/, ""))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a 10-digit Indian mobile number."));

export const ProfileSchema = z.object({
  name: z.string().trim().max(80, "That name is a little long.").optional().or(z.literal("")),
  email: z.string().trim().email("That email doesn't look right.").max(120).optional().or(z.literal("")),
  phone: phone.optional().or(z.literal("")),
});
export type Profile = { name: string; email: string; phone: string };

export const AddressSchema = z.object({
  label: z.enum(["Home", "Work", "Other"]),
  fullName: z.string().trim().min(2, "Please enter the recipient's name.").max(80),
  phone,
  line1: z.string().trim().min(5, "Please enter the house, flat or street.").max(160),
  landmark: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Please enter the city.").max(80),
  state: z.enum(INDIAN_STATES, { message: "Please choose a state." }),
  pincode: z.string().trim().regex(/^[1-8]\d{5}$/, "Enter a valid 6-digit pincode."),
});
export type AddressInput = z.infer<typeof AddressSchema>;
export type Address = AddressInput & { id: string; isDefault: boolean };

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
