"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { INTRO_DURATION, INTRO_STORAGE_KEY } from "@/lib/intro";

const EASE = [0.76, 0, 0.24, 1] as const;

/**
 * First-visit intro: the Puro wordmark fades up on forest green, then the
 * panel lifts away to reveal the page. Plays once per session; CSS hides it
 * for returning visitors, reduced-motion users and as a failsafe after 7s.
 */
export default function IntroCurtain() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro !== "play") {
      setDone(true);
      return;
    }
    const timer = setTimeout(() => finish(), INTRO_DURATION * 1000);
    return () => clearTimeout(timer);
  }, []);

  function finish() {
    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
    } catch {}
    document.documentElement.dataset.intro = "done";
    setDone(true);
  }

  if (done) return null;

  return (
    <motion.div
      className="intro-curtain fixed inset-0 z-[200] flex flex-col items-center justify-center bg-emerald-deep text-ivory"
      aria-hidden="true"
      initial={{ y: 0 }}
      animate={{ y: "-100%" }}
      transition={{ delay: INTRO_DURATION - 0.75, duration: 0.75, ease: EASE }}
    >
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
        animate={{ opacity: [0, 1, 1, 0], y: [14, 0, 0, -10], filter: ["blur(6px)", "blur(0px)", "blur(0px)", "blur(0px)"] }}
        transition={{ duration: INTRO_DURATION - 0.5, times: [0, 0.4, 0.78, 1], ease: "easeOut" }}
      >
        <span className="font-display text-[56px] leading-none tracking-[0.18em] sm:text-[72px]" style={{ marginRight: "-0.18em" }}>
          PURO
        </span>
        <span className="mt-3 text-[10px] font-medium uppercase tracking-[0.5em] text-ivory/60" style={{ marginRight: "-0.5em" }}>
          Body &amp; Soul
        </span>
      </motion.div>
      <button
        type="button"
        onClick={finish}
        className="absolute bottom-8 right-8 text-[10px] uppercase tracking-[0.3em] text-ivory/50 transition hover:text-ivory"
      >
        Skip
      </button>
    </motion.div>
  );
}
