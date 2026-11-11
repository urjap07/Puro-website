"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Leaf, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { cutoutFor } from "@/lib/cutouts";
import { flyToBasket } from "@/lib/flight-store";
import { quickLookOrigin, useQuickLook } from "@/lib/quicklook-store";
import { flightImage, toCartItem } from "@/components/cart/AddToBag";
import WishButton from "@/components/cart/WishButton";
import Price from "./Price";
import StarRating from "./StarRating";
import { DeliveryLine } from "./ResultCard";

const EASE = [0.22, 1, 0.36, 1] as const;
const RISE_S = 0.6;
const RETURN_S = 0.45;

type Box = { left: number; top: number; width: number; height: number };
const box = (rect: DOMRect): Box => ({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });

/** The image in flight between a card and the stage, above everything else. */
interface Ghost {
  src: string;
  cutout: boolean;
  from: Box;
  to: Box;
  direction: "in" | "out";
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Quick look: the product rises out of its card to centre stage, with the
 * essentials beside it. Arrows step through the row or grid it came from;
 * closing sends it back into its card. On phones it slides up as a sheet.
 */
export default function QuickLook() {
  const { list, index, isOpen, step, close } = useQuickLook();
  const product = isOpen ? list[index] : undefined;
  const [leaving, setLeaving] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [ghost, setGhost] = useState<Ghost | null>(null);
  const flyer = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const openedSlug = useRef<string | null>(null);
  const add = useCart((state) => state.add);
  const pathname = usePathname();

  // Leaving the page (e.g. "See full details") closes quick look.
  useEffect(() => {
    openedSlug.current = null;
    setGhost(null);
    setLeaving(false);
    useQuickLook.getState().close();
  }, [pathname]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setSheet(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // A fresh quantity for each product.
  useEffect(() => {
    setQuantity(1);
    setAdded(false);
  }, [product?.id]);

  // Rise from the card: hide the stage image and fly a copy from the card's image to it.
  useLayoutEffect(() => {
    if (!isOpen || sheet) return;
    const current = list[index];
    if (!current || openedSlug.current) return;
    openedSlug.current = current.slug;
    const el = flyer.current;
    const from = quickLookOrigin(current.slug);
    const src = cutoutFor(current.slug) ?? current.images[0]?.imageUrl;
    if (!el || !from || !src || reducedMotion()) return;
    el.style.opacity = "0";
    setGhost({ src, cutout: Boolean(cutoutFor(current.slug)), from: box(from), to: box(el.getBoundingClientRect()), direction: "in" });
  }, [isOpen, sheet, list, index]);

  const finishClose = useCallback(() => {
    openedSlug.current = null;
    setGhost(null);
    setLeaving(false);
    close();
  }, [close]);

  // Return to the card the current product lives in (if it is on screen), then close.
  const requestClose = useCallback(() => {
    if (leaving) return;
    const el = flyer.current;
    const current = list[index];
    const to = current ? quickLookOrigin(current.slug) : null;
    const src = current ? (cutoutFor(current.slug) ?? current.images[0]?.imageUrl) : null;
    setLeaving(true);
    if (sheet || !el || !to || !src || reducedMotion()) {
      setTimeout(finishClose, sheet ? 300 : 200);
      return;
    }
    setGhost({ src, cutout: Boolean(cutoutFor(current!.slug)), from: box(el.getBoundingClientRect()), to: box(to), direction: "out" });
    el.style.opacity = "0";
  }, [leaving, list, index, sheet, finishClose]);

  const onGhostLanded = () => {
    if (ghost?.direction === "out") return finishClose();
    if (flyer.current) flyer.current.style.opacity = "1";
    setGhost(null);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
      if (event.key === "ArrowRight" && list.length > 1) step(1);
      if (event.key === "ArrowLeft" && list.length > 1) step(-1);
    };
    document.addEventListener("keydown", onKey);
    window.__lenis?.stop();
    const previous = document.activeElement as HTMLElement | null;
    closeButton.current?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      window.__lenis?.start();
      previous?.focus?.({ preventScroll: true });
    };
  }, [isOpen, list.length, step, requestClose]);

  const variant = product?.variants[0];
  const cutout = product ? cutoutFor(product.slug) : null;
  const image = product ? (cutout ?? product.images[0]?.imageUrl) : null;
  const inStock = Boolean(variant && variant.stockQuantity > 0);
  const maxQty = variant ? Math.max(1, Math.min(10, variant.stockQuantity || 10)) : 1;
  const ingredients = product?.keyIngredients?.split(/,\s*/).filter(Boolean).slice(0, 5) ?? [];
  const href = product ? `/products/${product.slug}` : "/";
  const many = list.length > 1;

