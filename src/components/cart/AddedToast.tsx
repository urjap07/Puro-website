"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ShoppingBag, Truck, X } from "lucide-react";
import { FREE_DELIVERY_THRESHOLD, cartCount, cartSubtotal, useCart } from "@/lib/cart-store";
import { cutoutFor } from "@/lib/cutouts";
import { useDeliveryEstimate } from "@/lib/delivery";
import { formatPrice } from "@/lib/format";
import { PROGRESS_FILL, PROGRESS_TRACK, WELL_SHADOW, wellTint } from "./wellTint";

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
  const onProduct = usePathname().startsWith("/products/");
  const { freeDeliveryApplies } = useDeliveryEstimate();

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(dismiss, DISMISS_AFTER_MS);
    return () => clearTimeout(timer);
  }, [notice, dismiss]);

  const image = notice ? cutoutFor(notice.item.slug) ?? notice.item.image : null;

  return (
    <div
      aria-live="polite"
      className={clsx("pointer-events-none fixed inset-x-3 z-[97] flex justify-center sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-[96px]", onProduct ? "bottom-[88px]" : "bottom-3")}
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
            className="glass-strong glass-liquid pointer-events-auto w-full max-w-[400px] overflow-hidden rounded-[28px] text-ink"
          >
            <div className="flex items-center gap-4 p-4 pr-12">
              <span className={clsx("relative h-[84px] w-[70px] shrink-0 overflow-hidden rounded-[18px]", wellTint(notice.item.slug), WELL_SHADOW)}>
                {image && <Image src={image} alt="" fill sizes="70px" className="object-contain p-2" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-midnight">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[linear-gradient(110deg,#f6e3c8_0%,#f2c9c4_30%,#d9c8ec_62%,#bfe2e3_100%)] text-midnight-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_2px_6px_-2px_rgba(125,104,168,0.6)]">
                    <Check size={12} strokeWidth={2.4} />
                  </span>
                  Added to your bag
                </span>
                <span className="mt-1.5 block truncate font-display text-[22px] leading-tight">{notice.item.name}</span>
                <span className="mt-0.5 block text-[13px] text-stone">
                  {notice.quantity} × {formatPrice(notice.item.price)} · Bag total <strong className="font-semibold text-ink">{formatPrice(subtotal)}</strong>
                </span>
              </span>
              <button type="button" onClick={dismiss} aria-label="Dismiss" className="absolute right-3 top-3 z-[2] flex h-8 w-8 items-center justify-center rounded-full text-stone transition hover:bg-white/60 hover:text-ink">
                <X size={16} strokeWidth={1.4} />
              </button>
            </div>

            {freeDeliveryApplies && (
            <div className="glass tint-saffron mx-4 rounded-[18px] px-3.5 py-2.5">
              <p className="flex items-center gap-2 text-[13px] text-ink">
                <Truck size={15} strokeWidth={1.4} className="text-saffron-deep" />
                {remaining > 0 ? (
                  <span>
                    Add <strong className="font-semibold">{formatPrice(remaining)}</strong> more for free delivery
                  </span>
                ) : (
                  <span className="font-semibold text-midnight">Free delivery unlocked</span>
                )}
              </p>
              <div className={clsx("mt-2 h-1.5 overflow-hidden rounded-full", PROGRESS_TRACK)}>
                <motion.div
                  className={clsx("h-full rounded-full", PROGRESS_FILL)}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(1, subtotal / FREE_DELIVERY_THRESHOLD) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </div>
            </div>
            )}

            <div className="flex gap-2.5 p-4">
              <button
                type="button"
                onClick={() => open()}
                className="btn-primary flex-1 !gap-2 !px-3 !py-3 !font-semibold !tracking-[0.16em]"
              >
                <ShoppingBag size={14} strokeWidth={1.6} /> View bag ({count})
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="btn-glass flex-1 !px-3 !py-3 !font-semibold !tracking-[0.16em]"
              >
                Keep shopping
              </button>
            </div>

            <motion.span
              className={clsx("absolute bottom-0 left-0 z-[2] h-[3px] rounded-full", PROGRESS_FILL)}
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
