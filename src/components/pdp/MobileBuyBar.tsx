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
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-ink/10 bg-ivory/95 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] pt-3 backdrop-blur-md lg:hidden">
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] text-stone">{product.name}</p>
          <Price value={variant.price} size="sm" />
        </div>
        <button
          type="button"
          onClick={(event) => {
            add(toCartItem(product));
            flyToBasket(event.currentTarget, flightImage(product));
          }}
          className="flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#ecdcb4] via-[#d2b077] to-[#c29b5e] px-6 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink"
        >
          <ShoppingBag size={15} strokeWidth={1.6} /> Add to bag
        </button>
      </div>
    </div>
  );
}
