"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import clsx from "clsx";

/**
 * An oversized italic word set faintly behind a section, drifting sideways
 * as the page scrolls. Purely decorative.
 */
export default function GhostWord({
  word,
  className,
  direction = 1,
  light = false,
}: {
  word: string;
  className?: string;
  direction?: 1 | -1;
  light?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], direction > 0 ? ["8%", "-18%"] : ["-18%", "8%"]);

  return (
    <div ref={ref} aria-hidden="true" className={clsx("pointer-events-none absolute inset-x-0 -z-10 overflow-hidden", className)}>
      <motion.p
        style={reduceMotion ? undefined : { x }}
        className={clsx(
          "whitespace-nowrap font-display text-[26vw] italic leading-none tracking-[-0.03em] lg:text-[20vw]",
          light ? "text-ivory/[0.05]" : "text-emerald/[0.05]",
        )}
      >
        {word}
      </motion.p>
    </div>
  );
}
