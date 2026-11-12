"use client";

import { createContext, useContext, useEffect, useState } from "react";
import clsx from "clsx";
import type { Product } from "@/db/queries/products";
import { formatPrice } from "@/lib/format";
import Price from "@/components/commerce/Price";

type Variant = Product["variants"][number];

const VariantContext = createContext<{ variantId: number | null; select: (id: number) => void } | null>(null);

/** First variant that's in stock, else the first one. */
function defaultVariant(product: Pick<Product, "variants">) {
  return (product.variants.find((variant) => variant.stockQuantity > 0) ?? product.variants[0])?.id ?? null;
}

/**
 * Holds the variant chosen on a product page, so the price, buy box, mobile
 * bar and bag all agree. The choice is kept in the URL (?variant=) so a
 * shared link opens on the same size.
 */
export function VariantProvider({ product, children }: { product: Pick<Product, "variants">; children: React.ReactNode }) {
  const [variantId, setVariantId] = useState<number | null>(() => defaultVariant(product));

  useEffect(() => {
    const fromUrl = Number(new URLSearchParams(window.location.search).get("variant"));
    if (product.variants.some((variant) => variant.id === fromUrl)) setVariantId(fromUrl);
  }, [product.variants]);

  const select = (id: number) => {
    setVariantId(id);
    const url = new URL(window.location.href);
    if (id === defaultVariant(product)) url.searchParams.delete("variant");
    else url.searchParams.set("variant", String(id));
    window.history.replaceState(null, "", url);
  };

  return <VariantContext.Provider value={{ variantId, select }}>{children}</VariantContext.Provider>;
}

/** The variant chosen on this page (or the default outside a VariantProvider). */
export function useSelectedVariant(product: Pick<Product, "variants">): Variant | undefined {
  const context = useContext(VariantContext);
  const id = context?.variantId ?? defaultVariant(product);
  return product.variants.find((variant) => variant.id === id) ?? product.variants[0];
}

/** Price of the chosen variant, with its size. */
export function VariantPrice({ product, sizeLabel }: { product: Pick<Product, "variants">; sizeLabel: string | null }) {
  const variant = useSelectedVariant(product);
  if (!variant) return null;
  const size = product.variants.length > 1 ? variant.name : (sizeLabel ?? variant.name);
  const saving = variant.compareAtPrice && variant.compareAtPrice > variant.price ? variant.compareAtPrice : null;
  return (
    <div className="flex flex-wrap items-end gap-3">
      <Price value={variant.price} size="lg" />
      {saving && <s className="mb-1.5 text-[16px] text-stone">{formatPrice(saving)}</s>}
      {size && <span className="mb-1.5 text-[14px] uppercase tracking-[0.12em] text-stone">{size}</span>}
    </div>
  );
}

/** Size / variant choice. Renders only when a product comes in more than one. */
export function VariantPicker({ product }: { product: Pick<Product, "variants"> }) {
  const context = useContext(VariantContext);
  const selected = useSelectedVariant(product);
  if (product.variants.length < 2 || !context) return null;

  return (
    <fieldset className="mt-6">
      <legend className="text-[12px] font-semibold uppercase tracking-[0.18em] text-midnight">
        Size <span className="ml-1 font-normal normal-case tracking-normal text-stone">· {selected?.name}</span>
      </legend>
      <div role="radiogroup" className="mt-3 flex flex-wrap gap-2">
        {product.variants.map((variant) => {
          const active = variant.id === selected?.id;
          const soldOut = variant.stockQuantity <= 0;
          return (
            <button
              key={variant.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => context.select(variant.id)}
              className={clsx(
                "flex min-w-[96px] flex-col items-start rounded-[18px] px-4 py-2.5 text-left transition",
                active
                  ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.5),rgba(255,255,255,0)_60%),linear-gradient(110deg,#f6e3c8,#f2c9c4_35%,#d9c8ec_70%,#bfe2e3)] text-midnight-deep shadow-[inset_0_1px_0_rgba(255,255,255,1),0_10px_22px_-12px_rgba(125,104,168,0.6)] ring-1 ring-white"
                  : "glass text-midnight hover:-translate-y-px",
                soldOut && !active && "opacity-60",
              )}
            >
              <span className="relative z-[2] text-[14px] font-semibold">{variant.name}</span>
              <span className="relative z-[2] text-[12px] text-stone">{soldOut ? "Sold out" : formatPrice(variant.price)}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
