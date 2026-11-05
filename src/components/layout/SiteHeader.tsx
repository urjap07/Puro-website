"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Menu, Search, ShoppingBag, X } from "lucide-react";
import { cartCount, useCart } from "@/lib/cart-store";
import { COLLECTIONS } from "@/lib/collections";
import type { Concern } from "@/db/queries/products";

const NAVIGATION = [
  { label: "Face", href: "/collections/face" },
  { label: "Body", href: "/collections/body" },
  { label: "Hair", href: "/collections/hair" },
  { label: "Gifting", href: "/collections/gifting" },
];

const SECONDARY = [
  { label: "Our Story", href: "/#story" },
  { label: "Rituals", href: "/#ritual" },
  { label: "Ingredients", href: "/#ingredients" },
];

const FEATURED = [
  {
    eyebrow: "Bestseller",
    title: "Glow Up Pithi Pack",
    href: "/products/glow-up-pithi-pack",
    image: "/media/products/glow-up-pithi-pack/04.jpg",
  },
  {
    eyebrow: "The Gift Edit",
    title: "Keepsake gift boxes",
    href: "/collections/gifting",
    image: "/media/products/radiant-glow-luxurious-kit/02.jpg",
  },
];

/** Header height; the homepage hero tucks underneath it. */
export const HEADER_HEIGHT = 96;

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <span className="block text-center leading-none">
      <span
        className={clsx(
          "block font-display text-[32px] font-normal tracking-[0.32em] sm:text-[36px] lg:text-[40px]",
          light ? "text-ivory" : "text-emerald"
        )}
        style={{ marginRight: "-0.32em" }}
      >
        PURO
      </span>
      <span
        className={clsx(
          "mt-1.5 block text-[8px] tracking-[0.5em] lg:text-[9px]",
          light ? "text-gold-soft" : "text-gold-deep"
        )}
        style={{ marginRight: "-0.5em" }}
      >
        BODY &amp; SOUL
      </span>
    </span>
  );
}

