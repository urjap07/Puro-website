"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { cartSubtotal, useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

export default function CartDrawer() {
  const { items, isOpen, close, setQuantity, remove } = useCart();
  const subtotal = cartSubtotal(items);

  useEffect(() => {
    useCart.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-emerald-deep/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            className="fixed inset-y-0 right-0 z-[90] flex w-full max-w-[440px] flex-col bg-ivory shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="flex items-center justify-between border-b border-line px-7 py-6">
              <h2 className="font-display text-[26px] text-emerald">
                Your Bag
                {items.length > 0 && (
                  <span className="ml-2 align-middle font-sans text-[11px] tracking-[0.2em] text-stone">
                    ({items.reduce((n, item) => n + item.quantity, 0)})
                  </span>
                )}
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close bag"
                className="text-emerald transition hover:text-gold"
              >
                <X size={22} strokeWidth={1.1} />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
                <p className="ornament text-[10px]">◆</p>
                <p className="mt-6 font-display text-[28px] font-light text-emerald">
                  Your bag is empty
                </p>
                <p className="mt-3 text-[14px] leading-7 text-stone">
                  Discover rituals rooted in nature, crafted for skin, body and soul.
                </p>
                <Link href="/shop" onClick={close} className="btn-primary mt-8">
                  Explore the collection
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-line overflow-y-auto px-7">
                  {items.map((item) => (
                    <li key={item.variantId} className="flex gap-5 py-6">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={close}
                        className="relative h-[112px] w-[90px] shrink-0 overflow-hidden bg-parchment"
                      >
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="90px"
                            className="object-cover"
                          />
                        )}
                      </Link>

                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={close}
                            className="font-display text-[18px] leading-snug text-emerald hover:text-gold-deep"
                          >
                            {item.name}
                          </Link>
                          <p className="shrink-0 text-[14px] text-ink">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                        <p className="mt-1 text-[12px] text-stone">{item.variantName}</p>

                        <div className="mt-auto flex items-center justify-between pt-4">
                          <div className="flex h-9 items-center border border-line">
                            <button
                              type="button"
                              className="flex h-full w-9 items-center justify-center text-emerald hover:text-gold"
                              onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                              aria-label={`Decrease quantity of ${item.name}`}
                            >
                              <Minus size={12} strokeWidth={1.25} />
                            </button>
                            <span className="w-6 text-center text-[13px] tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              className="flex h-full w-9 items-center justify-center text-emerald hover:text-gold"
                              onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                              aria-label={`Increase quantity of ${item.name}`}
                            >
                              <Plus size={12} strokeWidth={1.25} />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(item.variantId)}
                            className="text-[10px] uppercase tracking-[0.2em] text-stone underline-offset-4 hover:text-emerald hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <footer className="border-t border-line bg-parchment/60 px-7 py-6">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] uppercase tracking-[0.22em] text-stone">
                      Subtotal
                    </span>
                    <span className="font-display text-[26px] text-emerald">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-stone">
                    Inclusive of all taxes. Shipping calculated at checkout.
                  </p>
                  <button
                    type="button"
                    disabled
                    className="btn-primary mt-5 w-full cursor-not-allowed opacity-60"
                  >
                    Checkout — coming soon
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    className="mt-3 w-full py-2 text-[10px] uppercase tracking-[0.22em] text-emerald hover:text-gold-deep"
                  >
                    Continue shopping
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
