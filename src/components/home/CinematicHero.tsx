"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image, { getImageProps } from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { introShouldPlay } from "@/lib/intro";
import { Frond, Leaf } from "./Botanicals";

const EASE = [0.22, 1, 0.36, 1] as const;
const SLOW = [0.33, 0, 0.1, 1] as const;
const RISE = [0.16, 1, 0.3, 1] as const;
const CAMERA = [0.45, 0, 0.15, 1] as const;

export interface HeroProduct {
  slug: string;
  name: string;
  /** High-resolution cut-out, cleaned for dark grounds. */
  cutout: string;
}

const WIDE = { src: "/media/video/hero-wide.mp4", poster: "/media/video/hero-wide-poster.jpg" };
const TALL = { src: "/media/video/hero-mobile.mp4", poster: "/media/video/hero-mobile-poster.jpg" };

/**
 * The opening, in seconds (creative targets from the storyboard):
 *   01 awakening 0–1.6 · 02 the mark 1.6–3.3 · 03 the formula 3.3–5.1
 *   04 nature 5.1–6.8 · 05 enter the PURO world 6.8–8.6
 */
const T = { brand: 1.6, product: 3.3, story: 5.1, world: 6.8 };
const SCENES = ["", "01 — The awakening", "02 — The mark", "03 — The formula", "04 — Nature, held in light", "05 — Enter"];

/** 0 = not yet decided (server render), 1–4 = opening scenes, 5 = the PURO world. */
type Phase = 0 | 1 | 2 | 3 | 4 | 5;

/** Hero cut-outs share one proportion (556 × 1600). */
const CUTOUT_RATIO = 556 / 1600;
/** Height of the product during the opening. */
const PRODUCT_H = "min(62vh, 640px)";

/* ------------------------------------------------------------------ */

function Poster() {
  const common = { alt: "", sizes: "100vw", quality: 75 };
  const {
    props: { srcSet: wide },
  } = getImageProps({ ...common, src: WIDE.poster, width: 1920, height: 1080 });
  const {
    props: { srcSet: tall, ...rest },
  } = getImageProps({ ...common, src: TALL.poster, width: 1080, height: 1350 });
  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={wide} />
      <source media="(max-width: 767px)" srcSet={tall} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- decorative; alt="" is in rest */}
      <img {...rest} className="absolute inset-0 h-full w-full object-cover" />
    </picture>
  );
}

/** Deterministic pseudo-random numbers, so server and client agree. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seeded(42);
/** Dust drifting in the shaft of light (scene 01). */
const MOTES = Array.from({ length: 30 }, () => ({
  left: `${4 + rand() * 58}%`,
  top: `${6 + rand() * 70}%`,
  size: 1.5 + rand() * 2.5,
  dx: `${(rand() - 0.3) * 60}px`,
  dy: `${-30 - rand() * 70}px`,
  duration: `${7 + rand() * 7}s`,
  delay: `${-rand() * 6}s`,
  opacity: 0.35 + rand() * 0.5,
}));
/** Soft champagne bokeh (scene 04). */
const BOKEH_COLOURS = ["236,222,190", "233,180,186", "205,189,230", "240,190,110", "184,222,224"];
const BOKEH = Array.from({ length: 8 }, (_, index) => ({
  colour: BOKEH_COLOURS[index % BOKEH_COLOURS.length],
  left: `${8 + rand() * 84}%`,
  top: `${8 + rand() * 80}%`,
  size: 40 + rand() * 110,
  blur: 6 + rand() * 12,
  y: -20 - rand() * 40,
  opacity: 0.18 + rand() * 0.3,
}));

/** A mask in the exact silhouette of a cut-out. */
function silhouette(src: string): React.CSSProperties {
  return {
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "bottom",
    maskPosition: "bottom",
  };
}

/* ------------------------------------------------------------------ */

/**
 * Three signature formulas standing on a lit glass ledge, each mirrored
 * beneath. In the opening the centre product arrives from the camera move,
 * so it is held back until the hand-off.
 */
