"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import clsx from "clsx";

/** A small photograph floating beside text, drifting at its own speed as you scroll. */
export default function FloatImage({
  src,
  className,
  speed = 120,
  rotate = 0,
}: {
  src: string;
  className?: string;
  /** Pixels of drift across the section's journey through the viewport. */
  speed?: number;
  rotate?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  const r = useTransform(scrollYProgress, [0, 1], [rotate, -rotate]);

  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      style={reduceMotion ? { rotate } : { y, rotate: r }}
      className={clsx(
        "pointer-events-none absolute overflow-hidden rounded-[18px] shadow-[0_40px_80px_-35px_rgba(20,38,30,0.55)]",
        className,
      )}
    >
      <Image src={src} alt="" fill sizes="260px" className="object-cover" />
    </motion.div>
  );
}
