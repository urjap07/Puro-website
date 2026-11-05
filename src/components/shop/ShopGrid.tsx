"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import type { Concern, Product } from "@/db/queries/products";
import { COLLECTIONS } from "@/lib/collections";
import ProductCard from "@/components/product/ProductCard";

type Sort = "featured" | "price-asc" | "price-desc" | "name";

interface ShopGridProps {
  products: Product[];
  concerns?: Concern[];
  initialCollection?: string | null;
  initialConcern?: string | null;
  showFilters?: boolean;
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

  const chip = (active: boolean) =>
    clsx(
      "whitespace-nowrap border px-5 py-2.5 text-[10px] uppercase tracking-[0.22em] transition",
      active
        ? "border-emerald bg-emerald text-ivory"
        : "border-line text-emerald hover:border-emerald"
    );

  return (
    <div>
      {showFilters && (
        <div className="mb-12 space-y-5 border-b border-line pb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
              <button type="button" className={chip(collection === null)} onClick={() => setCollection(null)}>
                All
              </button>
              {COLLECTIONS.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  className={chip(collection === item.slug)}
                  onClick={() => setCollection(item.slug)}
                >
                  {item.name}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-stone">
              Sort
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as Sort)}
                className="cursor-pointer border-b border-line bg-transparent py-2 pr-2 text-[11px] uppercase tracking-[0.18em] text-emerald outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name">Name</option>
              </select>
            </label>
          </div>

          {concerns.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="text-[10px] uppercase tracking-[0.22em] text-stone">Concern</span>
              {concerns.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => setConcern(concern === item.slug ? null : item.slug)}
                  className={clsx(
                    "font-display text-[18px] transition",
                    concern === item.slug
                      ? "text-gold-deep underline decoration-gold decoration-1 underline-offset-[6px]"
                      : "text-emerald hover:text-gold-deep"
                  )}
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="mb-8 text-[11px] uppercase tracking-[0.22em] text-stone">
        {visible.length} {visible.length === 1 ? "product" : "products"}
      </p>

      {visible.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-14 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
          {visible.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
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
