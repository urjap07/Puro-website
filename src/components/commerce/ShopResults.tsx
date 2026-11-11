"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { ChevronDown, LayoutGrid, List, SlidersHorizontal, Star, X } from "lucide-react";
import type { Concern, Product } from "@/db/queries/products";
import { COLLECTIONS } from "@/lib/collections";
import { searchProducts } from "@/lib/search";
import ResultCard from "./ResultCard";

export type SortKey = "featured" | "bestsellers" | "rating" | "price-asc" | "price-desc" | "newest";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "bestsellers", label: "Bestsellers" },
  { value: "rating", label: "Avg. customer review" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "newest", label: "Newest arrivals" },
];

const PRICES = [
  { value: "0-500", label: "Under ₹500" },
  { value: "500-1000", label: "₹500 – ₹1,000" },
  { value: "1000-2000", label: "₹1,000 – ₹2,000" },
  { value: "2000-", label: "Over ₹2,000" },
];

export interface ResultFilters {
  q: string;
  collection: string | null;
  concerns: string[];
  price: string | null;
  rating: number | null;
  inStock: boolean;
  sort: SortKey;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const priceOf = (product: Product) => product.variants[0]?.price ?? 0;

function inPrice(product: Product, range: string | null) {
  if (!range) return true;
  const [min, max] = range.split("-").map((part) => (part ? Number(part) : null));
  const price = priceOf(product);
  return (min === null || price >= min) && (max === null || price < max);
}

/**
 * Marketplace-style results: filter sidebar, sort, grid or list view.
 * Filters live in the URL so results can be shared and survive refresh.
 */
export default function ShopResults({
  products,
  concerns,
  initial,
  lockCollection = false,
  syncUrl = true,
}: {
  products: Product[];
  concerns: Concern[];
  initial: ResultFilters;
  /** On a collection page the department is fixed; other departments link away. */
  lockCollection?: boolean;
  syncUrl?: boolean;
}) {
  const pathname = usePathname();
  const [filters, setFilters] = useState<ResultFilters>(initial);
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [sheet, setSheet] = useState(false);
  // The sheet is portalled to <body>, which only exists in the browser.
  const [portalReady, setPortalReady] = useState(false);
  useEffect(() => setPortalReady(true), []);

  // A new search from the header arrives as new props; local filter clicks don't refetch.
  const initialKey = JSON.stringify(initial);
  useEffect(() => setFilters(JSON.parse(initialKey)), [initialKey]);

  const update = (patch: Partial<ResultFilters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    if (!syncUrl) return;
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.collection && !lockCollection) params.set("in", next.collection);
    if (next.concerns.length) params.set("concern", next.concerns.join(","));
    if (next.price) params.set("price", next.price);
    if (next.rating) params.set("rating", String(next.rating));
    if (next.inStock) params.set("stock", "1");
    if (next.sort !== "featured") params.set("sort", next.sort);
    const query = params.toString();
    window.history.replaceState(null, "", `${pathname}${query ? `?${query}` : ""}`);
  };

  const results = useMemo(() => {
    const scope = COLLECTIONS.find((collection) => collection.slug === filters.collection);
    let list = products.filter(
      (product) =>
        (!scope || product.categories.some((category) => scope.categorySlugs.includes(category.slug))) &&
        (filters.concerns.length === 0 || product.concerns.some((concern) => filters.concerns.includes(concern.slug))) &&
        inPrice(product, filters.price) &&
        (!filters.rating || (product.rating?.value ?? 0) >= filters.rating) &&
        (!filters.inStock || (product.variants[0]?.stockQuantity ?? 0) > 0),
    );
    list = filters.q ? searchProducts(list, filters.q) : list;
    const sorted = [...list];
    if (filters.sort === "featured" && !filters.q) sorted.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    if (filters.sort === "bestsellers") sorted.sort((a, b) => (b.rating?.count ?? 0) - (a.rating?.count ?? 0));
    if (filters.sort === "rating") sorted.sort((a, b) => (b.rating?.value ?? 0) - (a.rating?.value ?? 0) || (b.rating?.count ?? 0) - (a.rating?.count ?? 0));
    if (filters.sort === "price-asc") sorted.sort((a, b) => priceOf(a) - priceOf(b));
    if (filters.sort === "price-desc") sorted.sort((a, b) => priceOf(b) - priceOf(a));
    if (filters.sort === "newest") sorted.sort((a, b) => b.id - a.id);
    return sorted;
  }, [products, filters]);

