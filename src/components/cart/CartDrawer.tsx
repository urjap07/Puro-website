"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Heart, Minus, Plus, ShoppingBag, Truck, X } from "lucide-react";
import { FREE_DELIVERY_THRESHOLD, useCart } from "@/lib/cart-store";
import { useCartQuote, useCartQuoteSync } from "@/lib/cart-quote";
import { BagNotices, LineFlag, PriceCheckStatus, useBagTotals, useLineMax } from "./BagCheck";
import { useWishlist } from "@/lib/wishlist-store";
import { destinationLabel, useDeliveryEstimate } from "@/lib/delivery";
import { cutoutFor } from "@/lib/cutouts";
import { formatPrice } from "@/lib/format";
import { PROGRESS_FILL, PROGRESS_TRACK, WELL_SHADOW, wellTint } from "./wellTint";

const EASE = [0.22, 1, 0.36, 1] as const;

function Thumb({ slug, image, name }: { slug: string; image: string | null; name: string }) {
  const cutout = cutoutFor(slug);
  return (
    <span className={clsx("relative block h-[104px] w-[86px] shrink-0 overflow-hidden rounded-[18px]", wellTint(slug), WELL_SHADOW)}>
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
      <div className="glass tint-aqua mx-5 mt-5 rounded-[22px] p-4 text-[14px] text-ink">
        <p className="flex items-center gap-2.5">
          <Truck size={17} strokeWidth={1.3} className="text-aqua-deep" />
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
    <div className="glass tint-saffron mx-5 mt-5 rounded-[22px] p-4">
      <p className="flex items-center gap-2.5 text-[14px] text-ink">
        <Truck size={17} strokeWidth={1.3} className="text-saffron-deep" />
        {remaining > 0 ? (
          <span>
            You&rsquo;re <strong className="font-semibold text-midnight">{formatPrice(remaining)}</strong> away from free delivery
          </span>
        ) : (
          <span className="font-medium text-midnight">You&rsquo;ve unlocked free delivery</span>
        )}
      </p>
      <div className={clsx("mt-3 h-2 overflow-hidden rounded-full", PROGRESS_TRACK)}>
        <motion.div
          className={clsx("h-full rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]", PROGRESS_FILL)}
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: EASE }}
        />
      </div>
    </div>
  );
}

/** "+" that stops at what's in stock. */
function IncreaseButton({
  variantId,
  quantity,
  name,
  onIncrease,
  children,
}: {
  variantId: number;
  quantity: number;
  name: string;
  onIncrease: () => void;
  children: React.ReactNode;
}) {
  const max = useLineMax(variantId);
  return (
    <button
      type="button"
      disabled={quantity >= max}
      className="flex h-full w-10 items-center justify-center text-emerald hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
      onClick={onIncrease}
      aria-label={`Increase quantity of ${name}`}
    >
      {children}
    </button>
  );
}

