"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { ChevronRight, Gift, HandHeart, Heart, Lock, MapPin, Minus, Plus, Rabbit, ShoppingBag, Trash2, Truck, Undo2 } from "lucide-react";
import type { Product } from "@/db/queries/products";
import { type CartItem, FREE_DELIVERY_THRESHOLD, useCart } from "@/lib/cart-store";
import { useCartQuote } from "@/lib/cart-quote";
import { BagNotices, PriceCheckStatus, useBagTotals } from "./BagCheck";
import { type SavedItem, useWishlist } from "@/lib/wishlist-store";
import { INDIA_DAYS, destinationLabel, useDeliveryEstimate } from "@/lib/delivery";
import { cutoutFor } from "@/lib/cutouts";
import { formatPrice } from "@/lib/format";
import Price from "@/components/commerce/Price";
import ProductRow, { RecentlyViewedRow } from "@/components/commerce/ProductRow";
import { PROGRESS_FILL, PROGRESS_TRACK, WELL_SHADOW, wellTint } from "./wellTint";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Waits for the bag and saved list to load from this browser. */
function useStoresReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all([useCart.persist.rehydrate(), useWishlist.persist.rehydrate()]).then(() => setReady(true));
  }, []);
  return ready;
}

function Thumb({ slug, image, name, size = "lg" }: { slug: string; image: string | null; name: string; size?: "lg" | "md" }) {
  const cutout = cutoutFor(slug);
  return (
    <Link
      href={`/products/${slug}`}
      className={clsx(
        "relative block shrink-0 overflow-hidden rounded-[22px]",
        wellTint(slug),
        WELL_SHADOW,
        size === "lg" ? "h-[120px] w-[110px] sm:h-[160px] sm:w-[150px]" : "aspect-square w-full",
      )}
    >
      {cutout ? (
        <Image src={cutout} alt={name} fill sizes="160px" className="object-contain p-3 drop-shadow-[0_12px_12px_rgba(0,0,0,0.15)]" />
      ) : (
        image && <Image src={image} alt={name} fill sizes="160px" className="object-cover" />
      )}
    </Link>
  );
}

function Stock({ variant }: { variant?: Product["variants"][number] }) {
  if (!variant) return null;
  if (variant.stockQuantity <= 0) return <p className="text-[14px] font-semibold text-blush-deep">Currently unavailable</p>;
  if (variant.stockQuantity <= 5) return <p className="text-[14px] font-semibold text-blush-deep">Only {variant.stockQuantity} left in stock</p>;
  return <p className="text-[14px] font-semibold text-sage-deep">In stock</p>;
}

const linkAction = "rounded-full text-[13px] font-medium text-midnight underline-offset-4 hover:underline";

