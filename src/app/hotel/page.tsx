import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { ChevronRight, Hotel } from "lucide-react";
import QuoteForm from "@/components/business/QuoteForm";
import { AMENITY_RANGES, CLIENT_LOGOS, HOTEL_CLIENTS, HOTEL_INTRO } from "@/lib/business";

export const metadata: Metadata = {
  title: "Hotel Amenities",
  description:
    "Luxury hotel toiletries and amenities by Puro Body & Soul — natural formulations with pure essential oils and 100% paraben-free preservatives. Four signature ranges; request a price quote.",
  alternates: { canonical: "/hotel" },
};

const TINTS = ["tint-sage", "tint-saffron", "tint-aqua", "tint-quartz"];

export default function HotelPage() {
  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="container-site pt-8 sm:pt-12">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-stone">
          <Link href="/" className="underline-offset-4 hover:text-midnight hover:underline">
            Home
          </Link>
          <ChevronRight size={13} strokeWidth={1.4} />
          <span className="text-ink">Hotel amenities</span>
        </nav>
        <div className="glass tint-champagne mt-6 grid overflow-hidden rounded-[32px] sm:rounded-[40px] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="relative z-[2] px-6 py-10 sm:px-12 sm:py-14">
            <p className="label text-[#66532F]">For hotels</p>
            <h1 className="mt-5 font-display text-[46px] font-light leading-[1] text-midnight sm:text-[64px]">
              Exclusive <em className="text-iris pr-1">hotel collection</em>
            </h1>
            {HOTEL_INTRO.map((paragraph) => (
              <p key={paragraph} className="mt-5 max-w-[560px] text-[16px] leading-[1.8] text-graphite">
                {paragraph}
              </p>
            ))}
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#quote" className="btn-primary !px-8 !py-3.5">
                Get a price quote
              </a>
              <a href="#ranges" className="btn-glass !px-7 !py-3.5">
                See the ranges
              </a>
            </div>
          </div>
          <div className="relative min-h-[300px] lg:min-h-full">
            <Image src={AMENITY_RANGES[1].image} alt="Aromatherapy Naturelles hotel amenities" fill priority sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Trusted by */}
      <section aria-labelledby="clients-title" className="container-site mt-14">
        <h2 id="clients-title" className="text-center text-[12px] font-semibold uppercase tracking-[0.24em] text-stone">
          Trusted by hotels, spas and brands
        </h2>
        <ul className="mt-6 grid grid-cols-3 items-center gap-4 sm:grid-cols-6">
          {CLIENT_LOGOS.map((logo) => (
            <li key={logo.name} className="glass flex h-24 items-center justify-center rounded-[20px] p-4">
              <Image src={logo.src} alt={logo.name} width={logo.width} height={logo.height} className="relative z-[2] max-h-16 w-auto object-contain" />
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-5 max-w-[760px] text-center text-[14px] leading-[1.7] text-stone">
          Our amenities are chosen by hotels including {HOTEL_CLIENTS.slice(0, -1).join(", ")} and {HOTEL_CLIENTS.at(-1)}, and numerous independent luxury hotels.
        </p>
      </section>

      {/* Ranges */}
      <section id="ranges" aria-labelledby="ranges-title" className="container-site mt-16 scroll-mt-28">
        <div className="text-center">
          <p className="label justify-center text-[#5E4B8A]">Signature ranges</p>
          <h2 id="ranges-title" className="mt-4 font-display text-[38px] leading-tight text-midnight sm:text-[48px]">
            Four scents for your <em className="text-iris pr-1">guests</em>
          </h2>
        </div>
        <div className="mt-10 space-y-6">
          {AMENITY_RANGES.map((range, index) => (
            <article
              key={range.slug}
              id={range.slug}
              className={clsx("glass grid scroll-mt-28 overflow-hidden rounded-[32px] p-3 md:grid-cols-2 md:gap-4", TINTS[index % TINTS.length])}
            >
              <div className={clsx("relative aspect-[3/2] overflow-hidden rounded-[24px]", index % 2 === 1 && "md:order-last")}>
                <Image src={range.image} alt={`${range.name} hotel amenities`} fill sizes="(min-width: 768px) 46vw, 100vw" className="object-cover" />
              </div>
              <div className="relative z-[2] px-4 py-6 sm:px-8">
                <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-stone">{range.scent}</p>
                <h3 className="mt-2 font-display text-[34px] leading-tight text-midnight">{range.name}</h3>
                <p className="mt-3 text-[15px] leading-[1.75] text-graphite">{range.description}</p>
                <table className="mt-5 w-full overflow-hidden rounded-[16px] text-left text-[14px]">
                  <caption className="sr-only">{range.name} — products, packing and size</caption>
                  <thead>
                    <tr className="bg-white/70 text-[11px] uppercase tracking-[0.16em] text-stone">
                      <th scope="col" className="px-4 py-2.5 font-semibold">Product</th>
                      <th scope="col" className="px-4 py-2.5 font-semibold">Packing</th>
                      <th scope="col" className="px-4 py-2.5 text-right font-semibold">Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {range.items.map((item) => (
                      <tr key={`${item.product}-${item.packing}`} className="border-t border-white/70 bg-white/40">
                        <td className="px-4 py-2.5 text-midnight">{item.product}</td>
                        <td className="px-4 py-2.5 text-graphite">{item.packing}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-graphite">{item.size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section id="quote" aria-labelledby="quote-title" className="container-site mt-16 scroll-mt-28">
        <div className="glass-strong mx-auto max-w-[880px] rounded-[32px] p-6 sm:p-10">
          <div className="relative z-[2] flex items-center gap-3">
            <span className="glass tint-champagne flex h-11 w-11 items-center justify-center rounded-full">
              <Hotel size={19} strokeWidth={1.4} className="relative z-[2] text-midnight" />
            </span>
            <h2 id="quote-title" className="font-display text-[34px] leading-tight text-midnight sm:text-[40px]">
              Get a price <em className="text-iris pr-1">quote</em>
            </h2>
          </div>
          <p className="relative z-[2] mt-3 text-[15px] text-stone">Tell us about your property and we&rsquo;ll send a quote for your guest amenities.</p>
          <div className="relative z-[2] mt-8">
            <QuoteForm kind="Hotel" interests={AMENITY_RANGES.map((range) => `${range.name} (${range.scent})`)} />
          </div>
        </div>
      </section>
    </div>
  );
}
