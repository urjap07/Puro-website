"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import type { Concern, Product } from "@/db/queries/products";
import { formatPrice } from "@/lib/format";

export type FinderProduct = Pick<Product, "id" | "slug" | "name" | "headline" | "images" | "variants"> & { concernSlugs: string[] };

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * "Find your match": choose skin or hair, pick a concern, and the matching
 * rituals slide in beside it.
 */
export default function ConcernFinder({ concerns, products }: { concerns: Concern[]; products: FinderProduct[] }) {
  const [type, setType] = useState<"skin" | "hair">("skin");
  const list = concerns.filter((concern) => concern.type === type);
  const [active, setActive] = useState<string>(list[0]?.slug ?? "");
  const current = concerns.find((concern) => concern.slug === active) ?? list[0];

  const matches = useMemo(
    () => products.filter((product) => current && product.concernSlugs.includes(current.slug)).slice(0, 3),
    [products, current],
  );

  const switchType = (next: "skin" | "hair") => {
    setType(next);
    setActive(concerns.find((concern) => concern.type === next)?.slug ?? "");
  };

  return (
    <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
      <div>
        {/* Skin / hair switch */}
        <div className="relative inline-grid grid-cols-2 rounded-full border border-emerald/15 bg-ivory/70 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          {(["skin", "hair"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => switchType(option)}
              className={clsx(
                "relative z-10 rounded-full px-8 py-3 text-[13px] font-medium uppercase tracking-[0.2em] transition-colors duration-500",
                type === option ? "text-ivory" : "text-emerald",
              )}
            >
              {type === option && (
                <motion.span layoutId="concern-switch" className="absolute inset-0 -z-10 rounded-full bg-emerald" transition={{ duration: 0.5, ease: EASE }} />
              )}
              For {option}
            </button>
          ))}
        </div>

        <ul className="mt-10 flex flex-wrap gap-3">
          {list.map((concern) => (
            <li key={concern.slug}>
              <button
                type="button"
                onClick={() => setActive(concern.slug)}
                onMouseEnter={() => setActive(concern.slug)}
                className={clsx(
                  "rounded-full border px-5 py-3 font-display text-[21px] leading-none transition duration-500 sm:text-[24px]",
                  active === concern.slug
                    ? "border-emerald bg-emerald text-ivory shadow-[0_14px_30px_-18px_rgba(20,38,30,0.9)]"
                    : "border-emerald/20 text-emerald hover:border-emerald/60",
                )}
              >
                {concern.name}
              </button>
            </li>
          ))}
        </ul>

        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="mt-10 border-t border-line pt-8"
            >
              <p className="font-display text-[34px] italic leading-tight text-emerald sm:text-[40px]">{current.name}</p>
              {current.description && <p className="mt-3 max-w-[460px] text-[17px] leading-[1.8] text-stone">{current.description}</p>}
              <Link href={`/concerns/${current.slug}`} className="link-underline mt-7 text-emerald">
                See every ritual for {current.name.toLowerCase()} <ArrowRight size={14} strokeWidth={1.25} />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Matching products */}
      <div className="relative min-h-[420px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current?.slug ?? "none"}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5"
            initial="hidden"
            animate="shown"
            exit="hidden"
          >
            {matches.length === 0 && (
              <p className="col-span-full self-center text-[17px] text-stone">New rituals for this concern are on their way.</p>
            )}
            {matches.map((product, index) => (
              <motion.div
                key={product.id}
                variants={{ hidden: { opacity: 0, y: 30 }, shown: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.6, delay: index * 0.08, ease: EASE }}
                className={clsx(index === 1 && "sm:mt-12", index === 2 && "max-sm:hidden")}
              >
                <Link href={`/products/${product.slug}`} data-cursor="View" className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-[radial-gradient(ellipse_75%_60%_at_50%_42%,#ffffff_0%,#f6f1e8_55%,#e9e0d1_100%)]">
                    {product.images[0] && (
                      <Image
                        src={product.images[0].imageUrl}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1024px) 18vw, 45vw"
                        className="object-contain p-[10%] mix-blend-multiply transition duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                      />
                    )}
                  </div>
                  <p className="mt-4 font-display text-[21px] leading-tight text-ink">{product.name}</p>
                  {product.variants[0] && <p className="mt-1 text-[15px] text-stone">{formatPrice(product.variants[0].price)}</p>}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