  const activeCount =
    (filters.collection && !lockCollection ? 1 : 0) +
    filters.concerns.length +
    (filters.price ? 1 : 0) +
    (filters.rating ? 1 : 0) +
    (filters.inStock ? 1 : 0);
  const clearAll = () =>
    update({ collection: lockCollection ? filters.collection : null, concerns: [], price: null, rating: null, inStock: false });

  const heading = "text-[13px] font-semibold uppercase tracking-[0.16em] text-ink";
  const option = (active: boolean) =>
    clsx(
      "flex w-full items-center gap-3 rounded-[12px] px-2.5 py-2 text-left text-[15px] transition",
      active ? "bg-emerald/[0.08] font-semibold text-emerald" : "text-ink/80 hover:bg-mist-deep",
    );
  const box = (active: boolean) =>
    clsx(
      "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition",
      active ? "border-emerald bg-emerald text-ivory" : "border-ink/25 bg-ivory",
    );

  const panel = (
    <div className="space-y-7">
      <div>
        <p className={heading}>Department</p>
        <div className="mt-3 space-y-0.5">
          {!lockCollection && (
            <button type="button" className={option(!filters.collection)} onClick={() => update({ collection: null })}>
              All departments
            </button>
          )}
          {COLLECTIONS.map((collection) =>
            lockCollection ? (
              <Link key={collection.slug} href={`/collections/${collection.slug}`} className={option(filters.collection === collection.slug)}>
                {collection.title}
              </Link>
            ) : (
              <button key={collection.slug} type="button" className={option(filters.collection === collection.slug)} onClick={() => update({ collection: collection.slug })}>
                {collection.title}
              </button>
            ),
          )}
        </div>
      </div>

      <div>
        <p className={heading}>Customer review</p>
        <div className="mt-3 space-y-0.5">
          {[4, 3].map((stars) => (
            <button key={stars} type="button" className={option(filters.rating === stars)} onClick={() => update({ rating: filters.rating === stars ? null : stars })}>
              <span className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} strokeWidth={1.2} className={i < stars ? "fill-gold text-gold" : "text-gold/40"} />
                ))}
              </span>
              &amp; up
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className={heading}>Price</p>
        <div className="mt-3 space-y-0.5">
          {PRICES.map((price) => (
            <button key={price.value} type="button" className={option(filters.price === price.value)} onClick={() => update({ price: filters.price === price.value ? null : price.value })}>
              {price.label}
            </button>
          ))}
        </div>
      </div>

      {(["skin", "hair"] as const).map((type) => (
        <div key={type}>
          <p className={heading}>{type === "skin" ? "Skin concern" : "Hair concern"}</p>
          <div className="mt-3 space-y-0.5">
            {concerns
              .filter((concern) => concern.type === type)
              .map((concern) => {
                const active = filters.concerns.includes(concern.slug);
                return (
                  <button
                    key={concern.slug}
                    type="button"
                    className={option(false)}
                    onClick={() =>
                      update({
                        concerns: active ? filters.concerns.filter((slug) => slug !== concern.slug) : [...filters.concerns, concern.slug],
                      })
                    }
                  >
                    <span className={box(active)}>{active && <svg viewBox="0 0 12 12" className="h-3 w-3"><path d="M2 6.5 5 9l5-6" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>}</span>
                    {concern.name}
                  </button>
                );
              })}
          </div>
        </div>
      ))}

      <div>
        <p className={heading}>Availability</p>
        <button type="button" className={clsx(option(false), "mt-3")} onClick={() => update({ inStock: !filters.inStock })}>
          <span className={box(filters.inStock)}>{filters.inStock && <svg viewBox="0 0 12 12" className="h-3 w-3"><path d="M2 6.5 5 9l5-6" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>}</span>
          In stock only
        </button>
      </div>

