import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Check, FlaskConical, HandHeart, Mail, MapPin, Phone, Rabbit } from "lucide-react";
import NewsletterForm from "./NewsletterForm";
import BackToTop from "./BackToTop";
import RotatingSeal from "@/components/ui/RotatingSeal";
import { SITE } from "@/lib/site";

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
    title: "The Puro world",
    links: [
      ["Our story", "/our-story"],
      ["The ritual", "/#ritual"],
      ["Ingredients", "/#ingredients"],
      ["Good to know", "/#why-puro"],
    ],
  },
];

const PROMISES = [
  { icon: Rabbit, label: "Cruelty-free", note: "PETA certified" },
  { icon: FlaskConical, label: "Dermatologically tested", note: "Gentle on skin" },
  { icon: BadgeCheck, label: "GMP certified", note: "Made with care" },
  { icon: HandHeart, label: "Gives back", note: "Supports rural women" },
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

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M4 20l1.2-3.6A8 8 0 1 1 8 19.1L4 20z" strokeLinejoin="round" />
      <path
        d="M9.2 8.6c.2-.4.5-.4.7-.4h.5c.2 0 .4.1.5.4l.6 1.4c.1.2 0 .5-.1.6l-.4.5c-.1.2-.1.4 0 .5.5.9 1.3 1.7 2.2 2.2.2.1.4.1.5 0l.5-.4c.2-.1.4-.2.6-.1l1.4.6c.3.1.4.3.4.5v.5c0 .3-.1.5-.4.7-.5.3-1.1.5-1.7.4-2.6-.5-4.7-2.6-5.2-5.2-.1-.6.1-1.2.4-1.7z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

const SOCIALS = [
  { label: "Instagram", href: SITE.social.instagram, icon: InstagramIcon },
  { label: "Facebook", href: SITE.social.facebook, icon: FacebookIcon },
  { label: "WhatsApp", href: SITE.whatsapp, icon: WhatsAppIcon },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-noir text-ivory">
      {/* Gilded hairline across the top */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      {/* The Puro Letter */}
      <div className="container-site relative grid items-center gap-14 py-20 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div>
          <p className="eyebrow flex items-center gap-4 text-ivory/60">
            The Puro Letter <span className="h-px w-16 bg-ivory/30" />
          </p>
          <h2 className="mt-6 font-display text-[52px] leading-[0.98] sm:text-[76px] lg:text-[92px]">
            Join the <em className="text-gold-soft">ritual.</em>
          </h2>
          <p className="mt-6 max-w-[480px] text-[17px] leading-[1.8] text-ivory/70">
            Rituals, new arrivals and quiet moments — a few thoughtful letters a month, never more.
          </p>
          <div className="mt-9 max-w-[560px]">
            <NewsletterForm />
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-ivory/65">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-2">
                <Check size={14} strokeWidth={1.6} className="text-gold-soft" /> {perk}
              </li>
            ))}
          </ul>
        </div>

        {/* Photograph mosaic with the turning seal */}
        <div className="relative mx-auto hidden h-[440px] w-full max-w-[480px] sm:block">
          <div className="absolute left-0 top-0 h-[78%] w-[58%] overflow-hidden rounded-[28px] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)]">
            <Image src={MOSAIC[0]} alt="" fill sizes="280px" className="object-cover" />
          </div>
          <div className="absolute bottom-0 right-0 h-[62%] w-[48%] overflow-hidden rounded-[28px] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)] ring-[6px] ring-[#07303b]">
            <Image src={MOSAIC[1]} alt="" fill sizes="240px" className="object-cover" />
          </div>
          <div className="absolute right-[8%] top-[4%] h-[30%] w-[26%] overflow-hidden rounded-full shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] ring-[5px] ring-[#07303b]">
            <Image src={MOSAIC[2]} alt="" fill sizes="130px" className="object-cover" />
          </div>
          <RotatingSeal
            text="Ethical inside out · Puro Body & Soul · "
            className="absolute bottom-[10%] left-[44%] w-[124px] !bg-ivory text-[40px] !text-emerald"
          />
        </div>
      </div>

      {/* Promises */}
      <div className="container-site">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {PROMISES.map(({ icon: Icon, label, note }) => (
            <li
              key={label}
              className="flex items-center gap-4 rounded-[20px] border border-ivory/10 bg-ivory/[0.04] p-4 transition duration-500 hover:border-gold-soft/40 hover:bg-ivory/[0.07] sm:p-5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ivory/[0.08] text-gold-soft">
                <Icon size={19} strokeWidth={1.2} />
              </span>
              <span>
                <span className="block font-display text-[18px] leading-tight sm:text-[21px]">{label}</span>
                <span className="mt-0.5 block text-[12px] text-ivory/50 sm:text-[13px]">{note}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Links + visit */}
      <div className="container-site grid gap-14 py-20 lg:grid-cols-[1.6fr_1fr] lg:gap-20">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-[12px] font-medium uppercase tracking-[0.24em] text-gold-soft/80">{column.title}</h3>
              <ul className="mt-6 space-y-3">
                {column.links.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group inline-flex items-center gap-1.5 font-display text-[20px] leading-tight text-ivory/75 transition duration-300 hover:translate-x-1 hover:text-ivory sm:text-[22px]"
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

        <div className="rounded-[26px] border border-ivory/10 bg-ivory/[0.04] p-7 sm:p-8">
          <h3 className="text-[12px] font-medium uppercase tracking-[0.24em] text-gold-soft/80">Say hello</h3>
          <ul className="mt-6 space-y-4 text-[15px] text-ivory/75">
            <li>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-3 transition hover:text-ivory">
                <Mail size={17} strokeWidth={1.2} className="text-ivory/50" /> {SITE.email}
              </a>
            </li>
            <li>
              <a href={SITE.phoneHref} className="flex items-center gap-3 transition hover:text-ivory">
                <Phone size={17} strokeWidth={1.2} className="text-ivory/50" /> {SITE.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <MapPin size={17} strokeWidth={1.2} className="mt-1 shrink-0 text-ivory/50" />
              <span className="leading-relaxed">
                {SITE.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </li>
          </ul>
          <div className="mt-7 flex gap-3">
            {SOCIALS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-ivory/20 text-ivory/80 transition duration-300 hover:-translate-y-0.5 hover:border-ivory hover:bg-ivory hover:text-ink"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Signature */}
      <div className="border-t border-ivory/10">
        <div className="container-site flex flex-col items-center gap-6 pb-24 pt-8 text-center md:flex-row md:justify-between md:pb-8 md:pr-28 md:text-left">
          <Link href="/" aria-label="Puro Body & Soul — home" className="leading-none">
            <span className="block font-display text-[30px] tracking-[0.2em]" style={{ marginRight: "-0.2em" }}>
              PURO
            </span>
            <span className="mt-1 block text-[9px] font-medium uppercase tracking-[0.5em] text-ivory/55">Body &amp; Soul</span>
          </Link>
          <p className="text-[13px] text-ivory/50">
            © {year} Puro Body &amp; Soul · A division of {SITE.organisation}
          </p>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
