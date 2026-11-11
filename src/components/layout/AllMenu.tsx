"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, HeartHandshake, X } from "lucide-react";
import type { Concern } from "@/db/queries/products";
import { COLLECTIONS } from "@/lib/collections";
import { SITE } from "@/lib/site";

const EASE = [0.22, 1, 0.36, 1] as const;

const EXPLORE = [
  { label: "Bestsellers", href: "/search?sort=bestsellers" },
  { label: "Top rated", href: "/search?sort=rating" },
  { label: "Under ₹500", href: "/search?price=0-500" },
  { label: "Gift sets", href: "/collections/gifting" },
];

const PURO_WORLD = [
  { label: "The Puro ritual", href: "/#ritual" },
  { label: "Ingredients", href: "/#ingredients" },
  { label: "Good to know", href: "/#why-puro" },
];

/** Left-hand "All" menu: departments, concerns and the Puro world. */
export default function AllMenu({ open, onClose, concerns }: { open: boolean; onClose: () => void; concerns: Concern[] }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    window.__lenis?.stop();
    return () => {
      document.removeEventListener("keydown", onKey);
      window.__lenis?.start();
    };
  }, [open, onClose]);

  const heading = "px-6 pb-2 pt-6 text-[12px] font-semibold uppercase tracking-[0.2em] text-gold-deep";
  const row = "flex items-center justify-between px-6 py-2.5 text-[15px] text-ink transition hover:bg-mist-deep";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[95] bg-ink/55 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.nav
            aria-label="All departments"
            data-lenis-prevent
            className="fixed inset-y-0 left-0 z-[96] flex w-[min(380px,88vw)] flex-col overflow-y-auto bg-ivory"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div className="bg-noir flex items-center justify-between px-6 py-5 text-ivory">
              <span className="font-display text-[26px]">Hello, beautiful</span>
              <button type="button" onClick={onClose} aria-label="Close menu" className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/25 hover:bg-ivory hover:text-ink">
                <X size={18} strokeWidth={1.2} />
              </button>
            </div>

            <p className={heading}>Shop by department</p>
            {COLLECTIONS.map((collection) => (
              <Link key={collection.slug} href={`/collections/${collection.slug}`} onClick={onClose} className={row}>
                <span className="flex items-center gap-3">
                  <span className="relative h-9 w-9 overflow-hidden rounded-full">
                    <Image src={collection.image} alt="" fill sizes="36px" className="object-cover" />
                  </span>
                  {collection.title}
                </span>
                <ChevronRight size={16} strokeWidth={1.3} className="text-stone" />
              </Link>
            ))}

            <div className="mx-6 mt-4 h-px bg-ink/10" />
            <p className={heading}>Explore</p>
            {EXPLORE.map((item) => (
              <Link key={item.href} href={item.href} onClick={onClose} className={row}>
                {item.label}
                <ChevronRight size={16} strokeWidth={1.3} className="text-stone" />
              </Link>
            ))}

            {(["skin", "hair"] as const).map((type) => (
              <div key={type}>
                <div className="mx-6 mt-4 h-px bg-ink/10" />
                <p className={heading}>{type === "skin" ? "Skin concerns" : "Hair concerns"}</p>
                <div className="flex flex-wrap gap-2 px-6 pb-2">
                  {concerns
                    .filter((concern) => concern.type === type)
                    .map((concern) => (
                      <Link
                        key={concern.slug}
                        href={`/concerns/${concern.slug}`}
                        onClick={onClose}
                        className="rounded-full border border-emerald/20 px-3.5 py-1.5 text-[13px] text-emerald hover:bg-emerald hover:text-ivory"
                      >
                        {concern.name}
                      </Link>
                    ))}
                </div>
              </div>
            ))}

            <div className="mx-6 mt-4 h-px bg-ink/10" />
            <p className={heading}>The Puro world</p>
            <Link href="/our-story" onClick={onClose} className={`${row} font-medium text-emerald`}>
              <span className="flex items-center gap-2">
                <HeartHandshake size={17} strokeWidth={1.3} /> Our story &amp; Sa-Ni-Sa
              </span>
              <ChevronRight size={16} strokeWidth={1.3} className="text-stone" />
            </Link>
            {PURO_WORLD.map((item) => (
              <Link key={item.href} href={item.href} onClick={onClose} className={row}>
                {item.label}
                <ChevronRight size={16} strokeWidth={1.3} className="text-stone" />
              </Link>
            ))}

            <div className="mt-auto border-t border-ink/10 px-6 py-5 text-[13px] text-stone">
              Need help? <a href={`mailto:${SITE.email}`} className="text-emerald underline-offset-2 hover:underline">{SITE.email}</a>
              <br />
              <a href={SITE.phoneHref} className="text-emerald underline-offset-2 hover:underline">{SITE.phone}</a>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
