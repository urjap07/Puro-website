"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { ArrowUpRight, ChevronDown, Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useFlights } from "@/lib/flight-store";
import { cartCount, useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import type { Concern } from "@/db/queries/products";
import HeaderSearch from "./HeaderSearch";
import AllMenu from "./AllMenu";

const EASE = [0.22, 1, 0.36, 1] as const;

const ANNOUNCEMENTS = [
  "Complimentary delivery on orders over ₹500",
  "Cruelty-free · PETA certified · Dermatologically tested",
  "Every purchase supports a rural woman through Sa-Ni-Sa",
];

const SHOP_LINKS = [
  { label: "All products", href: "/shop" },
  { label: "Face care", href: "/collections/face" },
  { label: "Body care", href: "/collections/body" },
  { label: "Hair care", href: "/collections/hair" },
  { label: "Gift sets", href: "/collections/gifting" },
];

const SHOP_EDITS = [
  { label: "Bestsellers", href: "/search?sort=bestsellers" },
  { label: "New arrivals", href: "/search?sort=newest" },
  { label: "Top rated", href: "/search?sort=rating" },
  { label: "Under ₹500", href: "/search?price=0-500" },
];

const SHOP_FEATURE = [
  { label: "Face", href: "/collections/face", image: "/media/products/aqua-riche-night-repair-gel-cream/04.jpg" },
  { label: "Body", href: "/collections/body", image: "/media/products/sheavibe-lotion/03.jpg" },
  { label: "Hair", href: "/collections/hair", image: "/media/products/terra-tress-hair-scalp-oil/02.jpg" },
];

type PanelKey = "shop" | "concerns";

export function Wordmark({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <span className="block text-center leading-none">
      <span
        className={clsx(
          "block font-display text-[30px] font-medium tracking-[0.32em] transition-colors duration-500 sm:text-[34px]",
          tone === "light" ? "text-ivory" : "text-midnight",
        )}
        style={{ marginRight: "-0.32em" }}
      >
        PURO
      </span>
      <span
        className={clsx(
          "mt-1 block text-[8px] font-medium uppercase tracking-[0.5em] transition-colors duration-500",
          tone === "light" ? "text-champagne" : "text-champagne-deep",
        )}
        style={{ marginRight: "-0.5em" }}
      >
        Body &amp; Soul
      </span>
    </span>
  );
}

function Announcements() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % ANNOUNCEMENTS.length), 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div data-site-chrome className="relative flex h-8 items-center justify-center overflow-hidden bg-[linear-gradient(90deg,#0e272a,#173c40,#0e272a)] px-4 text-[10px] font-medium uppercase tracking-[0.26em] text-champagne/85 sm:text-[11px]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="truncate text-center"
        >
          {ANNOUNCEMENTS[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

/**
 * Editorial header. On the homepage it floats transparently over the
 * cinematic hero and settles into a pearl bar once the visitor scrolls.
 */
export default function SiteHeader({ concerns = [] }: { concerns?: Concern[] }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [panel, setPanel] = useState<PanelKey | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const items = useCart((state) => state.items);
  const openBag = useCart((state) => state.open);
  const count = cartCount(items);
  const savedCount = useWishlist((state) => state.items.length);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const landed = useFlights((state) => state.landed);
  const bagControls = useAnimationControls();
  useEffect(() => {
    if (landed) bagControls.start({ scale: [1, 1.18, 0.94, 1], rotate: [0, -6, 4, 0], transition: { duration: 0.5 } });
  }, [landed, bagControls]);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setPanel(null);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!panel && !searchOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPanel(null);
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panel, searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    window.__lenis?.stop();
    return () => window.__lenis?.start();
  }, [searchOpen]);

  const openPanel = (key: PanelKey) => {
    clearTimeout(closeTimer.current);
    setPanel(key);
  };
  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setPanel(null), 140);
  };

  // Transparent only on the homepage, at the very top, with nothing open.
  const transparent = isHome && !scrolled && !panel;
  const tone = transparent ? "light" : "dark";

  const navLink = clsx(
    "relative py-2 text-[12px] font-medium uppercase tracking-[0.2em] transition-colors duration-300",
    "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-500 hover:after:scale-x-100",
    transparent ? "text-ivory/90 hover:text-ivory" : "text-graphite hover:text-midnight",
  );
  const iconButton = clsx(
    "relative flex h-10 w-10 items-center justify-center rounded-full transition duration-300",
    transparent ? "text-ivory hover:bg-ivory/10" : "text-graphite hover:bg-midnight/[0.06] hover:text-midnight",
  );
  const badge = clsx(
    "absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums",
    transparent ? "bg-champagne text-midnight-deep" : "bg-midnight text-ivory",
  );

  return (
    <>
      <Announcements />

      <header
        data-site-chrome
        onMouseLeave={scheduleClose}
        className={clsx(
          "sticky top-0 z-50 px-2.5 pt-2.5 sm:px-4 sm:pt-3",
          // On the homepage the hero slides up underneath the floating bar.
          isHome && "-mb-[70px] sm:-mb-[78px]",
        )}
      >
        {/* A floating bar of liquid glass: smoked over the hero, frosted pearl once you scroll */}
        <div
          className={clsx(
            "glass-liquid mx-auto grid h-[60px] max-w-site grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-full px-3 transition-[background,box-shadow] duration-700 sm:h-[66px] sm:px-6 lg:px-8",
            transparent ? "glass-dark" : "glass-strong",
          )}
        >
          {/* Left: menu (mobile) / primary navigation (desktop) */}
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" className={clsx(iconButton, "lg:hidden")}>
              <Menu size={21} strokeWidth={1.3} />
            </button>
            <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search" className={clsx(iconButton, "sm:hidden")}>
              <Search size={19} strokeWidth={1.3} />
            </button>

            <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex xl:gap-9">
              <button
                type="button"
                aria-expanded={panel === "shop"}
                aria-controls="nav-panel-shop"
                onMouseEnter={() => openPanel("shop")}
                onClick={() => setPanel((p) => (p === "shop" ? null : "shop"))}
                className={clsx(navLink, "flex items-center gap-1.5")}
              >
                Shop <ChevronDown size={13} strokeWidth={1.5} className={clsx("transition-transform duration-300", panel === "shop" && "rotate-180")} />
              </button>
              <Link href="/our-story" className={navLink} onMouseEnter={scheduleClose}>
                Philosophy
              </Link>
              <Link href="/#ingredients" className={navLink} onMouseEnter={scheduleClose}>
                Ingredients
              </Link>
              <button
                type="button"
                aria-expanded={panel === "concerns"}
                aria-controls="nav-panel-concerns"
                onMouseEnter={() => openPanel("concerns")}
                onClick={() => setPanel((p) => (p === "concerns" ? null : "concerns"))}
                className={clsx(navLink, "flex items-center gap-1.5")}
              >
                Concerns <ChevronDown size={13} strokeWidth={1.5} className={clsx("transition-transform duration-300", panel === "concerns" && "rotate-180")} />
              </button>
              <Link href="/#journal" className={navLink} onMouseEnter={scheduleClose}>
                Journal
              </Link>
            </nav>
          </div>

          {/* Centre: wordmark */}
          <Link href="/" aria-label="PURO Body & Soul — home" className="relative z-[2] rounded-md px-2 py-1" onMouseEnter={scheduleClose}>
            <Wordmark tone={tone} />
          </Link>

          {/* Right: search, saved, bag */}
          <div className="flex items-center justify-end gap-0.5 sm:gap-1">
            <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search" className={clsx(iconButton, "hidden sm:flex")}>
              <Search size={19} strokeWidth={1.3} />
            </button>
            <button type="button" onClick={() => openBag("saved")} aria-label={`Wishlist, ${savedCount} saved`} className={iconButton}>
              <Heart size={19} strokeWidth={1.3} className={savedCount ? "fill-current" : ""} />
              {savedCount > 0 && <span className={badge}>{savedCount}</span>}
            </button>
            <motion.button
              type="button"
              data-bag-target
              onClick={() => openBag()}
              animate={bagControls}
              className={iconButton}
              aria-label={`Shopping bag, ${count} items`}
            >
              <ShoppingBag size={20} strokeWidth={1.3} />
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 1.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 14 }}
                  className={badge}
                >
                  {count}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>

        {/* Desktop dropdown panels */}
        <AnimatePresence>
          {panel && (
            <motion.div
              key={panel}
              id={`nav-panel-${panel}`}
              onMouseEnter={() => openPanel(panel)}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="glass-strong absolute left-4 right-4 top-[calc(100%+10px)] mx-auto hidden max-w-site rounded-[30px] lg:block"
            >
              {panel === "shop" ? (
                <div className="relative z-[2] grid grid-cols-[200px_200px_1fr] gap-12 px-10 py-9">
                  <div>
                    <p className="eyebrow">Shop</p>
                    <ul className="mt-5 space-y-3">
                      {SHOP_LINKS.map((link) => (
                        <li key={link.href}>
                          <Link href={link.href} className="font-display text-[24px] leading-tight text-midnight transition hover:text-champagne-deep">
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="eyebrow">Edits</p>
                    <ul className="mt-5 space-y-3.5">
                      {SHOP_EDITS.map((link) => (
                        <li key={link.href}>
                          <Link href={link.href} className="text-[14px] text-graphite transition hover:text-midnight">
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {SHOP_FEATURE.map((item) => (
                      <Link key={item.href} href={item.href} className="group relative block aspect-[4/5] overflow-hidden rounded-[22px] bg-mist-deep shadow-[0_18px_30px_-18px_rgba(14,39,42,0.5)]">
                        <Image src={item.image} alt="" fill sizes="240px" className="object-cover transition duration-[1.2s] ease-out group-hover:scale-[1.06]" />
                        <span className="absolute inset-0 bg-gradient-to-t from-midnight-deep/70 via-transparent to-transparent" />
                        <span className="absolute inset-x-4 bottom-4 flex items-end justify-between text-ivory">
                          <span className="font-display text-[26px] italic leading-none">{item.label}</span>
                          <ArrowUpRight size={16} strokeWidth={1.3} />
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="relative z-[2] grid grid-cols-[1fr_1fr_320px] gap-12 px-10 py-9">
                  {(["skin", "hair"] as const).map((type) => (
                    <div key={type}>
                      <p className="eyebrow">{type === "skin" ? "Skin concerns" : "Hair & scalp"}</p>
                      <ul className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3">
                        {concerns
                          .filter((concern) => concern.type === type)
                          .map((concern) => (
                            <li key={concern.slug}>
                              <Link href={`/concerns/${concern.slug}`} className="font-display text-[21px] leading-tight text-midnight transition hover:text-champagne-deep">
                                {concern.name}
                              </Link>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                  <Link href="/#finder" className="group flex flex-col justify-between overflow-hidden rounded-[24px] bg-[radial-gradient(120%_90%_at_0%_0%,#2b5a5f,#173c40_55%,#0e272a)] p-7 text-ivory shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_20px_40px_-20px_rgba(14,39,42,0.7)]">
                    <span className="eyebrow text-champagne/80">Skincare finder</span>
                    <span className="mt-8 font-display text-[30px] leading-[1.05]">
                      Not sure where to begin? <em className="text-champagne">Find your ritual.</em>
                    </span>
                    <span className="mt-6 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-champagne">
                      Start the finder <ArrowUpRight size={14} strokeWidth={1.4} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search PURO"
            className="fixed inset-0 z-[90] flex flex-col bg-[radial-gradient(80%_60%_at_50%_0%,rgba(43,90,95,0.55),rgba(14,39,42,0.82))] text-ivory backdrop-blur-[28px] backdrop-saturate-150"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="mx-auto flex w-full max-w-site justify-end px-4 pt-5 sm:px-8 lg:px-12">
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="btn-glass-dark h-11 w-11 !p-0"
              >
                <X size={18} strokeWidth={1.3} />
              </button>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
              className="mx-auto mt-[8vh] w-full max-w-[760px] px-4 sm:px-8"
            >
              <p className="label text-champagne/80">Search</p>
              <h2 className="mt-4 font-display text-[40px] font-light leading-[1.02] sm:text-[60px]">
                What are you <em className="text-champagne">looking for?</em>
              </h2>
              <Suspense fallback={<div className="mt-8 h-12" />}>
                <HeaderSearch className="relative mt-8" autoFocus />
              </Suspense>
              <div className="mt-8 flex flex-wrap gap-2">
                {["Turmeric", "Ubtan", "Aloe vera", "Hair oil", "Gift sets", "Night repair"].map((term) => (
                  <Link
                    key={term}
                    href={`/search?q=${encodeURIComponent(term)}`}
                    className="glass-dark rounded-full px-4 py-2 text-[13px] text-ivory/85 transition hover:text-champagne"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AllMenu open={menuOpen} onClose={closeMenu} concerns={concerns} />
    </>
  );
}
