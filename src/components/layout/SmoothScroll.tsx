"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/** Gentle inertial scrolling across the site (skipped for reduced-motion users). */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.15, anchors: { offset: -90 }, autoRaf: true });
    return () => lenis.destroy();
  }, []);

  return null;
}
