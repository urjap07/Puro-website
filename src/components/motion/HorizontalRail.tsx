"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Desktop: the section pins and its row of items glides sideways as you scroll
 * down. Phones, tablets and reduced motion: an ordinary swipeable row.
 */
export default function HorizontalRail({ header, children }: { header: ReactNode; children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [pinned, setPinned] = useState(false);
  const [distance, setDistance] = useState(0);

  useIsoLayoutEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const measure = () => {
      const on = query.matches && !reduceMotion;
      setPinned(on);
      if (track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (track.current) observer.observe(track.current);
    query.addEventListener("change", measure);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      query.removeEventListener("change", measure);
      window.removeEventListener("resize", measure);
    };
  }, [reduceMotion]);

  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={outer} className="relative" style={pinned ? { height: `calc(100svh + ${distance}px)` } : undefined}>
      <div className={pinned ? "sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden" : ""}>
        <div className="container-site">{header}</div>
        <motion.div
          ref={track}
          style={pinned ? { x } : undefined}
          className={
            pinned
              ? "mt-12 flex w-max gap-7 px-12 2xl:px-[max(3rem,calc((100vw-1440px)/2+3rem))]"
              : "no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 sm:gap-6 sm:scroll-px-8 sm:px-8"
          }
          data-lenis-prevent-wheel={pinned ? undefined : true}
        >
          {children}
        </motion.div>
        {pinned && (
          <div className="container-site mt-10">
            <div className="h-px w-full bg-line">
              <motion.div className="h-px bg-emerald" style={{ width: bar }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
