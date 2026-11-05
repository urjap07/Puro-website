"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Product } from "@/db/queries/products";
import ProductCard from "@/components/product/ProductCard";

/** Swipeable row of product cards with arrow controls (scroll-snap, no library). */
export default function ProductCarousel({ products }: { products: Product[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const scrollBy = (direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const arrow = (disabled: boolean) =>
    clsx(
      "flex h-12 w-12 items-center justify-center rounded-full border transition",
      disabled
        ? "cursor-default border-line text-line"
        : "border-emerald/30 text-emerald hover:border-emerald hover:bg-emerald hover:text-ivory"
    );

  return (
    <div>
      <div
        ref={track}
        onScroll={update}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto scroll-smooth px-5 sm:-mx-8 sm:scroll-px-8 sm:gap-6 sm:px-8 lg:-mx-12 lg:scroll-px-12 lg:px-12"
      >
        {products.map((product, index) => (
          <div
            key={product.id}
            className="w-[72%] shrink-0 snap-start sm:w-[42%] lg:w-[calc((100%-4.5rem)/4)]"
          >
            <ProductCard product={product} priority={index < 4} />
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center gap-3">
        <button
          type="button"
          aria-label="Previous products"
          disabled={edges.start}
          onClick={() => scrollBy(-1)}
          className={arrow(edges.start)}
        >
          <ArrowLeft size={17} strokeWidth={1.1} />
        </button>
        <button
          type="button"
          aria-label="Next products"
          disabled={edges.end}
          onClick={() => scrollBy(1)}
          className={arrow(edges.end)}
        >
          <ArrowRight size={17} strokeWidth={1.1} />
        </button>
      </div>
    </div>
  );
}
