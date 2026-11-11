import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  FlaskConical,
  HeartHandshake,
  Leaf,
  Rabbit,
  Recycle,
  ShieldCheck,
  Sprout,
  type LucideIcon,
} from "lucide-react";
import { SITE } from "@/lib/site";
import Reveal from "@/components/ui/Reveal";
import GildedArch from "@/components/ui/GildedArch";
import Jali from "@/components/ui/Jali";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Puro Body & Soul is a division of Shramik Naari Sangh. Clean, cruelty-free botanical care — and every purchase helps a rural woman live a life of dignity.",
};

/** Philosophy pillars, as published on purobodysoul.com/our-brand. */
const PILLARS: {
  icon: LucideIcon;
  title: string;
  text: string;
  image: string;
}[] = [
  {
    icon: HeartHandshake,
    title: "Ethical, inside out",
    text: "Founded to generate awareness about clean beauty, with products that are natural, cruelty-free, non-toxic and free from harmful chemicals and toxins.",
    image: "/media/brand/03.jpg",
  },
  {
    icon: Sprout,
    title: "Inspired by nature",
    text: "We harness the potent properties of botanical extracts, essential oils and other natural ingredients.",
    image: "/media/products/aloe-vibe-shower-gel/02.jpg",
  },
  {
    icon: FlaskConical,
    title: "Backed by science",
    text: "Historical beauty knowledge meets contemporary research, in formulations rigorously tested for quality and performance.",
    image: "/media/products/aqua-riche-night-repair-gel-cream/04.jpg",
  },
  {
    icon: Recycle,
    title: "Kind to the planet",
    text: "We strive to minimise our environmental footprint with recyclable packaging and sustainable practices.",
    image: "/media/products/terra-tress-hair-scalp-oil/03.jpg",
  },
  {
    icon: ShieldCheck,
    title: "Transparency & integrity",
    text: "From sourcing our ingredients to the manufacturing process, we prioritise integrity and honesty.",
    image: "/media/products/vita-clay-ubtan-pack/06.jpg",
  },
  {
    icon: Rabbit,
    title: "Vegan & cruelty-free",
    text: "All our products are certified Animal Cruelty-Free by PETA.",
    image: "/media/products/coco-silk-cold-pressed-virgin-coconut-oil/04.jpg",
  },
];

const PROMISES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Rabbit,
    title: "PETA cruelty-free",
    text: "Vegan formulas that harness the power of nature.",
  },
  {
    icon: Leaf,
    title: "Non-toxic",
    text: "Free from toxins, crafted for your skin's health.",
  },
  {
    icon: BadgeCheck,
    title: "Dermatologically tested",
    text: "Safe and effective for every skin type.",
  },
  {
    icon: ShieldCheck,
    title: "GMP certified",
    text: "Made in a facility held to the highest standards.",
  },
];

/** Verbs from the product taglines, e.g. "brighten it, flaunt it, naturally". */
const TAGLINE_VERBS = [
  "Clarify",
  "Quench",
  "Brighten",
  "Detoxify",
  "Polish",
  "Cool",
];

/** Amenity ranges, as listed on purobodysoul.com/hotel. */
const AMENITY_RANGES = [
  "Southern Kiwi",
  "Aromatherapy Naturelles",
  "Brazilian Naturelles",
  "Moroccan Oasis",
];

const HOTEL_CLIENTS = [
  "Ramoji Film City",
  "Clark Shiraz, Agra",
  "Sonar Bangla",
  "Adamo Hotels",
  "Rytham, Lonavala",
  "Upperdeck, Lonavala",
];

