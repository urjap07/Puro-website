import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";

interface Crumb {
  label: string;
  href?: string;
}

/** Compact, luxurious band at the top of shop, search and collection pages. */
export default function ResultsHero({
  crumbs,
  eyebrow,
  title,
  description,
  image,
  links,
}: {
  crumbs: Crumb[];
  eyebrow: string;
  title: React.ReactNode;
  description?: string | null;
  image?: string;
  links?: { label: string; href: string; active?: boolean }[];
}) {
  return (
    <section className="bg-noir text-ivory">
      {image && (
        <div className="absolute inset-y-0 right-0 hidden w-[46%] md:block">
          <Image src={image} alt="" fill priority sizes="46vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07303b] via-[#07303b]/60 to-transparent" />
        </div>
      )}
      <div className="container-site relative py-10 sm:py-14">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[13px] text-ivory/55">
          {crumbs.map((crumb, index) => (
            <span key={crumb.label} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight size={13} strokeWidth={1.4} />}
              {crumb.href ? (
                <Link href={crumb.href} className="transition hover:text-gold-soft">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-ivory/85">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
        <p className="eyebrow mt-6 text-gold-soft">{eyebrow}</p>
        <h1 className="mt-3 max-w-[760px] font-display text-[44px] leading-[1] sm:text-[64px]">{title}</h1>
        {description && <p className="mt-4 max-w-[560px] text-[16px] leading-[1.75] text-ivory/70">{description}</p>}
        {links && links.length > 0 && (
          <div className="no-scrollbar -mx-5 mt-7 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition",
                  link.active
                    ? "border-gold-soft bg-gold-soft text-ink"
                    : "border-ivory/20 text-ivory/85 hover:border-gold-soft hover:text-gold-soft",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
