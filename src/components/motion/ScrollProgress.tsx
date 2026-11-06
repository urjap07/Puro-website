"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUp } from "lucide-react";

const R = 24;
const C = 2 * Math.PI * R;

/** Gold ring in the corner that fills as you read; tap it to glide back to the top. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const offset = useTransform(progress, [0, 1], [C, 0]);
  const percent = useTransform(progress, (v) => `${Math.round(v * 100)}`);
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState("0");

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const unsub = percent.on("change", setLabel);
    return () => {
      window.removeEventListener("scroll", onScroll);
      unsub();
    };
  }, [percent]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="group fixed bottom-5 right-5 z-[80] flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#0d1c17]/85 text-ivory shadow-[0_20px_40px_-18px_rgba(0,0,0,0.6)] backdrop-blur-md sm:bottom-7 sm:right-7"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <svg viewBox="0 0 60 60" className="absolute inset-0 -rotate-90">
            <defs>
              <linearGradient id="progress-gold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#E9D7AE" />
                <stop offset="50%" stopColor="#C9A365" />
                <stop offset="100%" stopColor="#F1E2BD" />
              </linearGradient>
            </defs>
            <circle cx="30" cy="30" r={R} fill="none" stroke="rgba(251,249,245,0.14)" strokeWidth="1.5" />
            <motion.circle
              cx="30"
              cy="30"
              r={R}
              fill="none"
              stroke="url(#progress-gold)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={C}
              style={{ strokeDashoffset: offset }}
            />
          </svg>
          <span className="relative block h-5 overflow-hidden text-center">
            <span className="block text-[11px] font-semibold tabular-nums transition-transform duration-500 group-hover:-translate-y-full">
              {label}%
            </span>
            <ArrowUp
              size={16}
              strokeWidth={1.5}
              className="absolute inset-x-0 top-full mx-auto transition-transform duration-500 group-hover:-translate-y-[calc(100%+2px)]"
            />
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
