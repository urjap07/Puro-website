"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "framer-motion";
import clsx from "clsx";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import type { Product } from "@/db/queries/products";
import { QuickAdd } from "@/components/cart/AddToBag";
import { formatPrice } from "@/lib/format";
import { smoothScrollTo } from "@/components/layout/SmoothScroll";

export interface RitualSceneStep {
  step: string;
  note: string;
  when: string;
  duration: string;
  mood: string;
  product: Pick<Product, "id" | "slug" | "name" | "headline" | "images" | "variants">;
}

const R = 46;
/** Scroll distance given to each step, in viewport heights. */
const STEP_VH = 60;
const FADE = "transition-[opacity,transform,filter] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]";

/**
 * The four-step ritual as a pinned scene. All steps are rendered at once and
 * cross-fade from the scroll position, so it keeps pace with fast swipes in
 * either direction. Each photograph is shown whole in a tall frame, with a
 * soft blurred wash of it behind.
 */
export default function RitualScene({ steps }: { steps: RitualSceneStep[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const total = steps.length;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(total - 1, Math.max(0, Math.floor(value * total)));
    setActive((current) => (current === next ? current : next));
  });

  const jumpTo = (index: number) => {
    const section = ref.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const travel = section.offsetHeight - window.innerHeight;
    smoothScrollTo(top + travel * ((index + 0.5) / total));
  };

  const shown = (index: number) => (index === active ? "opacity-100" : "pointer-events-none opacity-0");

  return (
    <section
      ref={ref}
      id="ritual"
      className="bg-pearl relative scroll-mt-28 px-3 text-ivory sm:px-5 lg:px-8"
      style={{ height: reduceMotion ? "auto" : `${100 + total * STEP_VH}svh` }}
    >
      <div
        className={clsx(
          "relative mx-auto max-w-[1520px] overflow-hidden rounded-[28px] bg-[#06262f] shadow-[0_40px_80px_-50px_rgba(5,38,47,0.9)] ring-1 ring-gold/20",
          reduceMotion
            ? "my-6"
            : "sticky top-[140px] h-[calc(100dvh-152px)] lg:top-[92px] lg:h-[calc(100dvh-108px)]",
        )}
      >
        {/* Ambient wash: each photo, heavily blurred, glowing behind the scene */}
        {steps.map((item, index) => (
          <div key={item.mood} aria-hidden="true" className={clsx("absolute inset-0", FADE, shown(index))}>
            <Image src={item.mood} alt="" fill sizes="40vw" className="scale-125 object-cover opacity-45 blur-[70px] saturate-150" />
          </div>
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(90%_80%_at_30%_50%,rgba(6,38,47,0.2)_0%,rgba(6,38,47,0.75)_60%,rgba(6,38,47,0.95)_100%)]" />

        <div className="container-site relative flex h-full flex-col pb-[2.5vh] pt-[1.5vh]">
          {/* Title row */}
          <div className="flex items-start justify-between gap-6 pt-[2vh]">
            <div>
              <p className="eyebrow flex items-center gap-4 text-ivory/60">
                <span className="font-display text-[15px] normal-case italic tracking-normal">(05)</span>
                The Puro Ritual
              </p>
              <h2 className="mt-1 font-display text-[clamp(24px,4.4vh,40px)] leading-tight">
                Four steps to <em>radiant</em> skin
              </h2>
            </div>

            {/* Progress dial */}
            <div className="relative hidden aspect-square h-[clamp(64px,11vh,104px)] shrink-0 sm:block">
              <svg viewBox="0 0 112 112" className="absolute inset-0 -rotate-90">
                <defs>
                  <linearGradient id="ritual-gold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#E9D7AE" />
                    <stop offset="55%" stopColor="#C9A365" />
                    <stop offset="100%" stopColor="#F1E2BD" />
                  </linearGradient>
                </defs>
                <circle cx="56" cy="56" r={R} fill="none" stroke="rgba(251,249,245,0.15)" strokeWidth="1" />
                <motion.circle
                  cx="56"
                  cy="56"
                  r={R}
                  fill="none"
                  stroke="url(#ritual-gold)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ pathLength: reduceMotion ? (active + 1) / total : progress }}
                />
                {steps.map((_, i) => {
                  const angle = (i / total) * Math.PI * 2;
                  return (
                    <circle
                      key={i}
                      cx={56 + R * Math.cos(angle)}
                      cy={56 + R * Math.sin(angle)}
                      r={i <= active ? 3.5 : 2.5}
                      className={clsx("transition-all duration-500", i <= active ? "fill-gold-soft" : "fill-ivory/30")}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-[clamp(20px,3.4vh,32px)] leading-none tabular-nums">{String(active + 1).padStart(2, "0")}</span>
                <span className="mt-1 text-[10px] uppercase tracking-[0.22em] text-ivory/55 [@media(max-height:620px)]:hidden">of {String(total).padStart(2, "0")}</span>
              </div>
            </div>
          </div>

          {/* Stage */}
          <div className="grid min-h-0 flex-1 items-center gap-[2.5vh] py-[2vh] md:grid-cols-[0.8fr_1.2fr] md:gap-10 lg:gap-16">
            {/* Photograph, shown whole in a tall frame */}
            <div className="relative mx-auto aspect-[4/5] h-[28dvh] max-h-full overflow-hidden rounded-[24px] shadow-[0_50px_100px_-40px_rgba(0,0,0,0.9)] ring-1 ring-ivory/15 max-md:[@media(max-height:720px)]:h-[22dvh] md:h-[min(58dvh,640px)] md:rounded-[28px]">
              {steps.map((item, index) => (
                <div
                  key={item.mood}
                  className={clsx(
                    "absolute inset-0",
                    FADE,
                    index === active ? "scale-100 opacity-100" : index < active ? "scale-[1.04] opacity-0" : "scale-[1.1] opacity-0",
                  )}
                >
                  <Image src={item.mood} alt={item.product.name} fill sizes="(min-width: 1024px) 34vw, 60vw" className="object-cover" />
                </div>
              ))}
              <span className="absolute left-4 top-4 rounded-full bg-black/35 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] backdrop-blur">
                Step {String(active + 1).padStart(2, "0")}
              </span>
            </div>

            {/* Words + product */}
            <div className="relative grid min-h-0 items-center">
              {steps.map((item, index) => {
                const variant = item.product.variants[0];
                const isActive = index === active;
                return (
                  <div
                    key={item.step}
                    aria-hidden={!isActive}
                    className={clsx(
                      "relative col-start-1 row-start-1 flex flex-col justify-center",
                      FADE,
                      isActive ? "translate-y-0 opacity-100" : index < active ? "pointer-events-none -translate-y-8 opacity-0" : "pointer-events-none translate-y-8 opacity-0",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 select-none font-display text-[min(38vw,30vh)] leading-none text-transparent [-webkit-text-stroke:1px_rgba(251,249,245,0.14)] md:text-[min(16vw,34vh)]"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="relative font-display text-[clamp(44px,8.5vh,100px)] italic leading-[0.92] md:text-[clamp(52px,12vh,128px)]">{item.step}</h3>
                    <p className="relative mt-[1.6vh] max-w-[540px] text-[clamp(14px,2.2vh,19px)] leading-[1.65] text-ivory/85">{item.note}</p>
                    <div className="relative mt-[1.8vh] flex flex-wrap gap-2.5 text-[12px] font-medium uppercase tracking-[0.16em] max-md:[@media(max-height:720px)]:hidden md:[@media(max-height:560px)]:hidden">
                      <span className="flex items-center gap-2 rounded-full border border-ivory/25 bg-ivory/[0.06] px-3.5 py-2">
                        <CalendarDays size={14} strokeWidth={1.25} /> {item.when}
                      </span>
                      <span className="flex items-center gap-2 rounded-full border border-ivory/25 bg-ivory/[0.06] px-3.5 py-2">
                        <Clock size={14} strokeWidth={1.25} /> {item.duration}
                      </span>
                    </div>

                    {/* Product */}
                    <div className="relative mt-[2.4vh] flex max-w-[540px] items-center gap-4 rounded-[20px] border border-ivory/15 bg-ivory/[0.07] p-2.5 backdrop-blur-xl sm:gap-5 sm:p-3">
                      <Link
                        href={`/products/${item.product.slug}`}
                        tabIndex={isActive ? undefined : -1}
                        className="relative aspect-square h-[clamp(44px,8vh,72px)] shrink-0 overflow-hidden rounded-[14px] bg-[radial-gradient(ellipse_75%_60%_at_50%_45%,#ffffff_0%,#f3ece1_60%,#e3d8c6_100%)]"
                      >
                        {item.product.images[0] && (
                          <Image src={item.product.images[0].imageUrl} alt="" fill sizes="80px" className="object-contain p-1.5 mix-blend-multiply" />
                        )}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ivory/55 [@media(max-height:620px)]:hidden">Use</p>
                        <Link
                          href={`/products/${item.product.slug}`}
                          tabIndex={isActive ? undefined : -1}
                          className="block truncate font-display text-[clamp(18px,3vh,25px)] leading-tight hover:underline"
                        >
                          {item.product.name}
                        </Link>
                        {variant && <p className="text-[14px] text-ivory/70">{formatPrice(variant.price)}</p>}
                      </div>
                      <div className="hidden sm:block [&>button]:bg-ivory [&>button]:text-ink [&>button:hover]:bg-gold-soft">
                        <QuickAdd product={item.product} />
                      </div>
                      <Link
                        href={`/products/${item.product.slug}`}
                        tabIndex={isActive ? undefined : -1}
                        aria-label={`View ${item.product.name}`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ivory/30 transition hover:bg-ivory hover:text-ink sm:hidden"
                      >
                        <ArrowRight size={16} strokeWidth={1.1} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-4 gap-3 pr-[68px] sm:gap-6 sm:pr-[84px]">
            {steps.map((item, index) => (
              <button
                key={item.step}
                type="button"
                onClick={() => jumpTo(index)}
                className="group text-left"
                aria-current={index === active ? "step" : undefined}
              >
                <span className="relative block h-[2px] overflow-hidden rounded-full bg-ivory/15">
                  <span
                    className={clsx(
                      "absolute inset-y-0 left-0 bg-gradient-to-r from-gold to-gold-soft transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      index <= active ? "w-full" : "w-0",
                    )}
                  />
                </span>
                <span className="mt-[1.2vh] flex items-baseline gap-2">
                  <span className={clsx("text-[14px] font-medium tabular-nums sm:text-[11px]", index === active ? "text-gold-soft" : "text-ivory/40")}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={clsx(
                      "hidden truncate font-display leading-none transition-colors duration-500 sm:inline sm:text-[clamp(17px,3vh,24px)]",
                      index === active ? "italic text-ivory" : "text-ivory/45 group-hover:text-ivory/80",
                    )}
                  >
                    {item.step}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
