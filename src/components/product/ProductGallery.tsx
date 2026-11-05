"use client";

import { useState, type MouseEvent } from "react";
import Image from "next/image";
import clsx from "clsx";
import type { Product } from "@/db/queries/products";
import ImagePlaceholder from "./ImagePlaceholder";

export default function ProductGallery({ product }: { product: Product }) {
  const { images } = product;
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  if (images.length === 0) {
    return (
      <div className="relative aspect-[4/5] w-full">
        <ImagePlaceholder name={product.name} />
      </div>
    );
  }

  const current = images[active];

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      {images.length > 1 && (
        <div className="no-scrollbar flex gap-3 overflow-x-auto lg:w-[88px] lg:shrink-0 lg:flex-col">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={index === active}
              className={clsx(
                "relative aspect-[4/5] w-[72px] shrink-0 overflow-hidden bg-mist-card transition lg:w-full",
                index === active ? "ring-1 ring-gold ring-offset-2 ring-offset-mist" : "opacity-60 hover:opacity-100"
              )}
            >
              <Image src={image.imageUrl} alt="" fill sizes="88px" className="object-cover mix-blend-multiply" />
            </button>
          ))}
        </div>
      )}

      <div
        className="relative aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden bg-mist-card"
        onMouseMove={onMove}
        onMouseLeave={() => setZoom(null)}
      >
        <Image
          key={current.id}
          src={current.imageUrl}
          alt={current.altText ?? product.name}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover mix-blend-multiply transition-transform duration-300 ease-out"
          style={
            zoom
              ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
              : undefined
          }
        />
      </div>
    </div>
  );
}
