"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ShoppingBag, Truck, X } from "lucide-react";
import { FREE_DELIVERY_THRESHOLD, cartCount, cartSubtotal, useCart } from "@/lib/cart-store";
import { cutoutFor } from "@/lib/cutouts";
import { formatPrice } from "@/lib/format";

const DISMISS_AFTER_MS = 4500;

/** "Added to your bag" pop-up, shown after every add. */
export default function AddedToast() {
  const notice = useCart((state) => state.lastAdded);
  const dismiss = useCart((state) => state.dismissNotice);
  const open = useCart((state) => state.open);
  const items = useCart((state) => state.items);
  const count = cartCount(items);
  const subtotal = cartSubtotal(items);
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(dismiss, DISMISS_AFTER_MS);
    return () => clearTimeout(timer);
  }, [notice, dismiss]);

  const image = notice ? cutoutFor(notice.item.slug) ?? notice.item.image : null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-3 bottom-3 z-[85] flex justify-center sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-[96px]"
    >
      <AnimatePresence>
        {notice && (
          <motion.div
            key={notice.at}
            role="status"
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.45, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto relative w-full max-w-[400px] overflow-hidden rounded-[24px] border border-ink/10 bg-ivory text-ink shadow-[0_40px_80px_-30px_rgba(0,0,0,0.55)]"
          >
            <div className="flex items-center gap-4 p-4 pr-12">
              <span className="relative h-[84px] w-[70px] shrink-0 overflow-hidden rounded-[14px] bg-[radial-gradient(ellipse_80%_65%_at_50%_45%,#ffffff_0%,#f3ece1_60%,#e6dccb_100%)]">
                {image && <Image src={image} alt="" fill sizes="70px" className="object-contain p-2" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-emerald">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-ivory">
                    <Check size={12} strokeWidth={2.4} />
                  </span>
                  Added to your bag
                </span>
                <span className="mt-1.5 block truncate font-display text-[22px] leading-tight">{notice.item.name}</span>
                <span className="mt-0.5 block text-[13px] text-stone">
                  {notice.quantity} × {formatPrice(notice.item.price)} · Bag total <strong className="font-semibold text-ink">{formatPrice(subtotal)}</strong>
                </span>
              </span>
              <button type="button" onClick={dismiss} aria-label="Dismiss" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-stone hover:bg-mist-deep hover:text-ink">
                <X size={16} strokeWidth={1.4} />
              </button>
            </div>

            <div className="mx-4 rounded-[14px] bg-mist px-3.5 py-2.5">
              <p className="flex items-center gap-2 text-[13px] text-ink">
                <Truck size={15} strokeWidth={1.4} className="text-emerald" />
                {remaining > 0 ? (
                  <span>
                    Add <strong className="font-semibold">{formatPrice(remaining)}</strong> more for free delivery
                  </span>
                ) : (
                  <span className="font-semibold text-emerald">Free delivery unlocked</span>
                )}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald via-gold to-gold-soft"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(1, subtotal / FREE_DELIVERY_THRESHOLD) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </div>
            </div>

            <div className="flex gap-2.5 p-4">
              <button
                type="button"
                onClick={() => open()}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-ivory transition hover:bg-ink"
              >
                <ShoppingBag size={14} strokeWidth={1.6} /> View bag ({count})
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="flex-1 rounded-full border border-ink/15 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink transition hover:border-ink"
              >
                Keep shopping
              </button>
            </div>

            <motion.span
              className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-gold to-gold-soft"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: DISMISS_AFTER_MS / 1000, ease: "linear" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