      {activeCount > 0 && (
        <button type="button" onClick={clearAll} className="text-[13px] font-semibold text-emerald underline-offset-4 hover:underline">
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-10">
      {/* Sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-[88px] max-h-[calc(100vh-110px)] overflow-y-auto rounded-[24px] border border-ink/[0.07] bg-ivory/80 p-5 backdrop-blur" data-lenis-prevent>
          {panel}
        </div>
      </aside>

      <div className="min-w-0">
        {/* Results bar */}
        <div className="relative z-10 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-ink/[0.07] bg-ivory px-4 py-3">
          <p className="text-[14px] text-stone">
            {results.length === 0 ? "No results" : `1–${results.length} of ${results.length} results`}
            {filters.q && (
              <>
                {" "}for <span className="font-semibold text-gold-deep">&ldquo;{filters.q}&rdquo;</span>
              </>
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSheet(true)}
              className="flex h-10 items-center gap-2 rounded-full border border-ink/15 px-4 text-[13px] font-medium text-ink lg:hidden"
            >
              <SlidersHorizontal size={15} strokeWidth={1.4} /> Filters{activeCount ? ` (${activeCount})` : ""}
            </button>
            <label className="relative flex h-10 items-center rounded-full border border-ink/15 bg-ivory pl-4 pr-9 text-[13px]">
              <span className="mr-1 hidden text-stone sm:inline">Sort by:</span>
              <select
                value={filters.sort}
                onChange={(event) => update({ sort: event.target.value as SortKey })}
                className="cursor-pointer appearance-none bg-transparent font-medium text-ink outline-none"
              >
                {SORTS.map((sort) => (
                  <option key={sort.value} value={sort.value}>
                    {sort.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} strokeWidth={1.5} className="pointer-events-none absolute right-3.5 text-stone" />
            </label>
            <div className="hidden h-10 items-center rounded-full border border-ink/15 p-1 sm:flex">
              {(["grid", "list"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-label={`${mode} view`}
                  aria-pressed={layout === mode}
                  onClick={() => setLayout(mode)}
                  className={clsx("flex h-8 w-8 items-center justify-center rounded-full transition", layout === mode ? "bg-emerald text-ivory" : "text-stone hover:text-ink")}
                >
                  {mode === "grid" ? <LayoutGrid size={15} strokeWidth={1.4} /> : <List size={15} strokeWidth={1.4} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {results.length > 0 ? (
          <motion.div layout className={clsx("grid gap-4 sm:gap-5", layout === "grid" ? "grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" : "grid-cols-1")}>
            <AnimatePresence mode="popLayout">
              {results.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.45, delay: Math.min(index, 8) * 0.03, ease: EASE }}
                >
                  <ResultCard product={product} layout={layout} priority={index < 4} group={results} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-ink/15 bg-ivory/60 px-6 py-20 text-center">
            <p className="font-display text-[34px] text-emerald">No rituals match just yet</p>
            <p className="mt-2 text-[15px] text-stone">Try a different word, or loosen a filter.</p>
            <button type="button" onClick={() => update({ q: "", collection: lockCollection ? filters.collection : null, concerns: [], price: null, rating: null, inStock: false })} className="btn-primary mt-7 rounded-full px-8">
              Clear search &amp; filters
            </button>
          </div>
        )}
      </div>

      {/* Phone filter sheet — rendered at page level so it covers the sticky header */}
      {portalReady &&
        createPortal(
      <AnimatePresence>
        {sheet && (
          <>
            <motion.div className="fixed inset-0 z-[95] bg-ink/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)} />
            <motion.div
              data-lenis-prevent
              className="fixed inset-x-0 bottom-0 z-[96] max-h-[85svh] overflow-y-auto rounded-t-[28px] bg-ivory p-6"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <div className="mb-5 flex items-center justify-between">
                <p className="font-display text-[28px]">Filters</p>
                <button type="button" onClick={() => setSheet(false)} aria-label="Close filters" className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15">
                  <X size={17} strokeWidth={1.3} />
                </button>
              </div>
              {panel}
              <button type="button" onClick={() => setSheet(false)} className="btn-primary mt-8 w-full rounded-full">
                Show {results.length} results
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
