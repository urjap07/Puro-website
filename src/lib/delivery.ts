"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DELIVERY_ZONES, type DeliveryZone, type ZoneId, countryName, pincodeLooksMaharashtra } from "./delivery-rules";

export { DELIVERY_ZONES, COUNTRIES, INDIA_DAYS, countryName, isValidPincode, pincodeProblem } from "./delivery-rules";
export type { DeliveryZone, ZoneId } from "./delivery-rules";

/** An Indian address, known by its pincode. */
export interface IndiaDestination {
  country: "IN";
  pincode: string;
  /** From India Post; null when the lookup service couldn't be reached. */
  district: string | null;
  state: string | null;
}

/** Where the visitor wants their order sent: an Indian pincode or a country abroad. */
export type Destination = IndiaDestination | { country: string };

export function isIndia(destination: Destination): destination is IndiaDestination {
  return destination.country === "IN" && "pincode" in destination;
}

interface DestinationState {
  destination: Destination | null;
  setDestination: (destination: Destination | null) => void;
}

/** The visitor's delivery destination, remembered in this browser. */
export const useDestination = create<DestinationState>()(
  persist(
    (set) => ({
      destination: null,
      setDestination: (destination) => set({ destination }),
    }),
    {
      name: "puro-pincode",
      version: 1,
      skipHydration: true,
      // Version 0 stored only a pincode.
      migrate: (persisted, version) => {
        const old = persisted as { pincode?: string | null } | undefined;
        if (version === 0 && old?.pincode) {
          return { destination: { country: "IN", pincode: old.pincode, district: null, state: null } } as DestinationState;
        }
        return persisted as DestinationState;
      },
    },
  ),
);

let rehydrated = false;
/** Load the remembered destination once, after the page has hydrated. */
function useRehydrateDestination() {
  useEffect(() => {
    if (rehydrated) return;
    rehydrated = true;
    useDestination.persist.rehydrate();
  }, []);
}

/** Which delivery zone a destination falls in. */
export function zoneFor(destination: Destination): DeliveryZone {
  if (!isIndia(destination)) return DELIVERY_ZONES.international;
  const inMaharashtra = destination.state
    ? destination.state.toLowerCase() === "maharashtra"
    : pincodeLooksMaharashtra(destination.pincode);
  return inMaharashtra ? DELIVERY_ZONES.maharashtra : DELIVERY_ZONES.india;
}

const DAY = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" });

/** e.g. "Mon, 18 Nov – Thu, 21 Nov", counted from today. */
export function deliveryWindow(zone: DeliveryZone, from = new Date()) {
  const start = new Date(from);
  start.setDate(start.getDate() + zone.min);
  const end = new Date(from);
  end.setDate(end.getDate() + zone.max);
  return `${DAY.format(start)} – ${DAY.format(end)}`;
}

/** Short label for the destination, e.g. "Mumbai 400001" or "United Kingdom". */
export function destinationLabel(destination: Destination) {
  if (!isIndia(destination)) return countryName(destination.country);
  return destination.district ? `${destination.district} ${destination.pincode}` : destination.pincode;
}

export interface DeliveryEstimate {
  destination: Destination | null;
  zone: DeliveryZone | null;
  zoneId: ZoneId | null;
  /** Exact dates once a destination is known; null before that. */
  dates: string | null;
  /** Whether the ₹500 free-delivery offer applies (India only). */
  freeDeliveryApplies: boolean;
}

/**
 * The delivery promise for this visitor, worked out in the browser after the
 * page loads, so server and browser never disagree about "today" or about the
 * remembered destination. Until then everything is null.
 */
export function useDeliveryEstimate(): DeliveryEstimate {
  useRehydrateDestination();
  const destination = useDestination((state) => state.destination);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !destination) {
    return { destination: null, zone: null, zoneId: null, dates: null, freeDeliveryApplies: true };
  }
  const zone = zoneFor(destination);
  return {
    destination,
    zone,
    zoneId: zone.id,
    dates: deliveryWindow(zone),
    freeDeliveryApplies: zone.id !== "international",
  };
}

/** Result of asking our server whether an Indian pincode exists. */
export type PincodeLookup =
  | { status: "ok"; pincode: string; district: string; state: string }
  | { status: "not_found" | "invalid" }
  | { status: "unavailable" };

export async function lookupPincode(pincode: string): Promise<PincodeLookup> {
  try {
    const response = await fetch(`/api/pincode/${pincode}`);
    if (!response.ok && response.status !== 404 && response.status !== 400) return { status: "unavailable" };
    return (await response.json()) as PincodeLookup;
  } catch {
    return { status: "unavailable" };
  }
}
