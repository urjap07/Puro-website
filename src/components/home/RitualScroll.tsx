"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useInView } from "framer-motion";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";

export interface RitualStep {
  step: string;
  note: string;
  product: { name: string; slug: string; image: string; mood: string };
}

function Step({ item, index, onActive }: { item: RitualStep; index: number; onActive: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);

  return (
    <div ref={ref} className="flex flex-col justify-center py-10 lg:min-h-[78svh] lg:py-0">
      {/* Phones: the image travels with its step */}
      <div className="relative mb-8 aspect-[4/5] overflow-hidden rounded-[20px] bg-parchment lg:hidden">
        <Image src={item.product.mood} alt={item.product.name} fill sizes="100vw" className="object-cover" />
      </div>
      <p className="font-display text-[22px] italic text-gold-soft">Step {String(index + 1).padStart(2, "0")}</p>
      <h3 className="mt-3 font-display text-[54px] leading-none sm:text-[72px]">{item.step}</h3>
      <p className="mt-6 max-w-[420px] text-[17px] leading-[1.85] text-ivory/75">{item.note}</p>
      <Link
        href={`/products/${item.product.slug}`}
        className="group mt-8 flex max-w-[420px] items-center gap-5 border-t border-ivory/15 pt-6"
      >
        <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-ivory">
          <Image src={item.product.image} alt="" fill sizes="56px" className="object-cover mix-blend-multiply" />
        </span>
        <span className="flex-1">
          <span className="block text-[10px] uppercase tracking-[0.24em] text-ivory/50">Use</span>
          <span className="mt-1 block font-display text-[22px] leading-tight">{item.product.name}</span>
        </span>
        <ArrowRight size={18} strokeWidth={1.1} className="text-ivory/60 transition group-hover:translate-x-1 group-hover:text-ivory" />
      </Link>
    </div>
  );
}

/** The four-step ritual: the image panel stays put while the steps scroll past it. */
export default function RitualScroll({ steps }: { steps: RitualStep[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
      <div className="hidden lg:block">
        <div className="sticky top-[11svh] h-[78svh] overflow-hidden rounded-[24px] bg-emerald-soft">
          <AnimatePresence initial={false}>
            <motion.div
              key={active}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={steps[active].product.mood}
                alt={steps[active].product.name}
                fill
                sizes="50vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-ink/60 to-transparent p-8 text-ivory">
            <span className="font-display text-[26px]">{steps[active].step}</span>
            <span className="flex gap-2">
              {steps.map((s, i) => (
                <span key={s.step} className={clsx("h-px w-8 transition-colors duration-500", i === active ? "bg-ivory" : "bg-ivory/30")} />
              ))}
            </span>
          </div>
        </div>
      </div>
      <div>
        {steps.map((item, index) => (
          <Step key={item.step} item={item} index={index} onActive={setActive} />
        ))}
      </div>
    </div>
  );
}
