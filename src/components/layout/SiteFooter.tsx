import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Mail, MapPin, Phone } from "lucide-react";
import NewsletterForm from "./NewsletterForm";
import BackToTop from "./BackToTop";
import RotatingSeal from "@/components/ui/RotatingSeal";
import { SITE } from "@/lib/site";
import { POLICIES } from "@/lib/policies";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      ["Shop all", "/shop"],
      ["Face care", "/collections/face"],
      ["Body care", "/collections/body"],
      ["Hair & scalp", "/collections/hair"],
      ["The Gift Edit", "/collections/gifting"],
    ],
  },
  {
    title: "By concern",
    links: [
      ["Skin brightening", "/concerns/skin-brightening"],
      ["Tan removal", "/concerns/tan-removal"],
      ["Anti-ageing", "/concerns/anti-ageing"],
      ["Dry skin", "/concerns/dry-skin"],
      ["Hair fall", "/concerns/hair-fall"],
    ],
  },
  {
    title: "The PURO world",
    links: [
      ["Our philosophy", "/our-story"],
      ["Ingredients", "/ingredients"],
      ["Skincare finder", "/finder"],
      ["Hotel amenities", "/hotel"],
      ["Spa products", "/spa"],
    ],
  },
];

/** Certification badges, as shown on purobodysoul.com. */
const BADGES = [
  { src: "/media/badges/gmp-certified.png", label: "GMP certified" },
  { src: "/media/badges/dermatologically-tested.png", label: "Dermatologically tested" },
  { src: "/media/badges/natural-ingredients.png", label: "Natural ingredients" },
  { src: "/media/badges/silicone-paraben-free.png", label: "Silicone & paraben free" },
  { src: "/media/badges/peta-cruelty-free.png", label: "PETA cruelty-free" },
  { src: "/media/badges/non-toxic.png", label: "Non-toxic" },
  { src: "/media/badges/no-petroleum-mineral-oil.png", label: "No petroleum or mineral oil" },
];

const PERKS = ["First look at new rituals", "Seasonal gift edits", "Stories from Sa-Ni-Sa"];

const MOSAIC = [
  "/media/products/glow-up-pithi-pack/04.jpg",
  "/media/products/scrubulush-exfoliator/04.jpg",
  "/media/products/terra-tress-hair-scalp-oil/05.jpg",
];

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.6V21h3z" />
    </svg>
  );
}

