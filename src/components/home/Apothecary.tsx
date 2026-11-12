"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { QuickAdd, type CartProduct } from "@/components/cart/AddToBag";
import WishButton from "@/components/cart/WishButton";

const EASE = [0.22, 1, 0.36, 1] as const;

export interface ApothecaryItem extends CartProduct {
  /** Collection key, used to colour the light around the product. */
  shelf: "face" | "body" | "hair" | "gifting" | "wellness";
  category: string | null;
  headline: string | null;
  keyIngredients: string[];
  benefits: string[];
  ritual: string | null;
  price: string | null;
  size: string | null;
  /** Cut-out cleaned for the dark wall, or null to show a framed photograph. */
  cutout: string | null;
  photo: string | null;
}

/** Crate order and the look of each collection's sleeves. */
const SHELVES: { key: ApothecaryItem["shelf"]; label: string; sleeve: string; ink: string }[] = [
  { key: "face", label: "Face", sleeve: "linear-gradient(160deg,#fbf1f1 0%,#f3d6d8 100%)", ink: "#7a3d4a" },
  { key: "body", label: "Body", sleeve: "linear-gradient(160deg,#fdf6e6 0%,#f5dfae 100%)", ink: "#6e4a0e" },
  { key: "hair", label: "Hair", sleeve: "linear-gradient(160deg,#f6f2fb 0%,#ddd1ef 100%)", ink: "#4f3f78" },
  { key: "gifting", label: "Gifts", sleeve: "linear-gradient(160deg,#fdf3ea 0%,#f4d3b9 100%)", ink: "#7a4422" },
  { key: "wellness", label: "Wellness", sleeve: "linear-gradient(160deg,#f3f7f0 0%,#d7e4d0 100%)", ink: "#3d5636" },
];
const SHELF = Object.fromEntries(SHELVES.map((shelf) => [shelf.key, shelf])) as Record<ApothecaryItem["shelf"], (typeof SHELVES)[number]>;

/** The light-ground version of a cut-out (the drawer sleeves are pale). */
function lightCutout(path: string) {
  return path.replace("/cutouts/dark/", "/cutouts/");
}

const SLEEVE_W = "clamp(104px, 8.6vw, 132px)";

/**
 * One product in the crate: an even, rounded sleeve in its collection's
 * colour, with the real product photographed in it and its name at the top.
 * Hover lifts it; choosing it pulls it out onto the wall.
 */
function Sleeve({ item, index, active, onPick }: { item: ApothecaryItem; index: number; active: boolean; onPick: () => void }) {
  const shelf = SHELF[item.shelf];
  const packshot = item.images[0]?.imageUrl ?? null;

  return (
    <motion.button
      type="button"
      onClick={onPick}
      aria-pressed={active}
      aria-label={`Pull out ${item.name}`}
      data-index={index}
      className="group relative shrink-0 snap-start outline-none"
      style={{ width: SLEEVE_W }}
      initial={false}
      animate={{ y: active ? "-120%" : "0%", opacity: active ? 0 : 1 }}
      transition={{ duration: active ? 0.6 : 0.7, ease: EASE }}
    >
      <span
        className="relative flex aspect-[3/4] w-full flex-col overflow-hidden rounded-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_0_0_1px_rgba(255,255,255,0.45),0_18px_28px_-16px_rgba(0,0,0,0.75)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-4 group-focus-visible:-translate-y-4 group-focus-visible:ring-2 group-focus-visible:ring-champagne"
        style={{ background: shelf.sleeve }}
      >
        <span
          className="line-clamp-2 min-h-[2.4em] px-2.5 pt-2.5 text-center text-[9.5px] font-semibold uppercase leading-[1.2] tracking-[0.12em]"
          style={{ color: shelf.ink }}
        >
          {item.name}
        </span>
        <span className="relative mx-2 mb-2 mt-1 flex-1">
          {item.cutout ? (
            <Image src={lightCutout(item.cutout)} alt="" fill sizes="124px" className="object-contain object-bottom drop-shadow-[0_8px_10px_rgba(60,40,50,0.28)]" />
          ) : packshot ? (
            <span className="absolute inset-0 overflow-hidden rounded-[12px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]">
              <Image src={packshot} alt="" fill sizes="124px" className="object-cover" />
            </span>
          ) : null}
        </span>
        {/* A sheen across the sleeve, like a glossy record cover */}
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.45)_0%,transparent_35%)]" />
      </span>
    </motion.button>
  );
}

