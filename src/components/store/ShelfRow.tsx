"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Minus, Plus, Star } from "lucide-react";
import type { Product } from "@/db/queries/products";
import { useCart } from "@/lib/cart-store";
import { cutoutFor } from "@/lib/cutouts";
import { formatPrice } from "@/lib/format";
import { flyToBasket } from "@/lib/flight-store";
import { flightImage, toCartItem } from "@/components/cart/AddToBag";
import WishButton from "@/components/cart/WishButton";

const EASE = [0.22, 1, 0.36, 1] as const;

/** One product standing on the shelf, with its price tag clipped to the ledge. */
function ShelfItem({ product, index }: { product: Product; index: number }) {
  const variant = product.variants[0];
  const inBag = useCart((state) => state.items.find((item) => item.variantId === variant?.id));
  const add = useCart((state) => state.add);
  const setQuantity = useCart((state) => state.setQuantity);
  const cutout = cutoutFor(product.slug);
  const fallback = product.images[0]?.imageUrl;
  const soldOut = variant ? variant.stockQuantity <= 0 : true;
  const href = `/products/${product.slug}`;

  return (
    <motion.div
      className="group/item relative flex w-[156px] shrink-0 snap-start flex-col sm:w-[196px] lg:w-[212px]"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: Math.min(index, 6) * 0.06, ease: EASE }}
    >
      {/* Product on the shelf */}
      <div data-fly-source className="relative flex h-[190px] items-end justify-center px-2 sm:h-[236px]">
        {/* Name chip on hover */}
        <span className="pointer-events-none absolute inset-x-1 top-0 z-20 translate-y-2 rounded-full bg-ivory/95 px-3 py-1.5 text-center opacity-0 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)] backdrop-blur transition duration-500 group-hover/item:translate-y-0 group-hover/item:opacity-100 max-lg:hidden">
          <span className="block truncate font-display text-[16px] leading-tight text-ink">{product.name}</span>
          {product.rating && (
            <span className="flex items-center justify-center gap-1 text-[11px] text-stone">
              <Star size={10} strokeWidth={1} className="fill-emerald text-emerald" /> {product.rating.value.toFixed(1)} · {product.rating.count} reviews
            </span>
          )}
        </span>

        <Link href={href} aria-label={product.name} data-cursor="View" className="relative z-10 flex h-full w-full items-end justify-center">
          {cutout ? (
            <span className="relative block h-[82%] w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/item:-translate-y-3 group-hover/item:scale-[1.05]">
              <Image src={cutout} alt={product.name} fill sizes="212px" className="object-contain object-bottom" />
            </span>
          ) : fallback ? (
            // Shot on a coloured ground: shown as a small framed print on an easel
            <span className="relative block aspect-[4/5] h-[74%] rotate-[-2deg] rounded-[6px] border-[5px] border-[#c9965f] bg-[#c9965f] shadow-[0_14px_24px_-12px_rgba(0,0,0,0.6)] transition-transform duration-700 group-hover/item:-translate-y-3 group-hover/item:rotate-0">
              <span className="relative block h-full w-full overflow-hidden rounded-[2px]">
                <Image src={fallback} alt={product.name} fill sizes="180px" className="object-cover" />
              </span>
            </span>
          ) : (
            <span className="mb-2 flex h-[70%] w-[70%] items-center justify-center rounded-[14px] border border-dashed border-ivory/30 px-3 text-center font-display text-[18px] text-ivory/70">
              {product.name}
            </span>
          )}
        </Link>
        {/* Contact shadow on the shelf */}
        <span className="pointer-events-none absolute bottom-0 left-1/2 h-3 w-[62%] -translate-x-1/2 translate-y-1/2 rounded-[50%] bg-black/45 blur-[6px] transition-all duration-700 group-hover/item:w-[44%] group-hover/item:opacity-60" />

        <WishButton product={product} className="absolute right-2 top-10 z-20 lg:opacity-0 lg:group-hover/item:opacity-100 lg:[&[aria-pressed=true]]:opacity-100" />

        {/* Add / quantity */}
        {variant && !soldOut && (
          <div className="absolute bottom-2 right-1 z-20">
            {inBag ? (
              <div className="flex h-10 items-center rounded-full bg-emerald text-ivory shadow-[0_10px_20px_-10px_rgba(0,0,0,0.7)]">
                <button
                  type="button"
                  aria-label={`One less ${product.name}`}
                  onClick={() => setQuantity(variant.id, inBag.quantity - 1)}
                  className="flex h-10 w-9 items-center justify-center"
                >
                  <Minus size={14} strokeWidth={1.6} />
                </button>
                <span className="w-4 text-center text-[14px] font-semibold tabular-nums">{inBag.quantity}</span>
                <button
                  type="button"
                  aria-label={`One more ${product.name}`}
                  onClick={(event) => {
                    add(toCartItem(product));
                    flyToBasket(event.currentTarget, flightImage(product));
                  }}
                  className="flex h-10 w-9 items-center justify-center"
                >
                  <Plus size={14} strokeWidth={1.6} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                aria-label={`Add ${product.name} to bag`}
                onClick={(event) => {
                  add(toCartItem(product));
                  flyToBasket(event.currentTarget, flightImage(product));
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-ivory text-ink shadow-[0_10px_20px_-10px_rgba(0,0,0,0.7)] transition duration-300 hover:scale-110 hover:bg-gold-soft"
              >
                <Plus size={18} strokeWidth={1.6} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Price tag clipped to the shelf edge */}
      <div className="relative z-10 mt-[26px] flex justify-center sm:mt-[30px]">
        <span className="absolute -top-[9px] h-3 w-6 rounded-[3px] bg-gradient-to-b from-[#d9b97e] to-[#8c6a37] shadow-sm" />
        <Link
          href={href}
          className="flex min-w-[84px] flex-col items-center rounded-[6px] bg-[#fbf7ef] px-3 pb-1.5 pt-2 text-ink shadow-[0_8px_16px_-8px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover/item:rotate-[-3deg]"
        >
          {variant && (
            <span className="font-display text-[22px] leading-none">{soldOut ? "Sold out" : formatPrice(variant.price)}</span>
          )}
          <span className="mt-1 max-w-[140px] truncate text-[10px] font-medium uppercase tracking-[0.14em] text-stone">
            {product.sizeLabel ?? product.subCategory}
          </span>
        </Link>
      </div>
    </motion.div>
  );
}

/**
 * A single oak shelf: a brass name plate, products standing on the ledge,
 * and a sideways scroll when there are more than fit.
 */
export default function ShelfRow({ title, note, products }: { title: string; note?: string; products: Product[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const update = () => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  };
  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [products.length]);

  const scrollBy = (direction: 1 | -1) =>
    track.current?.scrollBy({ left: direction * track.current.clientWidth * 0.75, behavior: "smooth" });

  return (
    <section className="relative">
      <div className="mb-3 flex items-end justify-between gap-4 px-1">
        {/* Brass name plate */}
        <div className="flex items-center gap-3 rounded-[8px] bg-gradient-to-b from-[#e2c48c] via-[#c9a365] to-[#9c7a45] px-4 py-2 text-[#2a1f10] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_8px_18px_-10px_rgba(0,0,0,0.8)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#6b5230] shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]" />
          <span className="font-display text-[19px] leading-none sm:text-[22px]">{title}</span>
          {note && <span className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-70">{note}</span>}
          <span className="h-1.5 w-1.5 rounded-full bg-[#6b5230] shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]" />
        </div>
        {!(edges.start && edges.end) && (
          <div className="hidden gap-2 sm:flex">
            {([-1, 1] as const).map((direction) => (
              <button
                key={direction}
                type="button"
                aria-label={direction < 0 ? `Scroll ${title} back` : `Scroll ${title} forward`}
                disabled={direction < 0 ? edges.start : edges.end}
                onClick={() => scrollBy(direction)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/25 text-ivory transition hover:bg-ivory hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ivory"
              >
                {direction < 0 ? <ArrowLeft size={16} strokeWidth={1.2} /> : <ArrowRight size={16} strokeWidth={1.2} />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        ref={track}
        onScroll={update}
        data-lenis-prevent-wheel
        className="no-scrollbar relative -mx-5 snap-x snap-mandatory overflow-x-auto scroll-px-5 px-5 sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:-mx-12 lg:scroll-px-12 lg:px-12"
      >
        <div className="relative flex w-max min-w-full gap-3 pb-6 sm:gap-6">
          {/* The oak plank, spanning the whole track */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-[-48px] top-[190px] sm:top-[236px]">
            <div className="h-[14px] bg-gradient-to-b from-[#d8b07c] to-[#b98a55] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] sm:h-[16px]" />
            <div
              className="h-[22px] bg-[#9a6d40] shadow-[0_22px_30px_-10px_rgba(0,0,0,0.65)] sm:h-[26px]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 38px), linear-gradient(180deg, #a87a49, #7d5430)",
              }}
            />
          </div>
          {products.map((product, index) => (
            <ShelfItem key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
