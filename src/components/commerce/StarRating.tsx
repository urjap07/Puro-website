import clsx from "clsx";
import { Star } from "lucide-react";

/** Five stars with partial fill for the rating, plus an optional count. */
export default function StarRating({
  value,
  count,
  size = 14,
  className,
  light = false,
}: {
  value: number;
  count?: number;
  size?: number;
  className?: string;
  light?: boolean;
}) {
  return (
    <span className={clsx("inline-flex items-center gap-1.5", className)} aria-label={`${value.toFixed(1)} out of 5 stars${count ? `, ${count} reviews` : ""}`}>
      <span className={clsx("text-[13px] font-semibold", light ? "text-ivory" : "text-ink")}>{value.toFixed(1)}</span>
      <span className="relative inline-flex">
        <span className="inline-flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={size} strokeWidth={1.2} className={light ? "text-ivory/30" : "text-gold/40"} />
          ))}
        </span>
        <span className="absolute inset-0 inline-flex gap-0.5 overflow-hidden" style={{ width: `${(value / 5) * 100}%` }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={size} strokeWidth={1.2} className="shrink-0 fill-gold text-gold" />
          ))}
        </span>
      </span>
      {count !== undefined && <span className={clsx("text-[13px]", light ? "text-ivory/60" : "text-emerald underline-offset-2 hover:underline")}>({count})</span>}
    </span>
  );
}
