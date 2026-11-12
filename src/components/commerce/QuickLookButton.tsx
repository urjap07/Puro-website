"use client";

import clsx from "clsx";
import { Eye } from "lucide-react";
import type { Product } from "@/db/queries/products";
import { useQuickLook } from "@/lib/quicklook-store";

/** "Quick look" pill shown over a card image on hover (always visible on touch screens). */
export default function QuickLookButton({ product, group, className }: { product: Product; group?: Product[]; className?: string }) {
  const open = useQuickLook((state) => state.open);
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        open(group ?? [product], product);
      }}
      aria-label={`Quick look at ${product.name}`}
      className={clsx(
        "glass absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-white/50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-midnight transition duration-300 hover:bg-white/80",
        "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100",
        className,
      )}
    >
      <Eye size={14} strokeWidth={1.6} /> Quick look
    </button>
  );
}
