"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";

interface ImageRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Direction the image is uncovered towards. */
  from?: "bottom" | "left";
}

/** Uncovers its image with a clean wipe (and a slight settle) as it enters view. */
export default function ImageReveal({ children, className, delay = 0, from = "bottom" }: ImageRevealProps) {
  const reduceMotion = useReducedMotion();
  const hidden = from === "left" ? "inset(0 100% 0 0)" : "inset(100% 0 0 0)";

  return (
    <motion.div
      className={clsx("relative overflow-hidden", className)}
      initial={reduceMotion ? false : { clipPath: hidden }}
      whileInView={{ clipPath: "inset(0 0% 0 0)" }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1.3, delay, ease: [0.77, 0, 0.18, 1] }}
    >
      <motion.div
        className="absolute inset-0"
        initial={reduceMotion ? false : { scale: 1.18 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1.8, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
