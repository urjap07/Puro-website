import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { POLICIES, POLICIES_UPDATED } from "@/lib/policies";

export const metadata: Metadata = {
  title: "Policies",
  description: "PURO Body & Soul's shipping, return and refund, privacy, terms and disclaimer policies.",
  alternates: { canonical: "/policies" },
};

const TINTS = ["tint-aqua", "tint-quartz", "tint-lilac", "tint-champagne", "tint-sage"];

/** All policies in one place. */
export default function PoliciesPage() {
  return (
    <div className="pb-24">
      <section className="container-site pt-8 sm:pt-12">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-stone">
          <Link href="/" className="underline-offset-4 hover:text-midnight hover:underline">
            Home
          </Link>
          <ChevronRight size={13} strokeWidth={1.4} />
          <span className="text-ink">Policies</span>
        </nav>
        <header className="mx-auto mt-8 max-w-[720px] text-center">
          <p className="label justify-center text-[#5E4B8A]">The small print</p>
          <h1 className="mt-5 font-display text-[48px] font-light leading-[1] text-midnight sm:text-[68px]">
            Our <em className="text-iris pr-1">policies</em>
          </h1>
          <p className="mx-auto mt-5 max-w-[500px] text-[16px] leading-[1.8] text-stone">
            How we deliver, take returns, look after your information, and the terms of shopping with us. Last updated {POLICIES_UPDATED}.
          </p>
        </header>
      </section>

      <section className="container-site mt-12">
        <ul className="mx-auto grid max-w-[1000px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {POLICIES.map((policy, index) => (
            <li key={policy.slug}>
              <Link href={`/policies/${policy.slug}`} className={clsx("glass glass-hover group flex h-full flex-col rounded-[28px] p-6", TINTS[index % TINTS.length])}>
                <span className="relative z-[2] flex items-start justify-between gap-3">
                  <span className="font-display text-[28px] leading-tight text-midnight">{policy.title}</span>
                  <ArrowUpRight size={17} strokeWidth={1.4} className="mt-2 shrink-0 text-stone transition group-hover:text-midnight" />
                </span>
                <span className="relative z-[2] mt-3 text-[14px] leading-[1.7] text-graphite/85">{policy.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
