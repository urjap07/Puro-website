"use client";

import { useState } from "react";
import clsx from "clsx";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import type { Product } from "@/db/queries/products";
import { formatPrice } from "@/lib/format";

type CartProduct = Pick<Product, "id" | "slug" | "name" | "images" | "variants">;

function toCartItem(product: CartProduct) {
  const variant = product.variants[0];
  return {
    variantId: variant.id,
    productId: product.id,
    slug: product.slug,
    name: product.name,
    variantName: variant.name,
    price: variant.price,
    image: product.images[0]?.imageUrl ?? null,
  };
}

/** Full add-to-bag block with quantity, used on the product page. */
export function AddToBagPanel({ product }: { product: CartProduct }) {
  const add = useCart((state) => state.add);
  const [quantity, setQuantity] = useState(1);
  const variant = product.variants[0];

  if (!variant) return null;

  const soldOut = variant.stockQuantity <= 0;

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex h-[54px] items-center justify-between border border-line sm:w-[140px]">
        <button
          type="button"
          className="flex h-full w-12 items-center justify-center text-emerald transition hover:text-gold"
          onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          aria-label="Decrease quantity"
        >
          <Minus size={14} strokeWidth={1.25} />
        </button>
        <span className="text-[14px] tabular-nums" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          className="flex h-full w-12 items-center justify-center text-emerald transition hover:text-gold"
          onClick={() => setQuantity((value) => Math.min(10, value + 1))}
          aria-label="Increase quantity"
        >
          <Plus size={14} strokeWidth={1.25} />
        </button>
      </div>

      <button
        type="button"
        disabled={soldOut}
        onClick={() => add(toCartItem(product), quantity)}
        className="btn-primary h-[54px] flex-1 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {soldOut ? (
          "Sold out"
        ) : (
          <>
            Add to bag <span className="text-gold-soft">·</span>{" "}
            {formatPrice(variant.price * quantity)}
          </>
        )}
      </button>
    </div>
  );
}

/** Compact quick-add, revealed on product card hover. */
export function QuickAdd({
  product,
  className,
}: {
  product: CartProduct;
  className?: string;
}) {
  const add = useCart((state) => state.add);
  const variant = product.variants[0];

  if (!variant || variant.stockQuantity <= 0) return null;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        add(toCartItem(product));
      }}
      className={clsx(
        "rounded-full bg-ivory/95 py-3.5 text-[10px] uppercase tracking-[0.24em] text-emerald backdrop-blur transition hover:bg-emerald hover:text-ivory",
        className
      )}
    >
      Add to bag
    </button>
  );
}
