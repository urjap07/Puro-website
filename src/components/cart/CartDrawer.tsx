"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Heart, Minus, Plus, ShoppingBag, Truck, X } from "lucide-react";
import { FREE_DELIVERY_THRESHOLD, cartCount, cartSubtotal, useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { destinationLabel, useDeliveryEstimate } from "@/lib/delivery";
import { cutoutFor } from "@/lib/cutouts";
import { formatPrice } from "@/lib/format";

const EASE = [0.22, 1, 0.36, 1] as const;

function Thumb({ slug, image, name }: { slug: string; image: string | null; name: string }) {
  const cutout = cutoutFor(slug);
  return (
    <span className="relative block h-[104px] w-[86px] shrink-0 overflow-hidden rounded-[16px] bg-[radial-gradient(ellipse_80%_65%_at_50%_45%,#ffffff_0%,#f3ece1_60%,#e6dccb_100%)]">
      {cutout ? (
        <Image src={cutout} alt={name} fill sizes="86px" className="object-contain p-2.5" />
      ) : (
        image && <Image src={image} alt={name} fill sizes="86px" className="object-cover" />
      )}
    </span>
  );
}

/** Free-delivery progress, shown at the top of the bag. */
function DeliveryBar({ subtotal }: { subtotal: number }) {
  const { destination, zone, dates, freeDeliveryApplies } = useDeliveryEstimate();
  if (!freeDeliveryApplies && destination && zone) {
    return (
      <div className="mx-6 mt-5 rounded-[18px] border border-emerald/10 bg-ivory/80 p-4 text-[14px] text-ink">
        <p className="flex items-center gap-2.5">
          <Truck size={17} strokeWidth={1.3} className="text-emerald" />
          <span>
            Shipping to <strong className="font-semibold">{destinationLabel(destination)}</strong> · arrives {dates}
          </span>
        </p>
        <p className="mt-1.5 pl-[27px] text-[13px] text-stone">International shipping is charged at checkout.</p>
      </div>
    );
  }
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progress = Math.min(1, subtotal / FREE_DELIVERY_THRESHOLD);
  return (
    <div className="mx-6 mt-5 rounded-[18px] border border-emerald/10 bg-ivory/80 p-4">
      <p className="flex items-center gap-2.5 text-[14px] text-ink">
        <Truck size={17} strokeWidth={1.3} className="text-emerald" />
        {remaining > 0 ? (
          <span>
            You&rsquo;re <strong className="font-semibold text-emerald">{formatPrice(remaining)}</strong> away from free delivery
          </span>
        ) : (
          <span className="font-medium text-emerald">You&rsquo;ve unlocked free delivery</span>
        )}
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-emerald/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald via-gold to-gold-soft"
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: EASE }}
        />
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const { items, isOpen, view, setView, close, setQuantity, remove, add } = useCart();
  const saved = useWishlist((state) => state.items);
  const unsave = useWishlist((state) => state.remove);
  const subtotal = cartSubtotal(items);
  const count = cartCount(items);
  const { freeDeliveryApplies } = useDeliveryEstimate();

  useEffect(() => {
    useCart.persist.rehydrate();
    useWishlist.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    window.__lenis?.stop();
    return () => {
      document.removeEventListener("keydown", onKey);
      window.__lenis?.start();
    };
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-ink/45 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Your bag"
            className="bg-pearl fixed inset-y-0 right-0 z-[90] flex w-full max-w-[460px] flex-col shadow-[-40px_0_80px_-40px_rgba(0,0,0,0.5)] sm:inset-y-3 sm:right-3 sm:rounded-[28px]"
            initial={{ x: "105%" }}
            animate={{ x: 0 }}
            exit={{ x: "105%" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <header className="flex items-center justify-between px-6 pt-6">
              <div className="relative grid grid-cols-2 rounded-full border border-emerald/15 bg-ivory/70 p-1">
                {(["bag", "saved"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setView(tab)}
                    className={clsx(
                      "relative z-10 flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.18em] transition-colors duration-500",
                      view === tab ? "text-ivory" : "text-emerald",
                    )}
                  >
                    {view === tab && (
                      <motion.span layoutId="bag-tab" className="absolute inset-0 -z-10 rounded-full bg-emerald" transition={{ duration: 0.45, ease: EASE }} />
                    )}
                    {tab === "bag" ? <ShoppingBag size={14} strokeWidth={1.5} /> : <Heart size={14} strokeWidth={1.5} />}
                    {tab === "bag" ? `Bag (${count})` : `Saved (${saved.length})`}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-ink transition hover:bg-ink hover:text-ivory"
              >
                <X size={18} strokeWidth={1.2} />
              </button>
            </header>

            {view === "bag" ? (
              items.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
                  <ShoppingBag size={34} strokeWidth={0.9} className="text-emerald/50" />
                  <p className="mt-6 font-display text-[34px] leading-tight text-emerald">Your basket is empty</p>
                  <p className="mt-3 text-[15px] leading-7 text-stone">Wander the shelves and pick a ritual or two.</p>
                  <Link href="/shop" onClick={close} className="btn-primary mt-8 rounded-full px-9">
                    Browse the shelves
                  </Link>
                </div>
              ) : (
                <>
                  <DeliveryBar subtotal={subtotal} />
                  <ul data-lenis-prevent className="mt-2 flex-1 overflow-y-auto px-6">
                    <AnimatePresence initial={false}>
                      {items.map((item) => (
                        <motion.li
                          key={item.variantId}
                          layout
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -30, height: 0 }}
                          transition={{ duration: 0.4, ease: EASE }}
                          className="flex gap-4 border-b border-ink/10 py-5"
                        >
                          <Link href={`/products/${item.slug}`} onClick={close}>
                            <Thumb slug={item.slug} image={item.image} name={item.name} />
                          </Link>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-3">
                              <Link
                                href={`/products/${item.slug}`}
                                onClick={close}
                                className="font-display text-[21px] leading-[1.1] text-ink hover:text-emerald"
                              >
                                {item.name}
                              </Link>
                              <p className="shrink-0 font-display text-[19px] text-ink">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                            <p className="mt-1 text-[13px] text-stone">
                              {formatPrice(item.price)}
                              {item.variantName !== "Gift box" && ` · ${item.variantName}`}
                            </p>
                            <div className="mt-auto flex items-center justify-between pt-3">
                              <div className="flex h-10 items-center rounded-full border border-ink/15 bg-ivory/70">
                                <button
                                  type="button"
                                  className="flex h-full w-10 items-center justify-center text-emerald hover:text-ink"
                                  onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                                  aria-label={`Decrease quantity of ${item.name}`}
                                >
                                  <Minus size={13} strokeWidth={1.4} />
                                </button>
                                <span className="w-6 text-center text-[14px] tabular-nums">{item.quantity}</span>
                                <button
                                  type="button"
                                  className="flex h-full w-10 items-center justify-center text-emerald hover:text-ink"
                                  onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                                  aria-label={`Increase quantity of ${item.name}`}
                                >
                                  <Plus size={13} strokeWidth={1.4} />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => remove(item.variantId)}
                                className="text-[11px] uppercase tracking-[0.2em] text-stone underline-offset-4 hover:text-emerald hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>

                  <footer className="border-t border-ink/10 px-6 pb-6 pt-5">
                    <div className="space-y-1.5 text-[14px] text-stone">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="text-ink">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery</span>
                        <span className="text-ink">
                          {!freeDeliveryApplies ? "At checkout" : subtotal >= FREE_DELIVERY_THRESHOLD ? "Free" : `Free over ${formatPrice(FREE_DELIVERY_THRESHOLD)}`}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between border-t border-ink/10 pt-4">
                      <span className="text-[12px] font-medium uppercase tracking-[0.22em] text-stone">Total</span>
                      <span className="font-display text-[32px] leading-none text-emerald">{formatPrice(subtotal)}</span>
                    </div>
                    <button type="button" disabled className="btn-primary mt-5 w-full cursor-not-allowed rounded-full opacity-60">
                      Checkout — coming soon
                    </button>
                    <button
                      type="button"
                      onClick={close}
                      className="mt-2 w-full py-2 text-[11px] uppercase tracking-[0.22em] text-emerald hover:text-ink"
                    >
                      Keep shopping
                    </button>
                  </footer>
                </>
              )
            ) : saved.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
                <Heart size={34} strokeWidth={0.9} className="text-emerald/50" />
                <p className="mt-6 font-display text-[34px] leading-tight text-emerald">Nothing saved yet</p>
                <p className="mt-3 text-[15px] leading-7 text-stone">Tap the heart on any product to keep it here for later.</p>
              </div>
            ) : (
              <ul data-lenis-prevent className="mt-4 flex-1 overflow-y-auto px-6 pb-6">
                <AnimatePresence initial={false}>
                  {saved.map((item) => {
                    const inBag = items.some((bagItem) => bagItem.variantId === item.variantId);
                    return (
                      <motion.li
                        key={item.productId}
                        layout
                        exit={{ opacity: 0, x: -30, height: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="flex gap-4 border-b border-ink/10 py-5"
                      >
                        <Link href={`/products/${item.slug}`} onClick={close}>
                          <Thumb slug={item.slug} image={item.image} name={item.name} />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <Link href={`/products/${item.slug}`} onClick={close} className="font-display text-[21px] leading-[1.1] text-ink hover:text-emerald">
                              {item.name}
                            </Link>
                            <button type="button" aria-label={`Remove ${item.name} from saved`} onClick={() => unsave(item.productId)} className="text-rose-700">
                              <Heart size={18} strokeWidth={1.4} className="fill-current" />
                            </button>
                          </div>
                          <p className="mt-1 font-display text-[19px] text-ink">{formatPrice(item.price)}</p>
                          <button
                            type="button"
                            disabled={inBag}
                            onClick={() => add({ ...item })}
                            className={clsx(
                              "mt-auto flex items-center justify-center gap-2 self-start rounded-full px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.18em] transition",
                              inBag ? "bg-emerald/10 text-emerald" : "bg-emerald text-ivory hover:bg-ink",
                            )}
                          >
                            <ShoppingBag size={13} strokeWidth={1.5} /> {inBag ? "In your bag" : "Move to bag"}
                          </button>
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