/** A divider tab between collections, as in a record crate. */
function Divider({ label }: { label: string }) {
  return (
    <span
      aria-hidden="true"
      className="glass-dark tint-plum flex shrink-0 snap-start items-start justify-center self-end rounded-t-[12px] rounded-b-[4px] pt-3"
      style={{ width: 30, height: `calc(${SLEEVE_W} * 4 / 3 + 22px)` }}
    >
      <span className="relative z-[2] text-[10px] font-semibold uppercase tracking-[0.3em] text-champagne" style={{ writingMode: "vertical-rl" }}>
        {label}
      </span>
    </span>
  );
}

/**
 * Section 5 — The Apothecary. Inspired by a record shop: PURO cartons stand
 * in a drawer at the front of a midnight room. Pull one out and the formula
 * rises onto the wall, turning to face you, with its story beside it.
 */
export default function Apothecary({ items: unsorted }: { items: ApothecaryItem[] }) {
  const items = useMemo(
    () => SHELVES.flatMap((shelf) => unsorted.filter((item) => item.shelf === shelf.key)),
    [unsorted],
  );
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);
  const drawer = useRef<HTMLDivElement>(null);
  const current = selected === null ? null : items[selected];

  const pick = (index: number) => {
    setDirection(selected === null || index >= selected ? 1 : -1);
    setSelected(index);
  };
  const step = useCallback(
    (delta: number) => {
      setDirection(delta);
      setSelected((previous) => (previous === null ? 0 : (previous + delta + items.length) % items.length));
    },
    [items.length],
  );
  const close = useCallback(() => setSelected(null), []);

  // Keyboard: ← → to browse, Esc to put the carton back.
  useEffect(() => {
    if (selected === null) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, select")) return;
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, step, close]);

  // Keep the chosen carton in view in the drawer (phones scroll sideways).
  useEffect(() => {
    if (selected === null) return;
    const spine = drawer.current?.querySelector(`[data-index="${selected}"]`);
    spine?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", inline: "center", block: "nearest" });
  }, [selected, reduce]);

  if (items.length === 0) return null;

  return (
    <section id="apothecary" aria-labelledby="apothecary-title" className="relative isolate scroll-mt-20 overflow-hidden bg-plum-deep text-ivory">
      {/* ---- The room ---- */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {/* Wall */}
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_30%,#7a5270_0%,#4a2c42_42%,#241a2b_78%,#10272b_100%)]" />
        {/* Pastel light washing the wall: rose from the left, saffron from the lamp, lilac to the right */}
        <div className="absolute -left-[10%] top-[10%] h-[60%] w-[50%] rounded-full bg-quartz/20 blur-[100px]" />
        <div className="absolute right-[-5%] top-[30%] h-[55%] w-[40%] rounded-full bg-lilac/20 blur-[100px]" />
        <div className="grain absolute inset-0" />
        {/* Wooden pilasters framing the room, as in a shop fit-out */}
        <div className="absolute inset-y-0 left-0 hidden w-[5.5%] bg-[linear-gradient(90deg,#3b2d22,#6d5440_40%,#5a4434)] shadow-[10px_0_30px_rgba(0,0,0,0.5)] md:block" />
        <div className="absolute inset-y-0 right-0 hidden w-[5.5%] bg-[linear-gradient(270deg,#3b2d22,#6d5440_40%,#5a4434)] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] md:block" />
        {/* Pendant lamp and its pool of light */}
        <div className="absolute left-[10%] top-0 hidden flex-col items-center md:flex">
          <span className="h-[12vh] w-px bg-ivory/30" />
          <span className="h-7 w-16 rounded-t-full bg-[linear-gradient(180deg,#e3d5b6,#b8a37a)] shadow-[0_6px_16px_rgba(0,0,0,0.4)]" />
          <span className="-mt-1 h-3 w-10 rounded-full bg-[#fff6dc] blur-[3px]" />
          <span className="-mt-2 h-[44vh] w-[34vw] rounded-full bg-[radial-gradient(50%_55%_at_50%_0%,rgba(255,240,205,0.16),transparent_72%)] blur-xl" />
        </div>
        {/* Framed prints on the wall */}
        <div className="absolute right-[8%] top-[18%] hidden flex-col gap-4 2xl:flex">
          {["/media/products/terra-tress-hair-scalp-oil/05.jpg", "/media/products/vita-clay-ubtan-pack/06.jpg"].map((src) => (
            <span key={src} className="relative block h-[11vh] w-[9vh] overflow-hidden rounded-[10px] border-[5px] border-[#efe7da] bg-[#efe7da] shadow-[0_14px_24px_-10px_rgba(0,0,0,0.7)]">
              <Image src={src} alt="" fill sizes="90px" className="object-cover" />
            </span>
          ))}
        </div>
        {/* Spotlight on the centre of the wall */}
        <motion.div
          className="absolute left-1/2 top-[8%] h-[70%] w-[60%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(248,227,184,0.26),transparent)]"
          animate={{ opacity: current ? 1 : 0.4, scale: current ? 1 : 0.85 }}
          transition={{ duration: 1.2, ease: EASE }}
        />
        {/* Floor shadow where the drawer meets the room */}
        <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-black/45 to-transparent" />
      </div>

      <h2 id="apothecary-title" className="sr-only">
        The Apothecary — PURO signature formulas
      </h2>
      <div className="relative mx-auto flex max-w-site flex-col px-5 pt-20 sm:min-h-[max(calc(100svh-72px),540px)] sm:px-[8%] sm:pt-24 [@media(max-height:640px)]:min-h-0 [@media(max-height:640px)]:pt-16">
        {/* ---- The wall ---- */}
        <div className="relative flex min-h-[320px] flex-1 items-start justify-center pb-6 sm:min-h-[300px] md:items-center [@media(max-height:640px)]:min-h-[170px]">
          {/* Title, while nothing is out of the drawer */}
          <AnimatePresence>
            {!current && (
              <motion.div
                key="title"
                className="absolute inset-0 flex flex-col items-center justify-center text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.4 } }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                <p className="label justify-center text-champagne">
                  <span className="tabular-nums">04</span> — The Signatures
                </p>
                <p aria-hidden="true" className="mt-5 font-display font-light uppercase leading-[0.9] tracking-[0.06em]"
                  style={{ fontSize: "clamp(52px, min(9vw, 14vh), 128px)" }}>
                  The <em className="text-iris-light pr-[0.06em] normal-case tracking-normal">Apothecary</em>
                </p>
                <p className="mt-6 max-w-[420px] text-[15px] leading-[1.7] text-ivory/70 [@media(max-height:640px)]:hidden">
                  Every formula has a story. Pull a formula from the drawer below to meet it.
                </p>
                <motion.span
                  className="mt-8 flex flex-col items-center gap-2 text-[10px] font-medium uppercase tracking-[0.3em] text-champagne/80 [@media(max-height:640px)]:hidden"
                  animate={reduce ? undefined : { y: [0, 6, 0] }}
                  transition={{ duration: 2, repeat: 2, ease: "easeInOut" }}
                >
                  Choose a formula
                  <ArrowRight size={14} strokeWidth={1.3} className="rotate-90" />
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The chosen formula */}
          <AnimatePresence mode="wait" custom={direction}>
            {current && (
              <motion.div
                key={current.slug}
                className="relative grid w-full items-center gap-8 md:grid-cols-[1fr_1fr] md:gap-12 lg:gap-20"
                initial="enter"
                animate="show"
                exit="leave"
              >
                {/* Product, rising from the drawer and turning to face you */}
                <div className="relative mx-auto h-[min(30vh,400px)] w-full max-w-[360px] [perspective:1400px] md:h-[min(48vh,500px)] md:justify-self-end">
                  <motion.div
                    className="absolute inset-0"
                    variants={{
                      enter: reduce ? { opacity: 0 } : { opacity: 0, y: "55%", rotateY: -65 * direction, scale: 0.85 },
                      show: { opacity: 1, y: "0%", rotateY: 0, scale: 1, transition: { duration: 1.1, delay: 0.25, ease: EASE } },
                      leave: reduce ? { opacity: 0 } : { opacity: 0, y: "40%", rotateY: 55 * direction, scale: 0.9, transition: { duration: 0.5, ease: [0.55, 0, 0.75, 0] } },
                    }}
                  >
                    {current.cutout ? (
                      <Image src={current.cutout} alt={current.name} fill sizes="(min-width: 768px) 30vw, 70vw" className="object-contain object-bottom drop-shadow-[0_40px_40px_rgba(0,0,0,0.55)]" />
                    ) : current.photo ? (
                      <span className="absolute inset-x-[6%] bottom-0 top-[8%] block rounded-[28px] border-[8px] border-[#ece6da] bg-[#ece6da] shadow-[0_40px_60px_-20px_rgba(0,0,0,0.75)]">
                        <span className="relative block h-full w-full overflow-hidden rounded-[20px]">
                          <Image src={current.photo} alt={current.name} fill sizes="(min-width: 768px) 30vw, 70vw" className="object-cover" />
                        </span>
                      </span>
                    ) : null}
                  </motion.div>
                  {/* Contact shadow on the console */}
                  <motion.span
                    className="absolute -bottom-2 left-1/2 h-6 w-[60%] -translate-x-1/2 rounded-[50%] bg-black/55 blur-lg"
                    variants={{ enter: { opacity: 0, scaleX: 0.4 }, show: { opacity: 1, scaleX: 1, transition: { duration: 1, delay: 0.5 } }, leave: { opacity: 0 } }}
                  />
                </div>

                {/* Details */}
                <motion.div
                  className="glass-dark tint-plum w-full max-w-[500px] rounded-[28px] p-5 max-md:mx-auto max-md:text-center sm:rounded-[32px] sm:p-8 lg:p-9"
                  variants={{
                    enter: { opacity: 0, x: 24 * direction },
                    show: { opacity: 1, x: 0, transition: { duration: 0.9, delay: 0.55, ease: EASE } },
                    leave: { opacity: 0, x: -16 * direction, transition: { duration: 0.35 } },
                  }}
                >
                  <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-champagne/90">
                    {[current.category, current.size].filter(Boolean).join(" · ")}
                  </p>
                  <h3 className="mt-3 font-display text-[38px] font-light leading-[0.98] sm:text-[60px]">{current.name}</h3>
                  {current.headline && <p className="mt-2 font-display text-[19px] italic text-ivory/75 sm:mt-3 sm:text-[20px]">{current.headline}</p>}

                  {current.keyIngredients.length > 0 && (
                    <ul className="mt-6 flex flex-wrap gap-2 max-md:hidden">
                      {current.keyIngredients.slice(0, 4).map((ingredient) => (
                        <li key={ingredient} className="rounded-full bg-ivory/[0.06] px-3 py-1 text-[12px] text-ivory/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] ring-1 ring-inset ring-ivory/15">
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  )}
                  {current.benefits.length > 0 && (
                    <ul className="mt-5 space-y-1.5 text-[14px] leading-[1.6] text-ivory/75 max-md:hidden">
                      {current.benefits.slice(0, 2).map((benefit) => (
                        <li key={benefit} className="flex gap-3">
                          <span className="mt-[10px] h-px w-3 shrink-0 bg-quartz" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  )}

                  {current.ritual && (
                    <p className="mt-4 text-[13px] leading-[1.65] text-ivory/65 max-md:hidden">
                      <span className="mr-2 text-[10px] font-medium uppercase tracking-[0.24em] text-champagne/80">The ritual</span>
                      {current.ritual}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap items-center gap-3 max-md:justify-center sm:mt-7">
                    {current.price && <p className="mr-2 font-display text-[30px] leading-none">{current.price}</p>}
                    <QuickAdd
                      product={current}
                      className="bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0)_55%),linear-gradient(110deg,#f6e3c8_0%,#f2c9c4_30%,#d9c8ec_62%,#bfe2e3_100%)] px-6 py-3.5 text-midnight-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_14px_32px_-14px_rgba(0,0,0,0.6)] hover:brightness-105"
                    />
                    <WishButton product={current} className="h-11 w-11" />
                  </div>
                  <Link href={`/products/${current.slug}`} className="link-underline mt-5 text-champagne sm:mt-6">
                    Discover the formula <ArrowUpRight size={14} strokeWidth={1.3} />
                  </Link>

                  {/* Browse */}
                  <div className="mt-6 flex items-center gap-3 border-t border-ivory/15 pt-4 max-md:justify-center sm:mt-7 sm:gap-4 sm:pt-5">
                    <button type="button" onClick={() => step(-1)} aria-label="Previous formula" className="btn-glass-dark h-10 w-10 !p-0 hover:bg-ivory/15">
                      <ArrowLeft size={16} strokeWidth={1.3} />
                    </button>
                    <span className="whitespace-nowrap text-[12px] tabular-nums tracking-[0.2em] text-ivory/60" aria-live="polite">
                      {String((selected ?? 0) + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                    </span>
                    <button type="button" onClick={() => step(1)} aria-label="Next formula" className="btn-glass-dark h-10 w-10 !p-0 hover:bg-ivory/15">
                      <ArrowRight size={16} strokeWidth={1.3} />
                    </button>
                    <button type="button" onClick={close} aria-label="Back to the drawer" className="btn-glass-dark ml-auto h-10 gap-2 whitespace-nowrap !px-4 !py-0 text-[11px] text-ivory/80 hover:bg-ivory/15 hover:text-ivory max-md:ml-2 max-md:w-10 max-md:!px-0">
                      <X size={14} strokeWidth={1.3} /> <span className="max-md:hidden">Back to the drawer</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ---- The drawer of cartons ---- */}
        <div className="relative -mx-5 sm:mx-0">
          <div
            ref={drawer}
            role="group"
            aria-label="Formulas in the drawer, grouped by collection"
            data-lenis-prevent-wheel
            className="no-scrollbar relative z-10 -mb-[16px] flex snap-x snap-mandatory items-end gap-3 overflow-x-auto scroll-px-6 px-6 pb-1 pt-10 [mask-image:linear-gradient(90deg,transparent,black_4%,black_96%,transparent)] sm:gap-3.5"
          >
            {SHELVES.map((shelf) => {
              const group = items.map((item, index) => ({ item, index })).filter(({ item }) => item.shelf === shelf.key);
              if (!group.length) return null;
              return (
                <div key={shelf.key} className="flex shrink-0 items-end gap-3 sm:gap-3.5">
                  <Divider label={shelf.label} />
                  {group.map(({ item, index }) => (
                    <Sleeve key={item.slug} item={item} index={index} active={selected === index} onPick={() => pick(index)} />
                  ))}
                </div>
              );
            })}
          </div>
          {/* Front of the crate: a pane of glass with a bright rim, and arrows to flick through */}
          <div className="glass-dark tint-plum relative z-20 flex h-[clamp(54px,7vh,68px)] items-center justify-between rounded-[22px] px-3 sm:rounded-[26px] sm:px-5">
            <span aria-hidden="true" className="absolute inset-x-[6%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(243,201,166,0.9),rgba(246,227,228,0.9),rgba(205,189,230,0.9),transparent)]" />
            <button
              type="button"
              aria-label="Flick back through the drawer"
              onClick={() => drawer.current?.scrollBy({ left: -drawer.current.clientWidth * 0.7, behavior: "smooth" })}
              className="btn-glass-dark relative z-[2] h-10 w-10 !p-0"
            >
              <ArrowLeft size={16} strokeWidth={1.4} />
            </button>
            <span aria-hidden="true" className="h-[5px] w-[96px] rounded-full bg-[linear-gradient(90deg,#f3c9a6,#f6e3e4,#cdbde6)] shadow-[0_2px_6px_rgba(0,0,0,0.45)]" />
            <button
              type="button"
              aria-label="Flick forward through the drawer"
              onClick={() => drawer.current?.scrollBy({ left: drawer.current.clientWidth * 0.7, behavior: "smooth" })}
              className="btn-glass-dark relative z-[2] h-10 w-10 !p-0"
            >
              <ArrowRight size={16} strokeWidth={1.4} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
