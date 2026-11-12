"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Heart, HeartHandshake, UserRound, X } from "lucide-react";
import type { Concern } from "@/db/queries/products";
import { COLLECTIONS } from "@/lib/collections";
import { SITE } from "@/lib/site";

const EASE = [0.22, 1, 0.36, 1] as const;

const EXPLORE = [
  { label: "All products", href: "/shop" },
  { label: "Bestsellers", href: "/search?sort=bestsellers" },
  { label: "New arrivals", href: "/search?sort=newest" },
  { label: "Under ₹500", href: "/search?price=0-500" },
];

const PURO_WORLD = [
  { label: "Ingredients", href: "/#ingredients" },
  { label: "Skincare finder", href: "/#finder" },
  { label: "Journal", href: "/#journal" },
];

/** Mobile navigation drawer: shop, concerns and the PURO world. */
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

  const heading = "px-3 pb-2 pt-6 text-[11px] font-medium uppercase tracking-[0.26em] text-champagne-deep";
  const row = "flex items-center justify-between rounded-[18px] px-3 py-2.5 text-[15px] text-ink transition hover:bg-white/60 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_18px_-14px_rgba(14,39,42,0.45)]";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[95] bg-[radial-gradient(90%_70%_at_0%_50%,rgba(14,39,42,0.5),rgba(14,39,42,0.28))] backdrop-blur-[6px] backdrop-saturate-150" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.nav
            aria-label="All departments"
            className="glass-strong !fixed inset-y-2 left-2 z-[96] flex w-[min(380px,calc(100vw-40px))] flex-col overflow-hidden rounded-[30px] sm:inset-y-3 sm:left-3"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/70 px-6 py-4">
              <span className="leading-none">
                <span className="block font-display text-[26px] font-medium tracking-[0.3em] text-midnight">PURO</span>
                <span className="mt-1 block text-[8px] font-medium uppercase tracking-[0.5em] text-champagne-deep">Body &amp; Soul</span>
              </span>
              <button type="button" onClick={onClose} aria-label="Close menu" className="btn-glass h-11 w-11 !p-0">
                <X size={18} strokeWidth={1.3} />
              </button>
            </div>

            <div data-lenis-prevent className="flex flex-1 flex-col overflow-y-auto px-3 pb-3">
              <p className={heading}>Shop</p>
              {COLLECTIONS.map((collection) => (
                <Link key={collection.slug} href={`/collections/${collection.slug}`} onClick={onClose} className={row}>
                  <span className="flex items-center gap-3">
                    <span className="relative h-10 w-10 overflow-hidden rounded-full shadow-[0_0_0_2px_rgba(255,255,255,0.8),0_6px_14px_-8px_rgba(14,39,42,0.5)]">
                      <Image src={collection.image} alt="" fill sizes="36px" className="object-cover" />
                    </span>
                    {collection.title}
                  </span>
                  <ChevronRight size={16} strokeWidth={1.3} className="text-stone" />
                </Link>
              ))}

              <div className="mx-3 mt-4 h-px bg-gradient-to-r from-transparent via-midnight/15 to-transparent" />
              <p className={heading}>Edits</p>
              {EXPLORE.map((item) => (
                <Link key={item.href} href={item.href} onClick={onClose} className={row}>
                  {item.label}
                  <ChevronRight size={16} strokeWidth={1.3} className="text-stone" />
                </Link>
              ))}

              {(["skin", "hair"] as const).map((type) => (
                <div key={type}>
                  <div className="mx-3 mt-4 h-px bg-gradient-to-r from-transparent via-midnight/15 to-transparent" />
                  <p className={heading}>{type === "skin" ? "Skin concerns" : "Hair concerns"}</p>
                  <div className="flex flex-wrap gap-2 px-3 pb-2">
                    {concerns
                      .filter((concern) => concern.type === type)
                      .map((concern) => (
                        <Link
                          key={concern.slug}
                          href={`/concerns/${concern.slug}`}
                          onClick={onClose}
                          className={`glass glass-hover rounded-full px-3.5 py-1.5 text-[13px] text-plum transition ${type === "skin" ? "tint-quartz" : "tint-lilac"}`}
                        >
                          {concern.name}
                        </Link>
                      ))}
                  </div>
                </div>
              ))}

              <div className="mx-3 mt-4 h-px bg-gradient-to-r from-transparent via-midnight/15 to-transparent" />
              <p className={heading}>Your PURO</p>
              <Link href="/account" onClick={onClose} className={row}>
                <span className="flex items-center gap-2">
                  <UserRound size={17} strokeWidth={1.3} className="text-aqua-deep" /> Your account
                </span>
                <ChevronRight size={16} strokeWidth={1.3} className="text-stone" />
              </Link>
              <Link href="/wishlist" onClick={onClose} className={row}>
                <span className="flex items-center gap-2">
                  <Heart size={17} strokeWidth={1.3} className="text-quartz-deep" /> Wishlist
                </span>
                <ChevronRight size={16} strokeWidth={1.3} className="text-stone" />
              </Link>

              <div className="mx-6 mt-4 h-px bg-ink/10" />
              <p className={heading}>The PURO world</p>
              <Link href="/our-story" onClick={onClose} className={`${row} font-medium !text-midnight`}>
                <span className="flex items-center gap-2">
                  <HeartHandshake size={17} strokeWidth={1.3} className="text-quartz-deep" /> Our philosophy
                </span>
                <ChevronRight size={16} strokeWidth={1.3} className="text-stone" />
              </Link>
              {PURO_WORLD.map((item) => (
                <Link key={item.href} href={item.href} onClick={onClose} className={row}>
                  {item.label}
                  <ChevronRight size={16} strokeWidth={1.3} className="text-stone" />
                </Link>
              ))}

              <div className="mt-auto pt-6">
                <div className="glass tint-aqua rounded-[22px] px-5 py-4 text-[13px] text-graphite">
                  Need help? <a href={`mailto:${SITE.email}`} className="text-midnight underline-offset-2 hover:underline">{SITE.email}</a>
                  <br />
                  <a href={SITE.phoneHref} className="text-midnight underline-offset-2 hover:underline">{SITE.phone}</a>
                </div>
              </div>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
