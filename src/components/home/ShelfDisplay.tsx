"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { motion, useAnimationControls } from "framer-motion";
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag } from "lucide-react";
import { cartCount, cartSubtotal, useCart } from "@/lib/cart-store";
import { flyToBasket, useFlights } from "@/lib/flight-store";
import { formatPrice } from "@/lib/format";
import { toCartItem, type CartProduct } from "@/components/cart/AddToBag";
import WishButton from "@/components/cart/WishButton";

const EASE = [0.22, 1, 0.36, 1] as const;

export interface ShelfProduct extends CartProduct {
  category: string | null;
  headline: string | null;
  size: string | null;
  /** Transparent cut-out; otherwise the white packshot is blended onto the shelf. */
  cutout: string | null;
}

/** Each collection's shelf is tinted in its own colour. */
interface ShelfTint {
  glass: string;
  bar: string;
  ledge: string;
  glow: string;
}
const TINTS: Record<string, ShelfTint> = {
  face: { glass: "tint-quartz", bar: "bg-quartz-deep", ledge: "233,195,198", glow: "180,112,124" },
  body: { glass: "tint-saffron", bar: "bg-saffron-deep", ledge: "248,227,184", glow: "233,181,90" },
  hair: { glass: "tint-lilac", bar: "bg-lilac-deep", ledge: "205,189,230", glow: "125,104,168" },
  gifting: { glass: "tint-apricot", bar: "bg-apricot-deep", ledge: "243,201,166", glow: "194,122,74" },
};
const DEFAULT_TINT: ShelfTint = { glass: "tint-aqua", bar: "bg-aqua-deep", ledge: "184,222,224", glow: "63,133,137" };

export interface Shelf {
  key: string;
  title: string;
  href: string;
  products: ShelfProduct[];
}

