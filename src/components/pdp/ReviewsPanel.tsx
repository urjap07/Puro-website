import { MessageSquareQuote } from "lucide-react";
import type { Product, Review } from "@/db/queries/products";
import StarRating from "@/components/commerce/StarRating";

const DATE = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" });

/**
 * Customer reviews: the overall rating, a star breakdown where it can be
 * known for certain, and the written reviews.
 */
export default function ReviewsPanel({ product, reviews }: { product: Product; reviews: Review[] }) {
  const rating = product.rating;
  // The aggregate came from the previous store; its star split is only certain when every rating was 5★.
  const allFive = rating && rating.value >= 4.995;

  return (
    <div className="grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-14">
      <div>
        {rating ? (
          <>
            <div className="flex items-end gap-3">
              <span className="font-display text-[64px] leading-none text-ink">{rating.value.toFixed(1)}</span>
              <span className="mb-2 text-[14px] text-stone">out of 5</span>
            </div>
            <StarRating value={rating.value} size={18} className="mt-2" />
            <p className="mt-2 text-[14px] text-stone">{rating.count} customer ratings</p>
            {allFive && (
              <ul className="mt-6 space-y-2.5">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <li key={stars} className="flex items-center gap-3 text-[13px]">
                    <span className="w-12 shrink-0 text-emerald">{stars} star</span>
                    <span className="h-3 flex-1 overflow-hidden rounded-full bg-mist-deep">
                      <span className="block h-full rounded-full bg-gradient-to-r from-gold to-gold-soft" style={{ width: stars === 5 ? "100%" : "0%" }} />
                    </span>
                    <span className="w-10 shrink-0 text-right text-stone">{stars === 5 ? "100%" : "0%"}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="text-[15px] text-stone">No ratings yet.</p>
        )}
        <div className="mt-8 rounded-[18px] bg-mist p-5">
          <p className="font-display text-[22px] leading-tight text-ink">Tried this ritual?</p>
          <p className="mt-1 text-[14px] text-stone">We&rsquo;d love to hear how it felt. Reviews open with online ordering.</p>
        </div>
      </div>

      <div>
        {reviews.length === 0 ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-[22px] border border-dashed border-ink/15 p-8 text-center">
            <MessageSquareQuote size={30} strokeWidth={1} className="text-emerald/60" />
            <p className="mt-4 font-display text-[26px] text-ink">No written reviews yet</p>
            <p className="mt-1 text-[14px] text-stone">Ratings above were shared by customers of our previous store.</p>
          </div>
        ) : (
          <ul className="space-y-5">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-[22px] bg-mist p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald font-display text-[18px] text-ivory">
                    {review.author.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold text-ink">{review.author}</span>
                    {review.createdAt && <span className="block text-[12px] text-stone">Reviewed on {DATE.format(new Date(review.createdAt))}</span>}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <StarRating value={review.rating} size={14} />
                  {review.title && <p className="font-display text-[20px] leading-tight text-ink">{review.title}</p>}
                </div>
                {review.comment && <p className="mt-3 text-[15px] leading-[1.8] text-ink/80">{review.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
