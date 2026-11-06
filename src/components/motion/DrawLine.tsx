"use client";

import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";

/** A hairline that draws itself from the left when it scrolls into view. */
export default function DrawLine({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.span
      aria-hidden="true"
      className={clsx("block h-px origin-left bg-current", className)}
      initial={reduceMotion ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 1.4, delay: 0.15, ease: [0.77, 0, 0.18, 1] }}
    />
  );
}
