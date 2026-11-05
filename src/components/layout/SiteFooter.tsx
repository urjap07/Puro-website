import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Wordmark } from "./SiteHeader";
import NewsletterForm from "./NewsletterForm";
import { SITE } from "@/lib/site";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      ["Shop all", "/shop"],
      ["Face care", "/collections/face"],
      ["Body care", "/collections/body"],
      ["Hair & scalp", "/collections/hair"],
      ["Gift edit", "/collections/gifting"],
    ],
  },
  {
    title: "Concerns",
    links: [
      ["Skin brightening", "/concerns/skin-brightening"],
      ["Tan removal", "/concerns/tan-removal"],
      ["Anti-ageing", "/concerns/anti-ageing"],
      ["Dry skin", "/concerns/dry-skin"],
      ["Hair fall", "/concerns/hair-fall"],
    ],
  },
  {
    title: "The Puro World",
    links: [
      ["Our story", "/our-story"],
      ["The ritual", "/#ritual"],
      ["Ingredients", "/#ingredients"],
      ["FAQs", "/#faq"],
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-emerald-deep text-ivory">
      <div className="container-site grid gap-14 border-b border-ivory/10 py-20 lg:grid-cols-[1.2fr_2fr]">
        <div>
          <p className="eyebrow text-gold-soft">The Puro Letter</p>
          <h2 className="mt-5 max-w-[420px] font-display text-[34px] font-light leading-tight sm:text-[40px]">
            Rituals, new arrivals &amp; quiet moments — in your inbox.
          </h2>
          <NewsletterForm />
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-[10px] uppercase tracking-[0.28em] text-gold-soft">
                {column.title}
              </h3>
              <ul className="mt-6 space-y-3.5">
                {column.links.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-[14px] text-ivory/70 transition hover:text-ivory"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="container-site flex flex-col items-center justify-between gap-8 py-10 md:flex-row">
        <Wordmark light />
        <div className="flex flex-col items-center gap-3 text-center text-[13px] text-ivory/60 md:items-start md:text-left">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <a href={`mailto:${SITE.email}`} className="transition hover:text-ivory">
              {SITE.email}
            </a>
            <a href={SITE.phoneHref} className="transition hover:text-ivory">
              {SITE.phone}
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {[
              ["Instagram", SITE.social.instagram],
              ["Facebook", SITE.social.facebook],
              ["WhatsApp", SITE.whatsapp],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 transition hover:text-ivory"
              >
                {label} <ArrowUpRight size={13} strokeWidth={1.25} />
              </a>
            ))}
          </div>
        </div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-ivory/40">
          © {new Date().getFullYear()} Puro Body &amp; Soul
          <span className="mt-1 block normal-case tracking-normal">
            A division of {SITE.organisation}
          </span>
        </p>
      </div>
    </footer>
  );
}
