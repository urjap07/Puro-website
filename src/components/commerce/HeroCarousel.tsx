"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export interface HeroSlide {
  eyebrow: string;
  title: string;
  /** Words of the title set in italic gold. */
  accent?: string;
  text: string;
  cta: { label: string; href: string };
  image: string;
  video?: string;
  position?: string;
}

const ROTATE_MS = 3500;
const EASE = [0.22, 1, 0.36, 1] as const;

/** Full-width banner carousel that fades into the page below. */
export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % slides.length), ROTATE_MS);
    return () => clearTimeout(timer);
  }, [index, slides.length]);

  const go = (step: number) => setIndex((i) => (i + step + slides.length) % slides.length);
  const [before, after] = slide.accent ? slide.title.split(slide.accent) : [slide.title, ""];

  return (
    <section
      className="relative h-[540px] overflow-hidden bg-emerald-deep text-ivory sm:h-[580px] lg:h-[clamp(520px,78vh,660px)]"
      aria-roledescription="carousel"
      aria-label="Featured"
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        >
          <motion.div className="absolute inset-0" initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: ROTATE_MS / 1000 + 1.5, ease: "easeOut" }}>
            <Image src={slide.image} alt="" fill priority={index === 0} sizes="100vw" className="object-cover" style={{ objectPosition: slide.position ?? "center" }} />
            {slide.video && (
              <video className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden" autoPlay muted loop playsInline preload="auto" aria-hidden="true">
                <source src={slide.video} type="video/mp4" />
              </video>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Legibility and the fade into the page */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#062a34]/90 via-[#062a34]/45 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#fbf8f3] via-[#fbf8f3]/60 to-transparent" />

      <div className="container-site relative flex h-full flex-col pt-10 sm:pt-14 md:!px-24 lg:pt-[clamp(32px,7vh,80px)] xl:!px-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="max-w-[620px]"
            initial="hidden"
            animate="shown"
            exit="gone"
            variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.09 } }, gone: {} }}
          >
            <motion.p
              className="eyebrow text-gold-soft"
              variants={{ hidden: { opacity: 0, y: 14 }, shown: { opacity: 1, y: 0 }, gone: { opacity: 0, y: -8 } }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              {slide.eyebrow}
            </motion.p>
            <motion.h2
              className="mt-3 max-w-[560px] font-display text-[40px] leading-[1] sm:text-[52px] lg:max-w-[640px] lg:text-[clamp(40px,7.4vh,68px)]"
              variants={{ hidden: { opacity: 0, y: 24 }, shown: { opacity: 1, y: 0 }, gone: { opacity: 0, y: -12 } }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              {before}
              {slide.accent && <em className="text-gold-soft">{slide.accent}</em>}
              {after}
            </motion.h2>
            <motion.p
              className="mt-4 max-w-[460px] text-[15px] leading-[1.7] text-ivory/85 sm:text-[16px]"
              variants={{ hidden: { opacity: 0, y: 16 }, shown: { opacity: 1, y: 0 }, gone: { opacity: 0 } }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              {slide.text}
            </motion.p>
            <motion.div variants={{ hidden: { opacity: 0, y: 16 }, shown: { opacity: 1, y: 0 }, gone: { opacity: 0 } }} transition={{ duration: 0.7, ease: EASE }}>
              <Link
                href={slide.cta.href}
                className="mt-6 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#f1e2bd] via-[#d9b97a] to-[#c59a55] px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink shadow-[0_16px_34px_-16px_rgba(197,154,85,0.9)] transition hover:brightness-105"
              >
                {slide.cta.label} <ArrowRight size={15} strokeWidth={1.6} />
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Progress */}
        <div className="mt-7 flex max-w-[320px] items-center gap-3">
          <div className="flex flex-1 gap-2">
            {slides.map((item, i) => (
              <button key={item.title} type="button" aria-label={`Show slide ${i + 1}`} onClick={() => setIndex(i)} className="relative h-1 flex-1 overflow-hidden rounded-full bg-ivory/25">
                {i < index && <span className="absolute inset-0 bg-ivory/70" />}
                {i === index && (
                  <motion.span
                    key={index}
                    className="absolute inset-y-0 left-0 bg-gold-soft"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: ROTATE_MS / 1000, ease: "linear" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Side arrows, clear of the text */}
      {[-1, 1].map((step) => (
        <button
          key={step}
          type="button"
          aria-label={step < 0 ? "Previous slide" : "Next slide"}
          onClick={() => go(step)}
          className={`absolute top-[34%] z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/35 bg-black/20 text-ivory backdrop-blur-md transition hover:bg-ivory hover:text-ink md:flex xl:h-14 xl:w-14 ${
            step < 0 ? "left-5 xl:left-6" : "right-5 xl:right-6"
          }`}
        >
          {step < 0 ? <ChevronLeft size={22} strokeWidth={1.3} /> : <ChevronRight size={22} strokeWidth={1.3} />}
        </button>
      ))}
    </section>
  );
}
