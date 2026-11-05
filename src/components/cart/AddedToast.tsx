"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ShoppingBag, X } from "lucide-react";
import { cartCount, useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

const DISMISS_AFTER_MS = 4000;

/** "Added to your bag" confirmation that slides in after any add-to-bag. */
export default function AddedToast() {
  const notice = useCart((state) => state.lastAdded);
  const dismiss = useCart((state) => state.dismissNotice);
  const open = useCart((state) => state.open);
  const count = useCart((state) => cartCount(state.items));

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(dismiss, DISMISS_AFTER_MS);
    return () => clearTimeout(timer);
  }, [notice, dismiss]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[85] flex justify-center sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-[120px]"
    >
      <AnimatePresence>
        {notice && (
          <motion.div
            key={notice.at}
            role="status"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto relative w-full max-w-[380px] overflow-hidden rounded-2xl border border-gold/30 bg-emerald-deep text-ivory shadow-[0_30px_70px_-25px_rgba(0,0,0,0.55)]"
          >
            <div className="flex items-start gap-4 p-4 pr-11">
              <div className="relative h-[76px] w-[62px] shrink-0 overflow-hidden rounded-t-[40px] rounded-b-lg bg-parchment">
                {notice.item.image && (
                  <Image
                    src={notice.item.image}
                    alt=""
                    fill
                    sizes="62px"
                    className="object-cover mix-blend-multiply"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-gold-soft">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-soft text-emerald-deep">
                    <Check size={12} strokeWidth={2} />
                  </span>
                  Added to your bag
                </p>
                <p className="mt-2 truncate font-display text-[19px] leading-tight">
                  {notice.item.name}
                </p>
                <p className="mt-1 text-[12px] text-ivory/60">
                  {notice.quantity} × {formatPrice(notice.item.price)}
                  {notice.item.variantName !== "Gift box" && ` · ${notice.item.variantName}`}
                </p>
              </div>

              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss"
                className="absolute right-3 top-3 text-ivory/50 transition hover:text-ivory"
              >
                <X size={16} strokeWidth={1.25} />
              </button>
            </div>

            <div className="flex items-center gap-3 border-t border-ivory/10 px-4 py-3">
              <button
                type="button"
                onClick={open}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold-soft py-2.5 text-[11px] uppercase tracking-[0.2em] text-emerald-deep transition hover:bg-ivory"
              >
                <ShoppingBag size={14} strokeWidth={1.5} />
                View bag ({count})
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="flex-1 rounded-full border border-ivory/25 py-2.5 text-[11px] uppercase tracking-[0.2em] text-ivory/85 transition hover:border-ivory hover:text-ivory"
              >
                Keep shopping
              </button>
            </div>

            {/* Time remaining before auto-dismiss */}
            <motion.span
              className="absolute bottom-0 left-0 h-[2px] bg-gold-soft"
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
