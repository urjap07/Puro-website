import clsx from "clsx";

/** Price with a small raised rupee sign, as on marketplace listings. */
export default function Price({ value, size = "md", className }: { value: number; size?: "sm" | "md" | "lg"; className?: string }) {
  const amount = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
  return (
    <span className={clsx("inline-flex items-start font-display leading-none text-ink", className)}>
      <span className={clsx("mr-0.5", size === "lg" ? "mt-1.5 text-[18px]" : size === "md" ? "mt-1 text-[14px]" : "mt-0.5 text-[12px]")}>₹</span>
      <span className={size === "lg" ? "text-[44px]" : size === "md" ? "text-[30px]" : "text-[22px]"}>{amount}</span>
    </span>
  );
}
