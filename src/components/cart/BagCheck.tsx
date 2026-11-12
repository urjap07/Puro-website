"use client";

import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { AlertCircle, Check, Info, Loader2, X } from "lucide-react";
import { type CartItem, cartCount, cartSubtotal } from "@/lib/cart-store";
import { useCartQuote, useLineQuote } from "@/lib/cart-quote";

/**
 * Bag totals: the server's confirmed figures when it has priced this exact
 * bag, otherwise the bag's own (provisional) sums.
 */
export function useBagTotals(items: CartItem[]) {
  const quote = useCartQuote((state) => state.quote);
  const status = useCartQuote((state) => state.status);
  const confirmed = status === "confirmed" && quote !== null;
  return {
    subtotal: confirmed ? quote.subtotal : cartSubtotal(items),
    count: confirmed ? quote.count : cartCount(items),
    confirmed,
    unavailableCount: confirmed ? quote.lines.filter((line) => line.status === "sold_out").length : 0,
  };
}

/** "Prices & stock confirmed" — or checking / couldn't check. */
export function PriceCheckStatus({ className }: { className?: string }) {
  const status = useCartQuote((state) => state.status);
  if (status === "idle") return null;
  return (
    <p aria-live="polite" className={clsx("flex items-center gap-1.5 text-[12px]", status === "error" ? "text-[#8E4F5B]" : "text-stone", className)}>
      {status === "checking" && (
        <>
          <Loader2 size={13} strokeWidth={1.8} className="animate-spin motion-reduce:animate-none" /> Checking prices &amp; stock…
        </>
      )}
      {status === "confirmed" && (
        <>
          <Check size={13} strokeWidth={2} className="text-[#45633D]" /> Prices &amp; stock confirmed
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle size={13} strokeWidth={1.8} /> Couldn&rsquo;t confirm prices just now — they&rsquo;re checked again at checkout.
        </>
      )}
    </p>
  );
}

/** Messages about changes the server found (new price, low stock, sold out). */
export function BagNotices({ className }: { className?: string }) {
  const notices = useCartQuote((state) => state.notices);
  const dismiss = useCartQuote((state) => state.dismiss);
  return (
    <div className={clsx("space-y-2", className)} role="status">
      <AnimatePresence initial={false}>
        {notices.map((notice) => (
          <motion.div
            key={notice.id}
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className={clsx(
              "glass flex items-start gap-3 rounded-[18px] px-4 py-3 text-[13px] leading-[1.5]",
              notice.tone === "warning" ? "tint-saffron text-[#5c3d08]" : "tint-aqua text-[#24575a]",
            )}
          >
            <span className="relative z-[2] mt-0.5 shrink-0">
              {notice.tone === "warning" ? <AlertCircle size={15} strokeWidth={1.8} /> : <Info size={15} strokeWidth={1.8} />}
            </span>
            <span className="relative z-[2] flex-1">{notice.message}</span>
            <button
              type="button"
              onClick={() => dismiss(notice.id)}
              aria-label="Dismiss"
              className="relative z-[2] -mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-white/50"
            >
              <X size={13} strokeWidth={1.8} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/** Sold out / low stock flag for one bag line. */
export function LineFlag({ variantId }: { variantId: number }) {
  const line = useLineQuote(variantId);
  if (!line) return null;
  if (line.status === "sold_out")
    return (
      <span className="inline-flex items-center rounded-full bg-[#F6E3E4] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8E4F5B] ring-1 ring-inset ring-white/70">
        Sold out · not in total
      </span>
    );
  if (line.stock > 0 && line.stock <= 5)
    return (
      <span className="inline-flex items-center rounded-full bg-[#F8E3B8] px-2.5 py-0.5 text-[11px] font-semibold text-[#7A500C] ring-1 ring-inset ring-white/70">
        Only {line.stock} left
      </span>
    );
  return null;
}

/** Most of this line the shopper can add (stock, capped at 10). */
export function useLineMax(variantId: number) {
  const line = useLineQuote(variantId);
  return line ? Math.max(0, Math.min(10, line.stock)) : 10;
}
