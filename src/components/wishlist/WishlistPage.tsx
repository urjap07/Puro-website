"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Check, ChevronRight, Gift, Heart, Link2, Share2, ShoppingBag, X } from "lucide-react";
import type { Product } from "@/db/queries/products";
import { useCart } from "@/lib/cart-store";
import { type SavedItem, useWishlist } from "@/lib/wishlist-store";
import { cutoutFor } from "@/lib/cutouts";
import { formatPrice } from "@/lib/format";
import { flyToBasket } from "@/lib/flight-store";
import { flightImage, toCartItem } from "@/components/cart/AddToBag";
import ProductRow, { RecentlyViewedRow } from "@/components/commerce/ProductRow";
import { TINT, productTint } from "@/components/commerce/tints";

const EASE = [0.22, 1, 0.36, 1] as const;

function toSaved(product: Product): SavedItem {
  const variant = product.variants[0];
  return {
    productId: product.id,
    variantId: variant.id,
    slug: product.slug,
    name: product.name,
    variantName: variant.name,
    price: variant.price,
    image: product.images[0]?.imageUrl ?? null,
  };
}

/** One saved product, shown with today's price and stock. */
function SavedCard({
  product,
  onRemove,
  onMove,
  shared = false,
}: {
  product: Product;
  onRemove?: () => void;
  onMove: (event: React.MouseEvent<HTMLButtonElement>) => void;
  shared?: boolean;
}) {
  const variant = product.variants[0];
  const inStock = Boolean(variant && variant.stockQuantity > 0);
  const tint = TINT[productTint(product)];
  const cutout = cutoutFor(product.slug);
  const image = cutout ?? product.images[0]?.imageUrl ?? null;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.45, ease: EASE }}
      className={clsx("glass glass-hover flex flex-col rounded-[28px] p-3", tint.glass)}
    >
      <div data-fly-source className="relative">
        <Link href={`/products/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden rounded-[22px] bg-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
          {image && (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 22vw, (min-width: 640px) 30vw, 46vw"
              className={cutout ? "object-contain p-6" : "object-cover"}
            />
          )}
        </Link>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${product.name} from your wishlist`}
            className="btn-glass absolute right-3 top-3 h-9 w-9 !p-0"
          >
            <X size={15} strokeWidth={1.6} />
          </button>
        )}
        {!inStock && (
          <span className="absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8E4F5B]">
            Sold out
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
        {product.subCategory && <p className={clsx("text-[10px] font-semibold uppercase tracking-[0.2em]", tint.text)}>{product.subCategory}</p>}
        <h3 className="mt-1 font-display text-[22px] leading-[1.1] text-midnight">
          <Link href={`/products/${product.slug}`} className="relative z-[2] hover:underline hover:underline-offset-4">
            {product.name}
          </Link>
        </h3>
        {product.headline && <p className="mt-1 line-clamp-2 text-[13px] leading-[1.55] text-stone">{product.headline}</p>}
        <div className="mt-auto pt-4">
          {variant && (
            <p className="text-[15px] font-semibold text-graphite">
              {formatPrice(variant.price)}
              <span className="ml-2 text-[12px] font-normal text-stone">{product.sizeLabel ?? variant.name}</span>
            </p>
          )}
          <button
            type="button"
            disabled={!inStock}
            onClick={onMove}
            className={clsx("mt-3 w-full !py-3 !text-[11px]", inStock ? "btn-champagne" : "btn-glass cursor-not-allowed opacity-60")}
          >
            <ShoppingBag size={14} strokeWidth={1.6} /> {inStock ? (shared ? "Add to bag" : "Move to bag") : "Sold out"}
          </button>
        </div>
      </div>
    </motion.li>
  );
}

