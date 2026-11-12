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
import { formatPrice } from "@/lib/format";
import { searchProducts } from "@/lib/search";
import ResultCard from "./ResultCard";
import { TINT, collectionTint, concernTint, ingredientTint } from "./tints";

export type SortKey = "featured" | "bestsellers" | "rating" | "price-asc" | "price-desc" | "newest";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "bestsellers", label: "Bestsellers" },
  { value: "rating", label: "Avg. customer review" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "newest", label: "Newest arrivals" },
];

/** How many results show at first, and how many more each "Show more" adds. */
const PAGE_SIZE = 12;

export interface ResultFilters {
  q: string;
  collection: string | null;
  concerns: string[];
  /** Product types (the products' sub-category, e.g. "Face Wash"). */
  types: string[];
  /** Library ingredient slugs. */
  ingredients: string[];
  /** "min-max" in rupees; either end may be empty. */
  price: string | null;
  rating: number | null;
  inStock: boolean;
  sort: SortKey;
}

type Facet = "collection" | "concerns" | "types" | "ingredients" | "price" | "rating" | "inStock";

const EASE = [0.22, 1, 0.36, 1] as const;
const priceOf = (product: Product) => product.variants[0]?.price ?? 0;

function parseRange(range: string | null): [number | null, number | null] {
  if (!range) return [null, null];
  const [min, max] = range.split("-").map((part) => (part ? Number(part) : null));
  return [min, max];
}

/**
 * Does a product pass every filter except `skip`? Skipping one facet gives
 * the counts shown beside that facet's options.
 */
function passes(product: Product, f: ResultFilters, skip?: Facet) {
  const scope = COLLECTIONS.find((collection) => collection.slug === f.collection);
  const [min, max] = parseRange(f.price);
  const price = priceOf(product);
  return (
    (skip === "collection" || !scope || product.categories.some((category) => scope.categorySlugs.includes(category.slug))) &&
    (skip === "concerns" || f.concerns.length === 0 || product.concerns.some((concern) => f.concerns.includes(concern.slug))) &&
    (skip === "types" || f.types.length === 0 || (product.subCategory !== null && f.types.includes(product.subCategory))) &&
    (skip === "ingredients" || f.ingredients.length === 0 || product.ingredientLinks.some((link) => f.ingredients.includes(link.slug))) &&
    (skip === "price" || ((min === null || price >= min) && (max === null || price <= max))) &&
    (skip === "rating" || !f.rating || (product.rating?.value ?? 0) >= f.rating) &&
    (skip === "inStock" || !f.inStock || (product.variants[0]?.stockQuantity ?? 0) > 0)
  );
}

function Check({ on }: { on: boolean }) {
  return (
    <span
      className={clsx(
        "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition",
        on ? "border-[#5E4B8A] bg-[#5E4B8A] text-ivory shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]" : "border-graphite/25 bg-white/70",
      )}
    >
      {on && (
        <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
          <path d="M2 6.5 5 9l5-6" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      )}
    </span>
  );
}

function Count({ n }: { n: number }) {
  return <span className="ml-auto shrink-0 rounded-full bg-white/60 px-2 py-0.5 text-[11px] tabular-nums text-stone ring-1 ring-inset ring-white/70">{n}</span>;
}

