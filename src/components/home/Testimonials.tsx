"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import type { Review } from "@/db/queries/products";

interface TestimonialsProps {
  reviews: Review[];
  totalReviews: number;
  averageRating: number;
  /** Lifestyle photograph for each reviewed product, by product slug. */
  images: Record<string, string>;
}

/** Each review card in the ribbon takes a different tint. */
const RIBBON_TINTS = [
  "bg-[linear-gradient(140deg,#fdf0f1,#f6d9dc)]",
  "bg-[linear-gradient(140deg,#fef7e8,#f8e3b8)]",
  "bg-[linear-gradient(140deg,#f8f4fc,#e3d9f3)]",
  "bg-[linear-gradient(140deg,#f2f8f0,#dce8d5)]",
  "bg-[linear-gradient(140deg,#effafa,#cfe9ea)]",
];

export function Stars({ rating, size = 14, light = false }: { rating: number; size?: number; light?: boolean }) {
  return (
    <span className="inline-flex gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={size}
          strokeWidth={1}
          className={
            index < Math.round(rating)
              ? light
                ? "fill-saffron text-saffron"
                : "fill-saffron text-saffron-deep"
              : light
                ? "text-ivory/30"
                : "text-midnight/20"
          }
        />
      ))}
    </span>
  );
}

const ROTATE_MS = 8000;
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Dark editorial review spread: the reviewed product's photograph beside one
 * large quote, rotating on a timer, over a slow ribbon of further reviews.
 */
