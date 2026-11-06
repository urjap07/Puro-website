"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

/**
 * Closing scene: a small window of film opens to fill the screen as you
 * scroll, while the headline parts around it and turns to ivory.
 */
export default function ExpandingFilm() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Opens into a large framed panel rather than full-bleed, so it never runs into the footer.
  const insetY = useTransform(scrollYProgress, [0, 0.7], [24, 4]);
  const insetX = useTransform(scrollYProgress, [0, 0.7], [34, 2.5]);
  const round = useTransform(scrollYProgress, [0, 0.7], [220, 32]);
  const clip = useMotionTemplate`inset(${insetY}% ${insetX}% round ${round}px)`;
  const filmScale = useTransform(scrollYProgress, [0, 0.7], [1.25, 1]);
  const leftX = useTransform(scrollYProgress, [0, 0.7], ["0vw", "-6vw"]);
  const rightX = useTransform(scrollYProgress, [0, 0.7], ["0vw", "6vw"]);
  const color = useTransform(scrollYProgress, [0.25, 0.5], ["#1F3A2E", "#FBF9F5"]);
  const ctaOpacity = useTransform(scrollYProgress, [0.65, 0.85], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.65, 0.85], [24, 0]);

  if (reduceMotion) {
    return (
      <section className="bg-pearl px-3 pb-28 pt-6 sm:px-6 sm:pb-36">
        <div className="bg-noir flex min-h-[80svh] flex-col items-center justify-center rounded-[32px] px-5 text-center text-ivory">
          <h2 className="heading-xl">
            Your ritual <em>awaits.</em>
          </h2>
          <Link href="/shop" className="btn-light mt-10 rounded-full px-9">
            Shop the collection <ArrowRight size={15} strokeWidth={1.25} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="bg-pearl h-[calc(240svh+7rem)] pb-28 sm:h-[calc(240svh+9rem)] sm:pb-36">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div className="absolute inset-0 overflow-hidden bg-emerald-deep" style={{ clipPath: clip }}>
          <motion.video
            className="absolute inset-0 h-full w-full object-cover"
            style={{ scale: filmScale }}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster="/media/video/hero-wide-poster.jpg"
            aria-hidden="true"
          >
            <source src="/media/video/hero-wide.mp4" type="video/mp4" />
          </motion.video>
          <div className="absolute inset-0 bg-ink/35" />
        </motion.div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center">
          <motion.p className="eyebrow mb-6" style={{ color }}>
            Begin today
          </motion.p>
          <motion.h2
            className="font-display text-[15vw] leading-[0.9] tracking-[-0.02em] sm:text-[11vw] lg:text-[9vw]"
            style={{ color }}
          >
            <motion.span className="block" style={{ x: leftX }}>
              Your ritual
            </motion.span>
            <motion.span className="block italic" style={{ x: rightX }}>
              awaits.
            </motion.span>
          </motion.h2>
          <motion.div className="mt-12 flex flex-wrap justify-center gap-4" style={{ opacity: ctaOpacity, y: ctaY }}>
            <Link href="/shop" className="btn-light rounded-full px-9">
              Shop the collection <ArrowRight size={15} strokeWidth={1.25} />
            </Link>
            <Link href="/collections/gifting" className="btn-outline-light rounded-full px-9">
              Gift sets
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