/** Two-handle price slider, bounded by the catalogue's real lowest and highest prices. */
function PriceRange({ bounds, value, onChange }: { bounds: [number, number]; value: string | null; onChange: (range: string | null) => void }) {
  const [lo, hi] = bounds;
  const [rawMin, rawMax] = parseRange(value);
  const min = Math.max(lo, Math.min(rawMin ?? lo, hi));
  const max = Math.min(hi, Math.max(rawMax ?? hi, lo));
  const step = hi - lo > 1000 ? 50 : 10;
  const pct = (n: number) => ((n - lo) / Math.max(1, hi - lo)) * 100;
  const commit = (nextMin: number, nextMax: number) =>
    onChange(nextMin <= lo && nextMax >= hi ? null : `${nextMin <= lo ? "" : nextMin}-${nextMax >= hi ? "" : nextMax}`);
  const thumb =
    "pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[linear-gradient(135deg,#f6e3c8,#e9c3c6_50%,#cdbde6)] [&::-moz-range-thumb]:shadow-[0_4px_10px_-2px_rgba(94,75,138,0.6)] [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[linear-gradient(135deg,#f6e3c8,#e9c3c6_50%,#cdbde6)] [&::-webkit-slider-thumb]:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_10px_-2px_rgba(94,75,138,0.6)] [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-white focus-visible:outline-none [&:focus-visible::-webkit-slider-thumb]:ring-[#5E4B8A]";

  return (
    <div className="px-1">
      <div className="flex items-baseline justify-between text-[14px] font-semibold tabular-nums text-midnight">
        <span>{formatPrice(min)}</span>
        <span className="text-[11px] font-normal text-stone">to</span>
        <span>{formatPrice(max)}</span>
      </div>
      <div className="relative mt-4 h-5">
        <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/70 ring-1 ring-inset ring-graphite/10" />
        <span
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,#e9b55a,#e9a3ae,#b4a0e0)]"
          style={{ left: `${pct(min)}%`, right: `${100 - pct(max)}%` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          min={lo}
          max={hi}
          step={step}
          value={min}
          onChange={(event) => commit(Math.min(Number(event.target.value), max - step), max)}
          className={thumb}
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={lo}
          max={hi}
          step={step}
          value={max}
          onChange={(event) => commit(min, Math.max(Number(event.target.value), min + step))}
          className={thumb}
        />
      </div>
    </div>
  );
}

/**
 * Results with a filter sidebar, sort and grid/list view. Every filter's
 * options come from the catalogue itself, with live counts. Filters live in
 * the URL so results can be shared and survive a refresh.
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
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [allTypes, setAllTypes] = useState(false);
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
    setVisible(PAGE_SIZE);
    if (!syncUrl) return;
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.collection && !lockCollection) params.set("in", next.collection);
    if (next.concerns.length) params.set("concern", next.concerns.join(","));
    if (next.types.length) params.set("type", next.types.join(","));
    if (next.ingredients.length) params.set("ingredient", next.ingredients.join(","));
    if (next.price) params.set("price", next.price);
    if (next.rating) params.set("rating", String(next.rating));
    if (next.inStock) params.set("stock", "1");
    if (next.sort !== "featured") params.set("sort", next.sort);
    const query = params.toString();
    window.history.replaceState(null, "", `${pathname}${query ? `?${query}` : ""}`);
  };

  // Search narrows the pool first; facets and counts work within it.
  const pool = useMemo(() => (filters.q ? searchProducts(products, filters.q) : products), [products, filters.q]);

  // ---- Options, drawn from the catalogue ----
  const priceBounds = useMemo<[number, number]>(() => {
    const prices = products.map(priceOf).filter((price) => price > 0);
    if (!prices.length) return [0, 0];
    const step = 50;
    return [Math.floor(Math.min(...prices) / step) * step, Math.ceil(Math.max(...prices) / step) * step];
  }, [products]);

  const typeOptions = useMemo(() => {
    const names = [...new Set(products.map((product) => product.subCategory).filter((name): name is string => Boolean(name)))];
    return names
      .map((name) => ({ name, count: pool.filter((product) => product.subCategory === name && passes(product, filters, "types")).length }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [products, pool, filters]);

  const ingredientOptions = useMemo(() => {
    const bySlug = new Map<string, string>();
    for (const product of products) for (const link of product.ingredientLinks) bySlug.set(link.slug, link.name);
    return [...bySlug].map(([slug, name]) => ({
      slug,
      name,
      count: pool.filter((product) => product.ingredientLinks.some((link) => link.slug === slug) && passes(product, filters, "ingredients")).length,
    }));
  }, [products, pool, filters]);

  const countFor = (facet: Facet, matches: (product: Product) => boolean) =>
    pool.filter((product) => matches(product) && passes(product, filters, facet)).length;

  // ---- Results ----
  const results = useMemo(() => {
    const list = pool.filter((product) => passes(product, filters));
    const sorted = [...list];
    if (filters.sort === "featured" && !filters.q) sorted.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    if (filters.sort === "bestsellers") sorted.sort((a, b) => (b.rating?.count ?? 0) - (a.rating?.count ?? 0));
    if (filters.sort === "rating") sorted.sort((a, b) => (b.rating?.value ?? 0) - (a.rating?.value ?? 0) || (b.rating?.count ?? 0) - (a.rating?.count ?? 0));
    if (filters.sort === "price-asc") sorted.sort((a, b) => priceOf(a) - priceOf(b));
    if (filters.sort === "price-desc") sorted.sort((a, b) => priceOf(b) - priceOf(a));
    if (filters.sort === "newest") sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id);
    return sorted;
  }, [pool, filters]);
  const shown = results.slice(0, visible);

  // ---- Active filter chips ----
  const chips: { key: string; label: string; remove: () => void }[] = [
    ...(filters.collection && !lockCollection
      ? [{ key: "c", label: COLLECTIONS.find((c) => c.slug === filters.collection)?.title ?? filters.collection, remove: () => update({ collection: null }) }]
      : []),
    ...filters.types.map((type) => ({ key: `t-${type}`, label: type, remove: () => update({ types: filters.types.filter((t) => t !== type) }) })),
    ...filters.ingredients.map((slug) => ({
      key: `i-${slug}`,
      label: ingredientOptions.find((option) => option.slug === slug)?.name ?? slug,
      remove: () => update({ ingredients: filters.ingredients.filter((s) => s !== slug) }),
    })),
    ...filters.concerns.map((slug) => ({
      key: `k-${slug}`,
      label: concerns.find((concern) => concern.slug === slug)?.name ?? slug,
      remove: () => update({ concerns: filters.concerns.filter((s) => s !== slug) }),
    })),
    ...(filters.price
      ? [
          {
            key: "p",
            label: (() => {
              const [min, max] = parseRange(filters.price);
              return `${formatPrice(min ?? priceBounds[0])} – ${formatPrice(max ?? priceBounds[1])}`;
            })(),
            remove: () => update({ price: null }),
          },
        ]
      : []),
    ...(filters.rating ? [{ key: "r", label: `${filters.rating}★ & up`, remove: () => update({ rating: null }) }] : []),
    ...(filters.inStock ? [{ key: "s", label: "In stock", remove: () => update({ inStock: false }) }] : []),
  ];
  // On a concern page the concern itself is the page, not a removable filter.
  const visibleChips = syncUrl ? chips : chips.filter((chip) => !chip.key.startsWith("k-"));

  const clearAll = () =>
    update({
      collection: lockCollection ? filters.collection : null,
      concerns: syncUrl ? [] : filters.concerns,
      types: [],
      ingredients: [],
      price: null,
      rating: null,
      inStock: false,
    });

  const heading = "px-1 text-[12px] font-semibold uppercase tracking-[0.2em] text-midnight";
  const option = (active: boolean, disabled = false) =>
    clsx(
      "flex w-full items-center gap-3 rounded-full px-3.5 py-2 text-left text-[15px] transition",
      active
        ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.5),rgba(255,255,255,0)_60%),linear-gradient(110deg,rgba(246,227,200,0.95)_0%,rgba(242,201,196,0.9)_32%,rgba(217,200,236,0.9)_66%,rgba(191,226,227,0.95)_100%)] font-semibold text-midnight-deep shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_0_0_1px_rgba(255,255,255,0.6),0_8px_20px_-12px_rgba(125,104,168,0.55)]"
        : disabled
          ? "cursor-not-allowed text-graphite/40"
          : "text-graphite/85 hover:bg-white/50 hover:text-midnight",
    );
  const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

  const panel = (
    <div className="space-y-7">
      <div>
        <p className={heading}>Department</p>
        <div className="mt-3 space-y-0.5">
          {!lockCollection && (
            <button type="button" className={option(!filters.collection)} onClick={() => update({ collection: null })}>
              All departments
              <Count n={countFor("collection", () => true)} />
            </button>
          )}
          {COLLECTIONS.map((collection) => {
            const n = countFor("collection", (product) => product.categories.some((category) => collection.categorySlugs.includes(category.slug)));
            const dot = <span aria-hidden="true" className={clsx("h-2 w-2 shrink-0 rounded-full", TINT[collectionTint(collection.slug)].dot)} />;
            return lockCollection ? (
              <Link key={collection.slug} href={`/collections/${collection.slug}`} className={option(filters.collection === collection.slug)}>
                {dot}
                {collection.title}
              </Link>
            ) : (
              <button
                key={collection.slug}
                type="button"
                disabled={n === 0}
                className={option(filters.collection === collection.slug, n === 0)}
                onClick={() => update({ collection: collection.slug })}
              >
                {dot}
                {collection.title}
                <Count n={n} />
              </button>
            );
          })}
        </div>
      </div>

      {typeOptions.length > 0 && (
        <div>
          <p className={heading}>Product type</p>
          <div className="mt-3 space-y-0.5">
            {typeOptions
              .filter(({ name }, i) => allTypes || i < 6 || filters.types.includes(name))
              .map(({ name, count }) => {
              const active = filters.types.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={active}
                  disabled={count === 0 && !active}
                  className={option(false, count === 0 && !active)}
                  onClick={() => update({ types: toggle(filters.types, name) })}
                >
                  <Check on={active} />
                  <span className="flex-1">{name}</span>
                  <Count n={count} />
                </button>
              );
            })}
            {typeOptions.length > 6 && (
              <button
                type="button"
                aria-expanded={allTypes}
                onClick={() => setAllTypes((open) => !open)}
                className="mt-1 flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium text-[#5E4B8A] hover:underline"
              >
                {allTypes ? "Show fewer" : `Show all ${typeOptions.length} types`}
                <ChevronDown size={14} strokeWidth={1.6} className={clsx("transition-transform", allTypes && "rotate-180")} />
              </button>
            )}
          </div>
        </div>
      )}

      {ingredientOptions.length > 0 && (
        <div>
          <p className={heading}>Key ingredient</p>
          <div className="mt-3 space-y-0.5">
            {ingredientOptions.map(({ slug, name, count }) => {
              const active = filters.ingredients.includes(slug);
              return (
                <button
                  key={slug}
                  type="button"
                  aria-pressed={active}
                  disabled={count === 0 && !active}
                  className={option(false, count === 0 && !active)}
                  onClick={() => update({ ingredients: toggle(filters.ingredients, slug) })}
                >
                  <Check on={active} />
                  <span aria-hidden="true" className={clsx("h-2 w-2 shrink-0 rounded-full", TINT[ingredientTint(slug)].dot)} />
                  <span className="flex-1">{name}</span>
                  <Count n={count} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {priceBounds[1] > priceBounds[0] && (
        <div>
          <p className={heading}>Price</p>
          <div className="mt-4">
            <PriceRange bounds={priceBounds} value={filters.price} onChange={(price) => update({ price })} />
          </div>
        </div>
      )}

      {(["skin", "hair"] as const).map((type) => (
        <div key={type}>
          <p className={heading}>{type === "skin" ? "Skin concern" : "Hair concern"}</p>
          <div className="mt-3 space-y-0.5">
            {concerns
              .filter((concern) => concern.type === type)
              .map((concern) => {
                const active = filters.concerns.includes(concern.slug);
                const n = countFor("concerns", (product) => product.concerns.some((c) => c.slug === concern.slug));
                const locked = !syncUrl && active;
                return (
                  <button
                    key={concern.slug}
                    type="button"
                    aria-pressed={active}
                    disabled={locked || (n === 0 && !active)}
                    className={option(false, n === 0 && !active)}
                    onClick={() => update({ concerns: toggle(filters.concerns, concern.slug) })}
                  >
                    <Check on={active} />
                    <span className="flex-1">{concern.name}</span>
                    <span aria-hidden="true" className={clsx("h-2 w-2 shrink-0 rounded-full", TINT[concernTint(concern)].dot)} />
                    <Count n={n} />
                  </button>
                );
              })}
          </div>
        </div>
      ))}

      <div>
        <p className={heading}>Customer review</p>
        <div className="mt-3 space-y-0.5">
          {[4, 3].map((stars) => (
            <button
              key={stars}
              type="button"
              aria-pressed={filters.rating === stars}
              className={option(filters.rating === stars)}
              onClick={() => update({ rating: filters.rating === stars ? null : stars })}
            >
              <span className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} strokeWidth={1.2} className={i < stars ? "fill-saffron text-saffron-deep" : "text-saffron/40"} />
                ))}
              </span>
              &amp; up
              <Count n={countFor("rating", (product) => (product.rating?.value ?? 0) >= stars)} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className={heading}>Availability</p>
        <button type="button" aria-pressed={filters.inStock} className={clsx(option(false), "mt-3")} onClick={() => update({ inStock: !filters.inStock })}>
          <Check on={filters.inStock} />
          In stock only
          <Count n={countFor("inStock", (product) => (product.variants[0]?.stockQuantity ?? 0) > 0)} />
        </button>
      </div>

      {visibleChips.length > 0 && (
        <button type="button" onClick={clearAll} className="glass rounded-full px-4 py-2 text-[13px] font-semibold text-midnight transition hover:text-champagne-deep">
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-10">
      {/* Sidebar */}
      <aside className="hidden lg:block">
        <div className="glass-strong no-scrollbar sticky top-[96px] max-h-[calc(100vh-120px)] overflow-y-auto rounded-[28px] p-5" data-lenis-prevent>
          {panel}
        </div>
      </aside>

      <div className="min-w-0">
        {/* Results bar */}
        <div className="glass-strong z-10 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[24px] py-2.5 pl-5 pr-2.5 sm:rounded-full">
          <p className="text-[14px] text-graphite" aria-live="polite">
            {results.length === 0 ? "No results" : `1–${shown.length} of ${results.length} results`}
            {filters.q && (
              <>
                {" "}for <span className="font-semibold text-[#66532F]">&ldquo;{filters.q}&rdquo;</span>
              </>
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSheet(true)}
              className="glass flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-medium text-midnight lg:hidden"
            >
              <SlidersHorizontal size={15} strokeWidth={1.4} /> Filters{visibleChips.length ? ` (${visibleChips.length})` : ""}
            </button>
            <label className="glass flex h-10 items-center rounded-full pl-4 pr-9 text-[13px] focus-within:ring-2 focus-within:ring-midnight/40">
              <span className="mr-1 hidden text-stone sm:inline">Sort by:</span>
              <select
                value={filters.sort}
                onChange={(event) => update({ sort: event.target.value as SortKey })}
                className="relative z-[2] cursor-pointer appearance-none bg-transparent font-medium text-midnight outline-none"
              >
                {SORTS.map((sort) => (
                  <option key={sort.value} value={sort.value}>
                    {sort.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} strokeWidth={1.5} className="pointer-events-none absolute right-3.5 z-[2] text-stone" />
            </label>
            <div className="glass hidden h-10 items-center rounded-full p-1 sm:flex">
              {(["grid", "list"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-label={`${mode} view`}
                  aria-pressed={layout === mode}
                  onClick={() => setLayout(mode)}
                  className={clsx(
                    "relative z-[2] flex h-8 w-8 items-center justify-center rounded-full transition",
                    layout === mode
                      ? "bg-gradient-to-b from-[#2b5a5f] via-[#173c40] to-[#10302f] text-ivory shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_6px_14px_-8px_rgba(14,39,42,0.8)]"
                      : "text-stone hover:text-midnight",
                  )}
                >
                  {mode === "grid" ? <LayoutGrid size={15} strokeWidth={1.4} /> : <List size={15} strokeWidth={1.4} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active filters */}
        {visibleChips.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {visibleChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.remove}
                aria-label={`Remove filter: ${chip.label}`}
                className="glass flex items-center gap-1.5 rounded-full py-1.5 pl-3.5 pr-2.5 text-[13px] font-medium text-midnight transition hover:-translate-y-px"
              >
                <span className="relative z-[2]">{chip.label}</span>
                <X size={13} strokeWidth={1.8} className="relative z-[2] text-stone" />
              </button>
            ))}
            <button type="button" onClick={clearAll} className="px-2 text-[13px] font-medium text-[#5E4B8A] underline-offset-4 hover:underline">
              Clear all
            </button>
          </div>
        )}

        {results.length > 0 ? (
          <>
            <motion.div layout className={clsx("grid gap-4 sm:gap-5", layout === "grid" ? "grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" : "grid-cols-1")}>
              <AnimatePresence mode="popLayout">
                {shown.map((product, index) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.45, delay: Math.min(index % PAGE_SIZE, 8) * 0.03, ease: EASE }}
                  >
                    <ResultCard product={product} layout={layout} priority={index < 4} group={results} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Load more */}
            <div className="mt-12 flex flex-col items-center gap-4">
              <p className="text-[13px] text-stone">
                Showing {shown.length} of {results.length}
              </p>
              <span className="h-1 w-48 overflow-hidden rounded-full bg-white/70 ring-1 ring-inset ring-graphite/10">
                <span
                  className="block h-full rounded-full bg-[linear-gradient(90deg,#e9b55a,#e9a3ae,#b4a0e0)] transition-[width] duration-700"
                  style={{ width: `${(shown.length / results.length) * 100}%` }}
                />
              </span>
              {shown.length < results.length && (
                <button type="button" onClick={() => setVisible((n) => n + PAGE_SIZE)} className="btn-glass mt-2 px-9">
                  Show {Math.min(PAGE_SIZE, results.length - shown.length)} more
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="glass-strong rounded-[32px] px-6 py-20 text-center">
            <p className="font-display text-[34px] text-midnight">No rituals match just yet</p>
            <p className="mt-2 text-[15px] text-stone">Try a different word, or loosen a filter.</p>
            <button
              type="button"
              onClick={() =>
                update({
                  q: "",
                  collection: lockCollection ? filters.collection : null,
                  concerns: syncUrl ? [] : filters.concerns,
                  types: [],
                  ingredients: [],
                  price: null,
                  rating: null,
                  inStock: false,
                })
              }
              className="btn-primary mt-7 rounded-full px-8"
            >
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
                <motion.div
                  className="fixed inset-0 z-[95] bg-midnight-deep/40 backdrop-blur-[6px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSheet(false)}
                />
                <motion.div
                  data-lenis-prevent
                  className="glass-strong fixed inset-x-0 bottom-0 z-[96] max-h-[85svh] overflow-y-auto rounded-t-[32px] p-6"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <p className="font-display text-[28px] text-midnight">Filters</p>
                    <button type="button" onClick={() => setSheet(false)} aria-label="Close filters" className="glass flex h-10 w-10 items-center justify-center rounded-full text-midnight">
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
