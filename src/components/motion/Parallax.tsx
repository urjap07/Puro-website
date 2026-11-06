"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import clsx from "clsx";

/**
 * Image layer that drifts more slowly than the page. Place inside a
 * positioned, overflow-hidden parent; the layer is oversized to hide edges.
 */
export default function Parallax({
  children,
  className,
  strength = 12,
}: {
  children: ReactNode;
  className?: string;
  /** Travel as a percentage of the layer height. */
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);

  return (
    <div ref={ref} className={clsx("absolute inset-0 overflow-hidden", className)}>
      <motion.div
        className="absolute inset-x-0"
        style={{
          top: `-${strength}%`,
          bottom: `-${strength}%`,
          y: reduceMotion ? 0 : y,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
