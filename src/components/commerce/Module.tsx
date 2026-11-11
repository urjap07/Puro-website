import Link from "next/link";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";

/**
 * A marketplace content module: a rounded card with a title row and an
 * optional "See all"-style link — the shared frame for every homepage section.
 */
export default function Module({
  id,
  title,
  note,
  link,
  tone = "light",
  children,
  className,
}: {
  id?: string;
  title: React.ReactNode;
  note?: React.ReactNode;
  link?: { label: string; href: string };
  tone?: "light" | "dark";
  children: React.ReactNode;
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <section id={id} className={clsx("container-site scroll-mt-28", className)}>
      <div
        className={clsx(
          "rounded-[28px] p-5 sm:p-8 lg:p-10",
          dark
            ? "bg-noir text-ivory shadow-[0_40px_80px_-50px_rgba(5,38,47,0.9)] ring-1 ring-gold/20"
            : "bg-ivory shadow-[0_30px_60px_-46px_rgba(6,48,58,0.6)] ring-1 ring-ink/[0.06]",
        )}
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8">
          <div className="max-w-[720px]">
            <h2 className={clsx("font-display text-[30px] leading-[1.05] sm:text-[40px]", dark ? "text-ivory" : "text-ink")}>{title}</h2>
            {note && <p className={clsx("mt-2 text-[15px] leading-relaxed", dark ? "text-ivory/70" : "text-stone")}>{note}</p>}
          </div>
          {link && (
            <Link
              href={link.href}
              className={clsx(
                "inline-flex items-center gap-1.5 text-[14px] font-semibold underline-offset-4 hover:underline",
                dark ? "text-gold-soft" : "text-emerald",
              )}
            >
              {link.label} <ArrowRight size={14} strokeWidth={1.6} />
            </Link>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
