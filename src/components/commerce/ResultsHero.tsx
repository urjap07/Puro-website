import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";
import { TINT, type Tint } from "./tints";

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
  tint = "apricot",
}: {
  crumbs: Crumb[];
  eyebrow: string;
  title: React.ReactNode;
  description?: string | null;
  image?: string;
  links?: { label: string; href: string; active?: boolean; tint?: Tint }[];
  /** Colour of the glass: a collection's or concern's tint. */
  tint?: Tint;
}) {
  const colour = TINT[tint];
  return (
    <section className="container-site pt-4 sm:pt-6">
      <div className={clsx("glass relative overflow-hidden rounded-[28px] p-3 sm:rounded-[36px] sm:p-4", colour.glass)}>
        <div className={clsx("grid items-stretch gap-4", image && "md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]")}>
          <div className="px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[13px] text-stone">
              {crumbs.map((crumb, index) => (
                <span key={crumb.label} className="flex items-center gap-1.5">
                  {index > 0 && <ChevronRight size={13} strokeWidth={1.4} />}
                  {crumb.href ? (
                    <Link href={crumb.href} className="rounded-sm transition hover:text-midnight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-midnight">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
            <p className={clsx("eyebrow mt-6", colour.text)}>{eyebrow}</p>
            <h1 className="mt-3 font-display text-[44px] leading-[1] text-midnight sm:text-[64px] [&_em]:text-iris [&_em]:pr-1">{title}</h1>
            {description && <p className="mt-4 max-w-[560px] text-[16px] leading-[1.75] text-graphite">{description}</p>}
            {links && links.length > 0 && (
              <div className="no-scrollbar -mx-3 mt-7 flex gap-2 overflow-x-auto px-3 py-1 sm:mx-0 sm:flex-wrap sm:px-0">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={link.active ? "page" : undefined}
                    className={clsx(
                      "shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight",
                      link.active
                        ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0)_55%),linear-gradient(110deg,#f6e3c8_0%,#f2c9c4_30%,#d9c8ec_62%,#bfe2e3_100%)] font-semibold text-midnight-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(125,104,168,0.25),0_10px_24px_-12px_rgba(125,104,168,0.6)]"
                        : clsx("glass glass-hover text-midnight", link.tint && TINT[link.tint].glass),
                    )}
                  >
                    {link.tint && !link.active && <span aria-hidden="true" className={clsx("mr-2 inline-block h-2 w-2 rounded-full align-middle", TINT[link.tint].dot)} />}
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {image && (
            <div className="relative hidden min-h-[300px] overflow-hidden rounded-[22px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6),0_24px_48px_-30px_rgba(14,39,42,0.5)] sm:rounded-[28px] md:block">
              <Image src={image} alt="" fill priority sizes="(min-width: 768px) 45vw, 0px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/25 via-transparent to-transparent" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