/** One product standing on the glass, with its tag on the ledge below. */
function ShelfItem({ product, index, tint }: { product: ShelfProduct; index: number; tint: ShelfTint }) {
  const variant = product.variants[0];
  const inBag = useCart((state) => state.items.find((item) => item.variantId === variant?.id));
  const add = useCart((state) => state.add);
  const setQuantity = useCart((state) => state.setQuantity);
  const soldOut = variant ? variant.stockQuantity <= 0 : true;
  const href = `/products/${product.slug}`;
  const image = product.cutout ?? product.images[0]?.imageUrl ?? null;

  const addOne = (event: React.MouseEvent<HTMLButtonElement>) => {
    add(toCartItem(product));
    // The docked basket is the confirmation here, so skip the global "added" pop-up.
    useCart.getState().dismissNotice();
    flyToBasket(event.currentTarget, product.cutout ?? product.images[0]?.imageUrl ?? null);
  };

  return (
    <motion.li
      className="group/item relative flex w-[150px] shrink-0 snap-start flex-col sm:w-[180px] lg:w-[200px]"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: Math.min(index, 6) * 0.05, ease: EASE }}
    >
      {/* The product on the glass */}
      <div data-fly-source className="relative flex h-[200px] items-end justify-center px-3 sm:h-[230px]">
        <Link href={href} aria-label={product.name} className="relative z-10 block h-[86%] w-full">
          {image && (
            <span className="relative block h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/item:-translate-y-2 group-hover/item:scale-[1.04]">
              <Image
                src={image}
                alt={product.name}
                fill
                sizes="200px"
                className={clsx("object-contain object-bottom", !product.cutout && "mix-blend-multiply")}
              />
            </span>
          )}
        </Link>
        {/* Soft shadow where it stands */}
        <span className="pointer-events-none absolute bottom-0 left-1/2 h-2.5 w-[56%] -translate-x-1/2 translate-y-1/2 rounded-[50%] bg-midnight-deep/35 blur-[5px] transition-all duration-700 group-hover/item:w-[42%] group-hover/item:opacity-60" />

        {/* Short description on hover (pointer devices) */}
        {product.headline && (
          <span className="glass-strong pointer-events-none absolute inset-x-0 top-0 z-20 hidden -translate-y-1 rounded-[16px] px-3 py-2 text-center text-[12px] leading-snug text-graphite opacity-0 transition duration-500 group-hover/item:translate-y-0 group-hover/item:opacity-100 [@media(hover:hover)]:block">
            {product.headline}
          </span>
        )}

        <WishButton product={product} className="absolute left-1 top-14 z-20 h-9 w-9 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/item:opacity-100 [&[aria-pressed=true]]:opacity-100" />

        {/* Add / quantity, FreshCart-style */}
        {variant && !soldOut && (
          <div className="absolute bottom-2 right-1 z-20">
            {inBag ? (
              <div className="flex h-10 items-center rounded-full bg-[linear-gradient(180deg,#2b5a5f_0%,#173c40_55%,#10302f_100%)] text-ivory shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_24px_-10px_rgba(14,39,42,0.8)]">
                <button type="button" aria-label={`One less ${product.name}`} onClick={() => setQuantity(variant.id, inBag.quantity - 1)} className="flex h-10 w-9 items-center justify-center">
                  <Minus size={14} strokeWidth={1.6} />
                </button>
                <span className="w-4 text-center text-[14px] font-semibold tabular-nums" aria-live="polite">
                  {inBag.quantity}
                </span>
                <button type="button" aria-label={`One more ${product.name}`} onClick={addOne} className="flex h-10 w-9 items-center justify-center">
                  <Plus size={14} strokeWidth={1.6} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                aria-label={`Add ${product.name} to bag`}
                onClick={addOne}
                className="btn-glass glass-liquid h-10 w-10 !p-0 hover:scale-110 hover:bg-white/60"
              >
                <Plus size={18} strokeWidth={1.6} />
              </button>
            )}
          </div>
        )}
        {soldOut && (
          <span className="glass-strong absolute bottom-3 right-1 z-20 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-graphite">
            Sold out
          </span>
        )}
      </div>

      {/* Tag on the ledge */}
      <Link href={href} className={clsx(tint.glass, "glass glass-hover z-10 mx-auto mt-[28px] block w-[94%] rounded-[18px] px-3 pb-2.5 pt-3 text-center sm:mt-[30px]")}>
        <span className={clsx("absolute left-1/2 top-0 h-[3px] w-10 -translate-x-1/2 rounded-b-full", tint.bar)} />
        {product.category && <span className="block truncate text-[9px] font-medium uppercase tracking-[0.2em] text-graphite">{product.category}</span>}
        <span className="mt-0.5 line-clamp-2 min-h-[2.24em] font-display text-[17px] font-medium leading-[1.12] text-midnight">{product.name}</span>
        {variant && (
          <span className="mt-1 flex items-baseline justify-center gap-1.5">
            <span className="text-[15px] font-semibold text-graphite">{formatPrice(variant.price)}</span>
            {product.size && <span className="text-[11px] text-stone">{product.size}</span>}
          </span>
        )}
      </Link>
    </motion.li>
  );
}

