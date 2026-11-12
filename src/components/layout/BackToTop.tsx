"use client";

import { ArrowUp } from "lucide-react";
import { smoothScrollTo } from "./SmoothScroll";

export default function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => smoothScrollTo(0)}
      className="group flex items-center gap-3 rounded-full text-[12px] font-medium uppercase tracking-[0.2em] text-midnight transition hover:text-lilac-deep"
    >
      Back to top
      <span className="btn-glass h-10 w-10 !p-0 group-hover:-translate-y-1">
        <ArrowUp size={15} strokeWidth={1.3} />
      </span>
    </button>
  );
}
