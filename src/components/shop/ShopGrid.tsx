"use client";

import { Fragment, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, Sparkles, X } from "lucide-react";
import type { Concern, Product } from "@/db/queries/products";
import { COLLECTIONS } from "@/lib/collections";
import ProductCard from "@/components/product/ProductCard";
import SortMenu, { type Sort } from "./SortMenu";


export interface GridPromo {
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  cta: string;
  image: string;
}

/** Product slot after which the wide emerald promo tile is inserted. */
const PROMO_AFTER = 4;

function PromoTile({ promo }: { promo: GridPromo }) {
  return (
    <Link
      href={promo.href}
      className="group relative col-span-2 flex min-h-[340px] overflow-hidden rounded-2xl bg-emerald-deep text-ivory"
    >
      <Image
        src={promo.image}
        alt=""
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover opacity-60 transition duration-[1600ms] group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-deep via-emerald-deep/80 to-emerald-deep/10" />
      <div className="relative flex max-w-[360px] flex-col justify-end p-8 sm:p-10">
        <p className="eyebrow text-gold-soft">{promo.eyebrow}</p>
        <p className="mt-4 font-display text-[32px] font-light leading-[1.1] sm:text-[38px]">
          {promo.title}
        </p>
        <p className="mt-4 text-[14px] leading-7 text-ivory/75">{promo.text}</p>
        <span className="link-underline mt-7 text-ivory">
          {promo.cta} <ArrowRight size={14} strokeWidth={1.25} />
        </span>
      </div>
    </Link>
  );
}

interface ShopGridProps {
  products: Product[];
  concerns?: Concern[];
  initialCollection?: string | null;
  initialConcern?: string | null;
  showFilters?: boolean;
  promo?: GridPromo;
}

function priceOf(product: Product) {
  return product.variants[0]?.price ?? 0;
}

export default function ShopGrid({
  products,
  concerns = [],
  initialCollection = null,
  initialConcern = null,
  showFilters = true,
  promo,
}: ShopGridProps) {
  const [collection, setCollection] = useState<string | null>(initialCollection);
  const [concern, setConcern] = useState<string | null>(initialConcern);
  const [sort, setSort] = useState<Sort>("featured");

  const visible = useMemo(() => {
    const categorySlugs = COLLECTIONS.find((c) => c.slug === collection)?.categorySlugs;
    const filtered = products.filter(
      (product) =>
        (!categorySlugs ||
          product.categories.some((category) => categorySlugs.includes(category.slug))) &&
        (!concern || product.concerns.some((c) => c.slug === concern))
    );
    const sorted = [...filtered];
    if (sort === "price-asc") sorted.sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === "price-desc") sorted.sort((a, b) => priceOf(b) - priceOf(a));
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "featured") sorted.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    return sorted;
  }, [products, collection, concern, sort]);

  const pill = (active: boolean) =>
    clsx(
      "flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full border py-1.5 pl-1.5 pr-5 text-[12px] uppercase tracking-[0.18em] transition",
      active
        ? "border-gold-soft bg-gold-soft text-emerald-deep"
        : "border-ivory/20 text-ivory/85 hover:border-gold-soft hover:text-gold-soft"
    );

  const concernPill = (active: boolean) =>
    clsx(
      "rounded-full border px-4 py-2 text-[14px] transition",
      active
        ? "border-gold-soft bg-gold-soft text-emerald-deep"
        : "border-ivory/20 text-ivory/80 hover:border-gold-soft hover:text-gold-soft"
    );

  const activeConcern = concerns.find((item) => item.slug === concern);
  const activeCollection = COLLECTIONS.find((item) => item.slug === collection);

  return (
    <div>
      {showFilters && (
        <div className="relative z-20 mb-10 rounded-2xl bg-emerald-deep p-6 text-ivory shadow-[0_30px_80px_-50px_rgba(11,42,34,0.7)] sm:p-8 lg:p-10">
          {/* Glows are clipped separately so the sort menu can overflow the panel */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute -right-32 -top-40 h-[380px] w-[380px] rounded-full bg-emerald-soft/60 blur-3xl" />
            <div className="absolute -bottom-40 -left-24 h-[340px] w-[340px] rounded-full bg-gold/10 blur-3xl" />
          </div>

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="eyebrow text-gold-soft">Collection</p>
              <div className="no-scrollbar -mx-6 mt-4 flex gap-2 overflow-x-auto px-6 sm:mx-0 sm:flex-wrap sm:px-0">
                <button type="button" className={pill(collection === null)} onClick={() => setCollection(null)}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ivory/10">
                    <Sparkles size={14} strokeWidth={1.25} />
                  </span>
                  All
                </button>
                {COLLECTIONS.map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    className={pill(collection === item.slug)}
                    onClick={() => setCollection(item.slug)}
                  >
                    <span className="relative h-8 w-8 overflow-hidden rounded-full ring-1 ring-gold/40">
                      <Image src={item.image} alt="" fill sizes="32px" className="object-cover" />
                    </span>
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative z-10 flex shrink-0 items-center gap-3">
              <span className="eyebrow text-gold-soft">Sort</span>
              <SortMenu value={sort} onChange={setSort} />
            </div>
          </div>

          {concerns.length > 0 && (
            <div className="relative mt-8 grid gap-8 border-t border-gold/20 pt-8 lg:grid-cols-[1.7fr_1fr] lg:gap-12">
              {(["skin", "hair"] as const).map((type) => {
                const group = concerns.filter((item) => item.type === type);
                if (group.length === 0) return null;
                return (
                  <div key={type} className={type === "hair" ? "lg:border-l lg:border-ivory/10 lg:pl-12" : undefined}>
                    <p className="eyebrow text-gold-soft">
                      {type === "skin" ? "Skin concern" : "Hair concern"}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {group.map((item) => (
                        <button
                          key={item.slug}
                          type="button"
                          onClick={() => setConcern(concern === item.slug ? null : item.slug)}
                          aria-pressed={concern === item.slug}
                          className={concernPill(concern === item.slug)}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-3 text-[11px] uppercase tracking-[0.22em] text-gold-deep">
        <span className="h-px w-10 bg-gold/50" />
        <span>
          {visible.length} {visible.length === 1 ? "ritual" : "rituals"}
        </span>
        {[
          activeCollection && { label: activeCollection.title, clear: () => setCollection(null) },
          activeConcern && { label: activeConcern.name, clear: () => setConcern(null) },
        ]
          .filter((item): item is { label: string; clear: () => void } => Boolean(item))
          .map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.clear}
              className="flex items-center gap-2 rounded-full bg-emerald px-3.5 py-1.5 text-[10px] tracking-[0.18em] text-ivory transition hover:bg-emerald-deep"
            >
              {item.label} <X size={12} strokeWidth={1.5} />
            </button>
          ))}
        {(activeCollection || activeConcern) && (
          <button
            type="button"
            onClick={() => {
              setCollection(null);
              setConcern(null);
            }}
            className="text-stone underline-offset-4 hover:text-emerald hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {visible.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4 lg:gap-7">
          {visible.map((product, index) => (
            <Fragment key={product.id}>
              <ProductCard product={product} priority={index < 4} />
              {promo && index === PROMO_AFTER - 1 && visible.length > PROMO_AFTER && (
                <PromoTile promo={promo} />
              )}
            </Fragment>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="font-display text-[28px] font-light text-emerald">Nothing here just yet</p>
          <button
            type="button"
            className="link-underline mt-6 text-emerald"
            onClick={() => {
              setCollection(null);
              setConcern(null);
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
