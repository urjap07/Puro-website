"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import {
  ArrowDown,
  Check,
  Droplets,
  FlaskConical,
  Footprints,
  Flower2,
  Layers,
  Plus,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import QuoteForm from "@/components/business/QuoteForm";
import type { SpaCategory } from "@/lib/business";
import {
  MOODS,
  isBestseller,
  moodsFor,
  notesFor,
  type MoodId,
} from "@/lib/spa-notes";

/** Look and feel for each category: icon, tint and a mood photo from PURO's own photography. */
const STYLE: Record<
  string,
  {
    icon: LucideIcon;
    tint: string;
    accent: string;
    image: string;
    alt: string;
    tagline: string;
  }
> = {
  "massage-oils": {
    icon: Droplets,
    tint: "tint-saffron",
    accent: "#B07A1F",
    image: "/media/products/terra-tress-hair-scalp-oil/05.jpg",
    alt: "A dropper of golden oil beside sprigs of lavender",
    tagline: "Light, non-greasy blends for every kind of massage",
  },
  "scrubs-polishes": {
    icon: Sparkles,
    tint: "tint-quartz",
    accent: "#A34E6A",
    image: "/media/products/scrubulush-exfoliator/04.jpg",
    alt: "A PURO scrub with rice, turmeric and oil on a magenta background",
    tagline: "Cream scrubs and salt polishes that leave skin glowing",
  },
  "foot-care": {
    icon: Footprints,
    tint: "tint-sage",
    accent: "#4E7A4A",
    image: "/media/products/sole-rejuvenation-kit-foot-spa-kit/02.jpg",
    alt: "A PURO foot spa kit with tins, a pumice stone and a cotton pouch",
    tagline: "Creams, balms, soaks and polishes for pedicure rituals",
  },
  "face-care": {
    icon: Flower2,
    tint: "tint-apricot",
    accent: "#B4612F",
    image: "/media/products/glow-up-pithi-pack/04.jpg",
    alt: "A PURO face pack with a spoon of turmeric and a bowl of oil",
    tagline: "Masques, ubtans and scrubs for facial treatments",
  },
  "body-foot-wraps": {
    icon: Layers,
    tint: "tint-lilac",
    accent: "#6E5A9E",
    image: "/media/products/vita-clay-ubtan-pack/04.jpg",
    alt: "A sweep of golden clay on a deep green background",
    tagline: "Rich wraps that soften, brighten and detoxify",
  },
  "essential-oil-blends": {
    icon: FlaskConical,
    tint: "tint-aqua",
    accent: "#2F7C7A",
    image: "/media/products/aloe-vibe-shower-gel/05.jpg",
    alt: "A slice of orange beside a drop of clear gel",
    tagline: "Pure blends for diffusers, baths and custom oils",
  },
};

const SHORT = 115;

