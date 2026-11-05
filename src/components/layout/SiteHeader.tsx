"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { cartCount, useCart } from "@/lib/cart-store";

const NAVIGATION = [
  { label: "Shop All", href: "/shop" },
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

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <span className="block text-center leading-none">
      <span
        className={clsx(
          "block font-display text-[30px] font-normal tracking-[0.32em] sm:text-[34px]",
          light ? "text-ivory" : "text-emerald"
        )}
        style={{ marginRight: "-0.32em" }}
      >
        PURO
      </span>
      <span
        className={clsx(
          "mt-1.5 block text-[8px] tracking-[0.5em]",
          light ? "text-gold-soft" : "text-gold-deep"
        )}
        style={{ marginRight: "-0.5em" }}
      >
        BODY &amp; SOUL
      </span>
    </span>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const items = useCart((state) => state.items);
  const openBag = useCart((state) => state.open);
  const count = cartCount(items);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  // On the homepage the header floats transparently over the hero until scrolled.
  const overlay = pathname === "/" && !scrolled;
  const tone = overlay ? "text-ivory" : "text-emerald";

  return (
    <>
      <div className="bg-emerald-deep py-2.5 text-center text-[10px] uppercase tracking-[0.28em] text-gold-soft">
        Cruelty-free&nbsp;&nbsp;·&nbsp;&nbsp;Dermatologically tested
        <span className="hidden sm:inline">&nbsp;&nbsp;·&nbsp;&nbsp;GMP certified</span>
      </div>

      <header
        className={clsx(
          "sticky top-0 z-50 border-b transition-all duration-500",
          overlay
            ? "border-ivory/15 bg-transparent"
            : "bg-mist/95 backdrop-blur-md",
          scrolled && "border-line shadow-[0_8px_30px_-20px_rgba(18,59,48,0.35)]",
          !overlay && !scrolled && "border-transparent"
        )}
      >
        <div
          className={clsx(
            "container-site grid grid-cols-[1fr_auto_1fr] items-center transition-all duration-500",
            scrolled ? "h-[72px]" : "h-[88px]"
          )}
        >
          <div className="flex items-center">
            <button
              type="button"
              className={clsx(tone, "lg:hidden")}
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} strokeWidth={1.1} />
            </button>
            <nav className="hidden items-center gap-8 lg:flex">
              {NAVIGATION.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "text-[11px] uppercase tracking-[0.22em] transition-colors hover:text-gold-deep",
                    pathname === item.href ? "text-gold-deep" : tone
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link href="/" aria-label="Puro Body & Soul — home">
            <Wordmark light={overlay} />
          </Link>

          <div className={clsx("flex items-center justify-end gap-6", tone)}>
            <nav className="hidden items-center gap-8 xl:flex">
              {SECONDARY.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[11px] uppercase tracking-[0.22em] transition-colors hover:text-gold-deep"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link href="/shop" aria-label="Search products" className="hidden transition hover:text-gold-deep sm:block">
              <Search size={19} strokeWidth={1.1} />
            </Link>
            <button
              type="button"
              onClick={openBag}
              className="relative transition hover:text-gold-deep"
              aria-label={`Open bag, ${count} item${count === 1 ? "" : "s"}`}
            >
              <ShoppingBag size={20} strokeWidth={1.1} />
              {count > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-gold px-1 text-[9px] font-medium text-emerald-deep">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[70] flex flex-col bg-emerald-deep text-ivory lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex h-[88px] items-center justify-between px-5 sm:px-8">
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X size={22} strokeWidth={1.1} />
              </button>
              <Wordmark light />
              <span className="w-[22px]" />
            </div>
            <nav className="flex flex-1 flex-col justify-center gap-2 px-8">
              {[...NAVIGATION, ...SECONDARY].map((item, index) => (
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
