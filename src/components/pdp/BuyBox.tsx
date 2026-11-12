"use client";

import { useState } from "react";
import clsx from "clsx";
import { Gift, Lock, MapPin, ShoppingBag, Truck, Zap } from "lucide-react";
import type { Product } from "@/db/queries/products";
import { FREE_DELIVERY_THRESHOLD, useCart } from "@/lib/cart-store";
import { INDIA_DAYS, destinationLabel, useDeliveryEstimate } from "@/lib/delivery";
import { flyToBasket } from "@/lib/flight-store";
import { flightImage, toCartItem } from "@/components/cart/AddToBag";
import WishButton from "@/components/cart/WishButton";
import Price from "@/components/commerce/Price";

/** Marketplace buy box: price, delivery promise, stock, quantity and actions. */
export default function BuyBox({ product, isGift = false }: { product: Product; isGift?: boolean }) {
  const variant = product.variants[0];
  const add = useCart((state) => state.add);
  const open = useCart((state) => state.open);
  const { destination, dates, zone, freeDeliveryApplies } = useDeliveryEstimate();
  const [quantity, setQuantity] = useState(1);

  if (!variant) return null;
  const inStock = variant.stockQuantity > 0;
  const free = freeDeliveryApplies && variant.price * quantity >= FREE_DELIVERY_THRESHOLD;
  const maxQty = Math.max(1, Math.min(10, variant.stockQuantity || 10));

  return (
    <div className="glass-strong rounded-[32px] p-5 sm:p-6">
      <Price value={variant.price * quantity} size="lg" />
      <p className="mt-1 text-[13px] text-stone">
        {quantity > 1 && `${quantity} × ₹${variant.price} · `}Inclusive of all taxes
      </p>

      <div className="glass tint-aqua mt-5 space-y-2.5 rounded-[22px] p-4 text-[14px]">
        <p className="flex items-start gap-2.5">
          <Truck size={17} strokeWidth={1.4} className="mt-0.5 shrink-0 text-midnight-soft" />
          <span>
            {free ? <strong className="font-semibold text-midnight">FREE delivery </strong> : <span>Delivery </span>}
            <strong className="font-semibold text-ink">{dates ?? `in ${INDIA_DAYS}`}</strong>
            {zone && <span className="block text-[13px] text-stone">{zone.label} · {zone.min}–{zone.max} days</span>}
            {!freeDeliveryApplies ? (
              <span className="block text-[13px] text-stone">International shipping is charged at checkout</span>
            ) : (
              !free && <span className="block text-[13px] text-stone">Free on orders over ₹{FREE_DELIVERY_THRESHOLD}</span>
            )}
          </span>
        </p>
        <p className="flex items-center gap-2.5 text-[13px] text-stone">
          <MapPin size={16} strokeWidth={1.4} className="shrink-0 text-midnight-soft" />
          {destination ? (
            <span>
              Delivering to <strong className="font-semibold text-ink">{destinationLabel(destination)}</strong>
            </span>
          ) : (
            <span>Add your pincode under “Deliver to” for exact dates</span>
          )}
        </p>
      </div>

      <p className={clsx("mt-5 text-[17px] font-semibold", inStock ? "text-midnight" : "text-blush-deep")}>
        {inStock ? (variant.stockQuantity <= 5 ? `Only ${variant.stockQuantity} left in stock` : "In stock") : "Currently unavailable"}
      </p>

      {inStock && (
        <>
          <label className="mt-4 flex items-center gap-3 text-[14px]">
            <span className="text-stone">Quantity</span>
            <select
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="h-10 cursor-pointer rounded-full bg-white/55 pl-4 pr-3 font-medium text-midnight shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_0_0_1px_rgba(255,255,255,0.65),0_8px_18px_-12px_rgba(14,39,42,0.45)] outline-none backdrop-blur-xl focus-visible:ring-2 focus-visible:ring-midnight/50"
            >
              {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-5 space-y-2.5">
            <button
              type="button"
              onClick={(event) => {
                add(toCartItem(product), quantity);
                flyToBasket(event.currentTarget, flightImage(product));
              }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#f3eadb] via-[#dccbab] to-[#cbb68f] text-midnight-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(122,101,68,0.35),0_14px_28px_-14px_rgba(122,101,68,0.8)] text-[13px] font-semibold uppercase tracking-[0.16em] transition hover:brightness-105 active:scale-[0.99]"
            >
              <ShoppingBag size={16} strokeWidth={1.6} /> Add to bag
            </button>
            <button
              type="button"
              onClick={() => {
                add(toCartItem(product), quantity);
                open();
              }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#2b5a5f] via-[#173c40] to-[#10302f] text-ivory shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(0,0,0,0.25),0_14px_30px_-14px_rgba(14,39,42,0.7)] text-[13px] font-semibold uppercase tracking-[0.16em] transition hover:brightness-110 active:scale-[0.99]"
            >
              <Zap size={16} strokeWidth={1.6} /> Buy now
            </button>
          </div>
        </>
      )}

      <div className="mt-4 flex items-center gap-3 text-[14px] text-ink">
        <WishButton product={product} />
        <span>Save for later</span>
      </div>

      <dl className="mt-5 space-y-1.5 border-t border-white/80 pt-4 text-[13px] shadow-[0_-1px_0_rgba(52,59,59,0.08)]">
        <div className="flex gap-3">
          <dt className="w-[86px] shrink-0 text-stone">Ships from</dt>
          <dd className="text-ink">Puro Body &amp; Soul, Maharashtra</dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-[86px] shrink-0 text-stone">Sold by</dt>
          <dd className="text-ink">Shramik Naari Sangh (Sa-Ni-Sa)</dd>
        </div>
        {isGift && (
          <div className="flex gap-3">
            <dt className="w-[86px] shrink-0 text-stone">Packaging</dt>
            <dd className="flex items-center gap-1.5 text-ink">
              <Gift size={14} strokeWidth={1.4} className="text-champagne-deep" /> Keepsake gift box
            </dd>
          </div>
        )}
      </dl>
      <p className="mt-4 flex items-center gap-2 text-[12px] text-stone">
        <Lock size={13} strokeWidth={1.5} /> Secure checkout coming soon
      </p>
    </div>
  );
}