/** A glass shelf with a lit edge, scrolling sideways when it holds more than fits. */
function ShelfRow({ shelf }: { shelf: Shelf }) {
  const tint = TINTS[shelf.key] ?? DEFAULT_TINT;
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
  }, [shelf.products.length]);

  const scrollBy = (direction: 1 | -1) => track.current?.scrollBy({ left: direction * track.current.clientWidth * 0.75, behavior: "smooth" });

  return (
    <section aria-label={shelf.title} className="relative">
      <div className="mb-2 flex items-center justify-between gap-4">
        <p className={clsx("glass flex items-center gap-3 rounded-full py-1.5 pl-2 pr-4", tint.glass)}>
          <span className={clsx("h-2.5 w-2.5 rounded-full", tint.bar)} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-midnight">{shelf.title}</span>
          <span className="text-[12px] text-graphite">{shelf.products.length} formulas</span>
        </p>
        <div className="flex items-center gap-4">
          <Link href={shelf.href} className="text-[12px] font-medium text-midnight underline-offset-4 hover:underline">
            See all
          </Link>
          {!(edges.start && edges.end) && (
            <div className="hidden gap-2 sm:flex">
              {([-1, 1] as const).map((direction) => (
                <button
                  key={direction}
                  type="button"
                  aria-label={direction < 0 ? `Scroll ${shelf.title} back` : `Scroll ${shelf.title} forward`}
                  disabled={direction < 0 ? edges.start : edges.end}
                  onClick={() => scrollBy(direction)}
                  className="btn-glass h-9 w-9 !p-0 hover:bg-white/60 disabled:pointer-events-none disabled:opacity-35"
                >
                  {direction < 0 ? <ArrowLeft size={15} strokeWidth={1.4} /> : <ArrowRight size={15} strokeWidth={1.4} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div ref={track} onScroll={update} data-lenis-prevent-wheel className="no-scrollbar relative -mx-5 snap-x snap-mandatory overflow-x-auto scroll-px-5 px-5 sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:-mx-12 lg:scroll-px-12 lg:px-12">
        <div className="relative w-max min-w-full">
          {/* The glass shelf, spanning the whole track */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-[-48px] top-[196px] sm:top-[226px]">
            {/* Top face of the glass, seen from just above */}
            <div
              className="h-[9px] shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-md"
              style={{ backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.3), rgba(${tint.ledge},0.55))` }}
            />
            {/* Front edge: a bright rim of light over translucent glass */}
            <div
              style={{ backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(${tint.ledge},0.7) 35%, rgba(${tint.glow},0.3) 70%, rgba(255,255,255,0.8) 100%)` }}
              className="relative h-[14px] shadow-[inset_0_1px_0_#fff,inset_0_-1px_0_rgba(255,255,255,0.9),0_1px_0_rgba(23,60,64,0.14),0_22px_30px_-16px_rgba(14,39,42,0.4)] backdrop-blur-md">
              <span className="absolute inset-x-[8%] top-[3px] h-px bg-gradient-to-r from-transparent via-white to-transparent" />
            </div>
            {/* Light refracted through the ledge */}
            <div
              className="mx-auto h-[30px] w-[96%]"
              style={{ backgroundImage: `radial-gradient(60% 100% at 50% 0%, rgba(${tint.glow},0.35), rgba(${tint.ledge},0.15) 45%, transparent)` }}
            />
          </div>
          <ul className="relative flex gap-3 pb-6 sm:gap-6">
            {shelf.products.map((product, index) => (
              <ShelfItem key={product.id} product={product} index={index} tint={tint} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** The basket docked at the foot of the shelves; products fly into it. */
function BasketDock() {
  const items = useCart((state) => state.items);
  const open = useCart((state) => state.open);
  const count = cartCount(items);
  const subtotal = cartSubtotal(items);
  const landed = useFlights((state) => state.landed);
  const controls = useAnimationControls();
  useEffect(() => {
    if (landed) controls.start({ y: [0, 6, -3, 0], scale: [1, 1.04, 0.99, 1], transition: { duration: 0.5 } });
  }, [landed, controls]);

  return (
    <div className="pointer-events-none sticky bottom-4 z-30 mt-12 flex justify-center sm:bottom-6">
      <motion.button
        type="button"
        data-bag-target="dock"
        onClick={() => open()}
        animate={controls}
        aria-label={`Your bag: ${count} items, ${formatPrice(subtotal)}. Open bag`}
        className="glass-dark glass-liquid tint-plum pointer-events-auto flex items-center gap-4 rounded-full bg-plum/75 py-2 pl-2 pr-6 text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne"
      >
        <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,#f3eadb_0%,#dccbab_50%,#cbb68f_100%)] text-midnight-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          <ShoppingBag size={19} strokeWidth={1.5} />
          {count > 0 && (
            <motion.span key={count} initial={{ scale: 1.6 }} animate={{ scale: 1 }} className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ivory px-1 text-[10px] font-semibold text-midnight">
              {count}
            </motion.span>
          )}
        </span>
        <span className="text-left leading-tight">
          <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-ivory/75">Your basket</span>
          <span className="block text-[15px] font-semibold tabular-nums">{count ? formatPrice(subtotal) : "Empty — tap + to add"}</span>
        </span>
        {count > 0 && <span className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-champagne sm:inline">View bag</span>}
      </motion.button>
    </div>
  );
}

/** Section 3 — the PURO shelves, inspired by browsing a well-lit store. */
export default function ShelfDisplay({ shelves }: { shelves: Shelf[] }) {
  return (
    <div>
      <div className="space-y-12 sm:space-y-16">
        {shelves.map((shelf) => (
          <ShelfRow key={shelf.key} shelf={shelf} />
        ))}
      </div>
      <BasketDock />
    </div>
  );
}
