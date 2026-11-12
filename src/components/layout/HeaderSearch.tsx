"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import type { Product } from "@/db/queries/products";
import { COLLECTIONS } from "@/lib/collections";
import { searchProducts } from "@/lib/search";
import { cutoutFor } from "@/lib/cutouts";
import { formatPrice } from "@/lib/format";
import { wellTint } from "@/components/cart/wellTint";

let cache: Product[] | null = null;
let pending: Promise<Product[]> | null = null;

/** Loads the catalogue once for live suggestions. */
function loadProducts() {
  if (cache) return Promise.resolve(cache);
  pending ??= fetch("/api/products")
    .then((res) => res.json())
    .then((data) => (cache = data?.success ? (data.products as Product[]) : []));
  return pending;
}

/** Search field with a department picker and live suggestions. */
export default function HeaderSearch({ className, autoFocus = false }: { className?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [department, setDepartment] = useState(params.get("in") ?? "all");
  const [products, setProducts] = useState<Product[]>(cache ?? []);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const box = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (box.current && !box.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const scope = COLLECTIONS.find((collection) => collection.slug === department);
    const pool = scope
      ? products.filter((product) => product.categories.some((category) => scope.categorySlugs.includes(category.slug)))
      : products;
    return searchProducts(pool, query).slice(0, 6);
  }, [products, query, department]);

  const go = (q = query) => {
    setOpen(false);
    const search = new URLSearchParams();
    if (q.trim()) search.set("q", q.trim());
    if (department !== "all") search.set("in", department);
    router.push(`/search?${search.toString()}`);
  };

  return (
    <form
      ref={box}
      role="search"
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        if (highlight >= 0 && suggestions[highlight]) {
          setOpen(false);
          router.push(`/products/${suggestions[highlight].slug}`);
        } else go();
      }}
    >
      <div className="glass-dark glass-liquid flex h-14 items-stretch rounded-full transition-shadow duration-300 focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_0_0_2px_rgba(216,198,160,0.85),0_30px_60px_-30px_rgba(0,0,0,0.7)]">
        <label className="relative z-[2] m-1.5 hidden shrink-0 items-center rounded-full bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_0_0_1px_rgba(255,255,255,0.1)] transition hover:bg-white/[0.14] sm:flex">
          <span className="sr-only">Search in</span>
          <select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="h-full cursor-pointer appearance-none rounded-full bg-transparent pl-5 pr-9 text-[13px] font-medium text-ivory outline-none focus-visible:ring-2 focus-visible:ring-champagne [&>option]:text-ink"
          >
            <option value="all">All</option>
            {COLLECTIONS.map((collection) => (
              <option key={collection.slug} value={collection.slug}>
                {collection.title}
              </option>
            ))}
          </select>
          <ChevronDown size={14} strokeWidth={1.5} className="pointer-events-none absolute right-3 text-champagne/80" />
        </label>
        <input
          autoFocus={autoFocus}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setHighlight(-1);
          }}
          onFocus={() => {
            setOpen(true);
            loadProducts().then(setProducts);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setHighlight((h) => Math.max(h - 1, -1));
            }
            if (event.key === "Escape") setOpen(false);
          }}
          placeholder="Search products, ingredients, concerns…"
          aria-label="Search PURO"
          className="relative z-[2] min-w-0 flex-1 bg-transparent px-5 text-[15px] text-ivory caret-champagne outline-none placeholder:text-ivory/55"
        />
        <button
          type="submit"
          aria-label="Search"
          className="btn-iris relative z-[2] m-1.5 w-14 !p-0 sm:w-16"
        >
          <Search size={19} strokeWidth={1.6} />
        </button>
      </div>

      <AnimatePresence>
        {open && query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="glass-strong !absolute inset-x-0 top-[calc(100%+10px)] z-[70] overflow-hidden rounded-[26px] p-1.5 text-ink"
          >
            {suggestions.length === 0 ? (
              <p className="px-5 py-4 text-[14px] text-stone">
                {products.length ? <>No matches for &ldquo;{query}&rdquo; — try turmeric, aloe or gift.</> : "Searching…"}
              </p>
            ) : (
              <ul role="listbox">
                {suggestions.map((product, index) => (
                  <li key={product.id} role="option" aria-selected={highlight === index}>
                    <button
                      type="button"
                      onMouseEnter={() => setHighlight(index)}
                      onClick={() => {
                        setOpen(false);
                        router.push(`/products/${product.slug}`);
                      }}
                      className={`flex w-full items-center gap-4 rounded-[20px] px-3 py-2 text-left transition ${highlight === index ? "bg-[linear-gradient(110deg,rgba(246,227,200,0.6),rgba(242,201,196,0.5)_35%,rgba(217,200,236,0.55)_70%,rgba(191,226,227,0.6))] shadow-[inset_0_1px_0_rgba(255,255,255,1),0_8px_18px_-14px_rgba(125,104,168,0.6)]" : ""}`}
                    >
                      <span className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-[14px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)] ${wellTint(product.slug)}`}>
                        <Image
                          src={cutoutFor(product.slug) ?? product.images[0]?.imageUrl ?? "/media/brand/02.jpg"}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-contain p-1"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-[18px] leading-tight">{product.name}</span>
                        <span className="block truncate text-[12px] text-stone">{product.subCategory}</span>
                      </span>
                      {product.variants[0] && <span className="text-[14px] font-medium">{formatPrice(product.variants[0].price)}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="submit"
              className="mt-1 flex w-full items-center gap-2 rounded-[20px] border-t border-white/70 px-4 py-3 text-left text-[13px] font-medium text-midnight transition hover:bg-white/60"
            >
              <Search size={14} strokeWidth={1.6} /> See all results for &ldquo;{query.trim()}&rdquo;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
