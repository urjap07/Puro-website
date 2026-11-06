"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { introDelay } from "@/lib/intro";

const EASE = [0.22, 1, 0.36, 1] as const;

const HEADLINE: { word: string; italic?: boolean }[][] = [
  [{ word: "Rituals" }, { word: "rooted" }, { word: "in" }, { word: "nature,", italic: true }],
  [{ word: "made" }, { word: "for" }, { word: "the" }, { word: "modern" }, { word: "you." }],
];

/**
 * Full-screen film beneath the transparent header. As the visitor scrolls, the
 * film eases into an inset, rounded frame and the headline drifts away.
 */
export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [delay, setDelay] = useState<number | null>(null);
  useEffect(() => setDelay(introDelay()), []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const radius = useTransform(scrollYProgress, [0, 1], [0, 28]);
  const shade = useTransform(scrollYProgress, [0, 1], [0, 0.35]);
  const copyY = useTransform(scrollYProgress, [0, 0.8], [0, -90]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const ready = delay !== null || reduceMotion;
  const start = delay ?? 0;
  let wordIndex = 0;

  return (
    <section ref={ref} className="relative -mt-[96px] h-[135svh] bg-mist lg:h-[160svh]">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0 overflow-hidden bg-emerald-deep"
          style={reduceMotion ? undefined : { scale, borderRadius: radius }}
        >
          <Image
            src="/media/video/hero-mobile-poster.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover md:hidden"
          />
          <Image
            src="/media/video/hero-wide-poster.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="hidden object-cover md:block"
          />
          <video
            className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          >
            <source src="/media/video/hero-mobile.mp4" type="video/mp4" media="(max-width: 767px)" />
            <source src="/media/video/hero-wide.mp4" type="video/mp4" />
          </video>
          {/* Legibility: soft shade from the bottom-left, plus a scroll-linked dim */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/55 to-ink/25 md:from-ink/75 md:via-ink/25 md:to-ink/20" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-ink/45 to-transparent md:block" />
          <motion.div className="absolute inset-0 bg-ink" style={{ opacity: reduceMotion ? 0 : shade }} />
        </motion.div>

        <motion.div
          className="container-site relative z-10 flex h-full flex-col justify-end pb-24 text-ivory sm:pb-28"
          style={reduceMotion ? undefined : { y: copyY, opacity: copyOpacity }}
        >
          <motion.p
            className="eyebrow text-ivory/80"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={ready ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: start, duration: 0.9, ease: EASE }}
          >
            Puro Body &amp; Soul · Ethical inside out
          </motion.p>

          <h1 className="heading-xl mt-6 max-w-[980px]">
            {HEADLINE.map((line, lineIndex) => (
              <span key={lineIndex} className="block">
                {line.map(({ word, italic }) => {
                  const i = wordIndex++;
                  return (
                    <span key={word} className="inline-block overflow-hidden pb-[0.12em] align-top">
                      <motion.span
                        className={`inline-block ${italic ? "italic" : ""}`}
                        initial={reduceMotion ? false : { y: "105%", opacity: 0 }}
                        animate={ready ? { y: 0, opacity: 1 } : undefined}
                        transition={{ delay: start + 0.1 + i * 0.07, duration: 1.1, ease: EASE }}
                      >
                        {word}
                      </motion.span>
                      {" "}
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>

          <motion.div
            className="mt-9 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={ready ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: start + 0.85, duration: 1, ease: EASE }}
          >
            <div className="flex flex-wrap items-center gap-7">
              <Link href="/shop" className="btn-light rounded-full px-9">
                Shop the collection <ArrowRight size={15} strokeWidth={1.25} />
              </Link>
              <Link href="#ritual" className="link-underline text-ivory">
                Discover the ritual
              </Link>
            </div>
            <p className="max-w-[340px] text-[15px] leading-[1.8] text-ivory/75">
              Botanical skin, body and hair care with turmeric, saffron and aloe — every purchase
              supports the women of Sa-Ni-Sa.
            </p>
          </motion.div>
        </motion.div>

        <div className="pointer-events-none absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-ivory/60 lg:flex">
          <span className="relative block h-10 w-px overflow-hidden bg-ivory/20">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.2s_ease-in-out_infinite] bg-ivory" />
          </span>
        </div>
      </div>
    </section>
  );
}
