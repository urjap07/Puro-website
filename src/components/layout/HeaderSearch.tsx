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

/** Marketplace-style search: department picker, field and live suggestions. */
export default function HeaderSearch({ className }: { className?: string }) {
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
      <div className="relative flex h-12 items-stretch overflow-hidden rounded-full bg-ivory shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)] ring-1 ring-gold/30 transition focus-within:ring-2 focus-within:ring-gold-soft">
        <label className="relative hidden shrink-0 items-center border-r border-ink/10 bg-mist-deep/80 sm:flex">
          <span className="sr-only">Search in</span>
          <select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="h-full cursor-pointer appearance-none bg-transparent pl-5 pr-9 text-[13px] font-medium text-ink outline-none"
          >
            <option value="all">All</option>
            {COLLECTIONS.map((collection) => (
              <option key={collection.slug} value={collection.slug}>
                {collection.title}
              </option>
            ))}
          </select>
          <ChevronDown size={14} strokeWidth={1.5} className="pointer-events-none absolute right-3 text-stone" />
        </label>
        <input
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
          placeholder="Search turmeric, ubtan, hair oil, gift sets…"
          aria-label="Search Puro"
          className="min-w-0 flex-1 bg-transparent px-5 text-[15px] text-ink outline-none placeholder:text-stone/70"
        />
        <button
          type="submit"
          aria-label="Search"
          className="m-1 flex w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#e9d7ae] via-[#c9a365] to-[#a07c45] text-ink transition hover:brightness-110"
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
            className="absolute inset-x-0 top-[calc(100%+8px)] z-[70] overflow-hidden rounded-[22px] border border-ink/10 bg-ivory text-ink shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)]"
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
                      className={`flex w-full items-center gap-4 px-4 py-2.5 text-left transition ${highlight === index ? "bg-mist-deep" : ""}`}
                    >
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[10px] bg-mist">
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
              className="flex w-full items-center gap-2 border-t border-ink/10 bg-mist/70 px-5 py-3 text-left text-[13px] font-medium text-emerald hover:bg-mist-deep"
            >
              <Search size={14} strokeWidth={1.6} /> See all results for &ldquo;{query.trim()}&rdquo;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
