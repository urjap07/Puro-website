"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { ArrowUpRight, Search, X } from "lucide-react";
import { TINT, type Tint } from "@/components/commerce/tints";

export interface LibraryEntry {
  slug: string;
  name: string;
  role: string | null;
  image: string | null;
  tint: Tint;
  formulas: { slug: string; name: string }[];
}

export interface AlsoEntry {
  name: string;
  formulas: { slug: string; name: string }[];
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** The searchable ingredient library: featured botanicals, then everything else our formulas name. */
export default function IngredientLibrary({ entries, also }: { entries: LibraryEntry[]; also: AlsoEntry[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const shown = useMemo(
    () =>
      q
        ? entries.filter((entry) =>
            [entry.name, entry.role ?? "", ...entry.formulas.map((formula) => formula.name)].join(" ").toLowerCase().includes(q),
          )
        : entries,
    [entries, q],
  );
  const shownAlso = useMemo(
    () => (q ? also.filter((entry) => [entry.name, ...entry.formulas.map((formula) => formula.name)].join(" ").toLowerCase().includes(q)) : also),
    [also, q],
  );

  return (
    <div>
      {/* Search */}
      <label className="glass-strong mx-auto flex h-14 max-w-[620px] items-center gap-3 rounded-full pl-6 pr-2 focus-within:ring-2 focus-within:ring-[#5E4B8A]/50">
        <Search size={18} strokeWidth={1.5} className="relative z-[2] shrink-0 text-stone" />
        <span className="sr-only">Search ingredients</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search turmeric, aloe, clay, saffron…"
          className="relative z-[2] min-w-0 flex-1 bg-transparent text-[16px] text-midnight outline-none placeholder:text-stone/70"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="relative z-[2] flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/60">
            <X size={16} strokeWidth={1.6} />
          </button>
        )}
      </label>
      <p className="mt-3 text-center text-[13px] text-stone" aria-live="polite">
        {q ? `${shown.length + shownAlso.length} ${shown.length + shownAlso.length === 1 ? "ingredient" : "ingredients"} found` : " "}
      </p>

      {/* The library */}
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        <AnimatePresence mode="popLayout">
          {shown.map((entry, index) => {
            const tint = TINT[entry.tint];
            return (
              <motion.li
                key={entry.slug}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, delay: index * 0.04, ease: EASE }}
              >
                <Link href={`/ingredients/${entry.slug}`} className={clsx("glass glass-hover group flex h-full flex-col rounded-[30px] p-3", tint.glass)}>
                  <span className="relative block aspect-[4/3] overflow-hidden rounded-[24px] bg-white/50">
                    {entry.image && (
                      <Image
                        src={entry.image}
                        alt={`${entry.name}, a PURO ingredient`}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                        className="object-cover transition duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                      />
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold text-midnight backdrop-blur">
                      In {entry.formulas.length} {entry.formulas.length === 1 ? "formula" : "formulas"}
                    </span>
                  </span>
                  <span className="relative z-[2] flex flex-1 flex-col px-3 pb-3 pt-5">
                    <span className="flex items-start justify-between gap-3">
                      <span className="font-display text-[32px] leading-[1.02] text-midnight">{entry.name}</span>
                      <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/65 text-midnight transition group-hover:bg-midnight group-hover:text-ivory">
                        <ArrowUpRight size={16} strokeWidth={1.5} />
                      </span>
                    </span>
                    {entry.role && <span className="mt-3 text-[14px] leading-[1.7] text-graphite/85">{entry.role}</span>}
                    {entry.formulas.length > 0 && (
                      <span className={clsx("mt-auto pt-4 text-[12px] font-medium", tint.text)}>
                        {entry.formulas
                          .slice(0, 3)
                          .map((formula) => formula.name)
                          .join(" · ")}
                        {entry.formulas.length > 3 ? ` · +${entry.formulas.length - 3}` : ""}
                      </span>
                    )}
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      {/* Everything else our formulas name */}
      {shownAlso.length > 0 && (
        <section aria-labelledby="also-title" className="glass-strong mt-12 rounded-[32px] p-6 sm:p-8">
          <h2 id="also-title" className="relative z-[2] font-display text-[30px] leading-tight text-midnight sm:text-[36px]">
            Also in our <em className="text-iris pr-1">formulas</em>
          </h2>
          <p className="relative z-[2] mt-2 max-w-[620px] text-[14px] leading-[1.7] text-stone">
            Other key ingredients named on our product labels. Choose one to see every formula that lists it.
          </p>
          <ul className="relative z-[2] mt-6 flex flex-wrap gap-2">
            {shownAlso.map((entry) => (
              <li key={entry.name}>
                <Link
                  href={`/search?q=${encodeURIComponent(entry.name)}`}
                  className="flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-[14px] text-midnight ring-1 ring-inset ring-white/80 transition hover:-translate-y-px hover:bg-white/85"
                >
                  {entry.name}
                  <span className="rounded-full bg-midnight/[0.07] px-2 py-0.5 text-[11px] tabular-nums text-stone">{entry.formulas.length}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {q && shown.length === 0 && shownAlso.length === 0 && (
        <div className="glass-strong mt-6 rounded-[32px] px-6 py-14 text-center">
          <p className="relative z-[2] font-display text-[30px] text-midnight">Nothing by that name yet</p>
          <p className="relative z-[2] mt-2 text-[15px] text-stone">Try turmeric, aloe, clay or saffron.</p>
        </div>
      )}
    </div>
  );
}