const SOCIALS = [
  { label: "Instagram", href: SITE.social.instagram, icon: InstagramIcon },
  { label: "Facebook", href: SITE.social.facebook, icon: FacebookIcon },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-clip text-midnight">
      {/* Extra pools of rose, saffron and lilac light for the glass to catch */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-[8%] top-[6%] -z-10 h-[38vmax] w-[38vmax] rounded-full bg-[radial-gradient(circle,rgba(233,195,198,0.55),transparent_65%)] blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-[6%] top-[30%] -z-10 h-[34vmax] w-[34vmax] rounded-full bg-[radial-gradient(circle,rgba(205,189,230,0.55),transparent_65%)] blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-[30%] -z-10 h-[30vmax] w-[30vmax] rounded-full bg-[radial-gradient(circle,rgba(233,181,90,0.35),transparent_65%)] blur-3xl" />

      {/* The Puro Letter */}
      <div className="container-site relative grid items-center gap-14 pb-10 pt-12 sm:pb-12 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div className="glass tint-quartz rounded-[32px] p-7 sm:p-10">
          <p className="eyebrow flex items-center gap-4 text-quartz-deep">
            The Puro Letter <span className="h-px w-16 bg-quartz-deep/40" />
          </p>
          <h2 className="mt-6 font-display text-[52px] leading-[0.98] text-midnight sm:text-[76px] lg:text-[92px]">
            Join the <em className="text-iris pr-2">ritual.</em>
          </h2>
          <p className="mt-6 max-w-[480px] text-[17px] leading-[1.8] text-graphite">
            Rituals, new arrivals and quiet moments — a few thoughtful letters a month, never more.
          </p>
          <div className="mt-9 max-w-[560px]">
            <NewsletterForm />
          </div>
          <ul className="mt-6 flex flex-wrap gap-2 text-[13px] text-graphite">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-2 rounded-full bg-white/55 px-3.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_0_0_1px_rgba(255,255,255,0.6),0_6px_14px_-10px_rgba(180,112,124,0.5)]">
                <Check size={14} strokeWidth={1.6} className="text-quartz-deep" /> {perk}
              </li>
            ))}
          </ul>
        </div>

        {/* Photograph mosaic with the turning seal */}
        <div className="relative mx-auto hidden h-[440px] w-full max-w-[480px] sm:block">
          <div className="absolute left-0 top-0 h-[78%] w-[58%] overflow-hidden rounded-[30px] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)] ring-1 ring-white/80">
            <Image src={MOSAIC[0]} alt="" fill sizes="280px" className="object-cover" />
          </div>
          <div className="absolute bottom-0 right-0 h-[62%] w-[48%] overflow-hidden rounded-[30px] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)] ring-[6px] ring-white/60">
            <Image src={MOSAIC[1]} alt="" fill sizes="240px" className="object-cover" />
          </div>
          <div className="absolute right-[8%] top-[4%] h-[30%] w-[26%] overflow-hidden rounded-full shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] ring-[5px] ring-white/60">
            <Image src={MOSAIC[2]} alt="" fill sizes="130px" className="object-cover" />
          </div>
          <RotatingSeal
            text="Ethical inside out · Puro Body & Soul · "
            className="absolute bottom-[10%] left-[44%] w-[124px] !bg-[linear-gradient(140deg,#4a2c42,#173c40)] text-[40px] !text-saffron-soft"
          />
        </div>
      </div>

      {/* Kind to you, kind to the environment — the brand's certification badges */}
      <div className="container-site">
        <div className="glass rounded-[32px] px-5 py-8 sm:px-10">
          <p className="relative z-[2] text-center font-display text-[26px] italic leading-tight text-midnight sm:text-[32px]">Kind to you, kind to the environment</p>
          <ul className="relative z-[2] mt-6 grid grid-cols-4 gap-x-2 gap-y-5 sm:grid-cols-7">
            {BADGES.map((badge) => (
              <li key={badge.label} className="flex flex-col items-center text-center">
                <Image src={badge.src} alt="" width={84} height={84} className="h-16 w-16 opacity-85 sm:h-20 sm:w-20" />
                <span className="mt-2 text-[11px] leading-tight text-graphite sm:text-[12px]">{badge.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Links + visit */}
      <div className="container-site grid gap-3 py-3 lg:grid-cols-[1.6fr_1fr]">
        <div className="glass tint-lilac grid grid-cols-2 gap-10 rounded-[32px] p-7 sm:grid-cols-3 sm:p-10">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-[12px] font-medium uppercase tracking-[0.24em] text-lilac-deep">{column.title}</h3>
              <ul className="mt-6 space-y-3">
                {column.links.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group inline-flex items-center gap-1.5 rounded-md font-display text-[20px] leading-tight text-midnight transition duration-300 hover:translate-x-1 hover:text-lilac-deep sm:text-[22px]"
                    >
                      {label}
                      <ArrowUpRight
                        size={14}
                        strokeWidth={1.25}
                        className="-translate-x-1 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="glass tint-aqua rounded-[32px] p-7 sm:p-10">
          <h3 className="text-[12px] font-medium uppercase tracking-[0.24em] text-aqua-deep">Say hello</h3>
          <ul className="mt-6 space-y-4 text-[15px] text-graphite">
            <li>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-3 transition hover:text-midnight">
                <Mail size={17} strokeWidth={1.2} className="text-aqua-deep" /> {SITE.email}
              </a>
            </li>
            <li>
              <a href={SITE.phoneHref} className="flex items-center gap-3 transition hover:text-midnight">
                <Phone size={17} strokeWidth={1.2} className="text-aqua-deep" /> {SITE.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <MapPin size={17} strokeWidth={1.2} className="mt-1 shrink-0 text-aqua-deep" />
              <span className="leading-relaxed">
                {SITE.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/contact" className="btn-glass !px-5 !py-2.5 !text-[11px] hover:text-aqua-deep">
              Contact us
            </Link>
            <Link href="/faq" className="btn-glass !px-5 !py-2.5 !text-[11px] hover:text-aqua-deep">
              FAQs
            </Link>
          </div>
          <div className="mt-5 flex gap-3">
            {SOCIALS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="btn-glass h-12 w-12 !p-0 hover:-translate-y-0.5 hover:text-aqua-deep"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Signature */}
      <div className="container-site pb-24 pt-3 md:pb-6 md:pr-28">
        <div className="glass-strong flex flex-col items-center gap-6 rounded-[32px] px-6 py-6 text-center md:flex-row md:justify-between md:rounded-full md:px-8 md:py-4 md:text-left">
          <Link href="/" aria-label="Puro Body & Soul — home" className="leading-none">
            <Image src="/media/brand/puro-logo.png" alt="Puro Body & Soul" width={634} height={393} className="h-[56px] w-auto" />
          </Link>
          <div className="flex flex-col items-center gap-2 md:items-start">
            <p className="text-[13px] text-stone">
              © {year} Puro Body &amp; Soul · A division of {SITE.organisation}
            </p>
            <nav aria-label="Policies">
              <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[12px] md:justify-start">
                {POLICIES.map((policy) => (
                  <li key={policy.slug}>
                    <Link href={`/policies/${policy.slug}`} className="text-stone underline-offset-4 transition hover:text-midnight hover:underline">
                      {policy.short}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
