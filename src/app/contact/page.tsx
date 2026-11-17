import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { ArrowUpRight, ChevronRight, Clock, Mail, MapPin, MessageCircle, Package, Phone } from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";
import { SITE } from "@/lib/site";
import { CONTACT } from "@/lib/support";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Write, call or WhatsApp PURO Body & Soul — questions about orders, products, corporate gifting or anything else. ${CONTACT.replyTime}`,
  alternates: { canonical: "/contact" },
};

const WAYS = [
  {
    icon: Mail,
    title: "Email us",
    note: "General questions and the Puro Letter",
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    tint: "tint-lilac",
    ink: "text-lilac-deep",
  },
  {
    icon: Package,
    title: "Orders",
    note: "Changes, returns and deliveries",
    value: SITE.ordersEmail,
    href: `mailto:${SITE.ordersEmail}`,
    tint: "tint-saffron",
    ink: "text-saffron-deep",
  },
  {
    icon: Phone,
    title: "Call us",
    note: CONTACT.hours,
    value: SITE.phone,
    href: SITE.phoneHref,
    tint: "tint-aqua",
    ink: "text-aqua-deep",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    note: "Send us a message on WhatsApp",
    value: "Chat with us",
    href: SITE.whatsapp,
    tint: "tint-sage",
    ink: "text-sage-deep",
    external: true,
  },
];

export default function ContactPage() {
  const contactLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: `${SITE.url}/contact`,
    mainEntity: {
      "@type": "Organization",
      name: SITE.name,
      email: SITE.email,
      telephone: SITE.phone,
      address: { "@type": "PostalAddress", streetAddress: SITE.address[1], addressRegion: "Maharashtra", postalCode: "410205", addressCountry: "IN" },
      contactPoint: [
        { "@type": "ContactPoint", contactType: "customer service", email: SITE.email, telephone: SITE.phone, areaServed: "IN" },
        { "@type": "ContactPoint", contactType: "orders", email: SITE.ordersEmail },
      ],
    },
  }).replace(/</g, "\\u003c");

  return (
    <div className="pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: contactLd }} />
      <section className="container-site pt-8 sm:pt-12">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-stone">
          <Link href="/" className="underline-offset-4 hover:text-midnight hover:underline">
            Home
          </Link>
          <ChevronRight size={13} strokeWidth={1.4} />
          <span className="text-ink">Contact us</span>
        </nav>
        <header className="mx-auto mt-8 max-w-[760px] text-center">
          <p className="label justify-center text-[#2C6468]">Contact us</p>
          <h1 className="mt-5 font-display text-[48px] font-light leading-[1] text-midnight sm:text-[72px]">
            We&rsquo;d love to <em className="text-iris pr-1">hear from you.</em>
          </h1>
          <p className="mx-auto mt-5 max-w-[540px] text-[16px] leading-[1.8] text-stone">
            A question about an order, a product, or a gift for someone special — write, call or send us a message. {CONTACT.replyTime}
          </p>
        </header>
      </section>

      {/* Ways to reach us */}
      <section aria-label="Ways to reach us" className="container-site mt-12">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WAYS.map(({ icon: Icon, title, note, value, href, tint, ink, external }) => (
            <li key={title}>
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={clsx("glass glass-hover group flex h-full flex-col rounded-[28px] p-6", tint)}
              >
                <span className="relative z-[2] flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70">
                    <Icon size={19} strokeWidth={1.4} className={ink} />
                  </span>
                  <ArrowUpRight size={16} strokeWidth={1.4} className="text-stone transition group-hover:text-midnight" />
                </span>
                <span className="relative z-[2] mt-6 font-display text-[26px] leading-tight text-midnight">{title}</span>
                <span className="relative z-[2] mt-1 text-[13px] text-stone">{note}</span>
                <span className={clsx("relative z-[2] mt-4 break-words text-[15px] font-medium", ink)}>{value}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Form + visit */}
      <section className="container-site mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="glass-strong rounded-[32px] p-6 sm:p-10">
          <h2 className="relative z-[2] font-display text-[36px] leading-tight text-midnight sm:text-[44px]">
            Write <em className="text-iris pr-1">to us</em>
          </h2>
          <p className="relative z-[2] mt-2 text-[14px] text-stone">Fill in the form and we&rsquo;ll reply by email.</p>
          <div className="relative z-[2] mt-8">
            <Suspense>
              <ContactForm />
            </Suspense>
          </div>
        </div>

        <aside className="flex flex-col gap-5">
          <div className="glass tint-quartz rounded-[32px] p-6 sm:p-8">
            <h2 className="relative z-[2] flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8E4F5B]">
              <MapPin size={15} strokeWidth={1.6} /> Visit us
            </h2>
            <address className="relative z-[2] mt-4 not-italic leading-[1.8] text-graphite">
              {SITE.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer" className="relative z-[2] mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#5E4B8A] underline-offset-4 hover:underline">
              Open in Google Maps <ArrowUpRight size={14} strokeWidth={1.6} />
            </a>
          </div>
          <div className="glass tint-champagne rounded-[32px] p-6 sm:p-8">
            <h2 className="relative z-[2] flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#66532F]">
              <Clock size={15} strokeWidth={1.6} /> When we&rsquo;re around
            </h2>
            <p className="relative z-[2] mt-4 text-[15px] leading-[1.7] text-graphite">{CONTACT.hours}</p>
            <p className="relative z-[2] mt-1 text-[14px] text-stone">{CONTACT.replyTime}</p>
          </div>
          <div className="glass tint-lilac rounded-[32px] p-6 sm:p-8">
            <h2 className="relative z-[2] font-display text-[26px] leading-tight text-midnight">Quick answers</h2>
            <p className="relative z-[2] mt-2 text-[14px] leading-[1.7] text-stone">Delivery times, returns, payment and more — most questions are answered in our FAQs.</p>
            <Link href="/faq" className="btn-glass relative z-[2] mt-5 !px-6 !py-3 !text-[11px]">
              Read the FAQs
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
