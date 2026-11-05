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
    <div className="border-t border-line">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div key={item.title} className="border-b border-line">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-6 py-5 text-left"
              onClick={() => setOpen(isOpen ? null : index)}
              aria-expanded={isOpen}
            >
              <span className={titleClassName}>{item.title}</span>
              <span className="shrink-0 text-gold">
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
                  <div className="pb-6 pr-8 text-[14px] leading-[1.9] text-stone">
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