/** The wishlist: everything saved on this device, at today's prices, and lists shared by friends. */
export default function WishlistPage({ products }: { products: Product[] }) {
  const params = useSearchParams();
  const saved = useWishlist((state) => state.items);
  const toggle = useWishlist((state) => state.toggle);
  const unsave = useWishlist((state) => state.remove);
  const add = useCart((state) => state.add);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    useWishlist.persist.rehydrate();
    setReady(true);
    setCanShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  const bySlug = useMemo(() => new Map(products.map((product) => [product.slug, product])), [products]);
  const byId = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const items = saved.map((item) => byId.get(item.productId)).filter((product): product is Product => Boolean(product));
  const shared = (params.get("share") ?? "")
    .split(",")
    .map((slug) => bySlug.get(slug.trim()))
    .filter((product): product is Product => Boolean(product));
  const savedIds = new Set(saved.map((item) => item.productId));
  const inStock = items.filter((product) => (product.variants[0]?.stockQuantity ?? 0) > 0);

  const moveToBag = (product: Product, event: React.MouseEvent<HTMLButtonElement>, keepSaved = false) => {
    add(toCartItem(product));
    useCart.getState().dismissNotice();
    flyToBasket(event.currentTarget, flightImage(product));
    if (!keepSaved) unsave(product.id);
  };
  const addAll = (list: Product[], removeFromWishlist: boolean) => {
    for (const product of list) {
      if ((product.variants[0]?.stockQuantity ?? 0) <= 0) continue;
      add(toCartItem(product));
      if (removeFromWishlist) unsave(product.id);
    }
    useCart.getState().dismissNotice();
    useCart.getState().open();
  };
  const share = async () => {
    const url = `${window.location.origin}/wishlist?share=${items.map((product) => product.slug).join(",")}`;
    try {
      if (canShare) {
        await navigator.share({ title: "My PURO wishlist", text: "A few PURO rituals I love", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // The shopper closed the share sheet; nothing to do.
    }
  };

  const bestsellers = [...products].sort((a, b) => (b.rating?.count ?? 0) - (a.rating?.count ?? 0)).slice(0, 12);

  return (
    <div className="pb-20">
      <div className="container-site pt-8 sm:pt-12">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-stone">
          <Link href="/" className="underline-offset-4 hover:text-midnight hover:underline">
            Home
          </Link>
          <ChevronRight size={13} strokeWidth={1.4} />
          <span className="text-ink">Wishlist</span>
        </nav>

        {/* A wishlist someone shared */}
        {shared.length > 0 && (
          <section aria-labelledby="shared-title" className="glass tint-lilac mt-6 rounded-[32px] p-5 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="label text-[#5E4B8A]">
                  <Gift size={13} strokeWidth={1.6} className="-ml-1" /> Shared with you
                </p>
                <h2 id="shared-title" className="mt-3 font-display text-[34px] leading-tight text-midnight sm:text-[42px]">
                  A wishlist from a <em className="text-iris pr-1">friend</em>
                </h2>
                <p className="mt-1 text-[14px] text-stone">{shared.length} rituals they love. Perhaps one for a gift?</p>
              </div>
              <div className="relative z-[2] flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => shared.forEach((product) => !savedIds.has(product.id) && product.variants[0] && toggle(toSaved(product)))}
                  className="btn-glass !px-6 !py-3 !text-[11px]"
                >
                  <Heart size={14} strokeWidth={1.6} /> Save all to my wishlist
                </button>
                <button type="button" onClick={() => addAll(shared, false)} className="btn-primary !px-6 !py-3 !text-[11px]">
                  <ShoppingBag size={14} strokeWidth={1.6} /> Add all to bag
                </button>
              </div>
            </div>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {shared.map((product) => (
                <SavedCard key={product.id} product={product} shared onMove={(event) => moveToBag(product, event, true)} />
              ))}
            </ul>
          </section>
        )}

        {/* Your wishlist */}
        <section aria-labelledby="wishlist-title" className="mt-6">
          <div className="glass flex flex-col gap-5 rounded-[32px] p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
            <div>
              <p className="label text-[#8E4F5B]">Your wishlist</p>
              <h1 id="wishlist-title" className="mt-3 font-display text-[44px] font-light leading-[1] text-midnight sm:text-[60px]">
                Saved for <em className="text-iris pr-1">later</em>
              </h1>
              <p className="mt-3 text-[14px] text-stone" aria-live="polite">
                {!ready ? " " : items.length === 0 ? "Nothing saved yet." : `${items.length} ${items.length === 1 ? "ritual" : "rituals"} · saved on this device`}
              </p>
            </div>
            {ready && items.length > 0 && (
              <div className="relative z-[2] flex flex-wrap gap-2">
                <button type="button" onClick={share} className="btn-glass !px-6 !py-3 !text-[11px]">
                  {copied ? <Check size={14} strokeWidth={1.8} /> : canShare ? <Share2 size={14} strokeWidth={1.6} /> : <Link2 size={14} strokeWidth={1.6} />}
                  {copied ? "Link copied" : "Share list"}
                </button>
                {inStock.length > 0 && (
                  <button type="button" onClick={() => addAll(inStock, true)} className="btn-champagne !px-6 !py-3 !text-[11px]">
                    <ShoppingBag size={14} strokeWidth={1.6} /> Move all to bag ({inStock.length})
                  </button>
                )}
              </div>
            )}
          </div>

          {ready && items.length > 0 ? (
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {items.map((product) => (
                  <SavedCard key={product.id} product={product} onRemove={() => unsave(product.id)} onMove={(event) => moveToBag(product, event)} />
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            ready && (
              <div className="glass-strong mt-6 flex flex-col items-center rounded-[32px] px-6 py-16 text-center">
                <span className="glass tint-quartz flex h-20 w-20 items-center justify-center rounded-full">
                  <Heart size={30} strokeWidth={1} className="relative z-[2] text-quartz-deep" />
                </span>
                <p className="mt-6 font-display text-[34px] leading-tight text-midnight">Nothing saved yet</p>
                <p className="mt-2 max-w-[420px] text-[15px] leading-7 text-stone">
                  Tap the heart on any ritual to keep it here — for later, or for a gift list to share.
                </p>
                <Link href="/shop" className="btn-primary mt-7 px-9">
                  Browse the shelves
                </Link>
              </div>
            )
          )}
        </section>
      </div>

      <div className="container-site mt-12 space-y-8">
        <RecentlyViewedRow products={products} />
        {ready && items.length === 0 && <ProductRow title="Customer favourites" note="Most-loved rituals, ranked by reviews" products={bestsellers} />}
      </div>
    </div>
  );
}