export default function OurStoryPage() {
  return (
    <>
      {/* Hero — emerald with an arch collage */}
      <section className="relative overflow-hidden bg-emerald-deep text-ivory">
        <Jali />
        <div className="pointer-events-none absolute -left-40 top-20 h-[560px] w-[560px] rounded-full bg-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-[-10%] h-[640px] w-[640px] rounded-full bg-emerald-soft/60 blur-3xl" />
        {/* Fine arch outlines echoing the palace-arch motif */}
        <svg
          aria-hidden
          className="pointer-events-none absolute right-[4%] top-24 hidden h-[760px] w-[620px] text-gold/15 md:block"
          viewBox="0 0 620 760"
          fill="none"
        >
          <path
            d="M40 760V310C40 160 160 40 310 40s270 120 270 270v450"
            stroke="currentColor"
          />
          <path
            d="M80 760V320C80 192 183 80 310 80s230 112 230 240v440"
            stroke="currentColor"
          />
        </svg>

        <div className="container-site relative grid items-center gap-16 pb-20 pt-40 md:min-h-[88svh] md:grid-cols-[1.05fr_1fr] md:gap-10 lg:gap-16 lg:pb-24 lg:pt-44">
          <Reveal className="min-w-0">
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-gold-soft/70" />
              <p className="eyebrow text-gold-soft">Our Story</p>
            </div>
            <h1 className="heading-xl mt-8">
              Ethical, <br className="hidden sm:block" />
              <em className="font-normal text-gold-soft">inside out.</em>
            </h1>
            <p className="mt-8 max-w-[520px] text-[17px] leading-[1.9] text-ivory/80">
              Puro Body &amp; Soul was born to make clean beauty a little more
              meaningful — botanical rituals for skin, body and soul, and a
              brand whose every purchase gives a rural woman the chance to stand
              on her own feet.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                href="/shop"
                className="btn-outline-light rounded-full px-9"
              >
                Shop the collection <ArrowRight size={15} strokeWidth={1.25} />
              </Link>
              <Link href="#sanisa" className="link-underline text-ivory">
                Meet Sa-Ni-Sa
              </Link>
            </div>
            <ul className="mt-14 grid max-w-[560px] grid-cols-3 gap-4 border-t border-ivory/15 pt-8">
              {[
                { icon: Rabbit, label: "PETA certified cruelty-free" },
                { icon: Leaf, label: "Natural & non-toxic" },
                { icon: HeartHandshake, label: "Empowering rural women" },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex flex-col gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold-soft/40 text-gold-soft">
                    <Icon size={18} strokeWidth={1.1} />
                  </span>
                  <span className="text-[11px] uppercase leading-relaxed tracking-[0.18em] text-ivory/70">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Arch collage */}
          <Reveal
            delay={0.15}
            className="relative mx-auto h-[440px] w-full max-w-[520px] sm:h-[520px] lg:h-[560px]"
          >
            <GildedArch className="absolute left-1/2 top-0 aspect-[100/132] w-[62%] -translate-x-1/2">
              <Image
                src="/media/products/good-cleanse-face-wash/04.jpg"
                alt="Good Cleanse Face Wash beside a lit diya"
                fill
                priority
                sizes="(min-width: 1024px) 330px, 60vw"
                className="object-cover"
              />
            </GildedArch>
            <GildedArch className="absolute bottom-2 left-0 aspect-[100/132] w-[36%]">
              <Image
                src="/media/products/glow-up-pithi-pack/04.jpg"
                alt="Glow Up Pithi Pack with turmeric and rice bran oil"
                fill
                sizes="200px"
                className="object-cover"
              />
            </GildedArch>
            <GildedArch className="absolute bottom-14 right-0 aspect-[100/132] w-[34%]">
              <Image
                src="/media/products/vita-clay-ubtan-pack/04.jpg"
                alt="Vita Clay Ubtan Pack with flowers and clay"
                fill
                sizes="190px"
                className="object-cover"
              />
            </GildedArch>
            <span className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-full border border-gold/40 bg-emerald-deep/90 px-5 py-2.5 font-display text-[16px] italic text-gold-soft backdrop-blur">
              <span className="text-[8px] not-italic">◆</span> Age-old wisdom,
              modern care
              <span className="text-[8px] not-italic">◆</span>
            </span>
          </Reveal>
        </div>
      </section>

      {/* Origin — floating panel */}
      <section className="glow-botanical">
        <div className="container-site py-24 sm:py-32">
          <Reveal>
            <div className="grid overflow-hidden rounded-2xl bg-mist-deep shadow-[0_30px_80px_-50px_rgba(18,59,48,0.45)] lg:grid-cols-2">
              <div className="flex items-center px-7 py-14 sm:px-14 lg:px-16">
                <div className="max-w-[520px]">
                  <p className="eyebrow">Where it began</p>
                  <h2 className="heading-lg mt-6 text-emerald">
                    Clean beauty, <em>with a conscience.</em>
                  </h2>
                  <p className="body-copy mt-7">
                    Puro was founded to generate awareness about clean beauty —
                    by creating products that are natural, cruelty-free and
                    non-toxic, and free from harmful chemicals and toxins.
                  </p>
                  <p className="body-copy mt-5">
                    We draw on the rituals Indian homes have trusted for
                    generations — the golden turmeric of Pithi, the
                    clay-and-citrus glow of Ubtan — and pair them with
                    contemporary research, so every formula is as effective as
                    it is gentle.
                  </p>
                </div>
              </div>
              <div className="relative min-h-[380px] lg:min-h-[600px]">
                <Image
                  src="/media/products/glow-up-pithi-pack/03.jpg"
                  alt="Glow Up Pithi Pack with bridal jewellery and turmeric"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Philosophy pillars — photographs in palace arches on emerald */}
      <section className="relative overflow-hidden bg-emerald-deep py-24 text-ivory sm:py-32">
        <Jali />
        <div className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-emerald-soft/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 -left-40 h-[520px] w-[520px] rounded-full bg-gold/10 blur-3xl" />
        <div className="container-site relative">
          <SectionHeading
            eyebrow="Our Philosophy"
            title={
              <>
                Six promises,{" "}
                <em className="text-gold-soft">in every ritual</em>
              </>
            }
            description="The principles behind every Puro formula — from the first ingredient to the final pack."
            tone="light"
          />
          <div className="mt-16 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3">
            {PILLARS.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <Reveal key={pillar.title} delay={(index % 3) * 0.12}>
                  <div className="group text-center">
                    <GildedArch className="relative mx-auto aspect-[100/132] w-full max-w-[320px]">
                      <Image
                        src={pillar.image}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
                        className="object-cover transition duration-[1600ms] group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/70 via-transparent to-transparent" />
                    </GildedArch>
                    <span className="relative z-10 mx-auto -mt-7 flex h-14 w-14 items-center justify-center rounded-full border border-gold/60 bg-emerald-deep text-gold-soft transition group-hover:bg-gold-soft group-hover:text-emerald-deep">
                      <Icon size={21} strokeWidth={1.1} />
                    </span>
                    <p className="mt-5 text-[10px] uppercase tracking-[0.3em] text-gold-soft">
                      Promise 0{index + 1}
                    </p>
                    <h3 className="mt-2 font-display text-[30px] font-light">
                      {pillar.title}
                    </h3>
                    <p className="mx-auto mt-3 max-w-[320px] text-[15px] leading-[1.85] text-ivory/70">
                      {pillar.text}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trusted by hotels & spas — emerald panel */}
      <section className="glow-botanical">
        <div className="container-site py-24 sm:py-28">
          <Reveal>
            <div className="relative grid overflow-hidden rounded-2xl bg-emerald-deep text-ivory shadow-[0_40px_90px_-50px_rgba(11,42,34,0.8)] lg:grid-cols-[0.9fr_1.1fr]">
              <div className="relative min-h-[360px] lg:min-h-[620px]">
                <Image
                  src="/media/products/aloe-vibe-shower-gel/04.jpg"
                  alt="Aloe Vibe Shower Gel on a bathroom shelf"
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-emerald-deep/70" />
                <p className="absolute bottom-7 left-7 font-display text-[22px] italic text-ivory/90">
                  Hotel &amp; spa amenities
                </p>
              </div>

              <div className="relative px-7 py-14 sm:px-14 lg:px-16">
                <div className="pointer-events-none absolute -right-24 -top-24 h-[360px] w-[360px] rounded-full bg-gold/10 blur-3xl" />
                <p className="eyebrow relative text-gold-soft">
                  Beyond the bathroom shelf
                </p>
                <h2 className="heading-lg relative mt-6">
                  Trusted by{" "}
                  <em className="text-gold-soft">hotels &amp; spas</em>
                </h2>
                <p className="relative mt-6 max-w-[480px] text-[15px] leading-[1.9] text-ivory/75">
                  Natural actives, pure essential oils, exquisite natural
                  fragrances and paraben-free preservatives — the same care that
                  goes into every Puro ritual, chosen by hotels and spas across
                  India.
                </p>

                <ul className="relative mt-10 grid gap-x-8 gap-y-4 border-y border-gold/25 py-8 sm:grid-cols-2">
                  {HOTEL_CLIENTS.map((client) => (
                    <li
                      key={client}
                      className="flex items-center gap-3 font-display text-[21px] font-light"
                    >
                      <span className="text-[8px] text-gold-soft">◆</span>
                      {client}
                    </li>
                  ))}
                </ul>

                <p className="relative mt-8 text-[10px] uppercase tracking-[0.28em] text-gold-soft">
                  Signature amenity ranges
                </p>
                <div className="relative mt-4 flex flex-wrap gap-2">
                  {AMENITY_RANGES.map((range) => (
                    <span
                      key={range}
                      className="rounded-full border border-ivory/20 px-4 py-2 text-[13px] text-ivory/85"
                    >
                      {range}
                    </span>
                  ))}
                </div>

                <p className="relative mt-10 text-[14px] text-ivory/70">
                  For hotel &amp; spa enquiries:{" "}
                  <a
                    href={`mailto:${SITE.email}`}
                    className="text-gold-soft underline-offset-4 hover:underline"
                  >
                    {SITE.email}
                  </a>{" "}
                  ·{" "}
                  <a
                    href={SITE.phoneHref}
                    className="text-gold-soft underline-offset-4 hover:underline"
                  >
                    {SITE.phone}
                  </a>
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Sa-Ni-Sa */}
      <section
        id="sanisa"
        className="relative scroll-mt-24 overflow-hidden bg-emerald-deep py-24 text-ivory sm:py-32"
      >
        <div className="pointer-events-none absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-[560px] w-[560px] rounded-full bg-emerald-soft/50 blur-3xl" />
        <div className="container-site relative grid items-center gap-16 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <GildedArch className="relative mx-auto aspect-[100/132] w-full max-w-[420px]">
              <Image
                src="/media/products/coco-silk-cold-pressed-virgin-coconut-oil/03.jpg"
                alt="Coco Silk virgin coconut oil among fresh coconuts"
                fill
                sizes="420px"
                className="object-cover"
              />
            </GildedArch>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="eyebrow text-gold-soft">The heart of Puro</p>
            <h2 className="heading-lg mt-6">
              Every purchase{" "}
              <em className="text-gold-soft">empowers a woman.</em>
            </h2>
            <p className="mt-8 text-[16px] leading-[1.9] text-ivory/80">
              Puro Body &amp; Soul is a division of{" "}
              <strong className="font-normal text-ivory">
                Shramik Naari Sangh (Sa-Ni-Sa)
              </strong>
              , a charitable organisation rooted in Jambhulpada, in
              Maharashtra&rsquo;s Sudhagad Taluka.
            </p>
            <blockquote className="mt-8 border-l border-gold-soft/60 pl-6 font-display text-[26px] font-light italic leading-snug text-gold-soft sm:text-[30px]">
              &ldquo;For every product you buy, you help a rural woman to stand
              on her own feet and live a life of dignity.&rdquo;
            </blockquote>
            <p className="mt-8 text-[16px] leading-[1.9] text-ivory/80">
              That is what &ldquo;ethical, inside out&rdquo; means to us: care
              that is good for your skin, and good for the women and communities
              behind every bottle.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Tagline interlude — light, from the product taglines */}
      <section className="glow-botanical overflow-hidden border-y border-line py-20 sm:py-24">
        <Reveal className="container-site text-center">
          <p className="ornament text-[9px]">◆</p>
          <p className="mx-auto mt-8 max-w-[1000px] font-display text-[30px] font-light leading-[1.35] text-emerald sm:text-[40px] lg:text-[48px]">
            {TAGLINE_VERBS.map((verb, index) => (
              <span key={verb}>
                <em className={index % 2 ? "text-gold-deep" : undefined}>
                  {verb} it.
                </em>{" "}
              </span>
            ))}
          </p>
          <p className="mt-6 text-[12px] uppercase tracking-[0.34em] text-gold-deep">
            — flaunt it, naturally —
          </p>
          <Link href="/shop" className="link-underline mt-10 text-emerald">
            Find your ritual <ArrowRight size={14} strokeWidth={1.25} />
          </Link>
        </Reveal>
      </section>

      {/* Certifications band */}
      <section className="relative overflow-hidden text-ivory">
        <Image
          src="/media/products/terra-tress-hair-scalp-oil/05.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-emerald-deep/85" />
        <div className="container-site relative py-20 sm:py-24">
          <Reveal className="text-center">
            <p className="eyebrow text-gold-soft">Why choose Puro</p>
            <h2 className="heading-lg mt-5">
              Certified, tested, <em className="text-gold-soft">trusted.</em>
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROMISES.map((promise, index) => {
              const Icon = promise.icon;
              return (
                <Reveal key={promise.title} delay={index * 0.08}>
                  <div className="h-full rounded-2xl border border-ivory/15 bg-ivory/[0.04] p-7 text-center backdrop-blur-sm">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-soft/10 text-gold-soft ring-1 ring-gold-soft/40">
                      <Icon size={22} strokeWidth={1.1} />
                    </span>
                    <h3 className="mt-6 font-display text-[24px] font-light">
                      {promise.title}
                    </h3>
                    <p className="mt-2 text-[14px] leading-7 text-ivory/70">
                      {promise.text}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Closing CTA + contact */}
      <section className="glow-botanical-alt">
        <div className="container-site py-24 sm:py-32">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl bg-mist-deep text-emerald shadow-[0_30px_80px_-50px_rgba(18,59,48,0.45)]">
              <div className="pointer-events-none absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full bg-gold/15 blur-3xl" />
              <div className="relative grid gap-12 px-7 py-14 sm:px-14 lg:grid-cols-[1.3fr_1fr] lg:px-16 lg:py-16">
                <div>
                  <p className="eyebrow">Begin your ritual</p>
                  <h2 className="heading-lg mt-6">
                    Beauty that <em className="text-gold-deep">gives back.</em>
                  </h2>
                  <p className="mt-6 max-w-[460px] text-[16px] leading-[1.9] text-stone">
                    Discover botanical care for face, body and hair — and know
                    that every ritual supports the women of Sa-Ni-Sa.
                  </p>
                  <Link
                    href="/shop"
                    className="btn-primary mt-10 rounded-full px-9 hover:bg-gold hover:text-emerald-deep"
                  >
                    Shop the collection{" "}
                    <ArrowRight size={15} strokeWidth={1.25} />
                  </Link>
                </div>
                <div className="border-emerald/15 lg:border-l lg:pl-12">
                  <p className="eyebrow">Say hello</p>
                  <address className="mt-6 space-y-4 text-[15px] not-italic leading-7 text-ink/80">
                    <p>
                      {SITE.address.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </p>
                    <p>
                      <a
                        href={`mailto:${SITE.email}`}
                        className="hover:text-gold-deep"
                      >
                        {SITE.email}
                      </a>
                      <br />
                      <a href={SITE.phoneHref} className="hover:text-gold-deep">
                        {SITE.phone}
                      </a>
                    </p>
                  </address>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
