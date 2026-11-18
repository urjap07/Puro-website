"use client";

import { useState } from "react";
import type { Review } from "@/db/queries/products";
import StarRating from "@/components/commerce/StarRating";

const DATE = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" });
const FIRST = 5;

/** Written reviews: the first few, then "Show all". */
export default function ReviewList({ reviews }: { reviews: Review[] }) {
  const [all, setAll] = useState(false);
  const shown = all ? reviews : reviews.slice(0, FIRST);
  return (
    <>
      <ul className="space-y-5">
        {shown.map((review) => (
          <li key={review.id} className="glass tint-quartz rounded-[28px] p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f6e3c8_0%,#f2c9c4_35%,#d9c8ec_70%,#bfe2e3_100%)] font-display text-[19px] text-midnight-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_8px_16px_-10px_rgba(125,104,168,0.7)]">
                {review.author.charAt(0)}
              </span>
              <span>
                <span className="block text-[15px] font-semibold text-ink">{review.author}</span>
                {review.createdAt && <span className="block text-[12px] text-stone">Reviewed on {DATE.format(new Date(review.createdAt))}</span>}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <StarRating value={review.rating} size={14} />
              {review.title && <p className="font-display text-[20px] leading-tight text-midnight">{review.title}</p>}
            </div>
            {review.comment && <p className="mt-3 text-[15px] leading-[1.8] text-graphite">{review.comment}</p>}
          </li>
        ))}
      </ul>
      {reviews.length > FIRST && (
        <div className="mt-6 text-center">
          <button type="button" onClick={() => setAll(!all)} className="btn-glass !px-8 !py-3" aria-expanded={all}>
            {all ? "Show fewer reviews" : `Show all ${reviews.length} reviews`}
          </button>
        </div>
      )}
    </>
  );
}
