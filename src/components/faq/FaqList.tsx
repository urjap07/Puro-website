"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ChevronDown, Search, X } from "lucide-react";
import type { FaqSection } from "@/lib/support";

const TINTS = ["tint-saffron", "tint-aqua", "tint-quartz", "tint-sage", "tint-lilac", "tint-champagne"];

/** Searchable, grouped FAQs. Each question opens in place. */
export default function FaqList({ sections }: { sections: FaqSection[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(`${sections[0]?.id}-0`);
  const q = query.trim().toLowerCase();

  const shown = useMemo(
    () =>
      sections
        .map((section) => ({
          ...section,
          items: section.items
            .map((item, index) => ({ ...item, key: `${section.id}-${index}` }))
            .filter((item) => !q || [item.q, ...item.a].join(" ").toLowerCase().includes(q)),
        }))
        .filter((section) => section.items.length > 0),
    [sections, q],
  );
  const count = shown.reduce((sum, section) => sum + section.items.length, 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
      {/* Topics */}
      <nav aria-label="FAQ topics" className="min-w-0 lg:sticky lg:top-28 lg:self-start">
        <label className="glass-strong flex h-12 items-center gap-3 rounded-full pl-5 pr-2 focus-within:ring-2 focus-within:ring-[#5E4B8A]/50">
          <Search size={16} strokeWidth={1.5} className="relative z-[2] shrink-0 text-stone" />
          <span className="sr-only">Search the FAQs</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search questions"
            className="relative z-[2] min-w-0 flex-1 bg-transparent text-[15px] text-midnight outline-none placeholder:text-stone/70"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="relative z-[2] flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/60">
              <X size={14} strokeWidth={1.6} />
            </button>
          )}
        </label>
        <p aria-live="polite" className="mt-2 px-5 text-[12px] text-stone">
          {q ? `${count} ${count === 1 ? "answer" : "answers"} found` : " "}
        </p>
        <ul className="no-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
          {sections.map((section) => (
            <li key={section.id} className="shrink-0">
              <a
                href={`#${section.id}`}
                className="block rounded-full bg-white/45 px-4 py-2 text-[14px] text-graphite ring-1 ring-inset ring-white/70 transition hover:bg-white/75 hover:text-midnight lg:rounded-[14px] lg:bg-transparent lg:ring-0"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Questions */}
      <div className="min-w-0 space-y-10">
        {shown.map((section, sectionIndex) => (
          <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-28">
            <h2 id={`${section.id}-title`} className="font-display text-[32px] leading-tight text-midnight sm:text-[38px]">
              {section.title}
            </h2>
            <ul className={clsx("glass mt-5 divide-y divide-midnight/10 rounded-[28px] px-5 sm:px-7", TINTS[sectionIndex % TINTS.length])}>
              {section.items.map((item) => {
                const expanded = open === item.key || Boolean(q);
                return (
                  <li key={item.key} className="relative z-[2]">
                    <h3>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={`${item.key}-answer`}
                        onClick={() => setOpen(open === item.key ? null : item.key)}
                        className="flex w-full items-center justify-between gap-4 py-5 text-left text-[16px] font-medium text-midnight sm:text-[17px]"
                      >
                        {item.q}
                        <ChevronDown size={18} strokeWidth={1.5} className={clsx("shrink-0 text-stone transition-transform duration-300", expanded && "rotate-180")} />
                      </button>
                    </h3>
                    <div id={`${item.key}-answer`} hidden={!expanded} className="pb-5 pr-8">
                      {item.a.map((paragraph) => (
                        <p key={paragraph} className="mt-2 text-[15px] leading-[1.75] text-graphite first:mt-0">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        {count === 0 && (
          <div className="glass-strong rounded-[28px] px-6 py-12 text-center">
            <p className="relative z-[2] font-display text-[28px] text-midnight">No answers match &ldquo;{query.trim()}&rdquo;</p>
            <p className="relative z-[2] mt-2 text-[15px] text-stone">
              Try a different word — or{" "}
              <Link href="/contact" className="font-semibold text-[#5E4B8A] underline-offset-4 hover:underline">
                ask us directly
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
