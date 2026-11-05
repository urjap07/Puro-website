import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Review } from "@/db/queries/products";
import Reveal from "@/components/ui/Reveal";

interface TestimonialsProps {
  reviews: Review[];
  totalReviews: number;
  averageRating: number;
}

export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={size}
          strokeWidth={1}
          className={index < Math.round(rating) ? "fill-gold-soft text-gold-soft" : "text-ivory/40"}
        />
      ))}
    </span>
  );
}

export default function Testimonials({ reviews, totalReviews, averageRating }: TestimonialsProps) {
  if (reviews.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-24 text-ivory sm:py-32">
      <Image
        src="/media/products/sheavibe-lotion/04.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-emerald-deep/85" />

      <div className="container-site relative">
        <Reveal className="text-center">
          <p className="eyebrow text-gold-soft">Loved by our customers</p>
          <h2 className="heading-lg mt-5">
            Kind words, <em className="text-gold-soft">real rituals</em>
          </h2>
          <div className="mt-6 flex items-center justify-center gap-3 text-[13px] text-ivory/70">
            <Stars rating={averageRating} />
            <span>
              {averageRating.toFixed(1)} average from {totalReviews} reviews
            </span>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {reviews.map((review, index) => (
            <Reveal key={review.id} delay={index * 0.1}>
              <figure className="flex h-full flex-col rounded-2xl border border-ivory/15 bg-ivory/[0.04] p-8 backdrop-blur-sm">
                <Stars rating={review.rating} />
                {review.title && (
                  <p className="mt-6 font-display text-[22px] italic leading-snug text-ivory">
                    &ldquo;{review.title}&rdquo;
                  </p>
                )}
                <blockquote className="mt-4 flex-1 text-[14px] leading-[1.85] text-ivory/75">
                  {review.comment}
                </blockquote>
                <figcaption className="mt-8 border-t border-ivory/15 pt-5 text-[12px]">
                  <span className="text-ivory">{review.author}</span>
                  <span className="text-ivory/50"> · Verified customer</span>
                  <Link
                    href={`/products/${review.productSlug}`}
                    className="mt-1 block text-[10px] uppercase tracking-[0.22em] text-gold-soft hover:text-ivory"
                  >
                    {review.productName}
                  </Link>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