function ProductStage({
  products,
  play,
  delay,
  centreVisible,
  centreRises,
  reduce,
  centreRef,
}: {
  products: HeroProduct[];
  play: boolean;
  delay: number;
  centreVisible: boolean;
  centreRises: boolean;
  reduce: boolean;
  centreRef: React.Ref<HTMLDivElement>;
}) {
  const order = [1, 0, 2];
  const rise = (index: number) => ({ duration: 1.6, delay: delay + order.indexOf(index) * 0.2, ease: RISE });
  const shown = (index: number) => (index === 1 ? centreVisible : true);
  const animates = (index: number) => !reduce && (index !== 1 || centreRises);

  return (
    <div className="relative flex h-full w-full flex-col justify-end">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[14%] left-1/2 h-[95%] w-[95%] rounded-full bg-[radial-gradient(closest-side,rgba(246,214,200,0.5),rgba(205,189,230,0.22)_50%,transparent)]"
        style={{ x: "-50%" }}
        initial={reduce ? false : { opacity: 0, scale: 0.6 }}
        animate={play ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 2, delay, ease: EASE }}
      />

      <div className="relative flex h-[84%] items-end justify-center gap-[3%]">
        {products.map((product, index) => {
          const centre = index === 1;
          return (
            <div key={product.slug} className={clsx("relative h-full overflow-hidden", centre ? "z-10 w-[30%]" : "w-[25%]")}>
              <motion.div
                ref={centre ? centreRef : undefined}
                className={clsx("absolute inset-x-0 bottom-0", centre ? "h-full" : "h-[84%]")}
                style={{ opacity: shown(index) ? 1 : 0 }}
                initial={animates(index) ? { y: "102%" } : false}
                animate={play ? { y: "0%" } : undefined}
                transition={rise(index)}
              >
                <Image
                  src={product.cutout}
                  alt=""
                  fill
                  priority={centre}
                  sizes="(min-width: 1024px) 16vw, 34vw"
                  className="object-contain object-bottom"
                />
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Contact shadows where each pack stands */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-[16%] flex justify-center gap-[3%]">
        {products.map((product, index) => (
          <span key={product.slug} className={clsx("relative h-0", index === 1 ? "w-[30%]" : "w-[25%]")}>
            <motion.span
              className="absolute left-[18%] right-[18%] top-0 h-3 -translate-y-1/2 rounded-[50%] bg-black/55 blur-md"
              initial={reduce ? false : { opacity: 0 }}
              animate={play && shown(index) ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 1, delay: index === 1 ? 0 : delay + 0.8 }}
            />
          </span>
        ))}
      </div>

      <motion.div
        aria-hidden="true"
        className="relative h-px w-full origin-center bg-[linear-gradient(90deg,transparent,#f3c9a6_25%,#f6e3e4_50%,#cdbde6_75%,transparent)]"
        initial={reduce ? false : { scaleX: 0, opacity: 0 }}
        animate={play ? { scaleX: 1, opacity: 1 } : undefined}
        transition={{ duration: 1.3, delay: Math.max(0, delay - 0.2), ease: EASE }}
      >
        <span className="absolute inset-x-[15%] -top-3 h-6 rounded-[50%] bg-champagne/25 blur-xl" />
      </motion.div>

      <div
        aria-hidden="true"
        className="relative flex h-[16%] justify-center gap-[3%] overflow-hidden [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.4),transparent_85%)]"
      >
        {products.map((product, index) => {
          const centre = index === 1;
          return (
            <div key={product.slug} className={clsx("relative h-full", centre ? "w-[30%]" : "w-[25%]")}>
              <motion.div
                className="absolute inset-x-0 top-0"
                style={{ height: centre ? "525%" : "441%", opacity: shown(index) ? 1 : 0 }}
                initial={animates(index) ? { y: "-102%" } : false}
                animate={play ? { y: "0%" } : undefined}
                transition={rise(index)}
              >
                <Image
                  src={product.cutout}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 16vw, 34vw"
                  className="-scale-y-100 object-contain object-bottom opacity-70 blur-[1px]"
                />
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Section 1 — the opening and the hero.
 *
 * Every visit to the homepage opens like a film: letterboxed, a shaft of
 * light with drifting dust and swaying botanical shadows wakes the dark teal
 * stage; PURO is set like a fashion-house mark; a spotlight finds the formula
 * and a scan of light reveals it standing on still water while the camera
 * moves in; caustic water-light, bokeh and passing leaves surround it as the
 * headline is written; then the camera pulls back, the frame opens and the
 * full hero takes over.
 *
 * Navigation stays usable throughout. Skip, scrolling or any key jumps
 * straight to the hero; reduced-motion users get the hero directly.
 * Audio never plays.
 */
export default function CinematicHero({ products }: { products: HeroProduct[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion() ?? false;
  const [phase, setPhase] = useState<Phase>(0);
  const [intro, setIntro] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const [film, setFilm] = useState<typeof WIDE | null>(null);
  const [filmReady, setFilmReady] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const hero = products[1] ?? products[0];
  const productControls = useAnimationControls();
  const anchorRef = useRef<HTMLDivElement>(null);
  const centreRef = useRef<HTMLDivElement>(null);

  /* ---- Play the opening (unless reduced motion), or go straight to the hero ---- */
  useLayoutEffect(() => {
    const play = introShouldPlay() && Boolean(hero);
    setIntro(play);
    if (!play) {
      setPhase(5);
      setHandoff(true);
      return;
    }
    timers.current = [];
    setSkipped(false);
    setHandoff(false);
    setPhase(1);
    const at = (seconds: number, next: Phase) => timers.current.push(setTimeout(() => setPhase(next), seconds * 1000));
    at(T.brand, 2);
    at(T.product, 3);
    at(T.story, 4);
    at(T.world, 5);
    const current = timers.current;
    return () => current.forEach(clearTimeout);
  }, [hero]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;
    setFilm(window.matchMedia("(min-width: 768px)").matches ? WIDE : TALL);
  }, []);

  // Dim the site chrome while the film plays (it stays usable on hover/focus).
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.heroIntro = intro && phase > 0 && phase < 5 ? "on" : "off";
    return () => {
      delete root.dataset.heroIntro;
    };
  }, [intro, phase]);

  /* ---- Skip: button, scroll, swipe or any key ---- */
  const skip = useCallback(() => {
    timers.current.forEach(clearTimeout);
    setSkipped(true);
    setPhase(5);
    setHandoff(true);
  }, []);

  useEffect(() => {
    if (!intro || phase === 5) return;
    const onKey = (event: KeyboardEvent) => {
      if (["Tab", "Shift", "Alt", "Meta", "Control"].includes(event.key)) return;
      skip();
    };
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      window.removeEventListener("keydown", onKey);
    };
  }, [intro, phase, skip]);

  /* ---- The formula's choreography ---- */
  useEffect(() => {
    if (!intro || skipped) return;
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    if (phase === 3) {
      productControls.start({
        opacity: 1,
        y: 0,
        scale: 0.97,
        filter: "brightness(1) contrast(1) saturate(1)",
        transition: { duration: 2.2, ease: SLOW },
      });
    }
    if (phase === 4) {
      // The camera keeps moving in as the composition opens for the headline.
      productControls.start({
        x: wide ? window.innerWidth * 0.17 : 0,
        y: wide ? 0 : -window.innerHeight * 0.1,
        scale: wide ? 1.05 : 0.9,
        transition: { duration: 1.8, ease: CAMERA },
      });
    }
    if (phase === 5) {
      const anchor = anchorRef.current?.getBoundingClientRect();
      const box = centreRef.current?.getBoundingClientRect();
      if (!anchor || !box || box.width === 0) {
        productControls.start({ opacity: 0, transition: { duration: 0.6 } }).then(() => setHandoff(true));
        return;
      }
      const drawnH = Math.min(box.height, box.width / CUTOUT_RATIO);
      productControls
        .start({
          x: box.left + box.width / 2 - (anchor.left + anchor.width / 2),
          y: box.bottom - drawnH / 2 - (anchor.top + anchor.height / 2),
          scale: drawnH / anchor.height,
          transition: { duration: 1.8, ease: CAMERA },
        })
        .then(() => setHandoff(true));
    }
  }, [phase, intro, skipped, productControls]);

  /* ---- Scroll: push the film back, lift the stage ---- */
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const filmScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.18]);
  const filmY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const veil = useTransform(scrollYProgress, [0, 0.8], [0, 0.7]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const stageY = useTransform(scrollYProgress, [0, 1], [0, -180]);

  const world = phase === 5;
  const playing = intro && phase > 0 && phase < 5;
  const fast = skipped || !intro;
  const dur = (seconds: number) => (skipped ? Math.min(seconds, 0.6) : seconds);
  const headlineOn = phase >= 4;
  const reveal = (on: boolean, delay: number, y = 16) => ({
    initial: reduce ? false : { opacity: 0, y },
    animate: on ? { opacity: 1, y: 0 } : { opacity: 0, y },
    transition: { duration: dur(1.1), delay: on ? (fast ? delay * 0.5 : delay) : 0, ease: EASE },
  });
  const line = (delay: number) => ({
    initial: reduce ? false : { y: "110%" },
    animate: { y: headlineOn ? "0%" : "110%" },
    transition: { duration: dur(1.3), delay: headlineOn ? (fast ? delay * 0.4 : 0.35 + delay) : 0, ease: EASE },
  });

  return (
    <section
      ref={ref}
      aria-label="PURO Body & Soul"
      data-phase={phase}
      className="relative isolate h-[calc(100svh-32px)] min-h-[520px] overflow-hidden bg-[#08191b] text-ivory"
    >
      {/* ---- Film, graded to midnight teal (once you enter the world) ---- */}
      <motion.div className="absolute inset-0 -z-30" style={reduce ? undefined : { scale: filmScale, y: filmY }}>
        <motion.div
          className="absolute inset-0 bg-[linear-gradient(115deg,#123236_0%,#1f4a4f_30%,#4f3a55_62%,#9a6070_86%,#c08a78_100%)]"
          initial={false}
          animate={{ opacity: phase >= 5 ? 1 : 0 }}
          transition={{ duration: dur(2.4), ease: "easeOut" }}
        >
          {/* Warm saffron light and a lilac pool, so the hero isn't one colour */}
          <span className="absolute -right-[10%] -top-[20%] h-[70vh] w-[70vh] rounded-full bg-[radial-gradient(circle,rgba(240,190,110,0.45),transparent_65%)] blur-2xl" />
          <span className="absolute bottom-[-20%] left-[35%] h-[60vh] w-[60vh] rounded-full bg-[radial-gradient(circle,rgba(196,176,232,0.35),transparent_65%)] blur-2xl" />
          <div className="absolute inset-0 opacity-[0.5] mix-blend-luminosity">
            <Poster />
            {film && (
              <video
                key={film.src}
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1.6s]"
                style={{ opacity: filmReady ? 1 : 0 }}
                src={film.src}
                poster={film.poster}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
                onCanPlay={() => setFilmReady(true)}
                onError={() => setFilm(null)}
              />
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* ---- 01 · Shafts of light ---- */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 mix-blend-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 0 ? 0 : phase <= 4 ? 1 : 0.4 }}
        transition={{ duration: phase <= 1 ? 2.4 : dur(1.6), ease: "easeInOut" }}
      >
        <motion.div
          className="absolute -left-[25%] -top-[45%] h-[190%] w-[70%] origin-top"
          initial={{ rotate: -36, x: "-6%" }}
          animate={phase >= 3 ? { rotate: -22, x: "44%" } : { rotate: -32, x: "0%" }}
          transition={{ duration: phase >= 3 ? dur(2.4) : 3.2, ease: SLOW }}
        >
          <span className="absolute inset-y-0 left-[30%] w-[22%] bg-[linear-gradient(90deg,transparent,rgba(255,240,214,0.22),transparent)] blur-2xl" />
          <span className="absolute inset-y-0 left-[48%] w-[9%] bg-[linear-gradient(90deg,transparent,rgba(255,246,228,0.3),transparent)] blur-xl" />
          <span className="absolute inset-y-0 left-[60%] w-[16%] bg-[linear-gradient(90deg,transparent,rgba(216,198,160,0.16),transparent)] blur-2xl" />
        </motion.div>
      </motion.div>

      {/* ---- 01 · Dust in the light ---- */}
      <AnimatePresence>
        {playing && phase <= 3 && (
          <motion.div
            key="motes"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.2 } }}
            transition={{ duration: 2.4, delay: 0.4 }}
          >
            {MOTES.map((mote, index) => (
              <span
                key={index}
                className="absolute rounded-full bg-[#fff1d6] blur-[0.6px] motion-safe:animate-[mote_var(--d)_linear_var(--delay)_infinite]"
                style={
                  {
                    left: mote.left,
                    top: mote.top,
                    width: mote.size,
                    height: mote.size,
                    "--d": mote.duration,
                    "--delay": mote.delay,
                    "--dx": mote.dx,
                    "--dy": mote.dy,
                    "--o": mote.opacity,
                  } as React.CSSProperties
                }
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- 01 · Botanical shadows on the wall ---- */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 text-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 0 ? 0 : phase <= 4 ? 0.55 : 0.16 }}
        transition={{ duration: dur(2) }}
      >
        <motion.div
          className="absolute -right-[8%] -top-[12%] w-[54vmax] origin-top-right blur-[9px]"
          initial={{ rotate: 16 }}
          animate={playing ? { rotate: [16, 12.5, 15, 12] } : { rotate: 13 }}
          transition={playing ? { duration: 8.5, ease: "easeInOut" } : { duration: 1.5 }}
        >
          <Frond className="h-auto w-full" />
        </motion.div>
        <motion.div
          className="absolute -bottom-[22%] -left-[6%] w-[34vmax] origin-bottom-left blur-[12px]"
          initial={{ rotate: -24 }}
          animate={playing ? { rotate: [-24, -19, -22, -18] } : { rotate: -19 }}
          transition={playing ? { duration: 8.5, ease: "easeInOut" } : { duration: 1.5 }}
        >
          <Leaf className="h-auto w-full" />
        </motion.div>
      </motion.div>

      {/* ---- Legibility grade (from scene 04) ---- */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(14,39,42,0.85)_0%,rgba(20,44,50,0.45)_40%,rgba(40,30,45,0.05)_72%,rgba(40,30,45,0.15)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(14,39,42,0.25)_0%,rgba(14,39,42,0.1)_40%,rgba(14,39,42,0.88)_100%)]"
        initial={false}
        animate={{ opacity: phase >= 4 ? 1 : 0 }}
        transition={{ duration: dur(1.6) }}
      />
      {/* Vignette, heavier while the film plays */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_45%,rgba(3,12,13,0.85)_100%)]"
        initial={false}
        animate={{ opacity: playing ? 1 : 0.35 }}
        transition={{ duration: dur(1.6) }}
      />
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-midnight-deep" style={reduce ? { opacity: 0 } : { opacity: veil }} />
      <div className="grain pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />

      {/* ================= The opening ================= */}
      {intro && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5]">
          {/* 04 · Caustic water-light on the wall, and bokeh */}
          <motion.div
            className="absolute inset-0 lg:left-[17vw]"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 4 ? 1 : 0 }}
            transition={{ duration: phase === 4 ? 2 : dur(1.2) }}
          >
            <div className="absolute left-1/2 top-1/2 h-[110vh] w-[110vh] -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(closest-side,black_30%,transparent)]">
              <span className="absolute inset-0 bg-[url(/media/texture/caustics.webp)] bg-[length:520px_520px] opacity-[0.3] mix-blend-screen motion-safe:animate-[caustic-a_9s_linear_infinite]" />
              <span className="absolute inset-0 bg-[url(/media/texture/caustics.webp)] bg-[length:760px_760px] opacity-[0.22] mix-blend-screen [filter:sepia(0.6)] motion-safe:animate-[caustic-b_12s_linear_infinite]" />
            </div>
            {BOKEH.map((orb, index) => (
              <motion.span
                key={index}
                className="absolute rounded-full"
                style={{
                  left: orb.left,
                  top: orb.top,
                  width: orb.size,
                  height: orb.size,
                  filter: `blur(${orb.blur}px)`,
                  background: `radial-gradient(circle, rgba(${orb.colour},0.9), rgba(${orb.colour},0.25) 55%, transparent 70%)`,
                }}
                initial={{ opacity: 0, y: 0 }}
                animate={phase >= 4 ? { opacity: orb.opacity, y: orb.y } : undefined}
                transition={{ duration: 4, delay: index * 0.12, ease: "easeOut" }}
              />
            ))}
          </motion.div>

          {/* 02 · The mark */}
          <AnimatePresence>
            {phase >= 1 && phase <= 2 && (
              <motion.div
                key="brand"
                className="absolute inset-0 flex flex-col items-center justify-center px-6"
                exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)", transition: { duration: dur(1.1), ease: EASE } }}
              >
                <motion.div
                  className="relative font-display font-light leading-[0.85]"
                  style={{ fontSize: "clamp(70px, min(14vw, 20vh), 184px)" }}
                  initial={{ letterSpacing: "0.75em", paddingLeft: "0.75em" }}
                  animate={{ letterSpacing: "0.3em", paddingLeft: "0.3em" }}
                  transition={{ duration: 3.4, ease: SLOW }}
                >
                  <span className="flex">
                    {"PURO".split("").map((letter, index) => (
                      <motion.span
                        key={index}
                        className="inline-block"
                        initial={{ opacity: 0, filter: "blur(16px)" }}
                        animate={phase === 1 ? { opacity: 0.18, filter: "blur(10px)" } : { opacity: 1, filter: "blur(0px)" }}
                        transition={{ duration: phase === 1 ? 1.4 : 1.3, delay: phase === 1 ? 0.7 + index * 0.1 : index * 0.09, ease: EASE }}
                      >
                        {letter}
                      </motion.span>
                    ))}
                  </span>
                  {/* A glint of light across the letters */}
                  <motion.span
                    className="pointer-events-none absolute inset-0 flex bg-[linear-gradient(105deg,transparent_38%,rgba(255,246,226,0.9)_50%,transparent_62%)] bg-[length:300%_100%] bg-clip-text text-transparent"
                    style={{ paddingLeft: "inherit" }}
                    initial={{ backgroundPosition: "120% 0", opacity: 0 }}
                    animate={phase === 2 ? { backgroundPosition: "-20% 0", opacity: 1 } : undefined}
                    transition={{ duration: 1.8, delay: 0.6, ease: "easeInOut" }}
                  >
                    {"PURO".split("").map((letter, index) => (
                      <span key={index} className="inline-block">
                        {letter}
                      </span>
                    ))}
                  </motion.span>
                </motion.div>
                <motion.span
                  className="mt-7 block h-px w-[min(360px,60vw)] bg-gradient-to-r from-transparent via-champagne to-transparent"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={phase >= 2 ? { scaleX: 1, opacity: 1 } : undefined}
                  transition={{ duration: 1.4, delay: 0.2, ease: EASE }}
                />
                <motion.span
                  className="mt-6 block text-[11px] font-medium uppercase text-champagne sm:text-[12px]"
                  initial={{ opacity: 0, letterSpacing: "1.2em" }}
                  animate={phase >= 2 ? { opacity: 1, letterSpacing: "0.6em" } : undefined}
                  transition={{ duration: 1.5, delay: 0.3, ease: SLOW }}
                  style={{ marginRight: "-0.6em" }}
                >
                  Body &amp; Soul
                </motion.span>
                <motion.span
                  className="mt-8 block font-display text-[22px] font-light italic text-ivory/80 sm:text-[30px]"
                  initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                  animate={phase >= 2 ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
                  transition={{ duration: 1.2, delay: 0.75, ease: EASE }}
                >
                  The Art of Conscious Skin.
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 03 · The formula, found by light */}
          {hero && !handoff && (
            <>
              <div
                ref={anchorRef}
                className="invisible absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2"
                style={{ height: PRODUCT_H, aspectRatio: `${CUTOUT_RATIO}` }}
              />
              <motion.div
                className="absolute left-1/2 top-[46%] will-change-transform"
                style={{
                  height: PRODUCT_H,
                  aspectRatio: `${CUTOUT_RATIO}`,
                  marginLeft: `calc(${PRODUCT_H} * ${-CUTOUT_RATIO / 2})`,
                  marginTop: `calc(${PRODUCT_H} * -0.5)`,
                }}
                initial={{ opacity: 0, y: 46, scale: 0.9, filter: "brightness(0.02) contrast(1.3) saturate(0.6)" }}
                animate={productControls}
              >
                {/* Spotlight from above */}
                <motion.span
                  className="absolute bottom-[40%] left-1/2 -z-10 h-[160%] w-[440%] -translate-x-1/2 blur-[28px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: phase === 3 || phase === 4 ? 1 : 0 }}
                  transition={{ duration: 1.6, ease: "easeOut" }}
                >
                  <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,240,210,0.02),rgba(255,240,210,0.16)_55%,rgba(255,240,210,0.05))] [clip-path:polygon(43%_0,57%_0,82%_100%,18%_100%)]" />
                </motion.span>
                {/* Halo the pack steps into */}
                <motion.span
                  className="absolute left-1/2 top-1/2 -z-10 h-[115%] w-[330%] rounded-full bg-[radial-gradient(closest-side,rgba(216,198,160,0.38),rgba(216,198,160,0.1)_50%,transparent)]"
                  style={{ x: "-50%", y: "-50%" }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={phase >= 3 ? { opacity: phase === 5 ? 0 : 1, scale: 1 } : undefined}
                  transition={{ duration: 2.4, ease: EASE }}
                />
                {/* Still water beneath */}
                <motion.span
                  className="absolute left-1/2 top-[96%] -z-10 h-[16%] w-[520%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(120,160,160,0.18),rgba(14,39,42,0.55)_60%,transparent)]"
                  style={{ x: "-50%" }}
                  initial={{ opacity: 0, scaleX: 0.4 }}
                  animate={phase >= 3 ? { opacity: phase === 5 ? 0 : 1, scaleX: 1 } : undefined}
                  transition={{ duration: 2, ease: EASE }}
                />

                <Image
                  src={hero.cutout}
                  alt=""
                  fill
                  priority
                  sizes="40vh"
                  className="object-contain object-bottom [filter:drop-shadow(0_0_0.6px_rgba(255,238,206,0.9))_drop-shadow(0_40px_50px_rgba(0,0,0,0.5))]"
                />
                {/* Key light from the window side, shade on the far side: gives the pack form */}
                <span
                  className="absolute inset-0 bg-[linear-gradient(98deg,rgba(255,240,214,0.32)_0%,transparent_38%,transparent_60%,rgba(0,0,0,0.4)_100%)] mix-blend-soft-light"
                  style={silhouette(hero.cutout)}
                />
                {/* Light scans the pack top to bottom, then a final glint */}
                <span className="absolute inset-0 overflow-hidden" style={silhouette(hero.cutout)}>
                  <motion.span
                    className="absolute inset-x-0 -top-1/3 h-1/3 bg-gradient-to-b from-transparent via-white/55 to-transparent mix-blend-soft-light"
                    initial={{ y: "0%" }}
                    animate={phase >= 3 ? { y: "420%" } : undefined}
                    transition={{ duration: 1.8, delay: 0.35, ease: "easeInOut" }}
                  />
                  <motion.span
                    className="absolute inset-y-0 -left-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent mix-blend-soft-light"
                    initial={{ x: "0%" }}
                    animate={phase >= 4 ? { x: "300%" } : undefined}
                    transition={{ duration: 1.6, delay: 1, ease: "easeInOut" }}
                  />
                </span>
                {/* Reflection in the water */}
                <span className="absolute inset-x-0 top-full h-[36%] overflow-hidden opacity-45 [mask-image:linear-gradient(to_bottom,black,transparent)]">
                  <span className="absolute inset-x-0 top-0 h-[278%] -scale-y-100">
                    <Image src={hero.cutout} alt="" fill sizes="40vh" className="object-contain object-bottom blur-[2px]" />
                  </span>
                </span>
                {/* Ripples where it settles */}
                {[0, 0.6, 1.2].map((delay) => (
                  <motion.span
                    key={delay}
                    className="absolute left-1/2 top-full h-[4%] w-[200%] rounded-[50%] border border-champagne/35"
                    style={{ x: "-50%", y: "-50%" }}
                    initial={{ opacity: 0, scale: 0.2 }}
                    animate={phase >= 3 ? { opacity: [0, 0.7, 0], scale: [0.2, 1, 1.7] } : undefined}
                    transition={{ duration: 2.8, delay: 1.1 + delay, ease: "easeOut" }}
                  />
                ))}
              </motion.div>
            </>
          )}

          {/* 04 · Leaves passing close to the camera */}
          <motion.div
            className="absolute -bottom-[18%] -left-[14%] w-[44vmax] text-[#04100f] blur-[16px]"
            initial={{ x: "-40%", rotate: -30, opacity: 0 }}
            animate={phase === 4 ? { x: "0%", rotate: -18, opacity: 0.95 } : phase === 5 ? { x: "-60%", opacity: 0 } : undefined}
            transition={{ duration: phase === 5 ? dur(1.4) : 2.6, ease: SLOW }}
          >
            <Leaf className="h-auto w-full" />
          </motion.div>
          <motion.div
            className="absolute -right-[12%] -top-[16%] w-[50vmax] text-[#04100f] blur-[20px]"
            initial={{ x: "40%", rotate: 150, opacity: 0 }}
            animate={phase === 4 ? { x: "0%", rotate: 160, opacity: 0.9 } : phase === 5 ? { x: "60%", opacity: 0 } : undefined}
            transition={{ duration: phase === 5 ? dur(1.4) : 2.8, ease: SLOW }}
          >
            <Frond className="h-auto w-full" />
          </motion.div>
        </div>
      )}

      {/* ================= 05 · The PURO world ================= */}
      <div className="container-site relative z-[6] flex h-full flex-col pb-14 pt-[88px] sm:pb-20 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10 lg:pb-12 lg:pt-[104px]">
        {products.length === 3 && (
          <motion.div
            aria-hidden="true"
            style={reduce ? undefined : { y: stageY }}
            className="relative order-first mx-auto min-h-0 w-full max-w-[340px] flex-1 lg:order-last lg:mx-0 lg:h-[min(66vh,600px)] lg:max-w-[560px] lg:flex-none lg:justify-self-end [@media(max-height:640px)]:max-lg:hidden"
          >
            {phase !== 0 && (
              <ProductStage
                products={products}
                play={world}
                delay={fast ? 0.15 : 0.6}
                centreVisible={handoff}
                centreRises={!intro}
                reduce={reduce}
                centreRef={centreRef}
              />
            )}
          </motion.div>
        )}

        <motion.div style={reduce ? undefined : { y: copyY, opacity: copyOpacity }} className="relative max-w-[720px] pt-6 lg:pt-0">
          <motion.p className="label text-champagne" {...reveal(world, 0.15, 0)}>
            PURO Body &amp; Soul
          </motion.p>
          <h1
            className="mt-[clamp(12px,2.6vh,28px)] font-display font-light leading-[1] tracking-[-0.01em]"
            style={{ fontSize: "clamp(40px, min(5.5vw, 9vh), 96px)" }}
          >
            <span className="block overflow-hidden whitespace-nowrap pb-[0.08em]">
              <motion.span className="block" {...line(0)}>
                Where nature meets
              </motion.span>
            </span>
            <span className="block overflow-hidden whitespace-nowrap pb-[0.12em]">
              <motion.em className="text-iris-light block pr-[0.1em]" {...line(0.14)}>
                thoughtful care.
              </motion.em>
            </span>
          </h1>
          <motion.p
            className="mt-[clamp(14px,2.6vh,28px)] max-w-[460px] text-[15px] leading-[1.7] text-ivory/80 sm:text-[16px] [@media(max-height:620px)]:hidden"
            {...reveal(world, 0.55)}
          >
            Thoughtfully formulated face, body and hair care — botanical ingredients, considered formulation and a daily
            ritual made with care.
          </motion.p>
          <motion.div className="mt-[clamp(18px,3.4vh,40px)] flex flex-wrap items-center gap-x-8 gap-y-4" {...reveal(world, 0.75)}>
            <Link href="/shop" className="btn-iris px-8 py-3.5 sm:px-10 sm:py-4">
              Explore the collection <ArrowRight size={15} strokeWidth={1.3} />
            </Link>
            <Link href="#finder" className="link-underline text-ivory">
              Find your ritual
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* ---- Letterbox: the frame opens as you enter the world ---- */}
      {intro && (
        <>
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-[8] h-[clamp(34px,9vh,96px)] origin-top bg-[#040d0e]"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: world ? 0 : 1 }}
            transition={{ duration: dur(1.4), ease: CAMERA }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 z-[8] flex h-[clamp(34px,9vh,96px)] origin-bottom items-center justify-between bg-[#040d0e] px-5 sm:px-8 lg:px-12"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: world ? 0 : 1 }}
            transition={{ duration: dur(1.4), ease: CAMERA }}
          >
            <AnimatePresence mode="wait">
              {playing && (
                <motion.span
                  key={phase}
                  aria-hidden="true"
                  className="text-[10px] font-medium uppercase tracking-[0.32em] text-champagne/70"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.6 }}
                >
                  {SCENES[phase]}
                </motion.span>
              )}
            </AnimatePresence>
            {playing && (
              <button
                type="button"
                onClick={skip}
                className="rounded-full border border-ivory/20 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.3em] text-ivory/70 transition hover:border-ivory/60 hover:text-ivory"
              >
                Skip intro
              </button>
            )}
          </motion.div>
        </>
      )}

      {/* Scroll cue (hero) */}
      <motion.a
        href="#atelier"
        aria-label="Scroll to discover"
        className="absolute bottom-6 right-5 z-10 hidden flex-col items-center gap-3 text-[10px] font-medium uppercase tracking-[0.36em] text-ivory/60 transition hover:text-ivory sm:right-8 md:flex lg:right-12 [@media(max-height:700px)]:!hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: world ? 1 : 0 }}
        transition={{ duration: 1, delay: world ? (fast ? 0.8 : 2) : 0 }}
      >
        <span className="[writing-mode:vertical-rl]">Scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-ivory/20">
          <span className="absolute inset-x-0 top-0 h-1/2 bg-champagne motion-safe:animate-[scrollcue_2.2s_cubic-bezier(0.76,0,0.24,1)_infinite]" />
        </span>
      </motion.a>
    </section>
  );
}