/** The full bag page: items, saved for later, order summary and suggestions. */
export default function CartPage({ products }: { products: Product[] }) {
  const ready = useStoresReady();
  const items = useCart((state) => state.items);
  const add = useCart((state) => state.add);
  const setQuantity = useCart((state) => state.setQuantity);
  const remove = useCart((state) => state.remove);
  const saved = useWishlist((state) => state.items);
  const toggleSaved = useWishlist((state) => state.toggle);
  const unsave = useWishlist((state) => state.remove);
  const { destination, dates, zone, freeDeliveryApplies } = useDeliveryEstimate();
  const [undo, setUndo] = useState<{ item: CartItem; savedForLater: boolean } | null>(null);

  // Totals confirmed by the server (the bag drawer keeps them in sync).
  const { count, subtotal } = useBagTotals(items);
  const refreshQuote = useCartQuote((state) => state.refresh);
  useEffect(() => refreshQuote(), [refreshQuote]);
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const variants = useMemo(() => new Map(products.flatMap((p) => p.variants.map((v) => [v.id, { product: p, variant: v }] as const))), [products]);

  useEffect(() => {
    if (!undo) return;
    const timer = setTimeout(() => setUndo(null), 8000);
    return () => clearTimeout(timer);
  }, [undo]);

  const deleteItem = (item: CartItem) => {
    remove(item.variantId);
    setUndo({ item, savedForLater: false });
  };
  const saveForLater = (item: CartItem) => {
    if (!saved.some((s) => s.productId === item.productId)) {
      toggleSaved({ productId: item.productId, variantId: item.variantId, slug: item.slug, name: item.name, variantName: item.variantName, price: item.price, image: item.image });
    }
    remove(item.variantId);
    setUndo({ item, savedForLater: true });
  };
  const undoLast = () => {
    if (!undo) return;
    const { quantity, ...rest } = undo.item;
    add(rest, quantity);
    useCart.getState().dismissNotice();
    if (undo.savedForLater) unsave(undo.item.productId);
    setUndo(null);
  };
  const moveToBag = (item: SavedItem) => {
    add(item);
    useCart.getState().dismissNotice();
    unsave(item.productId);
  };

  // Suggestions: first what gets the bag to free delivery, then what pairs with it.
  const inBag = new Set(items.map((item) => item.productId));
  const notInBag = products.filter((p) => !inBag.has(p.id) && p.variants[0] && p.variants[0].stockQuantity > 0);
  const toFreeDelivery =
    remaining > 0 && freeDeliveryApplies && items.length > 0
      ? notInBag.filter((p) => p.variants[0].price >= remaining).sort((a, b) => a.variants[0].price - b.variants[0].price).slice(0, 12)
      : [];
  const bagConcerns = new Set(items.flatMap((item) => variants.get(item.variantId)?.product.concerns.map((c) => c.id) ?? []));
  const pairs = notInBag
    .map((p) => ({ p, score: p.concerns.filter((c) => bagConcerns.has(c.id)).length + (p.rating?.count ?? 0) / 1000 }))
    .sort((a, b) => b.score - a.score)
    .map(({ p }) => p)
    .slice(0, 12);
  const bestsellers = [...products].sort((a, b) => (b.rating?.count ?? 0) - (a.rating?.count ?? 0)).slice(0, 12);

  return (
    <div className="relative">
      <div className="container-site py-8 sm:py-12">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-stone">
          <Link href="/" className="hover:text-midnight hover:underline underline-offset-4">
            Home
          </Link>
          <ChevronRight size={13} strokeWidth={1.4} />
          <span className="text-ink">Your bag</span>
        </nav>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-8">
          {/* Order summary — first on phones, alongside on desktop */}
          <aside className={clsx("lg:sticky lg:top-[100px] lg:order-last", ready && items.length === 0 && "order-last")}>
            <div className="glass-strong rounded-[32px] p-6">
              {ready && items.length > 0 && freeDeliveryApplies && (
                <div className="glass tint-saffron mb-5 rounded-[22px] p-4">
                  <p className="flex items-center gap-2 text-[14px] text-ink">
                    <Truck size={17} strokeWidth={1.4} className="text-saffron-deep" />
                    {remaining > 0 ? (
                      <span>
                        Add <strong className="font-semibold text-midnight">{formatPrice(remaining)}</strong> more for FREE delivery
                      </span>
                    ) : (
                      <span className="font-semibold text-midnight">Your order qualifies for FREE delivery</span>
                    )}
                  </p>
                  <div className={clsx("mt-3 h-2 overflow-hidden rounded-full", PROGRESS_TRACK)}>
                    <motion.div
                      className={clsx("h-full rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]", PROGRESS_FILL)}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(1, subtotal / FREE_DELIVERY_THRESHOLD) * 100}%` }}
                      transition={{ duration: 0.8, ease: EASE }}
                    />
                  </div>
                </div>
              )}

              <p className="text-[18px] text-ink">
                Subtotal ({count} {count === 1 ? "item" : "items"}): <Price value={subtotal} size="md" className="ml-1 align-middle" />
              </p>
              <dl className="mt-4 space-y-2 border-t border-midnight/10 pt-4 text-[14px] text-stone">
                <div className="flex justify-between">
                  <dt>Items</dt>
                  <dd className="text-ink">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Delivery</dt>
                  <dd className="text-ink">
                    {!freeDeliveryApplies ? "Charged at checkout" : items.length === 0 ? "—" : remaining > 0 ? "Calculated at checkout" : <span className="font-semibold text-sage-deep">FREE</span>}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-midnight/10 pt-3">
                  <dt className="text-[12px] font-semibold uppercase tracking-[0.2em]">Order total</dt>
                  <dd className="font-display text-[30px] leading-none text-midnight">{formatPrice(subtotal)}</dd>
                </div>
              </dl>
              {items.length > 0 && <PriceCheckStatus className="mt-2 justify-end" />}

              <button type="button" disabled className="btn-iris mt-5 h-12 w-full cursor-not-allowed !gap-2 !py-0 !font-semibold !tracking-[0.16em] opacity-75">
                <Lock size={15} strokeWidth={1.6} /> Checkout — coming soon
              </button>
              <p className="mt-2 text-center text-[12px] text-stone">Secure checkout is being set up. Your bag is saved in this browser.</p>

              <div className="glass tint-aqua mt-5 rounded-[22px] p-4 text-[14px]">
                <p className="flex items-start gap-2.5">
                  <MapPin size={17} strokeWidth={1.4} className="mt-0.5 shrink-0 text-aqua-deep" />
                  {destination ? (
                    <span>
                      Delivering to <strong className="font-semibold">{destinationLabel(destination)}</strong>
                      <span className="block text-[13px] text-stone">
                        Arrives <strong className="font-semibold text-ink">{dates}</strong>
                        {zone && ` · ${zone.label}, ${zone.min}–${zone.max} days`}
                      </span>
                    </span>
                  ) : (
                    <span>
                      Delivered in {INDIA_DAYS} across India
                      <span className="block text-[13px] text-stone">Add your pincode under “Deliver to” at the top for exact dates.</span>
                    </span>
                  )}
                </p>
              </div>

              <ul className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] leading-tight text-stone">
                <li className="glass tint-lilac flex flex-col items-center gap-1.5 rounded-[18px] px-2 py-3 text-graphite">
                  <Lock size={16} strokeWidth={1.4} className="text-lilac-deep" /> Secure payments
                </li>
                <li className="glass tint-sage flex flex-col items-center gap-1.5 rounded-[18px] px-2 py-3 text-graphite">
                  <Rabbit size={16} strokeWidth={1.4} className="text-sage-deep" /> Cruelty-free
                </li>
                <li className="glass tint-quartz flex flex-col items-center gap-1.5 rounded-[18px] px-2 py-3 text-graphite">
                  <HandHeart size={16} strokeWidth={1.4} className="text-quartz-deep" /> Empowers women
                </li>
              </ul>
            </div>
          </aside>

          <div className="min-w-0 space-y-6">
            {/* Bag */}
            <section className="glass rounded-[32px] p-5 sm:p-8">
              <div className="flex items-end justify-between gap-4 border-b border-white/70 pb-4">
                <div>
                  <h1 className="font-display text-[40px] leading-none text-ink sm:text-[52px]">Your bag</h1>
                  {ready && items.length > 0 && <p className="mt-2 text-[14px] text-stone">{count} {count === 1 ? "item" : "items"} · prices include all taxes</p>}
                </div>
                {ready && items.length > 0 && <span className="hidden text-[13px] text-stone sm:block">Price</span>}
              </div>

              <AnimatePresence>
                {undo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="glass tint-champagne mt-4 flex flex-wrap items-center justify-between gap-3 rounded-full px-5 py-3 text-[14px]">
                      <span>
                        <strong className="font-semibold">{undo.item.name}</strong> {undo.savedForLater ? "was saved for later." : "was removed from your bag."}
                      </span>
                      <button type="button" onClick={undoLast} className="flex items-center gap-1.5 rounded-full font-semibold text-midnight underline-offset-4 hover:underline">
                        <Undo2 size={15} strokeWidth={1.6} /> Undo
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!ready ? (
                <div className="space-y-4 py-6" aria-hidden>
                  {[0, 1].map((i) => (
                    <div key={i} className="flex gap-5">
                      <div className="h-[160px] w-[150px] animate-pulse rounded-[22px] bg-white/50" />
                      <div className="flex-1 space-y-3 pt-2">
                        <div className="h-6 w-2/3 animate-pulse rounded-full bg-white/50" />
                        <div className="h-4 w-1/3 animate-pulse rounded-full bg-white/50" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center px-4 py-14 text-center">
                  <span className="glass tint-quartz flex h-20 w-20 items-center justify-center rounded-full">
                    <ShoppingBag size={32} strokeWidth={1} className="text-quartz-deep" />
                  </span>
                  <p className="mt-6 font-display text-[34px] leading-tight text-ink">Your bag is empty</p>
                  <p className="mt-2 max-w-[420px] text-[15px] leading-7 text-stone">
                    {saved.length > 0 ? "You have rituals saved for later below — move one in, or browse the shelves." : "Wander the shelves and pick a ritual or two. Every purchase empowers a woman artisan."}
                  </p>
                  <Link href="/shop" className="btn-primary mt-7 px-9">
                    Browse all rituals
                  </Link>
                </div>
              ) : (
                <>
                <BagNotices className="mt-5" />
                <ul>
                  <AnimatePresence initial={false}>
                    {items.map((item) => {
                      const match = variants.get(item.variantId);
                      const maxQty = Math.max(1, Math.min(10, match?.variant.stockQuantity || 10));
                      return (
                        <motion.li
                          key={item.variantId}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }}
                          transition={{ duration: 0.4, ease: EASE }}
                          className="flex gap-4 overflow-hidden border-b border-white/70 py-6 last:border-b-0 sm:gap-6"
                        >
                          <Thumb slug={item.slug} image={item.image} name={item.name} />
                          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                {match?.product.subCategory && <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-deep">{match.product.subCategory}</p>}
                                <Link href={`/products/${item.slug}`} className="mt-1 block font-display text-[22px] leading-[1.1] text-ink transition hover:text-midnight-soft sm:text-[26px]">
                                  {item.name}
                                </Link>
                              </div>
                              <div className="shrink-0 text-right">
                                <Price value={item.price * item.quantity} size="sm" />
                                {item.quantity > 1 && <p className="mt-1 text-[12px] text-stone">{formatPrice(item.price)} each</p>}
                              </div>
                            </div>
                            <Stock variant={match?.variant} />
                            <p className="text-[13px] text-stone">
                              {match?.product.sizeLabel ?? item.variantName}
                              {match?.product.kitContents.length ? (
                                <span className="ml-2 inline-flex items-center gap-1 text-gold-deep">
                                  <Gift size={13} strokeWidth={1.5} /> Keepsake gift box
                                </span>
                              ) : null}
                            </p>
                            {dates && (
                              <p className="flex items-center gap-1.5 text-[13px] text-stone">
                                <Truck size={14} strokeWidth={1.4} className="text-saffron-deep" /> Arrives {dates}
                              </p>
                            )}
                            <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-3">
                              <div className="flex h-10 items-center rounded-full bg-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_0_0_1px_rgba(255,255,255,0.6),0_6px_14px_-10px_rgba(14,39,42,0.5)] backdrop-blur-md">
                                <button
                                  type="button"
                                  aria-label={item.quantity === 1 ? `Remove ${item.name}` : `One less ${item.name}`}
                                  onClick={() => (item.quantity === 1 ? deleteItem(item) : setQuantity(item.variantId, item.quantity - 1))}
                                  className="flex h-full w-10 items-center justify-center text-midnight hover:text-quartz-deep"
                                >
                                  {item.quantity === 1 ? <Trash2 size={14} strokeWidth={1.5} /> : <Minus size={14} strokeWidth={1.6} />}
                                </button>
                                <span className="w-7 text-center text-[14px] font-semibold tabular-nums">{item.quantity}</span>
                                <button
                                  type="button"
                                  aria-label={`One more ${item.name}`}
                                  disabled={item.quantity >= maxQty}
                                  onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                                  className="flex h-full w-10 items-center justify-center text-midnight hover:text-quartz-deep disabled:opacity-30"
                                >
                                  <Plus size={14} strokeWidth={1.6} />
                                </button>
                              </div>
                              <span className="flex items-center gap-4">
                                <button type="button" onClick={() => deleteItem(item)} className={linkAction}>
                                  Delete
                                </button>
                                <span className="h-4 w-px bg-midnight/15" />
                                <button type="button" onClick={() => saveForLater(item)} className={linkAction}>
                                  Save for later
                                </button>
                              </span>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
                </>
              )}

              {ready && items.length > 0 && (
                <p className="border-t border-white/70 pt-4 text-right text-[18px] text-ink">
                  Subtotal ({count} {count === 1 ? "item" : "items"}): <Price value={subtotal} size="md" className="ml-1 align-middle" />
                </p>
              )}
            </section>

            {/* Saved for later */}
            {ready && saved.length > 0 && (
              <section className="glass tint-lilac rounded-[32px] p-5 sm:p-8">
                <h2 className="flex items-center gap-2.5 font-display text-[30px] leading-tight text-ink sm:text-[36px]">
                  <Heart size={22} strokeWidth={1.3} className="fill-quartz-deep text-quartz-deep" /> Saved for later
                  <span className="text-[18px] text-stone">({saved.length})</span>
                </h2>
                <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                  <AnimatePresence initial={false}>
                    {saved.map((item) => {
                      const match = variants.get(item.variantId);
                      const alreadyInBag = items.some((bagItem) => bagItem.variantId === item.variantId);
                      const available = !match || match.variant.stockQuantity > 0;
                      return (
                        <motion.li
                          key={item.productId}
                          layout
                          exit={{ opacity: 0, scale: 0.94 }}
                          transition={{ duration: 0.35, ease: EASE }}
                          className="glass-strong glass-hover flex flex-col rounded-[26px] p-3"
                        >
                          <Thumb slug={item.slug} image={item.image} name={item.name} size="md" />
                          <Link href={`/products/${item.slug}`} className="mt-3 line-clamp-2 font-display text-[19px] leading-[1.15] text-ink transition hover:text-midnight-soft">
                            {item.name}
                          </Link>
                          <Price value={match?.variant.price ?? item.price} size="sm" className="mt-2" />
                          <div className="mt-1">
                            <Stock variant={match?.variant} />
                          </div>
                          <div className="mt-auto space-y-2 pt-3">
                            <button
                              type="button"
                              disabled={alreadyInBag || !available}
                              onClick={() => moveToBag(item)}
                              className={clsx(
                                "h-10 w-full !gap-2 !px-3 !py-0 !text-[11px] !font-semibold !tracking-[0.14em]",
                                alreadyInBag || !available ? "btn-glass cursor-default" : "btn-iris",
                              )}
                            >
                              <ShoppingBag size={13} strokeWidth={1.6} /> {alreadyInBag ? "In your bag" : available ? "Move to bag" : "Unavailable"}
                            </button>
                            <button type="button" onClick={() => unsave(item.productId)} className="w-full py-1 text-[13px] text-stone underline-offset-4 hover:text-blush-deep hover:underline">
                              Remove
                            </button>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              </section>
            )}
          </div>
        </div>

        {/* Suggestions */}
        {ready && (
          <div className="mt-8 space-y-6">
            {toFreeDelivery.length > 0 && (
              <ProductRow title={`Add ${formatPrice(remaining)} more for free delivery`} note="Any one of these gets your order there" products={toFreeDelivery} />
            )}
            {items.length > 0 ? (
              <ProductRow title="Pairs beautifully with your bag" note="Chosen for the same skin and hair concerns" products={pairs} />
            ) : (
              <ProductRow title="Bestsellers" note="Most-loved rituals, ranked by reviews" href="/search?sort=bestsellers" products={bestsellers} ranked />
            )}
            <RecentlyViewedRow products={products} />
          </div>
        )}
      </div>
    </div>
  );
}
