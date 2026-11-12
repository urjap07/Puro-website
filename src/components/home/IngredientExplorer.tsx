"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export interface ExplorerIngredient {
  slug: string;
  name: string;
  /** Brand-approved description of the ingredient's role (from the database). */
  role: string | null;
  image: string | null;
  products: { slug: string; name: string; image: string | null; price: string | null }[];
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** Each ingredient has its own colour: glass tint, a swatch and a deep accent. */
const TINTS = [
  { match: /turmeric|saffron/, glass: "tint-saffron", swatch: "bg-saffron", deep: "text-saffron-deep" },
  { match: /aloe/, glass: "tint-sage", swatch: "bg-sage", deep: "text-sage-deep" },
  { match: /clay|ubtan/, glass: "tint-terracotta", swatch: "bg-terracotta", deep: "text-terracotta-deep" },
  { match: /shea|cocoa/, glass: "tint-apricot", swatch: "bg-apricot", deep: "text-apricot-deep" },
  { match: /lavender|rosemary/, glass: "tint-lilac", swatch: "bg-lilac", deep: "text-lilac-deep" },
  { match: /rice|walnut/, glass: "tint-champagne", swatch: "bg-champagne", deep: "text-champagne-deep" },
];
const FALLBACK = { glass: "tint-aqua", swatch: "bg-aqua", deep: "text-aqua-deep" };
const tintFor = (slug: string) => TINTS.find((tint) => tint.match.test(slug)) ?? FALLBACK;

/** Section 6 — choose an ingredient to see its role and the formulas it appears in. */
export default function IngredientExplorer({ ingredients }: { ingredients: ExplorerIngredient[] }) {
  const [active, setActive] = useState(0);
  const current = ingredients[active];
  if (!current) return null;
  const tint = tintFor(current.slug);

  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
      {/* Index */}
      <div role="tablist" aria-label="Ingredients" aria-orientation="vertical" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1 lg:mx-0 lg:block lg:space-y-1.5 lg:overflow-visible lg:px-0 lg:py-0">
        {ingredients.map((ingredient, index) => {
          const selected = index === active;
          const own = tintFor(ingredient.slug);
          return (
            <button
              key={ingredient.slug}
              type="button"
              role="tab"
              id={`ingredient-tab-${ingredient.slug}`}
              aria-selected={selected}
              aria-controls="ingredient-panel"
              onClick={() => setActive(index)}
              onMouseEnter={() => window.matchMedia("(hover: hover)").matches && setActive(index)}
              className={clsx(
                "group shrink-0 text-left transition-colors duration-500",
                "rounded-full px-4 py-2 lg:flex lg:w-full lg:items-baseline lg:gap-6 lg:rounded-[24px] lg:px-6 lg:py-4",
                selected
                  ? clsx("glass text-midnight", own.glass)
                  : "bg-white/30 text-graphite ring-1 ring-inset ring-white/70 hover:bg-white/50 hover:text-midnight lg:bg-transparent lg:ring-0 lg:hover:bg-white/35",
              )}
            >
              <span className="hidden w-10 items-center gap-2 text-[11px] tabular-nums tracking-[0.2em] text-stone lg:inline-flex">
                <span className={clsx("h-2 w-2 shrink-0 rounded-full", own.swatch)} />
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="flex items-center gap-2 text-[13px] font-medium lg:font-display lg:text-[40px] lg:font-light lg:leading-none xl:text-[48px]">
                <span className={clsx("h-2 w-2 shrink-0 rounded-full lg:hidden", own.swatch)} />
                {ingredient.name}
              </span>
              <ArrowUpRight
                size={20}
                strokeWidth={1.2}
                className={clsx("ml-auto hidden self-center transition duration-500 lg:block", selected ? clsx(own.deep, "opacity-100") : "opacity-0")}
              />
            </button>
          );
        })}
      </div>

      {/* Detail */}
      <div
        id="ingredient-panel"
        role="tabpanel"
        aria-labelledby={`ingredient-tab-${current.slug}`}
        aria-live="polite"
        className={clsx("glass self-start rounded-[28px] p-4 transition-colors duration-700 sm:rounded-[34px] sm:p-6 lg:p-7", tint.glass)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.slug}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="grid gap-8 sm:grid-cols-[1fr_1fr] lg:grid-cols-1 xl:grid-cols-[1.05fr_0.95fr]"
          >
            <motion.div
              className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-white/40 sm:aspect-[3/4] lg:aspect-[16/11] xl:aspect-[3/4]"
              initial={{ clipPath: "inset(8% 8% 8% 8%)" }}
              animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              {current.image && (
                <motion.div className="absolute inset-0" initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease: EASE }}>
                  <Image src={current.image} alt={`${current.name}, a PURO ingredient`} fill sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-cover" />
                </motion.div>
              )}
              <span className="glass-strong absolute left-3 top-3 rounded-full px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-midnight">
                Ingredient {String(active + 1).padStart(2, "0")}
              </span>
            </motion.div>

            <div className="flex flex-col sm:py-2 sm:pr-2">
              <h3 className="font-display text-[44px] font-light leading-none text-midnight sm:text-[52px]">{current.name}</h3>
              {current.role && (
                <>
                  <p className="mt-6 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.26em] text-graphite">
                    <span className={clsx("h-1.5 w-1.5 rounded-full", tint.swatch)} /> In the formula
                  </p>
                  <p className="mt-2 text-[16px] leading-[1.75] text-graphite">{current.role}</p>
                </>
              )}

              {current.products.length > 0 && (
                <>
                  <p className="mt-8 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.26em] text-graphite">
                    <span className={clsx("h-1.5 w-1.5 rounded-full", tint.swatch)} /> Found in
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {current.products.slice(0, 3).map((product) => (
                      <li key={product.slug}>
                        <Link
                          href={`/products/${product.slug}`}
                          className="group flex items-center gap-4 rounded-[18px] bg-white/45 p-2 pr-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-inset ring-white/70 transition hover:bg-white/70"
                        >
                          <span className="relative h-14 w-12 shrink-0 overflow-hidden rounded-[12px] bg-white">
                            {product.image && <Image src={product.image} alt="" fill sizes="48px" className="object-cover" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-display text-[20px] leading-tight text-midnight">{product.name}</span>
                            {product.price && <span className="block text-[12px] text-stone">{product.price}</span>}
                          </span>
                          <ArrowUpRight size={16} strokeWidth={1.3} className="text-stone transition group-hover:translate-x-0.5 group-hover:text-midnight" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <Link
                href={`/search?q=${encodeURIComponent(current.name.split(/\s*&\s*/)[0])}`}
                className="link-underline mt-8 self-start text-midnight"
              >
                Explore formulas with {current.name.toLowerCase()}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
