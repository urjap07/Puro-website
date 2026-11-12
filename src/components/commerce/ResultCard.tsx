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
import { TINT, productTint } from "./tints";

/** Add-to-bag button that becomes a quantity stepper once the product is in the bag. */
export function BagButton({ product, className }: { product: Product; className?: string }) {
  const variant = product.variants[0];
  const inBag = useCart((state) => state.items.find((item) => item.variantId === variant?.id));
  const add = useCart((state) => state.add);
  const setQuantity = useCart((state) => state.setQuantity);
  if (!variant) return null;
  if (variant.stockQuantity <= 0) {
    return (
      <span className={clsx("glass flex h-11 items-center justify-center rounded-full text-[12px] font-medium uppercase tracking-[0.16em] text-stone", className)}>
        Currently unavailable
      </span>
    );
  }
  if (inBag) {
    return (
      <div className={clsx("flex h-11 items-center justify-between rounded-full bg-gradient-to-b from-[#2b5a5f] via-[#173c40] to-[#10302f] px-1.5 text-ivory shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(0,0,0,0.25),0_12px_26px_-14px_rgba(14,39,42,0.75)]", className)}>
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
        "flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#f3eadb] via-[#dccbab] to-[#cbb68f] text-midnight-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(122,101,68,0.35),0_12px_24px_-14px_rgba(122,101,68,0.8)] text-[12px] font-semibold uppercase tracking-[0.16em] transition hover:brightness-105 active:scale-[0.98]",
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
      <Truck size={14} strokeWidth={1.4} className="mt-0.5 shrink-0 text-midnight-soft" />
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
  const colour = TINT[productTint(product)];

  return (
    <article
      className={clsx(
        "glass glass-hover group flex h-full rounded-[28px] p-3",
        colour.glass,
        list ? "flex-col gap-4 sm:flex-row sm:gap-6" : "flex-col",
      )}
    >
      <div
        data-fly-source
        data-quicklook={product.slug}
        className={clsx(
          "relative overflow-hidden rounded-[22px] bg-[radial-gradient(ellipse_75%_62%_at_50%_44%,rgba(255,255,255,0.95)_0%,rgba(247,242,233,0.78)_58%,rgba(231,221,204,0.62)_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7),inset_0_-18px_36px_-24px_rgba(122,101,68,0.25)]",
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
          <span className={clsx("glass pointer-events-none !absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-[10px] sm:tracking-[0.18em]", product.isFeatured ? clsx(TINT.saffron.glass, TINT.saffron.text) : clsx(TINT.lilac.glass, TINT.lilac.text))}>
            {badge}
          </span>
        )}
        <WishButton product={product} className="absolute right-3 top-3" />
        <QuickLookButton product={product} group={group} />
      </div>

      <div className={clsx("flex flex-1 flex-col", list ? "py-2 sm:pr-4" : "px-1.5 pb-1 pt-4")}>
        <p className={clsx("text-[11px] font-semibold uppercase tracking-[0.18em]", colour.text)}>{product.subCategory ?? product.categories[0]?.name}</p>
        <Link href={href} className={clsx("mt-1.5 font-display leading-[1.12] text-midnight transition hover:text-champagne-deep", list ? "text-[28px]" : "line-clamp-2 text-[22px]")}>
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
                <span className={clsx("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", colour.dot)} /> {benefit}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex items-end gap-2">
          {variant && <Price value={variant.price} size="md" />}
          {product.sizeLabel && <span className="mb-0.5 text-[12px] uppercase tracking-[0.12em] text-stone">{product.sizeLabel}</span>}
        </div>
        {variant && <DeliveryLine price={variant.price} className="mt-2" />}
        {lowStock && <p className="mt-1.5 text-[13px] font-medium text-blush-deep">Only {variant.stockQuantity} left in stock</p>}
        <div className={clsx("mt-auto pt-4", list && "sm:max-w-[280px]")}>
          <BagButton product={product} className="w-full" />
        </div>
      </div>
    </article>
  );
}
