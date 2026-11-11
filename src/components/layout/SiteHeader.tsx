"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { motion, useAnimationControls } from "framer-motion";
import { useFlights } from "@/lib/flight-store";
import { Heart, HeartHandshake, Menu, ShoppingBag } from "lucide-react";
import { cartCount, cartSubtotal, useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { formatPrice } from "@/lib/format";
import type { Concern } from "@/db/queries/products";
import HeaderSearch from "./HeaderSearch";
import DeliverTo from "./DeliverTo";
import AllMenu from "./AllMenu";

const QUICK_LINKS = [
  { label: "Bestsellers", href: "/search?sort=bestsellers" },
  { label: "Face", href: "/collections/face" },
  { label: "Body", href: "/collections/body" },
  { label: "Hair", href: "/collections/hair" },
  { label: "Gift sets", href: "/collections/gifting" },
  { label: "Under ₹500", href: "/search?price=0-500" },
  { label: "Top rated", href: "/search?sort=rating" },
];

const ANNOUNCEMENTS = [
  "Free delivery on orders over ₹500",
  "Maharashtra in 4–7 days · rest of India in 7–10",
  "We ship worldwide in 12–14 days",
  "Cruelty-free · PETA certified",
  "Every purchase empowers a woman",
  "Dermatologically tested",
];

export function Wordmark() {
  return (
    <span className="block leading-none">
      <span className="block font-display text-[28px] tracking-[0.18em] text-ivory sm:text-[32px]" style={{ marginRight: "-0.18em" }}>
        PURO
      </span>
      <span className="mt-1 block text-[8px] font-semibold uppercase tracking-[0.42em] text-gold-soft">Body &amp; Soul</span>
    </span>
  );
}

/** Two-row marketplace header: search-led top bar and a department strip. */
export default function SiteHeader({ concerns = [] }: { concerns?: Concern[] }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const items = useCart((state) => state.items);
  const openBag = useCart((state) => state.open);
  const count = cartCount(items);
  const subtotal = cartSubtotal(items);
  const savedCount = useWishlist((state) => state.items.length);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const landed = useFlights((state) => state.landed);
  const bagControls = useAnimationControls();
  useEffect(() => {
    if (landed) bagControls.start({ scale: [1, 1.18, 0.94, 1], rotate: [0, -6, 4, 0], transition: { duration: 0.5 } });
  }, [landed, bagControls]);

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const iconLink = "relative flex items-center gap-2.5 rounded-full px-3 py-2 text-ivory transition hover:bg-ivory/[0.07] hover:text-gold-soft";

  return (
    <>
      {/* Ribbon */}
      <div className="relative overflow-hidden bg-[#052530] py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-gold-soft/80">
        <div className="flex w-max animate-marquee-slow motion-reduce:animate-none">
          {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((text, index) => (
            <span key={index} aria-hidden={index >= ANNOUNCEMENTS.length} className="flex items-center whitespace-nowrap px-8">
              {text}
              <span className="ml-16 h-1 w-1 rounded-full bg-gold/70" />
            </span>
          ))}
        </div>
      </div>

      {/* Top bar */}
      <header
        className={clsx(
          "sticky top-0 z-50 bg-[linear-gradient(165deg,#0c4452_0%,#073140_60%,#0a3a47_100%)] text-ivory transition-shadow duration-500",
          scrolled && "shadow-[0_18px_40px_-24px_rgba(0,0,0,0.8)]",
        )}
      >
        <div className="mx-auto flex max-w-site flex-wrap items-center gap-x-3 gap-y-3 px-4 py-3 sm:px-8 lg:flex-nowrap lg:gap-x-6 lg:px-12 lg:py-3.5">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open all departments"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ivory/20 transition hover:border-gold-soft hover:text-gold-soft lg:hidden"
          >
            <Menu size={20} strokeWidth={1.3} />
          </button>
          <Link href="/" aria-label="Puro Body & Soul — home" className="rounded-[10px] px-1 py-1 transition hover:opacity-90">
            <Wordmark />
          </Link>
          <div className="hidden lg:block">
            <DeliverTo />
          </div>

          <Suspense fallback={<div className="order-last h-12 w-full lg:order-none lg:flex-1" />}>
            <HeaderSearch className="relative order-last w-full lg:order-none lg:flex-1" />
          </Suspense>

          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <Link href="/our-story" className={clsx(iconLink, "hidden xl:flex")}>
              <HeartHandshake size={20} strokeWidth={1.2} className="text-gold-soft" />
              <span className="leading-tight">
                <span className="block text-[11px] text-ivory/60">Our</span>
                <span className="block text-[14px] font-semibold">Story</span>
              </span>
            </Link>
            <button type="button" onClick={() => openBag("saved")} className={iconLink} aria-label={`Saved items, ${savedCount}`}>
              <span className="relative">
                <Heart size={22} strokeWidth={1.2} className={savedCount ? "fill-rose-500 text-rose-500" : ""} />
                {savedCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-ivory">
                    {savedCount}
                  </span>
                )}
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-[11px] text-ivory/60">Your</span>
                <span className="block text-[14px] font-semibold">Saved</span>
              </span>
            </button>
            <motion.button
              type="button"
              data-bag-target
              onClick={() => openBag()}
              animate={bagControls}
              className={iconLink}
              aria-label={`Open bag, ${count} items`}
            >
              <span className="relative">
                <ShoppingBag size={24} strokeWidth={1.2} />
                <motion.span
                  key={count}
                  initial={{ scale: count ? 1.6 : 1 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 14 }}
                  className="absolute -right-2 -top-2 flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-gradient-to-br from-[#f1e2bd] to-[#c9a365] px-1 text-[11px] font-bold text-ink"
                >
                  {count}
                </motion.span>
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-[11px] text-ivory/60">Bag</span>
                <span className="block text-[14px] font-semibold tabular-nums">{count ? formatPrice(subtotal) : "Empty"}</span>
              </span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Department strip */}
      <nav aria-label="Departments" className="relative z-40 border-y border-gold/15 bg-[#0b4250] text-ivory">
        <div className="no-scrollbar mx-auto flex max-w-site items-center gap-1 overflow-x-auto px-4 py-1.5 sm:px-8 lg:px-12">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="hidden shrink-0 items-center gap-2 rounded-full px-3 py-2 text-[14px] font-semibold transition hover:bg-ivory/[0.08] lg:flex"
          >
            <Menu size={17} strokeWidth={1.5} /> All
          </button>
          <div className="lg:hidden">
            <DeliverTo compact />
          </div>
          <span className="mx-1 hidden h-4 w-px bg-ivory/15 lg:block" />
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-full px-3 py-2 text-[14px] text-ivory/85 transition hover:bg-ivory/[0.08] hover:text-ivory"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/our-story"
            className="ml-auto hidden shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-[#e9d7ae] via-[#c9a365] to-[#b08d57] px-4 py-1.5 text-[13px] font-semibold text-ink shadow-[0_6px_16px_-8px_rgba(201,163,101,0.8)] lg:flex"
          >
            <HeartHandshake size={15} strokeWidth={1.5} /> Every purchase empowers a woman
          </Link>
        </div>
      </nav>

      <AllMenu open={menuOpen} onClose={closeMenu} concerns={concerns} />
    </>
  );
}
