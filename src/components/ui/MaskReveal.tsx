"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface MaskRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Text rises into view from behind a mask as it scrolls into the viewport.
 * The visible wrapper is what's observed — the hidden line itself is clipped,
 * so watching it directly would never fire.
 */
export default function MaskReveal({ children, delay = 0, className }: MaskRevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      className={`block overflow-hidden pb-[0.1em] ${className ?? ""}`}
      initial={reduceMotion ? false : "hidden"}
      whileInView="shown"
      viewport={{ once: true, margin: "-40px" }}
    >
      <motion.span
        className="block"
        variants={{ hidden: { y: "105%" }, shown: { y: 0 } }}
        transition={{ duration: 1.15, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}
