"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight, Clock } from "lucide-react";

export interface WeekendRitual {
  slug: string;
  verb: string;
  day: string;
  minutes: string;
  steps: string[];
  image: string;
  /** Jewel-tone background for the card, as a CSS gradient. */
  ground: string;
  name: string;
  headline: string | null;
  price: string | null;
}

function Card({
  item,
  index,
  total,
  progress,
}: {
  item: WeekendRitual;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const reduceMotion = useReducedMotion();
  // Each card shrinks a little as the next one slides over it.
  const scale = useTransform(progress, [index / total, 1], [1, 1 - (total - index - 1) * 0.05]);
  const dim = useTransform(progress, [index / total, (index + 1) / total], [0, index < total - 1 ? 0.35 : 0]);

  return (
    <div className="sticky h-[100svh] pt-[110px] sm:pt-[120px]" style={{ top: `${index * 22}px` }}>
      <motion.div
        style={reduceMotion ? undefined : { scale, transformOrigin: "50% 0%" }}
        className="relative mx-auto flex h-[calc(100svh-150px)] max-h-[760px] flex-col overflow-hidden rounded-[36px] text-ivory shadow-[0_-30px_80px_-40px_rgba(0,0,0,0.6)] md:grid md:grid-cols-[1.05fr_0.95fr]"
      >
        <div className="absolute inset-0 -z-10" style={{ background: item.ground }} />
        <div className="relative h-[40%] shrink-0 md:h-auto">
          <Image src={item.image} alt={item.name} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-between gap-4 p-6 sm:p-10 lg:p-14">
          <div className="flex items-center justify-between text-[12px] font-medium uppercase tracking-[0.22em] text-ivory/75">
            <span>
              Ritual {String(index + 1).padStart(2, "0")} · {item.day}
            </span>
            <span className="flex items-center gap-2 rounded-full border border-ivory/30 px-3 py-1.5">
              <Clock size={13} strokeWidth={1.25} /> {item.minutes}
            </span>
          </div>
          <div>
            <p className="font-display text-[64px] italic leading-[0.9] sm:text-[96px] lg:text-[128px]">{item.verb}</p>
            <ol className="mt-6 hidden space-y-2 sm:block">
              {item.steps.map((step, i) => (
                <li key={step} className="flex gap-4 text-[16px] leading-[1.6] text-ivory/80">
                  <span className="font-display text-[18px] italic text-ivory/50">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <Link href={`/products/${item.slug}`} className="group flex items-center justify-between gap-6 border-t border-ivory/20 pt-6">
            <span>
              <span className="block font-display text-[26px] leading-tight sm:text-[32px]">{item.name}</span>
              <span className="mt-1 block text-[14px] text-ivory/70">
                {item.headline}
                {item.price && <> · {item.price}</>}
              </span>
            </span>
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ivory text-ink transition duration-500 group-hover:rotate-45 group-hover:bg-gold-soft">
              <ArrowUpRight size={20} strokeWidth={1.1} />
            </span>
          </Link>
        </div>
        <motion.div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: reduceMotion ? 0 : dim }} />
      </motion.div>
    </div>
  );
}

/** Three weekend rituals as full-width cards that stack over one another as you scroll. */
export default function WeekendStack({ items }: { items: WeekendRitual[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <div ref={ref} className="relative">
      {items.map((item, index) => (
        <Card key={item.slug} item={item} index={index} total={items.length} progress={scrollYProgress} />
      ))}
    </div>
  );
}
