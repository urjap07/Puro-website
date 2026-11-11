"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import clsx from "clsx";
import { ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Product } from "@/db/queries/products";
import { cutoutFor } from "@/lib/cutouts";
import PendantLamp from "@/components/store/PendantLamp";
import WishButton from "@/components/cart/WishButton";
import Price from "./Price";
import StarRating from "./StarRating";
import { BagButton, DeliveryLine } from "./ResultCard";

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring", stiffness: 140, damping: 20, mass: 0.9 } as const;

/**
 * The apothecary room (after the record-store video): products stand on a
 * wooden counter; choose one and it lifts off, turns and glides to centre
 * stage with its details beside it.
 */
export default function ApothecaryCounter({ products, prints }: { products: Product[]; prints: [string, string] }) {
  const [active, setActive] = useState<number | null>(null);
  const current = active === null ? null : products[active];

  const step = useCallback(
    (direction: number) => setActive((i) => (i === null ? 0 : (i + direction + products.length) % products.length)),
    [products.length],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, step]);

  return (
    <LayoutGroup id="apothecary">
      <section
        aria-label="The Puro Apothecary"
        className="relative isolate overflow-hidden rounded-[32px] bg-[#0a3a47] text-ivory shadow-[0_60px_120px_-60px_rgba(5,38,47,0.9)]"
      >
        {/* ---- The room ---- */}
        {/* Wall: painted plaster under warm light */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_30%_15%,#18707a_0%,#0c4b58_45%,#07303b_100%)]" />
        <div className="grain absolute inset-0 -z-10" />
        {/* Window light falling across the wall */}
        <div className="pointer-events-none absolute -left-[10%] top-0 -z-10 h-full w-[45%] -skew-x-[18deg] bg-[linear-gradient(90deg,transparent,rgba(255,236,200,0.10)_30%,transparent_45%,rgba(255,236,200,0.08)_60%,transparent_75%)]" />
        <PendantLamp className="left-[18%] top-0 z-0 hidden sm:flex" cord={70} />
        <PendantLamp className="right-[30%] top-0 z-0 hidden lg:flex" cord={40} />

        {/* Framed prints */}
        <div className="pointer-events-none absolute right-[6%] top-[9%] z-0 hidden flex-col gap-4 md:flex">
          {prints.map((src, i) => (
            <span key={src} className="relative block h-[96px] w-[78px] rounded-[3px] border-[5px] border-[#c59a55] bg-[#c59a55] shadow-[0_14px_24px_-10px_rgba(0,0,0,0.6)] lg:h-[120px] lg:w-[96px]" style={{ rotate: i ? "1.5deg" : "-1deg" }}>
              <span className="absolute inset-[3px] overflow-hidden bg-ivory">
                <Image src={src} alt="" fill sizes="96px" className="object-cover" />
              </span>
            </span>
          ))}
        </div>

        {/* Back shelves with softly blurred bottles */}
        <div className={clsx("pointer-events-none absolute inset-x-0 bottom-[34%] z-0 hidden transition-opacity duration-700 sm:block", current && "opacity-0")}>
          <div className="mx-auto flex max-w-[78%] items-end justify-center gap-6 opacity-45 blur-[1.5px]">
            {products.slice(0, 12).map((product) => {
              const src = cutoutFor(product.slug);
              return src ? (
                <span key={product.id} className="relative block h-[70px] w-[38px]">
                  <Image src={src} alt="" fill sizes="40px" className="object-contain object-bottom" />
                </span>
              ) : null;
            })}
          </div>
          <div className="mx-auto h-[10px] max-w-[82%] rounded-[2px] bg-gradient-to-b from-[#b88a57] to-[#7d5430] opacity-70" />
        </div>

        {/* ---- Title (when nothing is chosen) ---- */}
        <AnimatePresence>
          {!current && (
            <motion.div
              className="pointer-events-none absolute inset-x-0 top-[13%] z-10 px-6 text-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <p className="eyebrow text-gold-soft">Step inside</p>
              <h2 className="mt-3 font-display text-[44px] uppercase leading-[0.95] tracking-[0.04em] sm:text-[68px] lg:text-[84px]">
                The Puro
                <br />
                <em className="normal-case tracking-normal text-gold-soft">Apothecary</em>
              </h2>
              <p className="mx-auto mt-4 max-w-[380px] text-[15px] text-ivory/75">Choose a ritual from the counter to take a closer look.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- The stage (when a product is chosen) ---- */}
        <div className="relative z-20 min-h-[620px] sm:min-h-[660px] lg:min-h-[700px]">
          <AnimatePresence mode="popLayout">
            {current && (
              <div key="stage" className="grid gap-6 px-5 pb-[230px] pt-10 sm:px-10 sm:pb-[250px] lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-10 lg:px-16 lg:pt-14">
                <div className="relative flex justify-center [perspective:1200px]">
                  <motion.div
                    layoutId={`apothecary-${current.id}`}
                    transition={SPRING}
                    className="relative h-[260px] w-[220px] sm:h-[360px] sm:w-[300px]"
                  >
                    <motion.div
                      key={current.id}
                      className="relative h-full w-full"
                      initial={{ rotateY: -55 }}
                      animate={{ rotateY: [-55, 12, 0] }}
                      transition={{ duration: 1.1, ease: EASE }}
                    >
                      <Image
                        src={cutoutFor(current.slug) ?? current.images[0]?.imageUrl ?? "/media/brand/02.jpg"}
                        alt={current.name}
                        fill
                        sizes="300px"
                        className={clsx("object-bottom drop-shadow-[0_40px_40px_rgba(0,0,0,0.5)]", cutoutFor(current.slug) ? "object-contain" : "rounded-[18px] object-cover")}
                      />
                    </motion.div>
                  </motion.div>
                  {/* Spotlight on the stage floor */}
                  <span className="pointer-events-none absolute bottom-[-18px] left-1/2 h-8 w-[60%] -translate-x-1/2 rounded-[50%] bg-black/45 blur-lg" />
                </div>

                <motion.div
                  key={`panel-${current.id}`}
                  className="relative rounded-[26px] border border-ivory/15 bg-[#062a34]/55 p-6 backdrop-blur-xl sm:p-8"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-gold-soft">{current.subCategory}</p>
                    <div className="flex gap-2">
                      <WishButton product={current} />
                      <button type="button" aria-label="Put it back" onClick={() => setActive(null)} className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/25 hover:bg-ivory hover:text-ink">
                        <X size={16} strokeWidth={1.4} />
                      </button>
                    </div>
                  </div>
                  <h3 className="mt-2 font-display text-[38px] leading-[1.02] sm:text-[48px]">{current.name}</h3>
                  {current.headline && <p className="mt-2 text-[16px] text-ivory/75">{current.headline}</p>}
                  {current.rating && <StarRating value={current.rating.value} count={current.rating.count} light className="mt-3" />}
                  <div className="mt-4 flex items-end gap-3">
                    {current.variants[0] && <Price value={current.variants[0].price} size="lg" className="text-ivory" />}
                    {current.sizeLabel && <span className="mb-1 text-[13px] uppercase tracking-[0.14em] text-ivory/60">{current.sizeLabel}</span>}
                  </div>
                  {current.variants[0] && <DeliveryLine price={current.variants[0].price} className="mt-2 text-ivory/70 [&_strong]:text-gold-soft [&_svg]:text-gold-soft [&_span_span]:text-gold-soft" />}
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <BagButton product={current} className="h-12 min-w-[200px] flex-1" />
                    <Link href={`/products/${current.slug}`} className="inline-flex h-12 items-center gap-2 rounded-full border border-ivory/30 px-6 text-[12px] font-semibold uppercase tracking-[0.16em] hover:bg-ivory hover:text-ink">
                      Details <ArrowRight size={14} strokeWidth={1.6} />
                    </Link>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-ivory/15 pt-4 text-[13px] text-ivory/60">
                    <span>
                      {String((active ?? 0) + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
                    </span>
                    <div className="flex gap-2">
                      {[-1, 1].map((direction) => (
                        <button
                          key={direction}
                          type="button"
                          aria-label={direction < 0 ? "Previous product" : "Next product"}
                          onClick={() => step(direction)}
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/25 text-ivory hover:bg-ivory hover:text-ink"
                        >
                          {direction < 0 ? <ChevronLeft size={17} strokeWidth={1.4} /> : <ChevronRight size={17} strokeWidth={1.4} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* ---- The counter ---- */}
        <div className="absolute inset-x-0 bottom-0 z-30">
          <div data-lenis-prevent-wheel className="no-scrollbar relative overflow-x-auto">
            <div className="relative mx-auto flex w-max min-w-full items-end justify-center gap-2 px-6 sm:gap-4 sm:px-10">
              {products.map((product, index) => {
                const src = cutoutFor(product.slug) ?? product.images[0]?.imageUrl;
                const chosen = active === index;
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => setActive(chosen ? null : index)}
                    aria-label={`Take a closer look at ${product.name}`}
                    aria-pressed={chosen}
                    className="group/slot relative flex h-[150px] w-[74px] shrink-0 items-end justify-center sm:h-[176px] sm:w-[92px]"
                  >
                    {!chosen && src && (
                      <motion.div
                        layoutId={`apothecary-${product.id}`}
                        transition={SPRING}
                        className="relative h-[86%] w-full transition-transform duration-500 group-hover/slot:-translate-y-4"
                      >
                        <Image
                          src={src}
                          alt=""
                          fill
                          sizes="92px"
                          className={clsx("object-bottom drop-shadow-[0_14px_10px_rgba(0,0,0,0.45)]", cutoutFor(product.slug) ? "object-contain" : "rounded-[8px] object-cover")}
                        />
                      </motion.div>
                    )}
                    <span className="pointer-events-none absolute -top-2 left-1/2 w-max -translate-x-1/2 rounded-full bg-ivory px-3 py-1 text-[12px] font-medium text-ink opacity-0 shadow-lg transition group-hover/slot:-top-5 group-hover/slot:opacity-100 max-sm:hidden">
                      {product.name}
                    </span>
                    {chosen && <span className="mb-3 h-2 w-10 rounded-full bg-gold-soft/70 blur-[2px]" />}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Counter top and front */}
          <div className="h-[16px] bg-gradient-to-b from-[#e2b985] to-[#b4834f] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]" />
          <div
            className="h-[52px] bg-[#8a5d34] sm:h-[64px]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0 1px, transparent 1px 120px), repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 9px), linear-gradient(180deg, #9a6b3e, #6a4526)",
            }}
          />
        </div>
      </section>
    </LayoutGroup>
  );
}
