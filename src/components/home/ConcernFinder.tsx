"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { ArrowRight, Check, ShoppingBag, Sparkles } from "lucide-react";
import type { Concern, Product } from "@/db/queries/products";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart-store";
import { flightImage, toCartItem } from "@/components/cart/AddToBag";
import { flyToBasket } from "@/lib/flight-store";

export type FinderProduct = Pick<Product, "id" | "slug" | "name" | "headline" | "images" | "variants"> & {
  concernSlugs: string[];
};

/** Small photograph beside each concern. */
const CONCERN_IMAGES: Record<string, string> = {
  "skin-brightening": "/media/products/glow-up-pithi-pack/04.jpg",
  "tan-removal": "/media/products/vita-clay-ubtan-pack/04.jpg",
  "pore-tightening": "/media/products/vita-clay-ubtan-pack/06.jpg",
  "anti-ageing": "/media/products/aqua-riche-night-repair-gel-cream/06.jpg",
  "oil-control": "/media/products/hydroclock-foaming-facewash/03.jpg",
  "dry-skin": "/media/products/supple-goals-body-balm/04.jpg",
  "combination-skin": "/media/products/aquench-soothing-hydrogel/05.jpg",
  "night-time-routine": "/media/products/aqua-riche-night-repair-gel-cream/05.jpg",
  "oily-scalp": "/media/products/terra-tress-hair-scalp-oil/03.jpg",
  "dry-hair": "/media/products/coco-silk-cold-pressed-virgin-coconut-oil/03.jpg",
  "hair-fall": "/media/products/hair-regrowth-oil/02.jpg",
  "frizzy-hair": "/media/products/terra-tress-hair-scalp-oil/05.jpg",
};

