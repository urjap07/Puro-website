"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search, X } from "lucide-react";
import type { Product } from "@/db/queries/products";
import { formatPrice } from "@/lib/format";

const POPULAR = ["Pithi", "Ubtan", "Turmeric", "Aloe", "Hair oil", "Gift set"];
const EASE = [0.22, 1, 0.36, 1] as const;

let cache: Product[] | null = null;

/** Full-width search panel with live results from the catalogue. */
export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>(cache ?? []);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => input.current?.focus(), 250);
    if (!cache) {
      fetch("/api/products")
        .then((res) => res.json())
        .then((data) => {
          if (data?.success) {
            cache = data.products as Product[];
            setProducts(cache);
          }
        })
        .catch(() => {});
    }
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    window.__lenis?.stop();
    return () => {
      document.removeEventListener("keydown", onKey);
      window.__lenis?.start();
    };
  }, [open, onClose]);

  const results = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return products.filter((product) => product.isFeatured).slice(0, 4);
    const haystack = (product: Product) =>
      [
        product.name,
        product.headline,
        product.tagline,
        product.summary,
        product.description,
        product.subCategory,
        product.keyIngredients,
        product.ingredients,
        ...product.benefits,
        ...product.categories.map((category) => category.name),
        ...product.concerns.map((concern) => concern.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    // Every word must appear somewhere; products whose name matches come first.
    const nameScore = (product: Product) => words.filter((word) => product.name.toLowerCase().includes(word)).length;
    return products
      .filter((product) => {
        const text = haystack(product);
        return words.every((word) => text.includes(word));
      })
      .sort((a, b) => nameScore(b) - nameScore(a))
      .slice(0, 8);
  }, [products, query]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button type="button" aria-label="Close search" onClick={onClose} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            data-lenis-prevent
            className="bg-pearl relative max-h-[90svh] overflow-y-auto rounded-b-[32px] shadow-[0_60px_120px_-40px_rgba(13,28,23,0.6)]"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.6, ease: [0.77, 0, 0.18, 1] }}
          >
            <div className="container-site pb-12 pt-8 sm:pb-16 sm:pt-12">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Search the collection</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-ink transition hover:bg-ink hover:text-ivory"
                  aria-label="Close search"
                >
                  <X size={18} strokeWidth={1.2} />
                </button>
              </div>

              <form
                className="mt-6 flex items-center gap-4 border-b border-ink/20 pb-4 focus-within:border-emerald"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (results[0]) window.location.href = `/products/${results[0].slug}`;
                }}
              >
                <Search size={28} strokeWidth={1} className="shrink-0 text-emerald" />
                <input
                  ref={input}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Turmeric, ubtan, hair oil…"
                  className="min-w-0 flex-1 bg-transparent font-display text-[34px] text-ink outline-none placeholder:text-ink/30 sm:text-[56px]"
                  aria-label="Search products"
                />
                {query && (
                  <button type="button" onClick={() => setQuery("")} className="text-[12px] uppercase tracking-[0.2em] text-stone hover:text-ink">
                    Clear
                  </button>
                )}
              </form>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="mr-2 text-[12px] font-medium uppercase tracking-[0.2em] text-stone">Popular</span>
                {POPULAR.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="rounded-full border border-emerald/20 px-4 py-2 text-[14px] text-emerald transition hover:border-emerald hover:bg-emerald hover:text-ivory"
                  >
                    {term}
                  </button>
                ))}
              </div>

              <p className="mt-10 text-[12px] font-medium uppercase tracking-[0.2em] text-stone">
                {query.trim() ? `${results.length} ${results.length === 1 ? "result" : "results"}` : "Bestsellers"}
              </p>
              <ul className="mt-5 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                {results.map((product, index) => (
                  <motion.li
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: index * 0.05, ease: EASE }}
                  >
                    <Link href={`/products/${product.slug}`} onClick={onClose} className="group block">
                      <span className="relative block aspect-[4/5] overflow-hidden rounded-[18px] bg-[radial-gradient(ellipse_75%_60%_at_50%_42%,#ffffff_0%,#f6f1e8_55%,#e9e0d1_100%)]">
                        {product.images[0] && (
                          <Image
                            src={product.images[0].imageUrl}
                            alt={product.name}
                            fill
                            sizes="(min-width: 1024px) 20vw, 45vw"
                            className="object-contain p-[10%] mix-blend-multiply transition duration-700 group-hover:scale-105"
                          />
                        )}
                      </span>
                      <span className="mt-3 block font-display text-[20px] leading-tight text-ink">{product.name}</span>
                      {product.variants[0] && <span className="text-[14px] text-stone">{formatPrice(product.variants[0].price)}</span>}
                    </Link>
                  </motion.li>
                ))}
                {query.trim() && results.length === 0 && (
                  <li className="col-span-full text-[16px] text-stone">Nothing matches &ldquo;{query}&rdquo; yet — try turmeric, aloe or gift.</li>
                )}
              </ul>

              <Link href="/shop" onClick={onClose} className="link-underline mt-10 text-emerald">
                Browse everything <ArrowRight size={14} strokeWidth={1.25} />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
