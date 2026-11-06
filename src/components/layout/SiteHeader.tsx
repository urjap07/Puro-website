"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  HeartHandshake,
  Menu,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { cartCount, useCart } from "@/lib/cart-store";
import { COLLECTIONS } from "@/lib/collections";
import type { Concern } from "@/db/queries/products";

const NAVIGATION = [
  { label: "Face", href: "/collections/face" },
  { label: "Body", href: "/collections/body" },
  { label: "Hair", href: "/collections/hair" },
  { label: "Gifting", href: "/collections/gifting" },
];

const OUR_STORY = { label: "Our Story", href: "/our-story" };

const SECONDARY = [
  { label: "Rituals", href: "/#ritual" },
  { label: "Ingredients", href: "/#ingredients" },
];

const ANNOUNCEMENTS = [
  "Cruelty-free · PETA certified",
  "Dermatologically tested",
  "Every purchase empowers a woman",
  "Made in a GMP-certified facility",
  "Rooted in age-old wisdom",
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

/** Pages whose full-bleed hero sits beneath a transparent header. */
const OVERLAY_PAGES = ["/", "/our-story"];

/** Height of the sticky header band; full-bleed heroes tuck underneath it. */
export const HEADER_HEIGHT = 96;

export function Wordmark({
  light = false,
  compact = false,
}: {
  light?: boolean;
  compact?: boolean;
}) {
  return (
    <span className="block text-center leading-none">
      <span
        className={clsx(
          "block font-display font-normal tracking-[0.2em] transition-all duration-500",
          compact ? "text-[26px]" : "text-[30px] sm:text-[34px] lg:text-[36px]",
          light ? "text-ivory" : "text-emerald",
        )}
        style={{ marginRight: "-0.2em" }}
      >
        PURO
      </span>
      <span
        className={clsx(
          "block overflow-hidden font-sans text-[8px] font-medium uppercase tracking-[0.5em] transition-all duration-500 lg:text-[9px]",
          compact ? "mt-0 max-h-0 opacity-0" : "mt-1 max-h-4 opacity-100",
          light ? "text-ivory/70" : "text-stone",
        )}
        style={{ marginRight: "-0.5em" }}
      >
        BODY &amp; SOUL
      </span>
    </span>
  );
}

/** Link text that rolls upward on hover, revealing an italic copy beneath. */
function Roll({ children }: { children: string }) {
  return (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/roll:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/roll:translate-y-0"
      >
        {children}
      </span>
    </span>
  );
}

export default function SiteHeader({
  concerns = [],
}: {
  concerns?: Concern[];
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const items = useCart((state) => state.items);
  const openBag = useCart((state) => state.open);
  const count = cartCount(items);

  // Compact frosted bar once scrolled; it stays in view the whole way down.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
    };
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
    const onKey = (event: KeyboardEvent) =>
      event.key === "Escape" && setShopOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shopOpen]);

  const openShop = () => {
    clearTimeout(closeTimer.current);
    setShopOpen(true);
  };
  const closeShopSoon = () => {
    closeTimer.current = setTimeout(() => setShopOpen(false), 180);
  };

  const overHero = OVERLAY_PAGES.includes(pathname) && !scrolled;
  // Ivory text over the hero; forest text on the frosted bar.
  const light = overHero;
  const navText =
    "group/roll font-sans text-[13px] font-medium uppercase tracking-[0.16em] 2xl:text-[14px]";

  return (
    <>
      {/* Ribbon of promises */}
      <div className="relative overflow-hidden bg-emerald-deep py-2.5 text-[10px] font-medium uppercase tracking-[0.24em] text-ivory/75 sm:text-[11px]">
        <div className="flex w-max animate-marquee-slow motion-reduce:animate-none">
          {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS, ...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((text, index) => (
            <span
              key={index}
              aria-hidden={index >= ANNOUNCEMENTS.length}
              className="flex items-center whitespace-nowrap px-8"
            >
              {text}
              <span className="ml-16 h-1 w-1 rounded-full bg-gold-soft/70" />
            </span>
          ))}
        </div>
      </div>

      <header
        className={clsx(
          "pointer-events-none sticky top-0 z-50 h-[96px] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        )}
        onMouseLeave={closeShopSoon}
      >
        <div
          className={clsx(
            "pointer-events-auto relative w-full transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
            scrolled || shopOpen
              ? "h-[72px] border-b border-ink/[0.07] bg-ivory/80 shadow-[0_18px_40px_-32px_rgba(20,38,30,0.45)] backdrop-blur-2xl backdrop-saturate-150"
              : overHero
                ? "h-[96px] border-b border-ivory/15 bg-transparent"
                : "h-[96px] border-b border-line bg-mist/90 backdrop-blur-md",
          )}
        >
          <div
            className={clsx(
              "container-site grid h-full grid-cols-[1fr_auto_1fr] items-center transition-colors duration-500",
              light && !shopOpen ? "text-ivory" : "text-emerald",
            )}
          >
            <div className="flex items-center">
              <button type="button" className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
                <Menu size={24} strokeWidth={1.1} />
              </button>
              <nav className="hidden items-center gap-8 lg:flex 2xl:gap-10">
                <button
                  type="button"
                  className={clsx(navText, "flex items-center gap-1.5")}
                  aria-expanded={shopOpen}
                  aria-haspopup="true"
                  onMouseEnter={openShop}
                  onClick={() => setShopOpen((open) => !open)}
                >
                  <Roll>Shop</Roll>
                  <ChevronDown
                    size={14}
                    strokeWidth={1.25}
                    className={clsx("transition-transform duration-500", shopOpen && "rotate-180")}
                  />
                </button>
                {NAVIGATION.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onMouseEnter={closeShopSoon}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className={clsx(navText, "relative")}
                  >
                    <Roll>{item.label}</Roll>
                    {pathname === item.href && (
                      <span className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-current" />
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            <Link href="/" aria-label="Puro Body & Soul — home">
              <Wordmark light={light && !shopOpen} compact={scrolled || shopOpen} />
            </Link>

            <div className="flex items-center justify-end gap-6 2xl:gap-8">
              <Link
                href={OUR_STORY.href}
                aria-current={pathname === OUR_STORY.href ? "page" : undefined}
                className={clsx(
                  navText,
                  "hidden items-center gap-2 rounded-full border px-4 py-2 transition-colors duration-500 lg:flex 2xl:px-5",
                  light && !shopOpen
                    ? "border-ivory/50 hover:border-ivory hover:bg-ivory hover:text-ink"
                    : "border-emerald bg-emerald text-ivory hover:border-ink hover:bg-ink",
                )}
              >
                <HeartHandshake size={15} strokeWidth={1.25} />
                <Roll>{OUR_STORY.label}</Roll>
              </Link>
              <Link href="/shop" aria-label="Search products" className="hidden transition-opacity hover:opacity-60 sm:block">
                <Search size={20} strokeWidth={1.1} />
              </Link>
              <button
                type="button"
                onClick={openBag}
                className={clsx(navText, "relative flex items-center gap-2")}
                aria-label={`Open bag, ${count} item${count === 1 ? "" : "s"}`}
              >
                <ShoppingBag size={20} strokeWidth={1.1} />
                <span className="hidden lg:inline">
                  <Roll>Bag</Roll>
                </span>
                <span
                  className={clsx(
                    "flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold tracking-normal tabular-nums",
                    "max-lg:absolute max-lg:-right-2.5 max-lg:-top-2",
                    count === 0 && "max-lg:hidden",
                    light && !shopOpen ? "bg-ivory text-ink" : "bg-emerald text-ivory",
                  )}
                >
                  {count}
                </span>
              </button>
            </div>
          </div>


          {/* Shop menu — a floating card */}
          <AnimatePresence>
            {shopOpen && (
              <div
                key="shop-menu"
                className="absolute inset-x-0 top-full hidden px-3 pt-2 lg:block"
                onMouseEnter={openShop}
              >
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -12,
                    clipPath: "inset(0 0 100% 0 round 28px)",
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    clipPath: "inset(0 0 0% 0 round 28px)",
                  }}
                  exit={{
                    opacity: 0,
                    y: -8,
                    clipPath: "inset(0 0 100% 0 round 28px)",
                  }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="mx-auto max-w-[1360px] overflow-hidden rounded-[24px] border border-line bg-mist text-ink shadow-[0_50px_100px_-40px_rgba(20,38,30,0.55)]"
                >
                  <div className="grid grid-cols-[1fr_1.25fr_1.45fr] gap-12 px-10 pb-8 pt-10">
                    <div>
                      <p className="eyebrow">Collections</p>
                      <ul className="mt-5 space-y-0.5">
                        {COLLECTIONS.map((collection, index) => (
                          <motion.li
                            key={collection.slug}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: 0.12 + index * 0.05,
                              duration: 0.5,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          >
                            <Link
                              href={`/collections/${collection.slug}`}
                              className="group flex items-baseline gap-3 py-1 font-display text-[30px] leading-tight text-emerald"
                            >
                              <span className="text-[10px] font-sans font-medium tabular-nums text-stone">
                                0{index + 1}
                              </span>
                              <span className="transition duration-500 group-hover:translate-x-2 group-hover:italic">
                                {collection.title}
                              </span>
                              <ArrowRight
                                size={16}
                                strokeWidth={1.1}
                                className="-translate-x-2 self-center opacity-0 transition duration-500 group-hover:translate-x-0 group-hover:opacity-100"
                              />
                            </Link>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-l border-line pl-12">
                      {(["skin", "hair"] as const).map((type) => (
                        <div
                          key={type}
                          className={type === "hair" ? "mt-9" : undefined}
                        >
                          <p className="eyebrow">
                            {type === "skin"
                              ? "Shop by skin concern"
                              : "Shop by hair concern"}
                          </p>
                          <div className="mt-5 flex flex-wrap gap-2">
                            {concerns
                              .filter((concern) => concern.type === type)
                              .map((concern) => (
                                <Link
                                  key={concern.slug}
                                  href={`/concerns/${concern.slug}`}
                                  className="rounded-full border border-emerald/20 px-4 py-2 text-[13px] text-emerald transition duration-300 hover:border-emerald hover:bg-emerald hover:text-ivory"
                                >
                                  {concern.name}
                                </Link>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      {FEATURED.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="group relative block self-start overflow-hidden rounded-[18px]"
                        >
                          <div className="relative aspect-[4/5]">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              sizes="240px"
                              className="object-cover transition duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
                          </div>
                          <div className="absolute inset-x-5 bottom-5 text-ivory">
                            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-ivory/70">
                              {item.eyebrow}
                            </p>
                            <p className="mt-1 font-display text-[24px] leading-tight">
                              {item.title}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-line bg-mist-deep/60 px-10 py-5 text-[11px] font-medium uppercase tracking-[0.22em]">
                    <div className="flex gap-8 text-stone">
                      {SECONDARY.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="transition hover:text-emerald"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <Link href="/shop" className="link-underline text-emerald">
                      Shop all rituals{" "}
                      <ArrowRight size={13} strokeWidth={1.25} />
                    </Link>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Phone menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            data-lenis-prevent
            className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-emerald-deep text-ivory lg:hidden"
            initial={{ clipPath: "circle(0% at 8% 4%)" }}
            animate={{ clipPath: "circle(150% at 8% 4%)" }}
            exit={{ clipPath: "circle(0% at 8% 4%)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="flex h-[84px] shrink-0 items-center justify-between px-5 sm:px-8">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={24} strokeWidth={1.1} />
              </button>
              <Wordmark light />
              <span className="w-[24px]" />
            </div>
            <nav className="flex flex-1 flex-col justify-center px-7 py-6">
              {[
                { label: "Shop all", href: "/shop" },
                OUR_STORY,
                ...NAVIGATION,
                ...SECONDARY,
              ].map((item, index) => (
                <motion.div
                  key={item.href}
                  className="overflow-hidden border-b border-ivory/10"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.25 + 0.05 * index,
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-baseline gap-4 py-3 font-display text-[40px] leading-none active:italic"
                  >
                    <span className="font-sans text-[10px] font-medium tabular-nums text-ivory/40">
                      0{index + 1}
                    </span>
                    {item.label}
                    {item.href === OUR_STORY.href && (
                      <HeartHandshake
                        size={20}
                        strokeWidth={1.1}
                        className="self-center text-gold-soft"
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
              {concerns.length > 0 && (
                <motion.div
                  className="mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/50">
                    Shop by concern
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {concerns.map((concern) => (
                      <Link
                        key={concern.slug}
                        href={`/concerns/${concern.slug}`}
                        onClick={() => setMenuOpen(false)}
                        className="rounded-full border border-ivory/20 px-4 py-2 text-[13px] text-ivory/85"
                      >
                        {concern.name}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </nav>
            <p className="px-7 pb-10 text-[10px] uppercase tracking-[0.28em] text-ivory/40">
              Rituals rooted in nature
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
