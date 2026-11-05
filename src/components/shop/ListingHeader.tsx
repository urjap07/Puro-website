import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import type { Product } from "@/db/queries/products";
import Reveal from "@/components/ui/Reveal";

export interface ListingLink {
  label: string;
  href: string;
  active?: boolean;
}

interface ListingHeaderProps {
  eyebrow: string;
  title: string;
  description?: string | null;
  /** Lifestyle photograph faded into the emerald backdrop. */
  backdrop: string;
  /** Products shown standing in arches on the right (first two with images). */
  products?: Product[];
  count?: number;
  links?: ListingLink[];
}

export default function ListingHeader({
  eyebrow,
  title,
  description,
  backdrop,
  products = [],
  count,
  links = [],
}: ListingHeaderProps) {
  const showcase = products.filter((product) => product.images[0]).slice(0, 2);

  return (
    <section className="relative overflow-hidden bg-emerald-deep text-ivory">
      <Image
        src={backdrop}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-30 mix-blend-luminosity"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-deep via-emerald-deep/90 to-emerald-deep/40" />
      <div className="pointer-events-none absolute -left-32 -top-40 h-[480px] w-[480px] rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-52 right-10 h-[520px] w-[520px] rounded-full bg-emerald-soft/50 blur-3xl" />

      <div className="container-site relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:py-24">
        <Reveal className="min-w-0">
          <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-[0.22em] text-ivory/55">
            <Link href="/" className="hover:text-ivory">
              Home
            </Link>
            <span className="mx-3 text-gold-soft">/</span>
            <Link href="/shop" className="hover:text-ivory">
              Shop
            </Link>
          </nav>

          <p className="eyebrow mt-10 text-gold-soft">{eyebrow}</p>
          <h1 className="heading-xl mt-5">{title}</h1>
          {description && (
            <p className="mt-6 max-w-[480px] text-[16px] leading-[1.9] text-ivory/75">
              {description}
            </p>
          )}

          {count !== undefined && (
            <p className="mt-8 flex items-center gap-4 text-[11px] uppercase tracking-[0.24em] text-gold-soft">
              <span className="h-px w-10 bg-gold-soft/60" />
              {count} {count === 1 ? "ritual" : "rituals"}
            </p>
          )}

          {links.length > 0 && (
            <div className="no-scrollbar -mx-5 mt-8 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "whitespace-nowrap rounded-full border px-5 py-2.5 text-[13px] transition",
                    link.active
                      ? "border-gold-soft bg-gold-soft text-emerald-deep"
                      : "border-ivory/25 text-ivory/85 hover:border-gold-soft hover:text-gold-soft"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </Reveal>

        {showcase.length > 0 && (
          <div className="hidden justify-center gap-6 lg:flex">
            {showcase.map((product, index) => (
              <Reveal key={product.id} delay={0.15 + index * 0.15}>
                <Link
                  href={`/products/${product.slug}`}
                  className={clsx("group block w-[210px] xl:w-[230px]", index === 1 && "mt-16")}
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-t-full bg-parchment p-2.5 ring-1 ring-gold/40 ring-offset-[6px] ring-offset-emerald-deep transition duration-700 group-hover:ring-gold">
                    <div className="relative h-full w-full overflow-hidden rounded-t-full bg-parchment">
                      <Image
                        src={product.images[0].imageUrl}
                        alt={product.name}
                        fill
                        sizes="230px"
                        className="object-cover mix-blend-multiply transition duration-[1400ms] group-hover:scale-105"
                      />
                    </div>
                  </div>
                  <p className="mt-4 text-center font-display text-[18px] text-ivory/90 transition group-hover:text-gold-soft">
                    {product.name}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
