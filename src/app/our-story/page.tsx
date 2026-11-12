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
  alternates: { canonical: "/our-story" },
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

/** Glass tints the pillar cards and amenity chips cycle through. */
const PILLAR_TINTS = ["tint-quartz", "tint-saffron", "tint-aqua", "tint-sage", "tint-apricot", "tint-lilac"];
const CERT_TINTS = ["tint-sage", "tint-quartz", "tint-aqua", "tint-saffron"];

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
      {/* Hero — rose-quartz glass with an arch collage */}
      <section className="glass tint-quartz mt-2 text-midnight sm:mt-3 mx-2 overflow-hidden rounded-[32px] sm:mx-3 sm:rounded-[40px]">
        <Jali />
        <div className="pointer-events-none absolute -left-40 top-20 h-[560px] w-[560px] rounded-full bg-saffron-soft/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-[-10%] h-[640px] w-[640px] rounded-full bg-lilac/50 blur-3xl" />
        {/* Fine arch outlines echoing the palace-arch motif */}
        <svg
          aria-hidden
          className="pointer-events-none absolute right-[4%] top-24 hidden h-[760px] w-[620px] text-quartz-deep/25 md:block"
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

        <div className="container-site relative grid items-center gap-16 pb-20 pt-20 md:min-h-[80svh] md:grid-cols-[1.05fr_1fr] md:gap-10 lg:gap-16 lg:pb-24 lg:pt-24">
          <Reveal className="min-w-0">
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-quartz-deep/60" />
              <p className="eyebrow text-quartz-deep">Our Story</p>
            </div>
            <h1 className="heading-xl mt-8">
              Ethical, <br className="hidden sm:block" />
              <em className="text-iris pr-3 font-normal">inside out.</em>
            </h1>
            <p className="mt-8 max-w-[520px] text-[17px] leading-[1.9] text-graphite">
              Puro Body &amp; Soul was born to make clean beauty a little more
              meaningful — botanical rituals for skin, body and soul, and a
              brand whose every purchase gives a rural woman the chance to stand
              on her own feet.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                href="/shop"
                className="btn-primary px-9"
              >
                Shop the collection <ArrowRight size={15} strokeWidth={1.25} />
              </Link>
              <Link href="#sanisa" className="link-underline text-midnight">
                Meet Sa-Ni-Sa
              </Link>
            </div>
            <ul className="mt-14 grid max-w-[560px] grid-cols-3 gap-3">
              {[
                { icon: Rabbit, label: "PETA certified cruelty-free", tint: "tint-sage", ink: "text-sage-deep" },
                { icon: Leaf, label: "Natural & non-toxic", tint: "tint-saffron", ink: "text-saffron-deep" },
                { icon: HeartHandshake, label: "Empowering rural women", tint: "tint-lilac", ink: "text-lilac-deep" },
              ].map(({ icon: Icon, label, tint, ink }) => (
                <li key={label} className={`glass flex flex-col gap-3 rounded-[24px] p-4 sm:p-5 ${tint}`}>
                  <span className={`flex h-11 w-11 items-center justify-center rounded-full bg-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_0_0_1px_rgba(255,255,255,0.6)] ${ink}`}>
                    <Icon size={18} strokeWidth={1.1} />
                  </span>
                  <span className="text-[10px] uppercase leading-relaxed tracking-[0.16em] text-graphite sm:text-[11px] sm:tracking-[0.18em]">
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
            <GildedArch className="absolute left-1/2 top-0 aspect-[100/132] w-[62%] -translate-x-1/2 rounded-[28px] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.75)] ring-1 ring-white/70">
              <Image
                src="/media/products/good-cleanse-face-wash/04.jpg"
                alt="Good Cleanse Face Wash beside a lit diya"
                fill
                priority
                sizes="(min-width: 1024px) 330px, 60vw"
                className="object-cover"
              />
            </GildedArch>
            <GildedArch className="absolute bottom-2 left-0 aspect-[100/132] w-[36%] rounded-[28px] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.75)] ring-1 ring-white/70">
              <Image
                src="/media/products/glow-up-pithi-pack/04.jpg"
                alt="Glow Up Pithi Pack with turmeric and rice bran oil"
                fill
                sizes="200px"
                className="object-cover"
              />
            </GildedArch>
            <GildedArch className="absolute bottom-14 right-0 aspect-[100/132] w-[34%] rounded-[28px] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.75)] ring-1 ring-white/70">
              <Image
                src="/media/products/vita-clay-ubtan-pack/04.jpg"
                alt="Vita Clay Ubtan Pack with flowers and clay"
                fill
                sizes="190px"
                className="object-cover"
              />
            </GildedArch>
            <span className="glass-strong glass-liquid !absolute -bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-full px-5 py-2.5 font-display text-[16px] italic text-plum">
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
            <div className="glass tint-saffron grid overflow-hidden rounded-[32px] p-2.5 lg:grid-cols-2">
              <div className="flex items-center px-7 py-14 sm:px-14 lg:px-16">
                <div className="max-w-[520px]">
                  <p className="eyebrow text-saffron-deep">Where it began</p>
                  <h2 className="heading-lg mt-6 text-midnight">
                    Clean beauty, <em className="text-iris pr-2">with a conscience.</em>
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
              <div className="relative min-h-[380px] overflow-hidden rounded-[24px] shadow-[0_24px_48px_-28px_rgba(14,39,42,0.6)] lg:min-h-[600px]">
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

      {/* Philosophy pillars — tinted glass cards on lilac glass */}
      <section className="glass tint-lilac py-24 text-midnight sm:py-32 mx-2 overflow-hidden rounded-[32px] sm:mx-3 sm:rounded-[40px]">
        <Jali />
        <div className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-aqua/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 -left-40 h-[520px] w-[520px] rounded-full bg-quartz/40 blur-3xl" />
        <div className="container-site relative">
          <SectionHeading
            eyebrow="Our Philosophy"
            title={
              <>
                Six promises,{" "}
                <em className="text-iris pr-2">in every ritual</em>
              </>
            }
            description="The principles behind every Puro formula — from the first ingredient to the final pack."
          />
          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-6">
            {PILLARS.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <Reveal key={pillar.title} delay={(index % 3) * 0.12} className="h-full">
                  <div className={`glass glass-hover group h-full rounded-[32px] p-3 pb-8 text-center ${PILLAR_TINTS[index % PILLAR_TINTS.length]}`}>
                    <GildedArch className="relative mx-auto aspect-[100/112] w-full rounded-[24px] shadow-[0_24px_48px_-28px_rgba(14,39,42,0.6)]">
                      <Image
                        src={pillar.image}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
                        className="object-cover transition duration-[1600ms] group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />
                    </GildedArch>
                    <span className="glass-strong relative z-10 mx-auto -mt-7 flex h-14 w-14 items-center justify-center rounded-full text-plum transition duration-500 group-hover:text-lilac-deep">
                      <Icon size={21} strokeWidth={1.1} />
                    </span>
                    <p className="mt-5 text-[10px] uppercase tracking-[0.3em] text-champagne-deep">
                      Promise 0{index + 1}
                    </p>
                    <h3 className="mt-2 px-4 font-display text-[30px] font-light">
                      {pillar.title}
                    </h3>
                    <p className="mx-auto mt-3 max-w-[320px] px-4 text-[15px] leading-[1.85] text-graphite">
                      {pillar.text}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trusted by hotels & spas — sage glass panel */}
      <section className="glow-botanical">
        <div className="container-site py-24 sm:py-28">
          <Reveal>
            <div className="glass tint-sage grid overflow-hidden rounded-[32px] p-2.5 text-midnight lg:grid-cols-[0.9fr_1.1fr]">
              <div className="relative min-h-[360px] overflow-hidden rounded-[24px] lg:min-h-[620px]">
                <Image
                  src="/media/products/aloe-vibe-shower-gel/04.jpg"
                  alt="Aloe Vibe Shower Gel on a bathroom shelf"
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight-deep/40 via-transparent to-transparent" />
                <p className="glass-dark glass-liquid !absolute bottom-5 left-5 rounded-full bg-midnight-deep/50 px-5 py-2 font-display text-[20px] italic text-ivory">
                  Hotel &amp; spa amenities
                </p>
              </div>

              <div className="relative px-7 py-14 sm:px-14 lg:px-16">
                <div className="pointer-events-none absolute -right-24 -top-24 h-[360px] w-[360px] rounded-full bg-saffron-soft/60 blur-3xl" />
                <p className="eyebrow relative text-sage-deep">
                  Beyond the bathroom shelf
                </p>
                <h2 className="heading-lg relative mt-6">
                  Trusted by{" "}
                  <em className="text-iris pr-2">hotels &amp; spas</em>
                </h2>
                <p className="relative mt-6 max-w-[480px] text-[15px] leading-[1.9] text-graphite">
                  Natural actives, pure essential oils, exquisite natural
                  fragrances and paraben-free preservatives — the same care that
                  goes into every Puro ritual, chosen by hotels and spas across
                  India.
                </p>

                <ul className="glass-strong mt-10 grid gap-x-8 gap-y-4 rounded-[26px] px-6 py-7 sm:grid-cols-2">
                  {HOTEL_CLIENTS.map((client) => (
                    <li
                      key={client}
                      className="flex items-center gap-3 font-display text-[21px] font-light"
                    >
                      <span className="text-[8px] text-sage-deep">◆</span>
                      {client}
                    </li>
                  ))}
                </ul>

                <p className="relative mt-8 text-[10px] uppercase tracking-[0.28em] text-sage-deep">
                  Signature amenity ranges
                </p>
                <div className="relative mt-4 flex flex-wrap gap-2">
                  {AMENITY_RANGES.map((range, i) => (
                    <span
                      key={range}
                      className={`glass rounded-full px-4 py-2 text-[13px] text-plum ${PILLAR_TINTS[i % PILLAR_TINTS.length]}`}
                    >
                      {range}
                    </span>
                  ))}
                </div>

                <p className="relative mt-10 text-[14px] text-graphite">
                  For hotel &amp; spa enquiries:{" "}
                  <a
                    href={`mailto:${SITE.email}`}
                    className="text-sage-deep underline-offset-4 hover:underline"
                  >
                    {SITE.email}
                  </a>{" "}
                  ·{" "}
                  <a
                    href={SITE.phoneHref}
                    className="text-sage-deep underline-offset-4 hover:underline"
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
        className="relative mx-2 scroll-mt-24 overflow-hidden rounded-[32px] bg-[radial-gradient(70%_60%_at_0%_0%,rgba(180,112,124,0.45),transparent_70%),radial-gradient(60%_60%_at_100%_100%,rgba(125,104,168,0.45),transparent_70%),linear-gradient(150deg,#4a2c42_0%,#2b1827_45%,#173c40_100%)] py-24 text-ivory shadow-[0_40px_80px_-40px_rgba(43,24,39,0.8),inset_0_1px_0_rgba(255,255,255,0.2)] sm:mx-3 sm:rounded-[40px] sm:py-32"
      >
        <div className="pointer-events-none absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-saffron/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-[560px] w-[560px] rounded-full bg-aqua/15 blur-3xl" />
        <div className="container-site relative grid items-center gap-16 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <GildedArch className="relative mx-auto aspect-[100/132] w-full max-w-[420px] rounded-[32px] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.75)] ring-1 ring-white/30">
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
            <p className="eyebrow text-quartz-soft">The heart of Puro</p>
            <h2 className="heading-lg mt-6">
              Every purchase{" "}
              <em className="text-iris-light pr-2">empowers a woman.</em>
            </h2>
            <p className="mt-8 text-[16px] leading-[1.9] text-ivory/80">
              Puro Body &amp; Soul is a division of{" "}
              <strong className="font-normal text-ivory">
                Shramik Naari Sangh (Sa-Ni-Sa)
              </strong>
              , a charitable organisation rooted in Jambhulpada, in
              Maharashtra&rsquo;s Sudhagad Taluka.
            </p>
            <blockquote className="glass-dark tint-plum mt-8 rounded-[28px] px-6 py-6 font-display text-[26px] font-light italic leading-snug text-saffron-soft sm:px-8 sm:text-[30px]">
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
      <section className="glow-botanical overflow-hidden py-20 sm:py-24">
        <Reveal className="container-site">
          <div className="glass tint-aqua rounded-[32px] px-6 py-14 text-center sm:px-12 sm:py-16">
            <p className="ornament text-[9px]">◆</p>
            <p className="mx-auto mt-8 max-w-[1000px] font-display text-[30px] font-light leading-[1.35] text-midnight sm:text-[40px] lg:text-[48px]">
              {TAGLINE_VERBS.map((verb, index) => (
                <span key={verb}>
                  <em className={index % 2 ? "text-iris pr-1" : undefined}>
                    {verb} it.
                  </em>{" "}
                </span>
              ))}
            </p>
            <p className="mt-6 text-[12px] uppercase tracking-[0.34em] text-aqua-deep">
              — flaunt it, naturally —
            </p>
            <Link href="/shop" className="btn-iris mt-10">
              Find your ritual <ArrowRight size={14} strokeWidth={1.25} />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Certifications band */}
      <section className="relative mx-2 overflow-hidden rounded-[32px] text-midnight shadow-[0_40px_80px_-40px_rgba(14,39,42,0.5)] sm:mx-3 sm:rounded-[40px]">
        <Image
          src="/media/products/terra-tress-hair-scalp-oil/05.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(150deg,rgba(248,227,184,0.72)_0%,rgba(246,227,228,0.72)_40%,rgba(236,229,246,0.74)_70%,rgba(225,242,242,0.74)_100%)] backdrop-blur-[6px]" />
        <div className="container-site relative py-20 sm:py-24">
          <Reveal className="text-center">
            <p className="eyebrow text-champagne-deep">Why choose Puro</p>
            <h2 className="heading-lg mt-5">
              Certified, tested, <em className="text-iris pr-2">trusted.</em>
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROMISES.map((promise, index) => {
              const Icon = promise.icon;
              return (
                <Reveal key={promise.title} delay={index * 0.08} className="h-full">
                  <div className={`glass glass-hover h-full rounded-[28px] p-7 text-center ${CERT_TINTS[index]}`}>
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/65 text-plum shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_0_0_1px_rgba(255,255,255,0.6),0_8px_18px_-12px_rgba(14,39,42,0.5)]">
                      <Icon size={22} strokeWidth={1.1} />
                    </span>
                    <h3 className="mt-6 font-display text-[24px] font-light">
                      {promise.title}
                    </h3>
                    <p className="mt-2 text-[14px] leading-7 text-graphite">
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
            <div className="glass tint-champagne overflow-hidden rounded-[32px] text-midnight">
              <div className="pointer-events-none absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full bg-quartz/40 blur-3xl" />
              <div className="relative grid gap-12 px-7 py-14 sm:px-14 lg:grid-cols-[1.3fr_1fr] lg:px-16 lg:py-16">
                <div>
                  <p className="eyebrow">Begin your ritual</p>
                  <h2 className="heading-lg mt-6">
                    Beauty that <em className="text-iris pr-2">gives back.</em>
                  </h2>
                  <p className="mt-6 max-w-[460px] text-[16px] leading-[1.9] text-stone">
                    Discover botanical care for face, body and hair — and know
                    that every ritual supports the women of Sa-Ni-Sa.
                  </p>
                  <Link
                    href="/shop"
                    className="btn-primary mt-10 px-9"
                  >
                    Shop the collection{" "}
                    <ArrowRight size={15} strokeWidth={1.25} />
                  </Link>
                </div>
                <div className="glass-strong rounded-[26px] p-7 sm:p-8">
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
