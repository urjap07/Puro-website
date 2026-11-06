"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { ArrowRight, BadgeCheck, HandHeart, Leaf, Recycle, Sprout, type LucideIcon } from "lucide-react";

export interface KnowledgeItem {
  title: string;
  lead: string;
  content: string;
  image: string;
  icon: "sprout" | "leaf" | "heart" | "recycle" | "badge";
  facts: string[];
  link: { label: string; href: string };
}

const ICONS: Record<KnowledgeItem["icon"], LucideIcon> = {
  sprout: Sprout,
  leaf: Leaf,
  heart: HandHeart,
  recycle: Recycle,
  badge: BadgeCheck,
};

const ROTATE_MS = 8000;
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * "Good to know" as an editorial feature: numbered questions on the left that
 * advance on their own, and a magazine-style page on the right with the
 * photograph, a pull-quote, the answer, key facts and a link to go deeper.
 */
export default function KnowledgeTabs({ items }: { items: KnowledgeItem[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return;
    const timer = setTimeout(() => setActive((i) => (i + 1) % items.length), ROTATE_MS);
    return () => clearTimeout(timer);
  }, [active, paused, items.length]);

  const current = items[active];
  if (!current) return null;
  const Icon = ICONS[current.icon];

  return (
    <div
      className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Questions */}
      <ol role="tablist" aria-label="Good to know" className="flex flex-col lg:sticky lg:top-28 lg:self-start">
        {items.map((item, index) => {
          const isActive = index === active;
          const ItemIcon = ICONS[item.icon];
          return (
            <li key={item.title} className="relative border-b border-ink/10 first:border-t">
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(index)}
                className="group flex w-full items-center gap-5 py-5 text-left sm:py-6"
              >
                <span
                  className={clsx(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition duration-500",
                    isActive ? "border-emerald bg-emerald text-ivory" : "border-ink/15 text-emerald group-hover:border-emerald/50",
                  )}
                >
                  <ItemIcon size={19} strokeWidth={1.2} />
                </span>
                <span className="flex-1">
                  <span className="block text-[12px] font-medium tabular-nums text-stone">{String(index + 1).padStart(2, "0")}</span>
                  <span
                    className={clsx(
                      "mt-1 block font-display text-[24px] leading-[1.1] transition-all duration-500 sm:text-[30px]",
                      isActive ? "translate-x-1 italic text-emerald" : "text-ink/45 group-hover:text-ink/80",
                    )}
                  >
                    {item.title}
                  </span>
                </span>
              </button>
              {isActive && (
                <motion.span
                  key={`${active}-${paused}`}
                  className="absolute -bottom-px left-0 h-[2px] bg-gradient-to-r from-emerald via-gold to-gold-soft"
                  initial={{ width: "0%" }}
                  animate={{ width: paused ? "0%" : "100%" }}
                  transition={{ duration: paused ? 0 : ROTATE_MS / 1000, ease: "linear" }}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* The page */}
      <div className="relative overflow-hidden rounded-[32px] bg-ivory shadow-[0_60px_120px_-60px_rgba(20,38,30,0.55)] ring-1 ring-ink/5">
        <div className="relative aspect-[16/10] overflow-hidden bg-sand">
          <AnimatePresence initial={false}>
            <motion.div
              key={current.image}
              className="absolute inset-0"
              initial={{ clipPath: "inset(0 0 100% 0)" }}
              animate={{ clipPath: "inset(0 0 0% 0)" }}
              exit={{ opacity: 0, transition: { delay: 0.8, duration: 0.2 } }}
              transition={{ duration: 1, ease: [0.77, 0, 0.18, 1] }}
            >
              <motion.div className="absolute inset-0" initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.8, ease: EASE }}>
                <Image src={current.image} alt="" fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
              </motion.div>
            </motion.div>
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
          <span className="absolute bottom-3 left-6 font-display text-[clamp(72px,10vw,150px)] leading-none text-ivory/95 sm:left-8">
            {String(active + 1).padStart(2, "0")}
          </span>
          <span className="absolute right-5 top-5 flex h-14 w-14 items-center justify-center rounded-full bg-ivory/90 text-emerald backdrop-blur sm:right-7 sm:top-7">
            <Icon size={24} strokeWidth={1.1} />
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.title}
            className="p-6 sm:p-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-gold-deep">{current.title}</p>
            <p className="mt-4 font-display text-[32px] italic leading-[1.08] text-emerald sm:text-[44px]">
              &ldquo;{current.lead}&rdquo;
            </p>
            <p className="mt-5 max-w-[640px] text-[16px] leading-[1.85] text-stone">{current.content}</p>
            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              {current.facts.map((fact) => (
                <span
                  key={fact}
                  className="flex items-center gap-2 rounded-full border border-emerald/15 bg-mist px-4 py-2 text-[13px] text-emerald"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  {fact}
                </span>
              ))}
            </div>
            <Link href={current.link.href} className="link-underline mt-8 text-emerald">
              {current.link.label} <ArrowRight size={14} strokeWidth={1.25} />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
