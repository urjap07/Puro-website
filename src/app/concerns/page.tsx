import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { ArrowUpRight, ChevronRight, Sparkles } from "lucide-react";
import { getActiveProducts, getConcerns } from "@/db/queries/products";
import { TINT, concernTint } from "@/components/commerce/tints";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Skin & Hair Concerns",
  description: "Explore PURO formulas by skin and hair concern — brightening, tan, pores, dry skin, oily scalp, hair fall and more.",
  alternates: { canonical: "/concerns" },
};

export default async function ConcernsPage() {
  const [concerns, products] = await Promise.all([getConcerns(), getActiveProducts()]);
  const formulasFor = (slug: string) => products.filter((product) => product.concerns.some((concern) => concern.slug === slug));

  // Give each concern its own photograph: the first matching product not already pictured.
  const pictured = new Set<number>();
  const imageFor = Object.fromEntries(
    concerns.map((concern) => {
      const formulas = formulasFor(concern.slug);
      const pick = formulas.find((product) => !pictured.has(product.id)) ?? formulas[0];
      if (pick) pictured.add(pick.id);
      return [concern.slug, pick?.images[1]?.imageUrl ?? pick?.images[0]?.imageUrl ?? null];
    }),
  );

  const groups = [
    { type: "skin" as const, title: "Skin", note: "For face and body" },
    { type: "hair" as const, title: "Hair & scalp", note: "From root to tip" },
  ];

  return (
    <div className="pb-24">
      <section className="container-site pt-8 sm:pt-12">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-stone">
          <Link href="/" className="underline-offset-4 hover:text-midnight hover:underline">
            Home
          </Link>
          <ChevronRight size={13} strokeWidth={1.4} />
          <span className="text-ink">Concerns</span>
        </nav>
        <header className="mx-auto mt-8 max-w-[760px] text-center">
          <p className="label justify-center text-[#8E4F5B]">Shop by concern</p>
          <h1 className="mt-5 font-display text-[48px] font-light leading-[1] text-midnight sm:text-[72px]">
            What would you like <em className="text-iris pr-1">to care for?</em>
          </h1>
          <p className="mx-auto mt-5 max-w-[540px] text-[16px] leading-[1.8] text-stone">
            Choose a concern to see the formulas made for it, or let the skincare finder suggest a ritual.
          </p>
          <Link href="/finder" className="btn-iris mt-8 !px-9 !py-3.5">
            <Sparkles size={15} strokeWidth={1.6} /> Take the skincare finder
          </Link>
        </header>
      </section>

      {groups.map((group) => {
        const list = concerns.filter((concern) => concern.type === group.type);
        if (!list.length) return null;
        return (
          <section key={group.type} aria-labelledby={`concerns-${group.type}`} className="container-site mt-14">
            <div className="flex items-end justify-between gap-4">
              <h2 id={`concerns-${group.type}`} className="font-display text-[36px] leading-tight text-midnight sm:text-[46px]">
                {group.title}
              </h2>
              <p className="text-[13px] text-stone">{group.note}</p>
            </div>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {list.map((concern) => {
                const tint = TINT[concernTint(concern)];
                const formulas = formulasFor(concern.slug);
                const image = imageFor[concern.slug];
                return (
                  <li key={concern.slug}>
                    <Link href={`/concerns/${concern.slug}`} className={clsx("glass glass-hover group flex h-full flex-col rounded-[28px] p-3", tint.glass)}>
                      <span className="relative block aspect-[5/4] overflow-hidden rounded-[22px] bg-white/50">
                        {image && (
                          <Image
                            src={image}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 100vw"
                            className="object-cover transition duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                          />
                        )}
                        <span className="absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold text-midnight backdrop-blur">
                          {formulas.length} {formulas.length === 1 ? "formula" : "formulas"}
                        </span>
                      </span>
                      <span className="relative z-[2] flex flex-1 flex-col px-2 pb-2 pt-4">
                        <span className="flex items-start justify-between gap-2">
                          <span className="font-display text-[26px] leading-[1.05] text-midnight">{concern.name}</span>
                          <ArrowUpRight size={16} strokeWidth={1.5} className="mt-1.5 shrink-0 text-stone transition group-hover:text-midnight" />
                        </span>
                        {concern.description && <span className="mt-2 text-[14px] leading-[1.6] text-graphite/85">{concern.description}</span>}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <p className="container-site mt-12 text-center text-[12px] leading-[1.7] text-stone">
        Concerns describe what each formula is designed for. They aren&rsquo;t a diagnosis; for skin or scalp conditions please
        speak to a dermatologist.
      </p>
    </div>
  );
}
