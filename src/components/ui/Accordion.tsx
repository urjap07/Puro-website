"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

export interface AccordionItem {
  title: string;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: number | null;
  titleClassName?: string;
}

export default function Accordion({
  items,
  defaultOpen = 0,
  titleClassName = "font-display text-[21px] text-emerald",
}: AccordionProps) {
  const [open, setOpen] = useState<number | null>(defaultOpen);

  return (
    <div className="space-y-2.5">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div key={item.title} className="glass rounded-[24px]">
            <button
              type="button"
              className="relative z-[2] flex w-full items-center justify-between gap-6 rounded-[24px] px-5 py-4 text-left sm:px-6"
              onClick={() => setOpen(isOpen ? null : index)}
              aria-expanded={isOpen}
            >
              <span className={titleClassName}>{item.title}</span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/60 text-champagne-deep shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_0_0_1px_rgba(255,255,255,0.6),0_6px_14px_-10px_rgba(14,39,42,0.5)]">
                {isOpen ? (
                  <Minus size={16} strokeWidth={1.25} />
                ) : (
                  <Plus size={16} strokeWidth={1.25} />
                )}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-6 pr-8 text-[14px] leading-[1.9] text-stone sm:px-6 sm:pr-12">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