const TYPES = [
  { key: "skin" as const, label: "For my skin", image: "/media/products/glow-up-pithi-pack/05.jpg" },
  { key: "hair" as const, label: "For my hair", image: "/media/products/terra-tress-hair-scalp-oil/02.jpg" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

function StepLabel({ n, children }: { n: number; children: string }) {
  return (
    <p className="flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.22em] text-stone">
      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald/25 font-display text-[14px] normal-case tracking-normal text-emerald">
        {n}
      </span>
      {children}
    </p>
  );
}

/**
 * "Find your match" as a ritual builder: choose skin or hair, choose a
 * concern, and a personal ritual card assembles itself — with one button
 * to add the whole ritual to the bag.
 */
export default function ConcernFinder({ concerns, products }: { concerns: Concern[]; products: FinderProduct[] }) {
  const [type, setType] = useState<"skin" | "hair">("skin");
  const list = concerns.filter((concern) => concern.type === type);
  const [active, setActive] = useState<string>(list[0]?.slug ?? "");
  const [added, setAdded] = useState(false);
  const add = useCart((state) => state.add);
  const current = concerns.find((concern) => concern.slug === active) ?? list[0];

  const matches = useMemo(
    () => products.filter((product) => current && product.concernSlugs.includes(current.slug)).slice(0, 3),
    [products, current],
  );
  const [hero, ...rest] = matches;
  const total = matches.reduce((sum, product) => sum + (product.variants[0]?.price ?? 0), 0);

  const choose = (slug: string) => {
    setActive(slug);
    setAdded(false);
  };
  const switchType = (next: "skin" | "hair") => {
    setType(next);
    choose(concerns.find((concern) => concern.type === next)?.slug ?? "");
  };
  const addRitual = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    matches.forEach((product, index) => {
      if (!product.variants[0]) return;
      add(toCartItem(product));
      setTimeout(() => flyToBasket(button, flightImage(product)), index * 140);
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2400);
  };

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
      {/* Choices */}
      <div className="space-y-10">
        <div>
          <StepLabel n={1}>Choose what you&rsquo;re caring for</StepLabel>
          <div className="mt-5 grid grid-cols-2 gap-4">
            {TYPES.map((option) => {
              const selected = type === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => switchType(option.key)}
                  aria-pressed={selected}
                  className={clsx(
                    "group relative aspect-[5/3] overflow-hidden rounded-[22px] text-left ring-offset-4 ring-offset-[#f8f4ee] transition duration-500",
                    selected ? "ring-2 ring-emerald" : "ring-1 ring-ink/10 hover:ring-ink/30",
                  )}
                >
                  <Image
                    src={option.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 22vw, 45vw"
                    className={clsx("object-cover transition duration-[1200ms]", selected ? "scale-105" : "scale-100 grayscale-[40%] group-hover:grayscale-0")}
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <span className="absolute bottom-4 left-4 font-display text-[24px] text-ivory sm:bottom-5 sm:left-5 sm:text-[30px]">{option.label}</span>
                  <span
                    className={clsx(
                      "absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full transition duration-500",
                      selected ? "scale-100 bg-ivory text-emerald" : "scale-0",
                    )}
                  >
                    <Check size={16} strokeWidth={2} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <StepLabel n={2}>Choose your concern</StepLabel>
          <AnimatePresence mode="wait">
            <motion.ul
              key={type}
              className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3"
              initial="hidden"
              animate="shown"
              exit="hidden"
            >
              {list.map((concern, index) => {
                const selected = active === concern.slug;
                return (
                  <motion.li
                    key={concern.slug}
                    variants={{ hidden: { opacity: 0, y: 12 }, shown: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.4, delay: index * 0.04, ease: EASE }}
                  >
                    <button
                      type="button"
                      onClick={() => choose(concern.slug)}
                      aria-pressed={selected}
                      className={clsx(
                        "flex w-full items-center gap-3 rounded-full border p-1.5 pr-4 text-left transition duration-500",
                        selected
                          ? "border-emerald bg-emerald text-ivory shadow-[0_16px_34px_-20px_rgba(6,48,58,0.9)]"
                          : "border-ink/10 bg-ivory/70 text-emerald hover:border-emerald/40 hover:bg-ivory",
                      )}
                    >
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full sm:h-11 sm:w-11">
                        <Image src={CONCERN_IMAGES[concern.slug] ?? "/media/brand/02.jpg"} alt="" fill sizes="44px" className="object-cover" />
                      </span>
                      <span className="font-display text-[18px] leading-tight sm:text-[21px]">{concern.name}</span>
                    </button>
                  </motion.li>
                );
              })}
            </motion.ul>
          </AnimatePresence>
        </div>
      </div>

      {/* Your ritual */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <StepLabel n={3}>Your ritual</StepLabel>
        <div className="bg-noir mt-5 rounded-[30px] p-6 text-ivory shadow-[0_50px_100px_-50px_rgba(5,38,47,0.9)] sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={current?.slug ?? "none"}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <p className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.22em] text-gold-soft">
                <Sparkles size={14} strokeWidth={1.25} /> Made for
              </p>
              <h3 className="mt-3 font-display text-[40px] italic leading-none sm:text-[52px]">{current?.name}</h3>
              {current?.description && <p className="mt-4 max-w-[480px] text-[16px] leading-[1.75] text-ivory/70">{current.description}</p>}

              {hero ? (
                <>
                  <Link
                    href={`/products/${hero.slug}`}
                    data-cursor="View"
                    className="group mt-7 grid grid-cols-[0.9fr_1.1fr] items-center gap-5 overflow-hidden rounded-[22px] bg-ivory/[0.06] p-3 ring-1 ring-ivory/10"
                  >
                    <span className="relative block aspect-[4/5] overflow-hidden rounded-[16px] bg-[radial-gradient(ellipse_75%_60%_at_50%_42%,#ffffff_0%,#f3ece1_58%,#e3d8c6_100%)]">
                      {hero.images[0] && (
                        <Image
                          src={hero.images[0].imageUrl}
                          alt={hero.name}
                          fill
                          sizes="220px"
                          className="object-contain p-[12%] mix-blend-multiply transition duration-1000 group-hover:scale-105"
                        />
                      )}
                    </span>
                    <span className="pr-2">
                      <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-ivory/50">Your hero</span>
                      <span className="mt-2 block font-display text-[26px] leading-[1.05] sm:text-[30px]">{hero.name}</span>
                      {hero.headline && <span className="mt-2 block text-[14px] leading-relaxed text-ivory/65">{hero.headline}</span>}
                      {hero.variants[0] && <span className="mt-3 block font-display text-[22px]">{formatPrice(hero.variants[0].price)}</span>}
                    </span>
                  </Link>

                  {rest.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {rest.map((product) => (
                        <li key={product.id}>
                          <Link
                            href={`/products/${product.slug}`}
                            className="group flex items-center gap-4 rounded-[18px] p-2 transition hover:bg-ivory/[0.06]"
                          >
                            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[12px] bg-ivory">
                              {product.images[0] && (
                                <Image src={product.images[0].imageUrl} alt="" fill sizes="56px" className="object-contain p-1 mix-blend-multiply" />
                              )}
                            </span>
                            <span className="flex-1 font-display text-[19px] leading-tight">{product.name}</span>
                            {product.variants[0] && <span className="text-[14px] text-ivory/65">{formatPrice(product.variants[0].price)}</span>}
                            <ArrowRight size={15} strokeWidth={1.1} className="text-ivory/50 transition group-hover:translate-x-1 group-hover:text-ivory" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-6 flex flex-wrap items-center gap-5 border-t border-ivory/15 pt-6">
                    <button
                      type="button"
                      onClick={addRitual}
                      className={clsx(
                        "flex items-center gap-2.5 rounded-full px-7 py-4 text-[12px] font-medium uppercase tracking-[0.18em] transition duration-500",
                        added ? "bg-gold-soft text-ink" : "bg-ivory text-ink hover:bg-gold-soft",
                      )}
                    >
                      {added ? <Check size={15} strokeWidth={2} /> : <ShoppingBag size={15} strokeWidth={1.5} />}
                      {added ? "Ritual added" : matches.length > 1 ? `Add the full ritual · ${formatPrice(total)}` : `Add to bag · ${formatPrice(total)}`}
                    </button>
                    {current && (
                      <Link href={`/concerns/${current.slug}`} className="link-underline text-ivory">
                        See all
                      </Link>
                    )}
                  </div>
                </>
              ) : (
                <p className="mt-8 text-[16px] text-ivory/60">New rituals for this concern are on their way.</p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
