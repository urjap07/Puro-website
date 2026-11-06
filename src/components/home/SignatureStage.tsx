"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { ArrowRight, Star } from "lucide-react";
import type { Product } from "@/db/queries/products";
import { formatPrice } from "@/lib/format";
import { QuickAdd } from "@/components/cart/AddToBag";

const ROTATE_MS = 6500;
const EASE = [0.22, 1, 0.36, 1] as const;

/** Prefer a styled lifestyle photograph over the white packshot. */
function moodImage(product: Product) {
  const images = product.images;
  return (images[2] ?? images[3] ?? images[1] ?? images[0])?.imageUrl;
}

/**
 * The bestsellers as a stage: one product shown large in its lifestyle
 * photograph, beside a numbered programme of the others. Advances on its own.
 */
export default function SignatureStage({ products }: { products: Product[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || products.length < 2) return;
    const timer = setTimeout(() => setActive((i) => (i + 1) % products.length), ROTATE_MS);
    return () => clearTimeout(timer);
  }, [active, paused, products.length]);

  const product = products[active];
  if (!product) return null;
  const variant = product.variants[0];
  const image = moodImage(product);

  return (
    <div
      className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* The stage */}
      <Link
        href={`/products/${product.slug}`}
        data-cursor="View"
        className="relative block aspect-[4/5] overflow-hidden rounded-[32px] bg-emerald-soft shadow-[0_60px_120px_-50px_rgba(0,0,0,0.8)] sm:aspect-[5/4] lg:aspect-auto lg:min-h-[640px]"
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={product.id}
            className="absolute inset-0"
            initial={{ clipPath: "inset(0 0 0 100%)" }}
            animate={{ clipPath: "inset(0 0 0 0%)" }}
            exit={{ opacity: 0, transition: { delay: 0.9, duration: 0.2 } }}
            transition={{ duration: 1.1, ease: [0.77, 0, 0.18, 1] }}
          >
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.18 }}
              animate={{ scale: 1.02 }}
              transition={{ duration: ROTATE_MS / 1000 + 1.5, ease: "easeOut" }}
            >
              {image && <Image src={image} alt={product.name} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />}
            </motion.div>
          </motion.div>
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/25" />

        <div className="absolute inset-x-6 top-6 flex items-center justify-between text-ivory sm:inset-x-8 sm:top-8">
          <span className="font-display text-[24px] italic">No. {String(active + 1).padStart(2, "0")}</span>
          <span className="rounded-full border border-ivory/40 bg-black/20 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] backdrop-blur">
            Bestseller
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={product.id}
            className="absolute inset-x-6 bottom-6 text-ivory sm:inset-x-8 sm:bottom-8"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
          >
            <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-ivory/70">
              {product.subCategory ?? product.categories[0]?.name}
            </p>
            <h3 className="mt-3 max-w-[620px] font-display text-[44px] leading-[0.98] sm:text-[64px] lg:text-[76px]">
              {product.name}
            </h3>
          </motion.div>
        </AnimatePresence>
      </Link>

      {/* Details + programme */}
      <div className="flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <p className="text-[18px] leading-[1.7] text-ivory/80">{product.headline ?? product.summary}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-ivory/70">
              {variant && <span className="font-display text-[34px] leading-none text-ivory">{formatPrice(variant.price)}</span>}
              {product.sizeLabel && <span className="uppercase tracking-[0.16em]">{product.sizeLabel}</span>}
              {product.rating && (
                <span className="flex items-center gap-1.5">
                  <Star size={14} strokeWidth={1} className="fill-gold-soft text-gold-soft" />
                  {product.rating.value.toFixed(1)} ({product.rating.count} reviews)
                </span>
              )}
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <div className="w-full sm:w-auto [&>button]:bg-ivory [&>button]:px-8 [&>button]:py-4 [&>button]:text-ink [&>button:hover]:bg-gold-soft">
                <QuickAdd product={product} className="w-full sm:w-auto" />
              </div>
              <Link href={`/products/${product.slug}`} className="link-underline text-ivory">
                View details <ArrowRight size={14} strokeWidth={1.25} />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        <ol className="mt-12 border-t border-ivory/15 lg:mt-auto">
          {products.map((item, index) => {
            const isActive = index === active;
            return (
              <li key={item.id} className="relative border-b border-ivory/15">
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  className="group flex w-full items-center gap-5 py-3.5 text-left"
                >
                  <span className={clsx("w-7 text-[12px] font-medium tabular-nums transition-colors", isActive ? "text-gold-soft" : "text-ivory/40")}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={clsx(
                      "flex-1 font-display text-[22px] leading-tight transition duration-500 sm:text-[24px]",
                      isActive ? "translate-x-2 italic text-ivory" : "text-ivory/55 group-hover:text-ivory",
                    )}
                  >
                    {item.name}
                  </span>
                  {item.variants[0] && (
                    <span className={clsx("text-[14px] tabular-nums transition-colors", isActive ? "text-ivory" : "text-ivory/45")}>
                      {formatPrice(item.variants[0].price)}
                    </span>
                  )}
                </button>
                {isActive && (
                  <motion.span
                    key={`${active}-${paused}`}
                    className="absolute bottom-[-1px] left-0 h-px bg-gradient-to-r from-gold to-gold-soft"
                    initial={{ width: "0%" }}
                    animate={{ width: paused ? "0%" : "100%" }}
                    transition={{ duration: paused ? 0 : ROTATE_MS / 1000, ease: "linear" }}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
