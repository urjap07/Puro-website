"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Plus } from "lucide-react";

export interface KnowledgeItem {
  title: string;
  content: string;
  image: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** Numbered questions beside a large photograph that changes with the open answer. */
export default function KnowledgeSplit({ items }: { items: KnowledgeItem[] }) {
  const [open, setOpen] = useState(0);
  const shown = items[open] ?? items[0];

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
      <div className="relative hidden aspect-[4/5] overflow-hidden rounded-[24px] bg-sand lg:block">
        <AnimatePresence initial={false}>
          <motion.div
            key={shown.image}
            className="absolute inset-0"
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            animate={{ clipPath: "inset(0% 0 0 0)" }}
            exit={{ opacity: 0, transition: { delay: 0.6, duration: 0.2 } }}
            transition={{ duration: 1, ease: [0.77, 0, 0.18, 1] }}
          >
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.6, ease: EASE }}
            >
              <Image src={shown.image} alt="" fill sizes="45vw" className="object-cover" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
        <span className="absolute bottom-6 left-6 z-10 font-display text-[120px] leading-none text-ivory drop-shadow-[0_4px_30px_rgba(0,0,0,0.35)]">
          {String(open + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="border-t border-ink/15">
        {items.map((item, index) => {
          const isOpen = open === index;
          return (
            <div key={item.title} className="border-b border-ink/15">
              <button
                type="button"
                onClick={() => setOpen(index)}
                aria-expanded={isOpen}
                className="group flex w-full items-baseline gap-6 py-7 text-left"
              >
                <span className="w-8 text-[12px] font-medium tabular-nums text-stone">{String(index + 1).padStart(2, "0")}</span>
                <span
                  className={clsx(
                    "flex-1 font-display text-[28px] leading-[1.1] transition-colors duration-500 sm:text-[36px]",
                    isOpen ? "text-emerald" : "text-ink/45 group-hover:text-ink",
                  )}
                >
                  {item.title}
                </span>
                <Plus
                  size={20}
                  strokeWidth={1}
                  className={clsx("shrink-0 self-center transition-transform duration-500", isOpen && "rotate-45")}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <div className="pb-8 pl-14">
                      <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-[16px] lg:hidden">
                        <Image src={item.image} alt="" fill sizes="100vw" className="object-cover" />
                      </div>
                      <p className="max-w-[520px] text-[16px] leading-[1.9] text-stone">{item.content}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