export default function SpaCatalogue({
  categories,
}: {
  categories: SpaCategory[];
}) {
  const [active, setActive] = useState(categories[0].id);
  const [mood, setMood] = useState<MoodId | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [quoteInView, setQuoteInView] = useState(false);
  const quoteRef = useRef<HTMLElement>(null);
  const panelTop = useRef<HTMLDivElement>(null);

  const category = categories.find((c) => c.id === active) ?? categories[0];
  const style = STYLE[category.id];

  const items = useMemo(
    () =>
      category.items.map((item) => ({
        ...item,
        notes: notesFor(item.name, item.text),
        moods: moodsFor(item.text),
        bestseller: isBestseller(item.text),
      })),
    [category],
  );
  // Only offer the moods this category actually has.
  const moods = MOODS.filter((m) =>
    items.some((item) => item.moods.includes(m.id)),
  );
  const shown = mood
    ? items.filter((item) => item.moods.includes(mood))
    : items;

  useEffect(() => {
    const node = quoteRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setQuoteInView(entry.isIntersecting),
      { rootMargin: "0px 0px -30% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const choose = (id: string) => {
    setActive(id);
    setMood(null);
    // Bring the new category into view if the tabs are stuck above it.
    const top = panelTop.current?.getBoundingClientRect().top ?? 0;
    if (top < 0)
      panelTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggle = (name: string) =>
    setPicked((current) =>
      current.includes(name)
        ? current.filter((n) => n !== name)
        : [...current, name],
    );

  const onTabKey = (event: React.KeyboardEvent, index: number) => {
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next =
      categories[(index + step + categories.length) % categories.length];
    choose(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  };

  const Icon = style.icon;

  return (
    <>
      {/* Category tabs */}
      <div ref={panelTop} className="scroll-mt-28" />
      {/* Tabs stick only while browsing products, not over the quote form. */}
      <div>
        <div className="container-site sticky top-[88px] z-20 mt-10">
          <div
            role="tablist"
            aria-label="Spa categories"
            className="no-scrollbar glass-strong -mx-1 flex gap-1.5 overflow-x-auto rounded-full p-1.5"
          >
            {categories.map((c, index) => {
              const TabIcon = STYLE[c.id].icon;
              const selected = c.id === active;
              return (
                <button
                  key={c.id}
                  id={`tab-${c.id}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls="spa-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => choose(c.id)}
                  onKeyDown={(event) => onTabKey(event, index)}
                  className={clsx(
                    "relative z-[2] flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium transition",
                    selected
                      ? "bg-midnight text-ivory shadow-[0_10px_20px_-12px_rgba(14,39,42,0.8)]"
                      : "text-midnight hover:bg-white/70",
                  )}
                >
                  <TabIcon size={15} strokeWidth={1.6} />
                  {c.title}
                  <span
                    className={clsx(
                      "rounded-full px-1.5 text-[11px]",
                      selected
                        ? "bg-white/20"
                        : "bg-midnight/[0.07] text-stone",
                    )}
                  >
                    {c.items.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          id="spa-panel"
          role="tabpanel"
          aria-labelledby={`tab-${category.id}`}
          className="container-site mt-8"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {/* Category banner */}
              <div className="grid overflow-hidden rounded-[32px] bg-white/40 shadow-[0_30px_60px_-45px_rgba(14,39,42,0.7)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
                <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[400px]">
                  <Image
                    src={style.image}
                    alt={style.alt}
                    fill
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight-deep/55 via-transparent to-transparent lg:hidden" />
                  <p className="absolute bottom-4 left-5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-ivory lg:hidden">
                    <Icon size={14} strokeWidth={1.8} /> {category.items.length}{" "}
                    products
                  </p>
                </div>
                <div
                  className={clsx(
                    "glass relative flex flex-col justify-center rounded-none p-7 sm:p-10",
                    style.tint,
                  )}
                >
                  <p
                    className="relative z-[2] hidden items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.22em] lg:flex"
                    style={{ color: style.accent }}
                  >
                    <Icon size={15} strokeWidth={1.8} /> {category.items.length}{" "}
                    products
                  </p>
                  <h2 className="relative z-[2] font-display text-[38px] leading-[1.05] text-midnight sm:text-[50px] lg:mt-4">
                    {category.title}
                  </h2>
                  <p className="relative z-[2] mt-2 font-display text-[20px] italic leading-snug text-graphite">
                    {style.tagline}
                  </p>
                  <p className="relative z-[2] mt-5 text-[15px] leading-[1.8] text-graphite">
                    {category.intro}
                  </p>
                </div>
              </div>

              {/* Mood filter */}
              {moods.length > 1 && (
                <div className="mt-8 flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-[12px] font-semibold uppercase tracking-[0.2em] text-stone">
                    Find by mood
                  </span>
                  {[{ id: null, label: "All" }, ...moods].map((m) => (
                    <button
                      key={m.label}
                      type="button"
                      aria-pressed={mood === m.id}
                      onClick={() => setMood(m.id as MoodId | null)}
                      className={clsx(
                        "rounded-full border px-3.5 py-1.5 text-[13px] transition",
                        mood === m.id
                          ? "border-midnight bg-midnight text-ivory"
                          : "border-midnight/15 bg-white/60 text-midnight hover:border-midnight/40",
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Products */}
              <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {shown.map((item) => (
                  <ProductCard
                    key={item.name}
                    item={item}
                    accent={style.accent}
                    picked={picked.includes(item.name)}
                    onToggle={() => toggle(item.name)}
                  />
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Quote */}
      <section
        ref={quoteRef}
        id="quote"
        aria-labelledby="quote-title"
        className="container-site mt-20 scroll-mt-28"
      >
        <div className="glass-strong mx-auto max-w-[880px] rounded-[32px] p-6 sm:p-10">
          <div className="relative z-[2] flex items-center gap-3">
            <span className="glass tint-quartz flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
              <Flower2
                size={19}
                strokeWidth={1.4}
                className="relative z-[2] text-midnight"
              />
            </span>
            <h2
              id="quote-title"
              className="font-display text-[32px] leading-tight text-midnight sm:text-[40px]"
            >
              Get a quote for a <em className="text-iris pr-1">bulk order</em>
            </h2>
          </div>
          <p className="relative z-[2] mt-3 text-[15px] text-stone">
            {picked.length
              ? "Here's your list — add your details and we'll send pricing."
              : "Pick products above with “Add to quote”, or tell us what your spa needs."}
          </p>
          <div className="relative z-[2] mt-8">
            <QuoteForm
              kind="Spa"
              interests={categories.map((c) => c.title)}
              picked={picked}
              onRemove={toggle}
            />
          </div>
        </div>
      </section>

      {/* Quote tray */}
      <AnimatePresence>
        {picked.length > 0 && !quoteInView && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            className="fixed bottom-4 left-4 right-[88px] z-[78] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
          >
            <div className="flex items-center gap-3 rounded-full bg-midnight py-2 pl-5 pr-2 text-ivory shadow-[0_20px_40px_-16px_rgba(14,39,42,0.8)]">
              <span className="min-w-0 flex-1 truncate text-[14px]">
                <strong className="font-semibold">{picked.length}</strong>{" "}
                <span className="sm:hidden">selected</span>
                <span className="hidden sm:inline">{picked.length === 1 ? "product" : "products"} in your quote</span>
              </span>
              <a
                href="#quote"
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-ivory px-4 py-2 text-[13px] font-semibold text-midnight transition hover:bg-white"
              >
                Request quote <ArrowDown size={14} strokeWidth={1.8} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ProductCard({
  item,
  accent,
  picked,
  onToggle,
}: {
  item: {
    name: string;
    text: string;
    notes: { name: string; colour: string }[];
    bestseller: boolean;
  };
  accent: string;
  picked: boolean;
  onToggle: () => void;
}) {
  const [open, setOpen] = useState(false);
  const long = item.text.length > SHORT;
  const swatch = item.notes.length
    ? item.notes.map((n) => n.colour)
    : [accent, "#F4EDE2"];
  const orb =
    swatch.length === 1
      ? `radial-gradient(circle at 30% 30%, #fff8, transparent 55%), ${swatch[0]}`
      : `radial-gradient(circle at 30% 30%, #fff8, transparent 55%), conic-gradient(from 200deg, ${[...swatch, swatch[0]].join(", ")})`;

  return (
    <li
      className={clsx(
        "group flex flex-col rounded-[26px] border bg-white/70 p-5 shadow-[0_18px_40px_-34px_rgba(14,39,42,0.6)] transition hover:-translate-y-0.5 hover:bg-white/90",
        picked ? "border-midnight/50" : "border-white/80",
      )}
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="h-12 w-12 shrink-0 rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,0.12),0_8px_16px_-10px_rgba(14,39,42,0.6)]"
          style={{ background: orb }}
        />
        <div className="min-w-0 flex-1">
          {item.bestseller && (
            <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-saffron/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-saffron-deep">
              <Sparkles size={10} strokeWidth={2} /> Bestseller
            </span>
          )}
          <h3 className="font-display text-[22px] leading-[1.15] text-midnight">
            {item.name}
          </h3>
        </div>
      </div>

      {item.notes.length > 0 && (
        <ul aria-label="Notes" className="mt-4 flex flex-wrap gap-1.5">
          {item.notes.map((note) => (
            <li
              key={note.name}
              className="flex items-center gap-1.5 rounded-full bg-pearl px-2.5 py-1 text-[12px] text-graphite"
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full"
                style={{ background: note.colour }}
              />
              {note.name}
            </li>
          ))}
        </ul>
      )}

      <p
        className={clsx(
          "mt-3 text-[14px] leading-[1.7] text-graphite",
          !open && long && "line-clamp-3",
        )}
      >
        {item.text}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="mt-1 self-start text-[13px] font-medium text-midnight underline underline-offset-4 hover:text-lilac-deep"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}

      <div className="mt-auto pt-5">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={picked}
          className={clsx(
            "flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-[13px] font-medium transition",
            picked
              ? "border-midnight bg-midnight text-ivory"
              : "border-midnight/20 text-midnight hover:border-midnight hover:bg-white",
          )}
        >
          {picked ? (
            <Check size={14} strokeWidth={2} />
          ) : (
            <Plus size={14} strokeWidth={2} />
          )}
          {picked ? "Added to quote" : "Add to quote"}
          {picked && (
            <X
              size={13}
              strokeWidth={1.8}
              className="ml-1 opacity-60"
              aria-hidden="true"
            />
          )}
        </button>
      </div>
    </li>
  );
}
