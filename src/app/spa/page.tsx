import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import SpaCatalogue from "@/components/business/SpaCatalogue";
import { SPA_CATEGORIES } from "@/lib/business";

export const metadata: Metadata = {
  title: "Spa Products",
  description:
    "Professional spa products by Puro Body & Soul — massage oils, body scrubs and polishes, foot care, face care, body and foot wraps and essential oil blends. Request a bulk quote.",
  alternates: { canonical: "/spa" },
};

const BADGES = [
  { src: "/media/badges/natural-ingredients.png", label: "Natural ingredients" },
  { src: "/media/badges/no-petroleum-mineral-oil.png", label: "No petroleum or mineral oil" },
  { src: "/media/badges/silicone-paraben-free.png", label: "Silicone & paraben free" },
  { src: "/media/badges/peta-cruelty-free.png", label: "Cruelty-free" },
  { src: "/media/badges/gmp-certified.png", label: "GMP certified" },
];

export default function SpaPage() {
  const total = SPA_CATEGORIES.reduce((sum, category) => sum + category.items.length, 0);
  const facts = [
    { value: String(total), label: "spa products" },
    { value: String(SPA_CATEGORIES.length), label: "treatment categories" },
    { value: "Bulk", label: "supply & pricing" },
  ];

  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="container-site pt-8 sm:pt-12">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-stone">
          <Link href="/" className="underline-offset-4 hover:text-midnight hover:underline">
            Home
          </Link>
          <ChevronRight size={13} strokeWidth={1.4} />
          <span className="text-ink">Spa products</span>
        </nav>
        <div className="mt-6 grid items-stretch gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="glass tint-quartz flex flex-col justify-center rounded-[32px] p-7 sm:rounded-[40px] sm:p-12">
            <p className="label relative z-[2] text-[#8E4F5B]">For spas &amp; salons</p>
            <h1 className="relative z-[2] mt-5 font-display text-[46px] font-light leading-[1] text-midnight sm:text-[68px]">
              Rituals your guests <em className="text-iris pr-1">remember</em>
            </h1>
            <p className="relative z-[2] mt-5 max-w-[520px] text-[16px] leading-[1.8] text-graphite">
              Aromatic massage oils, glowing scrubs, rich wraps and soothing foot care — natural formulations made for professional treatments and supplied in bulk.
            </p>
            <dl className="relative z-[2] mt-8 grid grid-cols-3 gap-3">
              {facts.map((fact) => (
                <div key={fact.label} className="rounded-[20px] bg-white/60 px-3 py-4 text-center">
                  <dt className="sr-only">{fact.label}</dt>
                  <dd className="font-display text-[32px] leading-none text-midnight sm:text-[40px]">{fact.value}</dd>
                  <dd className="mt-1.5 text-[11px] font-medium uppercase leading-tight tracking-[0.14em] text-stone">{fact.label}</dd>
                </div>
              ))}
            </dl>
            <div className="relative z-[2] mt-8 flex flex-wrap gap-3">
              <a href="#spa-panel" className="btn-primary !px-8 !py-3.5">
                Explore the range
              </a>
              <a href="#quote" className="btn-glass !px-8 !py-3.5">
                Get a bulk quote
              </a>
            </div>
          </div>
          <div className="relative min-h-[300px] overflow-hidden rounded-[32px] sm:min-h-[420px] sm:rounded-[40px]">
            <Image src="/media/spa/spa-products.webp" alt="PURO body scrubs in glass jars" fill priority sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-midnight-deep/70 to-transparent p-5 pt-16 sm:p-7 sm:pt-20">
              <ul className="flex flex-wrap gap-2">
                {BADGES.map((badge) => (
                  <li key={badge.label} className="flex items-center gap-2 rounded-full bg-white/90 py-1 pl-1 pr-3 text-[12px] font-medium text-midnight">
                    <Image src={badge.src} alt="" width={28} height={28} className="h-7 w-7" />
                    {badge.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <SpaCatalogue categories={SPA_CATEGORIES} />
    </div>
  );
}
