import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import FaqList from "@/components/faq/FaqList";
import { FAQ } from "@/lib/support";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Delivery, returns and payment, plus skincare advice for face, skin, body and hair — answers to common questions about PURO Body & Soul.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  // Placeholder answers aren't sent to search engines until they're confirmed.
  const faqLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.flatMap((section) => section.items)
      .filter((item) => !item.placeholder)
      .map((item) => ({
        "@type": "Question",
        name: item.q,
        // Links are written [label](/path); search engines get the plain label.
        acceptedAnswer: { "@type": "Answer", text: item.a.join(" ").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") },
      })),
  }).replace(/</g, "\\u003c");

  return (
    <div className="pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqLd }} />
      <section className="container-site pt-8 sm:pt-12">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-stone">
          <Link href="/" className="underline-offset-4 hover:text-midnight hover:underline">
            Home
          </Link>
          <ChevronRight size={13} strokeWidth={1.4} />
          <span className="text-ink">FAQs</span>
        </nav>
        <header className="mx-auto mt-8 max-w-[760px] text-center">
          <p className="label justify-center text-[#5E4B8A]">Help &amp; FAQs</p>
          <h1 className="mt-5 font-display text-[48px] font-light leading-[1] text-midnight sm:text-[72px]">
            How can we <em className="text-iris pr-1">help?</em>
          </h1>
          <p className="mx-auto mt-5 max-w-[520px] text-[16px] leading-[1.8] text-stone">
            Answers to the questions we hear most — about delivery, returns, payment and what goes into every formula.
          </p>
        </header>
      </section>

      <section className="container-site mt-12">
        <FaqList sections={FAQ} />
      </section>

      <section className="container-site mt-16">
        <div className="glass tint-quartz flex flex-col items-center gap-5 rounded-[32px] px-6 py-10 text-center sm:flex-row sm:justify-between sm:px-10 sm:text-left">
          <div className="relative z-[2]">
            <p className="font-display text-[30px] leading-tight text-midnight">Still have a question?</p>
            <p className="mt-1 text-[15px] text-stone">We&rsquo;re happy to help — write to us or give us a call.</p>
          </div>
          <div className="relative z-[2] flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn-primary !px-8 !py-3.5">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
