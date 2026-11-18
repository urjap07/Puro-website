import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { CLIENT_LOGOS } from "@/lib/business";

/** "Why use our products", from purobodysoul.com, with the brand's certification badges. */
const WHY = [
  { badge: "/media/badges/peta-cruelty-free.png", title: "Vegan & cruelty-free", text: "Our vegan products harness the power of nature, delivering effective skincare without compromise." },
  { badge: "/media/badges/non-toxic.png", title: "Non-toxic", text: "Our products are free from toxins, crafted for your skin's health and beauty." },
  { badge: "/media/badges/dermatologically-tested.png", title: "Dermatologically tested", text: "Tested to ensure safety and effectiveness for all skin types." },
  { badge: "/media/badges/gmp-certified.png", title: "GMP certified", text: "Crafted in a GMP-certified facility, guaranteeing the highest standards of quality and safety." },
];

const BUSINESS = [
  {
    href: "/hotel",
    eyebrow: "For hotels",
    title: "Hotel amenities",
    text: "Four signature guest-toiletry ranges, made with natural actives and pure essential oils.",
    image: "/media/hotel/aromatherapy-naturelles.webp",
    alt: "Aromatherapy Naturelles hotel amenities",
  },
  {
    href: "/spa",
    eyebrow: "For spas & salons",
    title: "Spa products",
    text: "Massage oils, scrubs, wraps, foot and face care — supplied in bulk for your treatments.",
    image: "/media/spa/spa-products.webp",
    alt: "Puro body scrubs in glass jars",
  },
];

/** Homepage: why PURO, PURO for business, and the clients who choose it. */
export default function TrustAndBusiness() {
  return (
    <>
      {/* Why use our products */}
      <section aria-labelledby="why-title" className="bg-pearl py-20 sm:py-28">
        <div className="container-site">
          <Reveal className="text-center">
            <p className="label justify-center text-[#45633D]">Why PURO</p>
            <h2 id="why-title" className="heading-lg mt-5 text-midnight">
              Why use our <em className="text-iris pr-[0.08em]">products</em>
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.06} className="h-full">
                <div className="glass h-full rounded-[28px] p-6 text-center">
                  <Image src={item.badge} alt="" width={96} height={96} className="relative z-[2] mx-auto h-24 w-24 opacity-90" />
                  <h3 className="relative z-[2] mt-4 font-display text-[24px] leading-tight text-midnight">{item.title}</h3>
                  <p className="relative z-[2] mt-2 text-[14px] leading-[1.7] text-graphite">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PURO for business */}
      <section aria-labelledby="business-title" className="py-20 sm:py-28">
        <div className="container-site">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label text-[#66532F]">PURO for business</p>
              <h2 id="business-title" className="heading-lg mt-5 text-midnight">
                For hotels <em className="text-iris pr-[0.08em]">&amp; spas</em>
              </h2>
            </div>
            <p className="max-w-[420px] text-[15px] leading-[1.8] text-stone">The same natural formulations, made for your guests and treatments — with price quotes for bulk orders.</p>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {BUSINESS.map((card, index) => (
              <Reveal key={card.href} delay={index * 0.08}>
                <Link href={card.href} className="group relative block aspect-[16/11] overflow-hidden rounded-[32px] shadow-[0_30px_60px_-40px_rgba(14,39,42,0.7)]">
                  <Image src={card.image} alt={card.alt} fill sizes="(min-width: 768px) 46vw, 100vw" className="object-cover transition duration-[1.4s] group-hover:scale-[1.04]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight-deep/80 via-midnight-deep/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-ivory sm:p-8">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ivory/80">{card.eyebrow}</p>
                      <p className="mt-2 font-display text-[34px] leading-tight sm:text-[40px]">{card.title}</p>
                      <p className="mt-2 max-w-[380px] text-[14px] leading-[1.6] text-ivory/85">{card.text}</p>
                    </div>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/90 text-midnight transition group-hover:rotate-45">
                      <ArrowUpRight size={18} strokeWidth={1.5} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          {/* Our clients */}
          <Reveal className="mt-16">
            <h3 className="text-center text-[12px] font-semibold uppercase tracking-[0.24em] text-stone">Our clients</h3>
            <ul className="mt-6 grid grid-cols-3 items-center gap-3 sm:gap-4 lg:grid-cols-6">
              {CLIENT_LOGOS.map((logo) => (
                <li key={logo.name} className="glass flex h-24 items-center justify-center rounded-[20px] p-4 sm:h-28">
                  <Image src={logo.src} alt={logo.name} width={logo.width} height={logo.height} className="relative z-[2] max-h-16 w-auto object-contain sm:max-h-20" />
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}