export default function SiteHeader({ concerns = [] }: { concerns?: Concern[] }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const items = useCart((state) => state.items);
  const openBag = useCart((state) => state.open);
  const count = cartCount(items);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setShopOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!shopOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setShopOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shopOpen]);

  const openShop = () => {
    clearTimeout(closeTimer.current);
    setShopOpen(true);
  };
  const closeShopSoon = () => {
    closeTimer.current = setTimeout(() => setShopOpen(false), 160);
  };

  // On the homepage the header floats transparently over the hero until scrolled.
  const overlay = pathname === "/" && !scrolled && !shopOpen;
  // Light text on the transparent hero header and on the emerald open-menu header.
  const dark = overlay || shopOpen;
  const tone = dark ? "text-ivory" : "text-emerald";
  const hover = dark ? "hover:text-gold-soft" : "hover:text-gold-deep";
  const navText = "text-[12px] font-normal uppercase tracking-[0.16em] transition-colors 2xl:text-[13px] 2xl:tracking-[0.18em]";

  return (
    <>
      <div className="bg-emerald-deep py-2.5 text-center text-[10px] uppercase tracking-[0.28em] text-gold-soft sm:text-[11px]">
        Cruelty-free&nbsp;&nbsp;·&nbsp;&nbsp;Dermatologically tested
        <span className="hidden sm:inline">&nbsp;&nbsp;·&nbsp;&nbsp;GMP certified</span>
        <span className="hidden lg:inline">&nbsp;&nbsp;·&nbsp;&nbsp;Every purchase empowers a woman</span>
      </div>

      <header
        className={clsx(
          "sticky top-0 z-50 border-b transition-all duration-500",
          overlay && "border-ivory/15 bg-transparent",
          shopOpen && "border-ivory/10 bg-emerald-deep",
          !overlay && !shopOpen && "bg-mist/95 backdrop-blur-md",
          scrolled && !shopOpen && "border-line shadow-[0_8px_30px_-20px_rgba(18,59,48,0.35)]",
          !overlay && !scrolled && !shopOpen && "border-transparent"
        )}
        onMouseLeave={closeShopSoon}
      >
        <div
          className={clsx(
            "container-site grid grid-cols-[1fr_auto_1fr] items-center transition-all duration-500",
            scrolled ? "h-[78px]" : "h-[96px]"
          )}
        >
          <div className="flex items-center">
            <button
              type="button"
              className={clsx(tone, "lg:hidden")}
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} strokeWidth={1.1} />
            </button>
            <nav className="hidden items-center gap-6 lg:flex 2xl:gap-9">
              <button
                type="button"
                className={clsx(
                  navText,
                  "flex items-center gap-1.5",
                  shopOpen ? "text-gold-soft" : pathname === "/shop" ? "text-gold-deep" : tone,
                  hover
                )}
                aria-expanded={shopOpen}
                aria-haspopup="true"
                onMouseEnter={openShop}
                onClick={() => setShopOpen((open) => !open)}
              >
                Shop
                <ChevronDown
                  size={14}
                  strokeWidth={1.25}
                  className={clsx("transition-transform duration-300", shopOpen && "rotate-180")}
                />
              </button>
              {NAVIGATION.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={closeShopSoon}
                  className={clsx(
                    navText,
                    pathname === item.href ? (dark ? "text-gold-soft" : "text-gold-deep") : tone,
                    hover
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link href="/" aria-label="Puro Body & Soul — home">
            <Wordmark light={dark} />
          </Link>

          <div className={clsx("flex items-center justify-end gap-5 2xl:gap-7", tone)}>
            <nav className="hidden items-center gap-6 xl:flex 2xl:gap-9">
              {SECONDARY.map((item) => (
                <Link key={item.href} href={item.href} className={clsx(navText, hover)}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <span className={clsx("hidden h-5 w-px xl:block", dark ? "bg-ivory/30" : "bg-line")} />
            <Link
              href="/shop"
              aria-label="Search products"
              className={clsx("hidden transition sm:block", hover)}
            >
              <Search size={21} strokeWidth={1.1} />
            </Link>
            <button
              type="button"
              onClick={openBag}
              className={clsx("relative flex items-center gap-2 transition", hover)}
              aria-label={`Open bag, ${count} item${count === 1 ? "" : "s"}`}
            >
              <ShoppingBag size={22} strokeWidth={1.1} />
              <span className={clsx(navText, "hidden lg:inline xl:hidden 2xl:inline")}>Bag</span>
              {count > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-medium text-emerald-deep lg:static lg:ml-0.5">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Shop mega menu */}
        <AnimatePresence>
          {shopOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-full hidden overflow-hidden border-b border-gold/30 bg-emerald-deep text-ivory shadow-[0_40px_80px_-40px_rgba(11,42,34,0.8)] lg:block"
              onMouseEnter={openShop}
            >
              <div className="pointer-events-none absolute -left-40 -top-40 h-[460px] w-[460px] rounded-full bg-gold/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-56 right-1/4 h-[520px] w-[520px] rounded-full bg-emerald-soft/60 blur-3xl" />

              <div className="container-site relative grid grid-cols-[1.05fr_1.35fr_1.25fr] gap-12 pb-8 pt-12">
                {/* Collections with thumbnails */}
                <div>
                  <p className="eyebrow text-gold-soft">Collections</p>
                  <ul className="mt-6 space-y-1">
                    {COLLECTIONS.map((collection) => (
                      <li key={collection.slug}>
                        <Link
                          href={`/collections/${collection.slug}`}
                          className="group flex items-center gap-4 rounded-full py-1.5 pl-1.5 pr-4 transition hover:bg-ivory/[0.06]"
                        >
                          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-gold/40 transition group-hover:ring-gold-soft">
                            <Image
                              src={collection.image}
                              alt=""
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          </span>
                          <span className="flex-1 font-display text-[22px] font-light text-ivory transition group-hover:text-gold-soft">
                            {collection.title}
                          </span>
                          <ArrowRight
                            size={15}
                            strokeWidth={1.25}
                            className="-translate-x-2 text-gold-soft opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Concerns as pills */}
                <div className="border-l border-ivory/10 pl-12">
                  {(["skin", "hair"] as const).map((type) => (
                    <div key={type} className={type === "hair" ? "mt-9" : undefined}>
                      <p className="eyebrow text-gold-soft">
                        {type === "skin" ? "Shop by skin concern" : "Shop by hair concern"}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {concerns
                          .filter((concern) => concern.type === type)
                          .map((concern) => (
                            <Link
                              key={concern.slug}
                              href={`/concerns/${concern.slug}`}
                              className="rounded-full border border-ivory/20 px-4 py-2 text-[14px] text-ivory/85 transition hover:border-gold-soft hover:bg-gold-soft hover:text-emerald-deep"
                            >
                              {concern.name}
                            </Link>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Featured in palace arches */}
                <div className="flex justify-end gap-6">
                  {FEATURED.map((item) => (
                    <Link key={item.href} href={item.href} className="group block w-[190px] text-center">
                      <div className="relative aspect-[3/4] overflow-hidden rounded-t-full ring-1 ring-gold/40 ring-offset-[5px] ring-offset-emerald-deep transition duration-700 group-hover:ring-gold-soft">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="190px"
                          className="object-cover transition duration-[1200ms] group-hover:scale-105"
                        />
                      </div>
                      <p className="mt-5 text-[10px] uppercase tracking-[0.24em] text-gold-soft">
                        {item.eyebrow}
                      </p>
                      <p className="mt-1.5 font-display text-[19px] leading-snug text-ivory transition group-hover:text-gold-soft">
                        {item.title}
                      </p>
                      <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-ivory/60 transition group-hover:text-ivory">
                        Shop now
                        <ArrowRight size={12} strokeWidth={1.25} className="transition group-hover:translate-x-1" />
                      </p>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="container-site relative">
                <div className="flex items-center justify-between border-t border-gold/25 py-5 text-[11px] uppercase tracking-[0.24em]">
                  <span className="text-ivory/50">
                    Cruelty-free · Dermatologically tested · GMP certified
                  </span>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 text-gold-soft transition hover:text-ivory"
                  >
                    Shop all rituals <ArrowRight size={13} strokeWidth={1.25} />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-emerald-deep text-ivory lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex h-[96px] shrink-0 items-center justify-between px-5 sm:px-8">
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X size={24} strokeWidth={1.1} />
              </button>
              <Wordmark light />
              <span className="w-[24px]" />
            </div>
            <nav className="flex flex-1 flex-col justify-center gap-1 px-8 py-6">
              {[{ label: "Shop All", href: "/shop" }, ...NAVIGATION, ...SECONDARY].map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index + 0.1, duration: 0.5 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block py-2 font-display text-[34px] font-light text-ivory hover:text-gold-soft"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              {concerns.length > 0 && (
                <div className="mt-6 border-t border-ivory/15 pt-6">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-gold-soft">Shop by concern</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {concerns.map((concern) => (
                      <Link
                        key={concern.slug}
                        href={`/concerns/${concern.slug}`}
                        onClick={() => setMenuOpen(false)}
                        className="rounded-full border border-ivory/25 px-4 py-2 text-[13px] text-ivory/85"
                      >
                        {concern.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </nav>
            <p className="px-8 pb-10 text-[10px] uppercase tracking-[0.28em] text-gold-soft">
              Rituals rooted in nature
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
