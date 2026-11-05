"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownAZ,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Check,
  ChevronDown,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type Sort = "featured" | "price-asc" | "price-desc" | "name";

const OPTIONS: { value: Sort; label: string; icon: LucideIcon }[] = [
  { value: "featured", label: "Featured", icon: Sparkles },
  { value: "price-asc", label: "Price: low to high", icon: ArrowUpNarrowWide },
  { value: "price-desc", label: "Price: high to low", icon: ArrowDownWideNarrow },
  { value: "name", label: "Name A–Z", icon: ArrowDownAZ },
];

interface SortMenuProps {
  value: Sort;
  onChange: (value: Sort) => void;
}

/** Styled listbox replacement for a native <select>. */
export default function SortMenu({ value, onChange }: SortMenuProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = OPTIONS.find((option) => option.value === value) ?? OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    setHighlighted(OPTIONS.findIndex((option) => option.value === value));
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open, value]);

  const choose = (index: number) => {
    onChange(OPTIONS[index].value);
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") return setOpen(false);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) return setOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setHighlighted((index) => (index + step + OPTIONS.length) % OPTIONS.length);
    }
    if ((event.key === "Enter" || event.key === " ") && open) {
      event.preventDefault();
      choose(highlighted);
    }
  };

  const CurrentIcon = current.icon;

  return (
    <div ref={root} className="relative" onKeyDown={onKeyDown}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((state) => !state)}
        className={clsx(
          "flex min-w-[230px] items-center gap-3 rounded-full border py-2.5 pl-4 pr-4 text-left text-[12px] uppercase tracking-[0.16em] transition",
          open
            ? "border-gold-soft bg-ivory/10 text-ivory"
            : "border-ivory/25 bg-ivory/[0.06] text-ivory hover:border-gold-soft"
        )}
      >
        <CurrentIcon size={15} strokeWidth={1.25} className="text-gold-soft" />
        <span className="flex-1">{current.label}</span>
        <ChevronDown
          size={15}
          strokeWidth={1.25}
          className={clsx("text-gold-soft transition-transform duration-300", open && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            role="listbox"
            aria-label="Sort products"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 z-30 mt-2 w-[260px] origin-top-right overflow-hidden rounded-2xl border border-gold/30 bg-emerald-deep p-2 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.6)]"
          >
            <li className="px-3 pb-2 pt-1.5 text-[10px] uppercase tracking-[0.28em] text-gold-soft/80">
              Sort by
            </li>
            {OPTIONS.map((option, index) => {
              const selected = option.value === value;
              const Icon = option.icon;
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={selected}
                  onPointerEnter={() => setHighlighted(index)}
                  onClick={() => choose(index)}
                  className={clsx(
                    "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition",
                    selected ? "text-gold-soft" : "text-ivory/85",
                    highlighted === index && "bg-ivory/[0.08] text-ivory"
                  )}
                >
                  <span
                    className={clsx(
                      "flex h-8 w-8 items-center justify-center rounded-full border",
                      selected ? "border-gold-soft/60 bg-gold-soft/10" : "border-ivory/15"
                    )}
                  >
                    <Icon size={14} strokeWidth={1.25} />
                  </span>
                  <span className="flex-1">{option.label}</span>
                  {selected && <Check size={15} strokeWidth={1.5} className="text-gold-soft" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
