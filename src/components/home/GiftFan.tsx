"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { ArrowLeft, ArrowRight, Gift } from "lucide-react";
import type { KitItem } from "@/db/queries/products";

export interface GiftSet {
  id: number;
  slug: string;
  name: string;
  headline: string | null;
  price: string | null;
  image: string | null;
  contents: KitItem[];
}

const EASE = [0.22, 1, 0.36, 1] as const;

const ROTATE_MS = 4000;

/**
 * Gift sets fanned out like a hand of cards, turning one by one: every few
 * seconds the next set comes to the front and the rest wheel around it.
 * Click the front card for the next set, or any other card to bring it
 * forward; arrows, swipe and the keyboard work too. Hover pauses and opens
 * the fan wider.
 */
export default function GiftFan({ gifts }: { gifts: GiftSet[] }) {
  const [active, setActive] = useState(0);
  const [spread, setSpread] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [paused, setPaused] = useState(false);
  const total = gifts.length;

  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Auto-advance, one set at a time.
  useEffect(() => {
    if (paused || total < 2) return;
    const timer = setTimeout(() => setActive((i) => (i + 1) % total), ROTATE_MS);
    return () => clearTimeout(timer);
  }, [active, paused, total]);

  const go = (step: number) => setActive((i) => (i + step + total) % total);

  const current = gifts[active];
  if (!current) return null;

  return (
    <div className="grid items-center gap-16 lg:grid-cols-[1fr_1fr] lg:gap-10">
      {/* The fan */}
      <div>
        <motion.div
          className="relative mx-auto h-[420px] w-full max-w-[600px] touch-pan-y sm:h-[520px]"
          onMouseEnter={() => {
            setSpread(true);
            setPaused(true);
          }}
          onMouseLeave={() => {
            setSpread(false);
            setPaused(false);
          }}
          onPanEnd={(_, info) => {
            if (Math.abs(info.offset.x) > 50) go(info.offset.x < 0 ? 1 : -1);
          }}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label="Gift sets"
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") go(1);
            if (event.key === "ArrowLeft") go(-1);
          }}
        >
          {gifts.map((gift, index) => {
            // Position relative to the front card, wrapping round the circle.
            let offset = index - active;
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;
            const isActive = offset === 0;
            const distance = Math.abs(offset);
            const gap = (spread ? 1 : 0.8) * (narrow ? 0.6 : 1);
            return (
              <motion.button
                key={gift.id}
                type="button"
                aria-label={isActive ? `${gift.name} — show the next gift set` : `Show ${gift.name}`}
                onClick={() => (isActive ? go(1) : setActive(index))}
                className="absolute left-1/2 top-1/2 h-[300px] w-[210px] -ml-[105px] -mt-[150px] origin-bottom sm:h-[380px] sm:w-[270px] sm:-ml-[135px] sm:-mt-[190px]"
                style={{ zIndex: 50 - distance }}
                animate={{
                  rotate: offset * 9 * gap,
                  x: offset * 56 * gap,
                  y: isActive ? -24 : distance * 16 * gap,
                  scale: isActive ? 1.06 : 1 - distance * 0.05,
                  opacity: distance > 3 ? 0 : distance === 3 ? 0.55 : 1,
                  filter: isActive ? "brightness(1)" : `brightness(${1 - distance * 0.12})`,
                }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <span
                  className={clsx(
                    "flex h-full w-full flex-col overflow-hidden rounded-[24px] border bg-ivory shadow-[0_40px_80px_-30px_rgba(0,0,0,0.75)] transition-colors duration-500",
                    isActive ? "border-gold-soft" : "border-ivory/40",
                  )}
                >
                  <span className="relative flex-1 bg-[radial-gradient(ellipse_75%_60%_at_50%_45%,#ffffff_0%,#f3ece1_60%,#e6dccb_100%)]">
                    {gift.image && (
                      <Image src={gift.image} alt="" fill sizes="270px" className="object-contain p-5 mix-blend-multiply" />
                    )}
                    {isActive && total > 1 && (
                      <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-ink text-ivory">
                        <ArrowRight size={15} strokeWidth={1.25} />
                      </span>
                    )}
                  </span>
                  <span className="flex items-center justify-between gap-3 border-t border-ink/10 px-4 py-3 text-left">
                    <span className="line-clamp-1 font-display text-[18px] text-ink">{gift.name}</span>
                    <span className="shrink-0 text-[13px] text-stone">{gift.price}</span>
                  </span>
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Controls */}
        {total > 1 && (
          <div className="mx-auto mt-8 flex max-w-[600px] items-center gap-5">
            <button
              type="button"
              aria-label="Previous gift set"
              onClick={() => go(-1)}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ivory/25 text-ivory transition duration-300 hover:border-ivory hover:bg-ivory hover:text-ink"
            >
              <ArrowLeft size={17} strokeWidth={1.1} />
            </button>
            <div className="flex flex-1 gap-1.5">
              {gifts.map((gift, index) => (
                <button
                  key={gift.id}
                  type="button"
                  aria-label={`Show ${gift.name}`}
                  aria-current={index === active}
                  onClick={() => setActive(index)}
                  className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-ivory/15"
                >
                  {index < active && <span className="absolute inset-0 bg-ivory/45" />}
                  {index === active && (
                    <motion.span
                      key={`${active}-${paused}`}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold to-gold-soft"
                      initial={{ width: paused ? "100%" : "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: paused ? 0 : ROTATE_MS / 1000, ease: "linear" }}
                    />
                  )}
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-label="Next gift set"
              onClick={() => go(1)}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ivory/25 text-ivory transition duration-300 hover:border-ivory hover:bg-ivory hover:text-ink"
            >
              <ArrowRight size={17} strokeWidth={1.1} />
            </button>
          </div>
        )}
        <p className="mt-5 text-center text-[12px] uppercase tracking-[0.22em] text-ivory/50">
          Tap the front box for the next set · swipe or use the arrows
        </p>
      </div>

      {/* Details of the chosen set */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          className="relative z-[60]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <p className="flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.22em] text-gold-soft">
            <Gift size={15} strokeWidth={1.25} /> Gift set {String(active + 1).padStart(2, "0")} of {String(gifts.length).padStart(2, "0")}
          </p>
          <h3 className="mt-5 font-display text-[44px] leading-[1] text-ivory sm:text-[60px]">{current.name}</h3>
          {current.headline && <p className="mt-5 max-w-[480px] text-[17px] leading-[1.8] text-ivory/75">{current.headline}</p>}
          {current.contents.length > 0 && (
            <div className="mt-8">
              <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-ivory/50">Inside the box</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {current.contents.slice(0, 6).map((item) => (
                  <li key={item.name} className="rounded-full border border-ivory/20 bg-ivory/[0.06] px-4 py-2 text-[14px] text-ivory/85">
                    {item.name}
                    {item.size && <span className="text-ivory/50"> · {item.size}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-10 flex flex-wrap items-center gap-6">
            {current.price && <span className="font-display text-[38px] leading-none text-ivory">{current.price}</span>}
            <Link href={`/products/${current.slug}`} className="btn-light rounded-full px-9">
              Choose this gift <ArrowRight size={15} strokeWidth={1.25} />
            </Link>
            <Link href="/collections/gifting" className="link-underline text-ivory">
              All gift sets
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
