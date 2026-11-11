"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export interface ShowcaseCollection {
  slug: string;
  name: string;
  title: string;
  description: string;
  image: string;
  count: number;
  products: { id: number; slug: string; name: string; image: string | null; price: string | null }[];
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Collections as a showcase: large serif tabs across the top, and a dark
 * panel below with the chosen collection's photograph, story and top products.
 */
export default function CollectionShowcase({ collections }: { collections: ShowcaseCollection[] }) {
  const [active, setActive] = useState(0);
  const current = collections[active];
  if (!current) return null;

  return (
    <div>
      {/* Tabs */}
      <div role="tablist" aria-label="Collections" className="no-scrollbar -mx-5 flex gap-8 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-6 sm:px-0">
        {collections.map((collection, index) => {
          const isActive = index === active;
          return (
            <button
              key={collection.slug}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(index)}
              onMouseEnter={() => setActive(index)}
              className="group relative shrink-0 pb-5 text-left"
            >
              <span className="flex items-start gap-2">
                <span
                  className={clsx(
                    "font-display text-[38px] leading-none transition-all duration-500 sm:text-[clamp(34px,3.6vw,56px)]",
                    isActive ? "italic text-emerald" : "text-ink/35 group-hover:text-ink/70",
                  )}
                >
                  {collection.name}
                </span>
                <span
                  className={clsx(
                    "mt-0.5 font-display text-[16px] italic leading-none tabular-nums transition-colors",
                    isActive ? "text-gold-deep" : "text-stone/60",
                  )}
                >
                  ({String(collection.count).padStart(2, "0")})
                </span>
              </span>
              <span className="absolute inset-x-0 bottom-0 h-px bg-ink/10" />
              {isActive && (
                <motion.span
                  layoutId="collection-tab"
                  className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-emerald via-gold to-gold-soft"
                  transition={{ duration: 0.6, ease: EASE }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Showcase panel */}
      <div className="bg-noir mt-10 overflow-hidden rounded-[32px] text-ivory shadow-[0_60px_120px_-60px_rgba(5,38,47,0.9)] lg:grid lg:min-h-[600px] lg:grid-cols-[1.05fr_0.95fr]">
        <Link
          href={`/collections/${current.slug}`}
          data-cursor="Explore"
          className="relative block aspect-[4/3] overflow-hidden lg:aspect-auto"
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={current.slug}
              className="absolute inset-0"
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: "inset(0 0% 0 0)" }}
              exit={{ opacity: 0, transition: { delay: 0.8, duration: 0.2 } }}
              transition={{ duration: 1, ease: [0.77, 0, 0.18, 1] }}
            >
              <motion.div className="absolute inset-0" initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.8, ease: EASE }}>
                <Image src={current.image} alt={current.title} fill sizes="(min-width: 1024px) 52vw, 100vw" className="object-cover" />
              </motion.div>
            </motion.div>
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <span className="absolute bottom-6 left-6 font-display text-[clamp(56px,8vw,120px)] italic leading-none text-ivory/95 sm:bottom-8 sm:left-8">
            {current.name}
          </span>
        </Link>

        <div className="flex flex-col p-6 sm:p-10 lg:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.slug}
              className="flex flex-1 flex-col"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-gold-soft">
                {current.title} · {current.count} {current.count === 1 ? "ritual" : "rituals"}
              </p>
              <p className="mt-5 max-w-[460px] font-display text-[26px] leading-[1.25] sm:text-[32px]">{current.description}</p>

              <p className="mt-10 text-[12px] font-medium uppercase tracking-[0.22em] text-ivory/50">Most loved in {current.name}</p>
              <div className="mt-4 grid grid-cols-3 gap-3 sm:gap-4">
                {current.products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 + index * 0.08, ease: EASE }}
                  >
                    <Link href={`/products/${product.slug}`} data-cursor="View" className="group block">
                      <span className="relative block aspect-[4/5] overflow-hidden rounded-[18px] bg-[radial-gradient(ellipse_75%_60%_at_50%_42%,#ffffff_0%,#f3ece1_58%,#e3d8c6_100%)]">
                        {product.image && (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="160px"
                            className="object-contain p-[12%] mix-blend-multiply transition duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 group-hover:scale-105"
                          />
                        )}
                      </span>
                      <span className="mt-3 block font-display text-[17px] leading-tight sm:text-[19px]">{product.name}</span>
                      {product.price && <span className="mt-0.5 block text-[13px] text-ivory/60">{product.price}</span>}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-6 pt-10">
                <Link href={`/collections/${current.slug}`} className="btn-light rounded-full px-9">
                  Explore {current.title} <ArrowRight size={15} strokeWidth={1.25} />
                </Link>
                <Link href="/shop" className="link-underline text-ivory">
                  Shop everything <ArrowUpRight size={14} strokeWidth={1.25} />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
