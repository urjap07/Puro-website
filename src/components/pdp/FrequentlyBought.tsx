"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { Check, Plus, ShoppingBag } from "lucide-react";
import type { Product } from "@/db/queries/products";
import { useCart } from "@/lib/cart-store";
import { cutoutFor } from "@/lib/cutouts";
import { formatPrice } from "@/lib/format";
import { flyToBasket } from "@/lib/flight-store";
import { flightImage, toCartItem } from "@/components/cart/AddToBag";
import { TINT, productTint } from "@/components/commerce/tints";

/** "Frequently bought together": tick the items you want and add them in one go. */
export default function FrequentlyBought({ products }: { products: Product[] }) {
  const [chosen, setChosen] = useState<number[]>(products.map((product) => product.id));
  const [added, setAdded] = useState(false);
  const add = useCart((state) => state.add);
  const selected = products.filter((product) => chosen.includes(product.id));
  const total = selected.reduce((sum, product) => sum + (product.variants[0]?.price ?? 0), 0);

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1fr_300px]">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {products.map((product, index) => {
          const image = cutoutFor(product.slug) ?? product.images[0]?.imageUrl;
          const isChosen = chosen.includes(product.id);
          return (
            <div key={product.id} className="flex items-center gap-3 sm:gap-4">
              {index > 0 && <span className="glass flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-midnight"><Plus size={16} strokeWidth={1.5} /></span>}
              <div className={clsx("w-[132px] transition sm:w-[160px]", !isChosen && "opacity-45")}>
                <Link href={`/products/${product.slug}`} className={clsx("glass glass-hover block aspect-square overflow-hidden rounded-[24px] bg-[radial-gradient(ellipse_75%_62%_at_50%_44%,rgba(255,255,255,0.95)_0%,rgba(247,242,233,0.75)_60%,rgba(231,221,204,0.55)_100%)]", TINT[productTint(product)].glass)}>
                  {image && <Image src={image} alt={product.name} fill sizes="160px" className={cutoutFor(product.slug) ? "object-contain p-[12%]" : "object-cover"} />}
                </Link>
                <label className="mt-2.5 flex cursor-pointer items-start gap-2 text-[13px] leading-snug">
                  <input
                    type="checkbox"
                    checked={isChosen}
                    disabled={index === 0}
                    onChange={() => setChosen((ids) => (isChosen ? ids.filter((id) => id !== product.id) : [...ids, product.id]))}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#173c40]"
                  />
                  <span>
                    {index === 0 && <strong className="font-semibold">This item: </strong>}
                    {product.name}
                    <span className="block font-semibold text-ink">{product.variants[0] ? formatPrice(product.variants[0].price) : ""}</span>
                  </span>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass tint-champagne rounded-[28px] p-5">
        <p className="text-[14px] text-graphite">Total for {selected.length} {selected.length === 1 ? "item" : "items"}</p>
        <p className="mt-1 font-display text-[36px] leading-none text-midnight">{formatPrice(total)}</p>
        <button
          type="button"
          disabled={selected.length === 0}
          onClick={(event) => {
            const button = event.currentTarget;
            selected.forEach((product, i) => {
              add(toCartItem(product));
              setTimeout(() => flyToBasket(button, flightImage(product)), i * 140);
            });
            setAdded(true);
            setTimeout(() => setAdded(false), 2400);
          }}
          className={clsx(
            "mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full text-[12px] font-semibold uppercase tracking-[0.16em] transition",
            added ? "bg-gradient-to-b from-[#2b5a5f] via-[#173c40] to-[#10302f] text-ivory shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(0,0,0,0.25),0_14px_30px_-14px_rgba(14,39,42,0.7)]" : "bg-gradient-to-b from-[#f3eadb] via-[#dccbab] to-[#cbb68f] text-midnight-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(122,101,68,0.35),0_14px_28px_-14px_rgba(122,101,68,0.8)] hover:brightness-105",
          )}
        >
          {added ? <Check size={15} strokeWidth={2} /> : <ShoppingBag size={15} strokeWidth={1.6} />}
          {added ? "Added to bag" : selected.length > 1 ? `Add all ${selected.length} to bag` : "Add to bag"}
        </button>
      </div>
    </div>
  );
}
