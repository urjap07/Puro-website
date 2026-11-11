import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";

export interface CategoryCard {
  title: string;
  href: string;
  cta: string;
  /** Four product tiles, or one feature image. */
  tiles?: { label: string; href: string; image: string; cutout: boolean }[];
  image?: string;
  note?: string;
  dark?: boolean;
}

/** Marketplace-style category cards: a title, a 2×2 of products, a link. */
export default function CategoryCards({ cards }: { cards: CategoryCard[] }) {
  return (
    // On phones the cards sit side by side and swipe instead of stacking into a very long column.
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.title}
          className={clsx(
            "group/card flex w-[82%] shrink-0 snap-center flex-col rounded-[26px] p-5 sm:w-auto shadow-[0_30px_60px_-40px_rgba(6,48,58,0.6)] ring-1 transition duration-500 hover:-translate-y-1 hover:shadow-[0_40px_70px_-36px_rgba(6,48,58,0.7)]",
            card.dark ? "bg-noir text-ivory ring-gold/25" : "bg-ivory ring-ink/[0.06]",
          )}
        >
          <h3 className="font-display text-[26px] leading-[1.08]">{card.title}</h3>
          {card.note && <p className={clsx("mt-1 text-[14px]", card.dark ? "text-ivory/65" : "text-stone")}>{card.note}</p>}

          {card.tiles ? (
            <div className="mt-4 grid flex-1 grid-cols-2 gap-3">
              {card.tiles.map((tile) => (
                <Link key={tile.href + tile.label} href={tile.href} className="group/tile block">
                  <span
                    className={clsx(
                      "relative block aspect-square overflow-hidden rounded-[16px]",
                      card.dark ? "bg-ivory/[0.08]" : "bg-[radial-gradient(ellipse_75%_62%_at_50%_44%,#ffffff_0%,#f5efe5_60%,#e7ddcc_100%)]",
                    )}
                  >
                    <Image
                      src={tile.image}
                      alt=""
                      fill
                      sizes="(min-width: 1280px) 10vw, 22vw"
                      className={clsx(
                        "transition duration-700 group-hover/tile:scale-[1.07]",
                        tile.cutout ? "object-contain p-[12%] drop-shadow-[0_10px_12px_rgba(0,0,0,0.18)]" : "object-cover",
                      )}
                    />
                  </span>
                  <span className={clsx("mt-1.5 block truncate text-[13px]", card.dark ? "text-ivory/80" : "text-ink/80")}>{tile.label}</span>
                </Link>
              ))}
            </div>
          ) : (
            card.image && (
              <Link href={card.href} className="relative mt-4 block flex-1 overflow-hidden rounded-[18px]" style={{ minHeight: 260 }}>
                <Image src={card.image} alt="" fill sizes="(min-width: 1280px) 22vw, 45vw" className="object-cover transition duration-[1200ms] group-hover/card:scale-[1.06]" />
              </Link>
            )
          )}

          <Link
            href={card.href}
            className={clsx(
              "mt-4 inline-flex w-fit items-center gap-1.5 text-[14px] font-semibold underline-offset-4 hover:underline",
              card.dark ? "text-gold-soft" : "text-emerald",
            )}
          >
            {card.cta} <ArrowRight size={14} strokeWidth={1.6} className="transition group-hover/card:translate-x-1" />
          </Link>
        </article>
      ))}
    </div>
  );
}
