"use client";

import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { Check, Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import type { Product } from "@/db/queries/products";
import { FREE_DELIVERY_THRESHOLD, useCart } from "@/lib/cart-store";
import { cutoutFor } from "@/lib/cutouts";
import { INDIA_DAYS, useDeliveryEstimate } from "@/lib/delivery";
import { flyToBasket } from "@/lib/flight-store";
import { flightImage, toCartItem } from "@/components/cart/AddToBag";
import WishButton from "@/components/cart/WishButton";
import Price from "./Price";
import QuickLookButton from "./QuickLookButton";
import StarRating from "./StarRating";

/** Add-to-bag button that becomes a quantity stepper once the product is in the bag. */
export function BagButton({ product, className }: { product: Product; className?: string }) {
  const variant = product.variants[0];
  const inBag = useCart((state) => state.items.find((item) => item.variantId === variant?.id));
  const add = useCart((state) => state.add);
  const setQuantity = useCart((state) => state.setQuantity);
  if (!variant) return null;
  if (variant.stockQuantity <= 0) {
    return (
      <span className={clsx("flex h-11 items-center justify-center rounded-full border border-ink/15 text-[12px] font-medium uppercase tracking-[0.16em] text-stone", className)}>
        Currently unavailable
      </span>
    );
  }
  if (inBag) {
    return (
      <div className={clsx("flex h-11 items-center justify-between rounded-full bg-emerald px-1.5 text-ivory", className)}>
        <button type="button" aria-label={`One less ${product.name}`} onClick={() => setQuantity(variant.id, inBag.quantity - 1)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-ivory/15">
          <Minus size={15} strokeWidth={1.6} />
        </button>
        <span className="flex items-center gap-1.5 text-[13px] font-semibold">
          <Check size={14} strokeWidth={2} /> {inBag.quantity}<span className="hidden sm:inline"> in bag</span>
        </span>
        <button
          type="button"
          aria-label={`One more ${product.name}`}
          onClick={(event) => {
            add(toCartItem(product));
            flyToBasket(event.currentTarget, flightImage(product));
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-ivory/15"
        >
          <Plus size={15} strokeWidth={1.6} />
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={(event) => {
        add(toCartItem(product));
        flyToBasket(event.currentTarget, flightImage(product));
      }}
      className={clsx(
        "flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ecdcb4] via-[#d2b077] to-[#c29b5e] text-[12px] font-semibold uppercase tracking-[0.16em] text-ink shadow-[0_10px_22px_-14px_rgba(140,106,55,0.9)] transition hover:brightness-105 active:scale-[0.98]",
        className,
      )}
    >
      <ShoppingBag size={15} strokeWidth={1.6} /> Add to bag
    </button>
  );
}

/** Delivery promise line under a price. */
export function DeliveryLine({ price, className }: { price: number; className?: string }) {
  const { dates, freeDeliveryApplies } = useDeliveryEstimate();
  const when = dates ?? `in ${INDIA_DAYS}`;
  return (
    <p className={clsx("flex items-start gap-1.5 text-[13px] leading-snug text-stone", className)}>
      <Truck size={14} strokeWidth={1.4} className="mt-0.5 shrink-0 text-emerald" />
      {!freeDeliveryApplies ? (
        <span>
          Ships abroad · arrives <span className="text-emerald">{when}</span>
        </span>
      ) : price >= FREE_DELIVERY_THRESHOLD ? (
        <span>
          <strong className="font-semibold text-emerald">FREE delivery</strong> {when}
        </span>
      ) : (
        <span>
          Delivery {when}
          <span className="hidden sm:inline">
            {" "}
            · <span className="text-emerald">free over ₹500</span>
          </span>
        </span>
      )}
    </p>
  );
}

/** A marketplace result card, in grid or list layout. */
export default function ResultCard({
  product,
  layout = "grid",
  priority = false,
  group,
}: {
  product: Product;
  layout?: "grid" | "list";
  priority?: boolean;
  /** The products quick look can step through. */
  group?: Product[];
}) {
  const variant = product.variants[0];
  const href = `/products/${product.slug}`;
  const cutout = cutoutFor(product.slug);
  const image = cutout ?? product.images[0]?.imageUrl;
  const badge = product.isFeatured ? "Bestseller" : product.isClassic ? "Puro Classic" : null;
  const lowStock = variant && variant.stockQuantity > 0 && variant.stockQuantity <= 5;
  const list = layout === "list";

  return (
    <article
      className={clsx(
        "group relative flex rounded-[24px] border border-ink/[0.07] bg-ivory p-3 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] transition duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_30px_60px_-36px_rgba(6,48,58,0.55)]",
        list ? "flex-col gap-4 sm:flex-row sm:gap-6" : "flex-col",
      )}
    >
      <div
        data-fly-source
        data-quicklook={product.slug}
        className={clsx(
          "relative overflow-hidden rounded-[18px] bg-[radial-gradient(ellipse_75%_62%_at_50%_44%,#ffffff_0%,#f5efe5_58%,#e7ddcc_100%)]",
          list ? "aspect-square sm:w-[240px] sm:shrink-0" : "aspect-square",
        )}
      >
        <Link href={href} aria-label={product.name} data-cursor="View" className="absolute inset-0">
          {image && (
            <Image
              src={image}
              alt={product.name}
              fill
              priority={priority}
              sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw"
              className={clsx(
                "transition duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]",
                cutout ? "object-contain p-[11%] drop-shadow-[0_18px_18px_rgba(0,0,0,0.18)]" : "object-cover",
              )}
            />
          )}
        </Link>
        {badge && (
          <span className="pointer-events-none !absolute left-3 top-3 rounded-full bg-noir px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-soft">
            {badge}
          </span>
        )}
        <WishButton product={product} className="absolute right-3 top-3" />
        <QuickLookButton product={product} group={group} />
      </div>

      <div className={clsx("flex flex-1 flex-col", list ? "py-2 sm:pr-4" : "px-1.5 pb-1 pt-4")}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-deep">{product.subCategory ?? product.categories[0]?.name}</p>
        <Link href={href} className={clsx("mt-1.5 font-display leading-[1.12] text-ink transition hover:text-emerald", list ? "text-[28px]" : "line-clamp-2 text-[22px]")}>
          {product.name}
        </Link>
        {product.headline && <p className={clsx("mt-1 text-[14px] text-stone", list ? "" : "line-clamp-1")}>{product.headline}</p>}
        {product.rating && (
          <Link href={`${href}#reviews`} className="mt-2 w-fit">
            <StarRating value={product.rating.value} count={product.rating.count} size={13} />
          </Link>
        )}
        {list && product.benefits.length > 0 && (
          <ul className="mt-3 space-y-1 text-[14px] text-stone">
            {product.benefits.slice(0, 3).map((benefit) => (
              <li key={benefit} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" /> {benefit}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex items-end gap-2">
          {variant && <Price value={variant.price} size="md" />}
          {product.sizeLabel && <span className="mb-0.5 text-[12px] uppercase tracking-[0.12em] text-stone">{product.sizeLabel}</span>}
        </div>
        {variant && <DeliveryLine price={variant.price} className="mt-2" />}
        {lowStock && <p className="mt-1.5 text-[13px] font-medium text-rose-700">Only {variant.stockQuantity} left in stock</p>}
        <div className={clsx("mt-auto pt-4", list && "sm:max-w-[280px]")}>
          <BagButton product={product} className="w-full" />
        </div>
      </div>
    </article>
  );
}
