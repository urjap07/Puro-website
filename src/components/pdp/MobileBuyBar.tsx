"use client";

import { ShoppingBag } from "lucide-react";
import type { Product } from "@/db/queries/products";
import { useCart } from "@/lib/cart-store";
import { flyToBasket } from "@/lib/flight-store";
import { flightImage, toCartItem } from "@/components/cart/AddToBag";
import Price from "@/components/commerce/Price";

/** Phones: price and Add to bag always within thumb's reach. */
export default function MobileBuyBar({ product }: { product: Product }) {
  const add = useCart((state) => state.add);
  const variant = product.variants[0];
  if (!variant || variant.stockQuantity <= 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] px-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] lg:hidden">
      <div className="glass-strong glass-liquid pointer-events-auto flex items-center gap-4 rounded-full bg-ivory/80 py-2 pl-6 pr-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] text-graphite">{product.name}</p>
          <Price value={variant.price} size="sm" />
        </div>
        <button
          type="button"
          onClick={(event) => {
            add(toCartItem(product));
            flyToBasket(event.currentTarget, flightImage(product));
          }}
          className="relative z-[2] flex h-12 shrink-0 items-center gap-2 rounded-full bg-gradient-to-b from-[#f3eadb] via-[#dccbab] to-[#cbb68f] text-midnight-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(122,101,68,0.35),0_14px_28px_-14px_rgba(122,101,68,0.8)] px-6 text-[12px] font-semibold uppercase tracking-[0.16em] transition hover:brightness-105 active:scale-[0.98]"
        >
          <ShoppingBag size={15} strokeWidth={1.6} /> Add to bag
        </button>
      </div>
    </div>
  );
}
