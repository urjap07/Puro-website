"use client";

import { ArrowUp } from "lucide-react";
import { smoothScrollTo } from "./SmoothScroll";

export default function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => smoothScrollTo(0)}
      className="group flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.2em] text-ivory/70 transition hover:text-ivory"
    >
      Back to top
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/25 transition duration-300 group-hover:-translate-y-1 group-hover:border-ivory group-hover:bg-ivory group-hover:text-ink">
        <ArrowUp size={15} strokeWidth={1.3} />
      </span>
    </button>
  );
}