  return (
    <AnimatePresence>
      {isOpen && product && (
        <motion.div
          key="quicklook"
          className="fixed inset-0 z-[95] flex items-end justify-center md:items-center md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Quick look: ${product.name}`}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,50,61,0.72),rgba(3,22,28,0.88))] backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: leaving ? 0 : 1 }}
            transition={{ duration: 0.4 }}
            onClick={requestClose}
          />

          {/* Previous / next, outside the panel on wide screens */}
          {many && (
            <>
              <button
                type="button"
                aria-label="Previous product"
                onClick={() => step(-1)}
                className="absolute left-4 top-1/2 z-10 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/25 bg-ivory/10 text-ivory backdrop-blur transition hover:bg-ivory hover:text-ink md:flex xl:left-10"
              >
                <ChevronLeft size={22} strokeWidth={1.3} />
              </button>
              <button
                type="button"
                aria-label="Next product"
                onClick={() => step(1)}
                className="absolute right-4 top-1/2 z-10 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/25 bg-ivory/10 text-ivory backdrop-blur transition hover:bg-ivory hover:text-ink md:flex xl:right-10"
              >
                <ChevronRight size={22} strokeWidth={1.3} />
              </button>
            </>
          )}

          <motion.div
            data-fly-source
            className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[28px] bg-ivory shadow-[0_60px_120px_-40px_rgba(0,0,0,0.8)] md:max-h-[min(720px,90vh)] md:max-w-[1040px] md:flex-row md:rounded-[32px]"
            initial={sheet ? { y: "100%" } : { opacity: 0, scale: 0.96 }}
            animate={sheet ? { y: leaving ? "100%" : 0 } : { opacity: leaving ? 0 : 1, scale: leaving ? 0.97 : 1 }}
            transition={{ duration: sheet ? 0.45 : leaving ? RETURN_S * 0.8 : 0.4, ease: EASE }}
          >
            {/* Stage: the image is the part that rises out of the card */}
            <div className="relative shrink-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_42%,#ffffff_0%,#f4ede2_55%,#e3d7c3_100%)] md:w-[46%]">
              <div ref={flyer} className="relative mx-auto aspect-square w-[62%] origin-center md:my-0 md:h-full md:w-full md:aspect-auto">
                <AnimatePresence mode="popLayout" initial={false}>
                  {image && (
                    <motion.div
                      key={product.id}
                      className="absolute inset-0"
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.4, ease: EASE }}
                    >
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        sizes="(min-width: 768px) 480px, 60vw"
                        className={cutout ? "object-contain p-[12%] drop-shadow-[0_30px_30px_rgba(0,0,0,0.22)]" : "object-cover"}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <motion.span
                className="pointer-events-none absolute bottom-[10%] left-1/2 hidden h-6 w-[45%] -translate-x-1/2 rounded-[50%] bg-ink/15 blur-xl md:block"
                initial={{ opacity: 0 }}
                animate={{ opacity: leaving ? 0 : 1 }}
                transition={{ delay: leaving ? 0 : RISE_S * 0.7 }}
              />
              {many && (
                <span className="absolute left-4 top-4 rounded-full bg-ivory/90 px-3 py-1 text-[12px] font-semibold tabular-nums text-ink shadow-sm">
                  {index + 1} / {list.length}
                </span>
              )}
              <span className="absolute left-1/2 top-2.5 h-1 w-10 -translate-x-1/2 rounded-full bg-ink/20 md:hidden" />
            </div>

            {/* Details */}
            <motion.div
              data-lenis-prevent
              className="relative flex-1 overflow-y-auto"
              initial={{ opacity: 0, x: sheet ? 0 : 24 }}
              animate={{ opacity: leaving ? 0 : 1, x: 0 }}
              transition={{ duration: 0.45, delay: leaving || sheet ? 0 : RISE_S * 0.55, ease: EASE }}
            >
              <button
                ref={closeButton}
                type="button"
                onClick={requestClose}
                aria-label="Close quick look"
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-mist text-ink transition hover:bg-ink hover:text-ivory"
              >
                <X size={18} strokeWidth={1.4} />
              </button>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={product.id}
                  className="p-6 pr-16 sm:p-9 sm:pr-20"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <p className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-deep">
                    {product.subCategory ?? product.categories[0]?.name}
                    {product.isFeatured && <span className="rounded-full bg-noir px-2.5 py-0.5 text-[10px] text-gold-soft">Bestseller</span>}
                  </p>
                  <h2 className="mt-2 font-display text-[34px] leading-[1.05] text-ink sm:text-[42px]">{product.name}</h2>
                  {product.headline && <p className="mt-1.5 font-display text-[19px] italic text-emerald">{product.headline}</p>}
                  {product.rating && (
                    <Link href={`${href}#reviews`} onClick={finishClose} className="mt-3 inline-block">
                      <StarRating value={product.rating.value} count={product.rating.count} size={14} />
                    </Link>
                  )}

                  {variant && (
                    <div className="mt-5 flex items-end gap-2.5">
                      <Price value={variant.price * quantity} size="lg" />
                      {product.sizeLabel && <span className="mb-1 text-[13px] uppercase tracking-[0.12em] text-stone">{product.sizeLabel}</span>}
                    </div>
                  )}
                  <p className="mt-1 text-[13px] text-stone">
                    {quantity > 1 && variant && `${quantity} × ₹${variant.price} · `}Inclusive of all taxes
                  </p>
                  {variant && <DeliveryLine price={variant.price * quantity} className="mt-3 text-[14px]" />}
                  <p className={clsx("mt-2 text-[14px] font-semibold", inStock ? "text-emerald" : "text-rose-700")}>
                    {!variant || !inStock ? "Currently unavailable" : variant.stockQuantity <= 5 ? `Only ${variant.stockQuantity} left in stock` : "In stock"}
                  </p>

                  {product.benefits.length > 0 && (
                    <ul className="mt-5 space-y-2 text-[15px] leading-snug text-ink/85">
                      {product.benefits.slice(0, 3).map((benefit) => (
                        <li key={benefit} className="flex gap-2.5">
                          <Check size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-emerald" /> {benefit}
                        </li>
                      ))}
                    </ul>
                  )}

                  {ingredients.length > 0 && (
                    <div className="mt-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">Key ingredients</p>
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {ingredients.map((name) => (
                          <li key={name} className="flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-[13px] text-ink">
                            <Leaf size={12} strokeWidth={1.6} className="text-emerald" /> {name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {product.skinType && (
                    <p className="mt-4 text-[14px] text-stone">
                      Suitable for <span className="text-ink">{product.skinType}</span>
                    </p>
                  )}

                  {variant && inStock && (
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <div className="flex h-12 items-center rounded-full border border-ink/15 bg-mist">
                        <button type="button" aria-label="One less" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex h-full w-11 items-center justify-center text-emerald hover:text-ink">
                          <Minus size={14} strokeWidth={1.6} />
                        </button>
                        <span className="w-6 text-center text-[15px] font-semibold tabular-nums" aria-live="polite">
                          {quantity}
                        </span>
                        <button type="button" aria-label="One more" onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))} className="flex h-full w-11 items-center justify-center text-emerald hover:text-ink">
                          <Plus size={14} strokeWidth={1.6} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          add(toCartItem(product), quantity);
                          flyToBasket(event.currentTarget, flightImage(product));
                          setAdded(true);
                        }}
                        className="flex h-12 min-w-[180px] flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ecdcb4] via-[#d2b077] to-[#c29b5e] px-6 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink shadow-[0_12px_24px_-14px_rgba(140,106,55,0.9)] transition hover:brightness-105 active:scale-[0.98]"
                      >
                        {added ? <Check size={16} strokeWidth={2} /> : <ShoppingBag size={16} strokeWidth={1.6} />}
                        {added ? "Added — add more" : "Add to bag"}
                      </button>
                      <WishButton product={product} className="h-12 w-12 bg-mist shadow-none" />
                    </div>
                  )}

                  <Link
                    href={href}
                    onClick={finishClose}
                    className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-emerald underline-offset-4 hover:underline"
                  >
                    See full details <ArrowRight size={15} strokeWidth={1.6} />
                  </Link>

                  {many && (
                    <div className="mt-6 flex gap-2 border-t border-ink/10 pt-5 md:hidden">
                      <button type="button" onClick={() => step(-1)} className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-ink/15 py-2.5 text-[13px] font-semibold">
                        <ChevronLeft size={16} strokeWidth={1.5} /> Previous
                      </button>
                      <button type="button" onClick={() => step(1)} className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-ink/15 py-2.5 text-[13px] font-semibold">
                        Next <ChevronRight size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {ghost && (
            <motion.div
              className="pointer-events-none fixed z-20"
              initial={ghost.from}
              animate={ghost.to}
              transition={{ duration: ghost.direction === "in" ? RISE_S : RETURN_S, ease: EASE }}
              onAnimationComplete={onGhostLanded}
            >
              <Image
                src={ghost.src}
                alt=""
                fill
                sizes="480px"
                className={ghost.cutout ? "object-contain p-[12%] drop-shadow-[0_30px_30px_rgba(0,0,0,0.25)]" : "rounded-[18px] object-cover"}
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