export default function CartDrawer() {
  const { items, isOpen, view, setView, close, setQuantity, remove, add } = useCart();
  const saved = useWishlist((state) => state.items);
  const unsave = useWishlist((state) => state.remove);
  const { subtotal, count } = useBagTotals(items);
  const { freeDeliveryApplies } = useDeliveryEstimate();
  const refreshQuote = useCartQuote((state) => state.refresh);

  // Prices, stock and totals are always confirmed by the server.
  useCartQuoteSync();
  useEffect(() => {
    if (isOpen) refreshQuote();
  }, [isOpen, refreshQuote]);

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
            className="fixed inset-0 z-[80] bg-[radial-gradient(90%_70%_at_100%_50%,rgba(14,39,42,0.45),rgba(14,39,42,0.25))] backdrop-blur-[6px] backdrop-saturate-150"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Your bag"
            className="glass-strong !fixed inset-y-2 right-2 left-2 z-[90] flex flex-col overflow-hidden rounded-[28px] sm:inset-y-3 sm:left-auto sm:right-3 sm:w-[calc(100%-24px)] sm:max-w-[460px] sm:rounded-[32px]"
            initial={{ x: "105%" }}
            animate={{ x: 0 }}
            exit={{ x: "105%" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <header className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
              <div className="relative grid grid-cols-2 rounded-full bg-white/40 p-1 shadow-[inset_0_1px_2px_rgba(14,39,42,0.12),inset_0_0_0_1px_rgba(255,255,255,0.6)]">
                {(["bag", "saved"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setView(tab)}
                    className={clsx(
                      "relative z-10 flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[12px] font-medium uppercase tracking-[0.18em] transition-colors duration-500 sm:px-5",
                      view === tab ? "text-midnight-deep" : "text-midnight/80 hover:text-midnight",
                    )}
                  >
                    {view === tab && (
                      <motion.span layoutId="bag-tab" className="absolute inset-0 -z-10 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0)_55%),linear-gradient(110deg,#f6e3c8_0%,#f2c9c4_30%,#d9c8ec_62%,#bfe2e3_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_8px_18px_-10px_rgba(125,104,168,0.6)]" transition={{ duration: 0.45, ease: EASE }} />
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
                className="btn-glass h-11 w-11 shrink-0 !p-0"
              >
                <X size={18} strokeWidth={1.3} />
              </button>
            </header>

            {view === "bag" ? (
              items.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
                  <span className="glass tint-quartz flex h-20 w-20 items-center justify-center rounded-full">
                    <ShoppingBag size={30} strokeWidth={1} className="text-quartz-deep" />
                  </span>
                  <p className="mt-7 font-display text-[34px] leading-tight text-midnight">Your basket is empty</p>
                  <p className="mt-3 text-[15px] leading-7 text-stone">Wander the shelves and pick a ritual or two.</p>
                  <Link href="/shop" onClick={close} className="btn-primary mt-8 rounded-full px-9">
                    Browse the shelves
                  </Link>
                </div>
              ) : (
                <>
                  <DeliveryBar subtotal={subtotal} />
                  <BagNotices className="mx-5 mt-3" />
                  <ul data-lenis-prevent className="mt-3 flex-1 space-y-3 overflow-y-auto px-5 py-2">
                    <AnimatePresence initial={false}>
                      {items.map((item) => (
                        <motion.li
                          key={item.variantId}
                          layout
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -30, height: 0 }}
                          transition={{ duration: 0.4, ease: EASE }}
                          className="glass flex gap-4 rounded-[24px] p-3"
                        >
                          <Link href={`/products/${item.slug}`} onClick={close}>
                            <Thumb slug={item.slug} image={item.image} name={item.name} />
                          </Link>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-3">
                              <Link
                                href={`/products/${item.slug}`}
                                onClick={close}
                                className="font-display text-[21px] leading-[1.1] text-ink transition hover:text-midnight-soft"
                              >
                                {item.name}
                              </Link>
                              <p className="shrink-0 font-display text-[19px] text-ink">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                            <p className="mt-1 text-[13px] text-stone">
                              {formatPrice(item.price)}
                              {item.variantName !== "Gift box" && ` · ${item.variantName}`}
                            </p>
                            <div className="mt-1.5">
                              <LineFlag variantId={item.variantId} />
                            </div>
                            <div className="mt-auto flex items-center justify-between pr-1 pt-3">
                              <div className="flex h-10 items-center rounded-full bg-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_0_0_1px_rgba(255,255,255,0.6),0_6px_14px_-10px_rgba(14,39,42,0.5)] backdrop-blur-md">
                                <button
                                  type="button"
                                  className="flex h-full w-10 items-center justify-center text-emerald hover:text-ink"
                                  onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                                  aria-label={`Decrease quantity of ${item.name}`}
                                >
                                  <Minus size={13} strokeWidth={1.4} />
                                </button>
                                <span className="w-6 text-center text-[14px] tabular-nums">{item.quantity}</span>
                                <IncreaseButton variantId={item.variantId} quantity={item.quantity} name={item.name} onIncrease={() => setQuantity(item.variantId, item.quantity + 1)}>
                                  <Plus size={13} strokeWidth={1.4} />
                                </IncreaseButton>
                              </div>
                              <button
                                type="button"
                                onClick={() => remove(item.variantId)}
                                className="rounded-full px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-stone underline-offset-4 hover:text-midnight hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>

                  <footer className="glass tint-champagne m-3 mt-2 rounded-[26px] px-5 pb-5 pt-5">
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
                    <div className="mt-4 flex items-baseline justify-between border-t border-white/70 pt-4">
                      <span className="text-[12px] font-medium uppercase tracking-[0.22em] text-stone">Total</span>
                      <span className="font-display text-[32px] leading-none text-midnight">{formatPrice(subtotal)}</span>
                    </div>
                    <PriceCheckStatus className="mt-2 justify-end" />
                    <button type="button" disabled className="btn-primary mt-5 w-full cursor-not-allowed opacity-70">
                      Checkout — coming soon
                    </button>
                    <div className="mt-2 flex gap-2">
                      <Link
                        href="/cart"
                        onClick={close}
                        className="btn-glass flex-1 !px-4 !py-3 !text-[11px]"
                      >
                        View full bag
                      </Link>
                      <button
                        type="button"
                        onClick={close}
                        className="flex-1 rounded-full py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-midnight transition hover:bg-white/40"
                      >
                        Keep shopping
                      </button>
                    </div>
                  </footer>
                </>
              )
            ) : saved.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
                <span className="glass tint-lilac flex h-20 w-20 items-center justify-center rounded-full">
                  <Heart size={30} strokeWidth={1} className="text-lilac-deep" />
                </span>
                <p className="mt-7 font-display text-[34px] leading-tight text-midnight">Nothing saved yet</p>
                <p className="mt-3 text-[15px] leading-7 text-stone">Tap the heart on any product to keep it here for later.</p>
              </div>
            ) : (
              <ul data-lenis-prevent className="mt-4 flex-1 space-y-3 overflow-y-auto px-5 pb-5">
                <AnimatePresence initial={false}>
                  {saved.map((item) => {
                    const inBag = items.some((bagItem) => bagItem.variantId === item.variantId);
                    return (
                      <motion.li
                        key={item.productId}
                        layout
                        exit={{ opacity: 0, x: -30, height: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="glass flex gap-4 rounded-[24px] p-3"
                      >
                        <Link href={`/products/${item.slug}`} onClick={close}>
                          <Thumb slug={item.slug} image={item.image} name={item.name} />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <Link href={`/products/${item.slug}`} onClick={close} className="font-display text-[21px] leading-[1.1] text-ink transition hover:text-midnight-soft">
                              {item.name}
                            </Link>
                            <button type="button" aria-label={`Remove ${item.name} from saved`} onClick={() => unsave(item.productId)} className="mr-1 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-quartz-deep transition hover:bg-white/50">
                              <Heart size={18} strokeWidth={1.4} className="fill-current" />
                            </button>
                          </div>
                          <p className="mt-1 font-display text-[19px] text-ink">{formatPrice(item.price)}</p>
                          <button
                            type="button"
                            disabled={inBag}
                            onClick={() => add({ ...item })}
                            className={clsx(
                              "mt-auto self-start !gap-2 !px-5 !py-2.5 !text-[11px] !tracking-[0.18em]",
                              inBag ? "btn-glass cursor-default" : "btn-iris",
                            )}
                          >
                            <ShoppingBag size={13} strokeWidth={1.5} /> {inBag ? "In your bag" : "Move to bag"}
                          </button>
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
                <li className="pt-1 text-center">
                  <Link href="/wishlist" onClick={close} className="btn-glass !px-6 !py-3 !text-[11px]">
                    <Heart size={14} strokeWidth={1.6} /> View full wishlist
                  </Link>
                </li>
              </ul>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
