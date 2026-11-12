"use client";

import { useEffect } from "react";
import { create } from "zustand";
import type { CartQuote, QuoteLine } from "@/lib/cart-pricing";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

export type QuoteStatus = "idle" | "checking" | "confirmed" | "error";

export interface BagNotice {
  id: string;
  tone: "info" | "warning";
  message: string;
}

interface QuoteState {
  quote: CartQuote | null;
  status: QuoteStatus;
  notices: BagNotice[];
  /** Bumped to ask for a fresh check (e.g. when the bag opens). */
  nonce: number;
  refresh: () => void;
  dismiss: (id: string) => void;
}

/** The server's latest word on the bag: prices, stock and totals. */
export const useCartQuote = create<QuoteState>()((set) => ({
  quote: null,
  status: "idle",
  notices: [],
  nonce: 0,
  refresh: () => set((state) => ({ nonce: state.nonce + 1 })),
  dismiss: (id) => set((state) => ({ notices: state.notices.filter((notice) => notice.id !== id) })),
}));

/** Status of one bag line in the latest quote. */
export function useLineQuote(variantId: number): QuoteLine | undefined {
  return useCartQuote((state) => state.quote?.lines.find((line) => line.variantId === variantId));
}

function noticeFor(line: QuoteLine): BagNotice | null {
  const name = line.name ?? "An item";
  switch (line.status) {
    case "price_changed":
      return {
        id: `${line.variantId}-price-${line.price}`,
        tone: "info",
        message: `${name} is now ${formatPrice(line.price)} (was ${formatPrice(line.previousPrice ?? line.price)}). Your bag shows the current price.`,
      };
    case "reduced":
      return {
        id: `${line.variantId}-reduced-${line.quantity}`,
        tone: "warning",
        message: `Only ${line.stock} of ${name} left — we've updated the quantity in your bag.`,
      };
    case "sold_out":
      return { id: `${line.variantId}-sold-out`, tone: "warning", message: `${name} has just sold out. Remove it or save it for later.` };
    case "unavailable":
      return { id: `${line.variantId}-unavailable`, tone: "warning", message: `${name} is no longer available and was removed from your bag.` };
    default:
      return null;
  }
}

/**
 * Keeps the bag honest. Whenever the bag changes (or a refresh is asked for)
 * it asks the server to price it, applies the corrections to the stored bag
 * and keeps notices for anything the shopper should know. Mount once.
 */
export function useCartQuoteSync() {
  const items = useCart((state) => state.items);
  const reconcile = useCart((state) => state.reconcile);
  const nonce = useCartQuote((state) => state.nonce);
  const key = JSON.stringify(items.map((item) => [item.variantId, item.quantity, item.price]));

  useEffect(() => {
    const lines = JSON.parse(key) as [number, number, number][];
    if (lines.length === 0) {
      useCartQuote.setState({ quote: null, status: "idle" });
      return;
    }

    const controller = new AbortController();
    useCartQuote.setState({ status: "checking" });
    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/cart/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: lines.map(([variantId, quantity, seenPrice]) => ({ variantId, quantity, seenPrice })) }),
          signal: controller.signal,
        });
        const data = (await response.json()) as { success: boolean; quote?: CartQuote };
        if (!response.ok || !data.success || !data.quote) throw new Error("Quote failed");
        const quote = data.quote;

        useCartQuote.setState((state) => {
          const fresh = quote.lines.map(noticeFor).filter((notice): notice is BagNotice => notice !== null);
          const known = new Set(state.notices.map((notice) => notice.id));
          // A sold-out notice stays only while the line is still sold out.
          const stillSoldOut = new Set(quote.lines.filter((line) => line.status === "sold_out").map((line) => `${line.variantId}-sold-out`));
          const kept = state.notices.filter((notice) => !notice.id.endsWith("-sold-out") || stillSoldOut.has(notice.id));
          return { quote, status: "confirmed", notices: [...kept, ...fresh.filter((notice) => !known.has(notice.id))] };
        });
        reconcile(quote.lines);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        useCartQuote.setState({ status: "error" });
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, nonce, reconcile]);
}
