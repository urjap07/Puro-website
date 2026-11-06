"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { RotateCw } from "lucide-react";
import type { Ingredient } from "@/db/queries/products";

/**
 * Specimen cards: the photograph on the front, its story on the back.
 * Hover (or tap) turns the card over in 3D.
 */
export default function IngredientCards({ ingredients }: { ingredients: Ingredient[] }) {
  const [flipped, setFlipped] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
      {ingredients.map((ingredient, index) => {
        const isFlipped = flipped === index;
        return (
          <motion.button
            key={ingredient.id}
            type="button"
            aria-pressed={isFlipped}
            aria-label={`${ingredient.name}: ${ingredient.benefits ?? ""}`}
            onClick={() => setFlipped(isFlipped ? null : index)}
            onMouseEnter={() => setFlipped(index)}
            onMouseLeave={() => setFlipped(null)}
            className={clsx("group relative aspect-[3/4] text-left [perspective:1600px]", index % 3 === 1 && "lg:translate-y-16")}
            initial={reduceMotion ? false : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 1, delay: (index % 3) * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className={clsx(
                "absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d]",
                isFlipped && "[transform:rotateY(180deg)]",
              )}
            >
              {/* Front */}
              <span className="absolute inset-0 overflow-hidden rounded-[22px] bg-parchment [backface-visibility:hidden]">
                {ingredient.imageUrl && (
                  <Image src={ingredient.imageUrl} alt="" fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover" />
                )}
                <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/5 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-ivory/90 px-3 py-1 text-[12px] font-medium tabular-nums text-ink backdrop-blur sm:left-5 sm:top-5">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-ivory sm:inset-x-6 sm:bottom-6">
                  <span className="font-display text-[26px] leading-[1.02] sm:text-[38px]">{ingredient.name}</span>
                  <RotateCw size={18} strokeWidth={1.1} className="mb-1 shrink-0 opacity-70" />
                </span>
              </span>

              {/* Back */}
              <span className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[22px] bg-emerald p-5 text-ivory [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-8">
                <span className="text-[12px] font-medium uppercase tracking-[0.22em] text-gold-soft">
                  No. {String(index + 1).padStart(2, "0")} · From the earth
                </span>
                <span>
                  <span className="block font-display text-[28px] italic leading-none sm:text-[44px]">{ingredient.name}</span>
                  <span className="mt-4 block text-[14px] leading-[1.7] text-ivory/80 sm:text-[17px]">{ingredient.benefits}</span>
                </span>
                <span className="relative mx-auto block h-16 w-16 overflow-hidden rounded-full ring-1 ring-ivory/30 sm:h-20 sm:w-20">
                  {ingredient.imageUrl && <Image src={ingredient.imageUrl} alt="" fill sizes="80px" className="object-cover" />}
                </span>
              </span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
