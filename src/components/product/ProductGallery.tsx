"use client";

import { useState, type MouseEvent } from "react";
import Image from "next/image";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import type { Product } from "@/db/queries/products";
import WishButton from "@/components/cart/WishButton";
import ImagePlaceholder from "./ImagePlaceholder";

/** Thumbnails beside a large image that zooms where you hover. */
export default function ProductGallery({ product }: { product: Product }) {
  const { images } = product;
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  if (images.length === 0) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-[24px]">
        <ImagePlaceholder name={product.name} />
      </div>
    );
  }

  const current = images[active];
  const go = (step: number) => setActive((i) => (i + step + images.length) % images.length);
  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setZoom({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 });
  };

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row">
      {images.length > 1 && (
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto lg:max-h-[600px] lg:w-[76px] lg:shrink-0 lg:flex-col lg:overflow-y-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(index)}
              onMouseEnter={() => setActive(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={index === active}
              className={clsx(
                "relative aspect-square w-[64px] shrink-0 overflow-hidden rounded-[14px] bg-[radial-gradient(ellipse_80%_65%_at_50%_45%,#ffffff_0%,#f3ece1_60%,#e6dccb_100%)] transition lg:w-full",
                index === active ? "ring-2 ring-emerald ring-offset-2 ring-offset-[#fbf8f3]" : "opacity-70 ring-1 ring-ink/10 hover:opacity-100",
              )}
            >
              <Image src={image.imageUrl} alt="" fill sizes="76px" className="object-cover mix-blend-multiply" />
            </button>
          ))}
        </div>
      )}

      <div
        data-fly-source
        className="group relative aspect-square flex-1 cursor-zoom-in overflow-hidden rounded-[26px] bg-[radial-gradient(ellipse_75%_62%_at_50%_44%,#ffffff_0%,#f5efe5_58%,#e7ddcc_100%)] ring-1 ring-ink/[0.06]"
        onMouseMove={onMove}
        onMouseLeave={() => setZoom(null)}
      >
        <Image
          key={current.id}
          src={current.imageUrl}
          alt={current.altText ?? product.name}
          fill
          priority
          sizes="(min-width: 1024px) 42vw, 100vw"
          className="object-cover mix-blend-multiply transition-transform duration-300 ease-out"
          style={zoom ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
        />
        <WishButton product={product} className="absolute right-4 top-4 h-11 w-11" />
        <span className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-ivory/90 px-3 py-1.5 text-[12px] text-stone backdrop-blur transition group-hover:opacity-0">
          <ZoomIn size={13} strokeWidth={1.5} /> Hover to zoom · {active + 1} / {images.length}
        </span>
        {images.length > 1 && (
          <>
            {[-1, 1].map((step) => (
              <button
                key={step}
                type="button"
                aria-label={step < 0 ? "Previous image" : "Next image"}
                onClick={() => go(step)}
                className={clsx(
                  "absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/90 text-ink shadow-md backdrop-blur transition hover:bg-emerald hover:text-ivory lg:opacity-0 lg:group-hover:opacity-100",
                  step < 0 ? "left-3" : "right-3",
                )}
              >
                {step < 0 ? <ChevronLeft size={18} strokeWidth={1.4} /> : <ChevronRight size={18} strokeWidth={1.4} />}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