export default function Testimonials({ reviews, totalReviews, averageRating, images }: TestimonialsProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || reviews.length < 2) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % reviews.length), ROTATE_MS);
    return () => clearTimeout(timer);
  }, [index, paused, reviews.length]);

  if (reviews.length === 0) return null;
  const review = reviews[index];
  const go = (step: number) => setIndex((i) => (i + step + reviews.length) % reviews.length);
  const image = images[review.productSlug];
  const ribbon = [...reviews, ...reviews];

  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(160deg,#fff8f3_0%,#fbeff3_45%,#f3eefb_100%)] pt-24 text-midnight sm:pt-32">
      {/* Radiant pools of rose quartz, apricot, lilac and aqua */}
      <div className="pointer-events-none absolute -left-32 -top-32 -z-10 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(236,170,180,0.65),transparent_65%)] blur-2xl" />
      <div className="pointer-events-none absolute -right-24 -top-20 -z-10 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(246,196,140,0.6),transparent_65%)] blur-2xl" />
      <div className="pointer-events-none absolute -bottom-40 right-[12%] -z-10 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(190,170,236,0.6),transparent_65%)] blur-2xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 -z-10 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(150,214,214,0.55),transparent_65%)] blur-2xl" />

      <div
        className="container-site relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="flex flex-col justify-between gap-6 border-b border-midnight/10 pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="label text-quartz-deep"><span className="tabular-nums">09</span> — Customer Reviews</p>
            <h2 className="heading-lg mt-5">
              In their <em className="text-iris pr-[0.08em]">own words.</em>
            </h2>
          </div>
          <div className="flex items-center gap-5">
            <p className="font-display text-[64px] leading-none">{averageRating.toFixed(1)}</p>
            <div>
              <Stars rating={averageRating} />
              <p className="mt-1.5 text-[13px] text-stone">across {totalReviews.toLocaleString("en-IN")} customer reviews</p>
            </div>
          </div>
        </div>

        <div className="grid items-center gap-10 py-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:py-20">
          {/* Product photograph */}
          <Link
            href={`/products/${review.productSlug}`}
            data-cursor="Shop"
            className="relative mx-auto block aspect-[4/5] w-full max-w-[460px] overflow-hidden rounded-[28px] bg-emerald-soft shadow-[0_40px_80px_-40px_rgba(125,104,168,0.7)] ring-4 ring-white/60"
          >
            <AnimatePresence initial={false}>
              {image && (
                <motion.div
                  key={review.id}
                  className="absolute inset-0"
                  initial={{ clipPath: "inset(0 0 100% 0)", scale: 1.12 }}
                  animate={{ clipPath: "inset(0 0 0% 0)", scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.1, ease: [0.77, 0, 0.18, 1] }}
                >
                  <Image src={image} alt={review.productName} fill sizes="(min-width: 1024px) 34vw, 90vw" className="object-cover" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className="glass-strong absolute bottom-4 left-4 z-10 rounded-full px-4 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-ink">
              {review.productName}
            </span>
          </Link>

          {/* Quote */}
          <div className="glass tint-quartz rounded-[28px] p-6 sm:rounded-[36px] sm:p-10 lg:p-12">
            <span aria-hidden="true" className="pointer-events-none absolute right-6 top-0 font-display text-[160px] leading-[0.8] text-quartz-deep/25 sm:right-10 sm:text-[220px]">
              &ldquo;
            </span>
            <div className="relative min-h-[340px] sm:min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.figure
                  key={review.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.7, ease: EASE }}
                >
                  <Stars rating={review.rating} />
                  <blockquote className="mt-6 font-display text-[36px] italic leading-[1.08] sm:text-[52px] lg:text-[60px]">
                    {review.title || (review.comment ?? "").split(".")[0]}
                  </blockquote>
                  <p className="mt-6 line-clamp-4 max-w-[600px] text-[16px] leading-[1.85] text-graphite/85">{review.comment}</p>
                  <figcaption className="mt-8 flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f6d6b8,#efc3c8_50%,#d6c8ee)] font-display text-[20px] text-midnight-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_16px_-8px_rgba(125,104,168,0.6)]">
                      {review.author.charAt(0)}
                    </span>
                    <span>
                      <span className="block text-[15px]">{review.author}</span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-[12px] uppercase tracking-[0.18em] text-stone">
                        Customer review
                      </span>
                    </span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>

            {reviews.length > 1 && (
              <div className="mt-8 flex items-center gap-4 border-t border-midnight/10 pt-6 sm:gap-6">
                <span className="font-display text-[22px] tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                  <span className="text-midnight/35"> / {String(reviews.length).padStart(2, "0")}</span>
                </span>
                <span className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-midnight/10">
                  <motion.span
                    key={`${index}-${paused}`}
                    className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#e9b55a,#e9a3ae,#b4a0e0)]"
                    initial={{ width: "0%" }}
                    animate={{ width: paused ? "0%" : "100%" }}
                    transition={{ duration: paused ? 0 : ROTATE_MS / 1000, ease: "linear" }}
                  />
                </span>
                <div className="flex gap-2">
                  {[-1, 1].map((step) => (
                    <button
                      key={step}
                      type="button"
                      aria-label={step < 0 ? "Previous review" : "Next review"}
                      onClick={() => go(step)}
                      className="btn-glass h-12 w-12 !p-0"
                    >
                      {step < 0 ? <ArrowLeft size={17} strokeWidth={1.1} /> : <ArrowRight size={17} strokeWidth={1.1} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ribbon of further reviews */}
      <div className="relative overflow-hidden border-t border-midnight/10 py-8">
        <div className="flex w-max animate-marquee-slow gap-4 motion-reduce:animate-none hover:[animation-play-state:paused]">
          {ribbon.map((item, i) => (
            <button
              key={`${item.id}-${i}`}
              type="button"
              aria-hidden={i >= reviews.length}
              tabIndex={i >= reviews.length ? -1 : undefined}
              onClick={() => setIndex(i % reviews.length)}
              className={`flex w-[300px] shrink-0 flex-col rounded-[22px] p-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_20px_40px_-28px_rgba(125,104,168,0.6)] ring-1 ring-inset ring-white/70 transition hover:-translate-y-1 sm:w-[340px] ${RIBBON_TINTS[i % RIBBON_TINTS.length]}`}
            >
              <Stars rating={item.rating} size={11} />
              <span className="mt-3 line-clamp-1 font-display text-[20px] italic">{item.title || item.productName}</span>
              <span className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-graphite/80">{item.comment}</span>
              <span className="mt-3 text-[10px] uppercase tracking-[0.2em] text-stone">
                {item.author} · {item.productName}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
