import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import {
  getActiveProducts,
  getConcerns,
  getFeaturedReviews,
  getIngredients,
  type Product,
} from "@/db/queries/products";
import { COLLECTIONS } from "@/lib/collections";
import Hero from "@/components/home/Hero";
import TrustMarquee from "@/components/home/TrustMarquee";
import ProductCarousel from "@/components/home/ProductCarousel";
import Testimonials, { Stars } from "@/components/home/Testimonials";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Accordion from "@/components/ui/Accordion";

export const dynamic = "force-dynamic";

const RITUAL_EDIT = [
  {
    slug: "vita-clay-ubtan-pack",
    verb: "Detoxify",
    image: "/media/products/vita-clay-ubtan-pack/03.jpg",
  },
  {
    slug: "scrubulush-exfoliator",
    verb: "Polish",
    image: "/media/products/scrubulush-exfoliator/07.jpg",
  },
  {
    slug: "aquench-soothing-hydrogel",
    verb: "Soothe",
    image: "/media/products/aquench-soothing-hydrogel/03.jpg",
  },
];

const RITUAL = [
  {
    step: "Cleanse",
    slug: "good-cleanse-face-wash",
    note: "Two pumps, a gentle lather, sixty seconds of circular massage.",
  },
  {
    step: "Exfoliate",
    slug: "scrubulush-exfoliator",
    note: "Twice a week on damp skin, to lift away dull, tired cells.",
  },
  {
    step: "Mask",
    slug: "glow-up-pithi-pack",
    note: "A thick layer, twenty unhurried minutes, then rinse to reveal the glow.",
  },
  {
    step: "Hydrate",
    slug: "aquench-soothing-hydrogel",
    note: "Massage in until absorbed to calm, cool and replenish.",
  },
];

/** Education rows, in the spirit of "What is tallow? / Why choose ours?" */
const WHY_PURO = [
  {
    title: "What are Pithi and Ubtan?",
    content:
      "Pithi is the golden turmeric ritual performed before an Indian wedding; Ubtan is the clay-and-botanical paste our grandmothers swore by. Our Glow Up Pithi Pack and Vita Clay Ubtan Pack bring these age-old rituals into a modern, ready-to-use tube — turmeric, saffron, rice bran oil, volcanic clays and citrus oils, blended for everyday radiance.",
  },
  {
    title: "Ethical, inside out",
    content:
      "Puro was founded to raise awareness about clean beauty. Our products are natural, cruelty-free and non-toxic, and free from harmful chemicals and toxins. We draw on the potent properties of botanical extracts and essential oils, and pair historical beauty knowledge with contemporary research.",
  },
  {
    title: "Every purchase supports a woman",
    content:
      "Puro Body & Soul is a division of Shramik Naari Sangh (Sa-Ni-Sa), a charitable organisation. For every product you buy, you help a rural woman to stand on her own feet and live a life of dignity.",
  },
  {
    title: "Kind to you, kind to the environment",
    content:
      "We strive to minimise our environmental footprint with recyclable packaging and sustainable practices — and we prioritise integrity and honesty, from how we source our ingredients to how our products are made.",
  },
  {
    title: "Certified, tested, trusted",
    content:
      "Every Puro product is certified Animal Cruelty-Free by PETA, dermatologically tested, non-toxic and crafted in a GMP-certified facility, so you can trust what goes on your skin.",
  },
];

function bySlug(products: Product[], slug: string) {
  return products.find((product) => product.slug === slug);
}

export default async function Home() {
  const [products, concerns, ingredients, reviews] = await Promise.all([
    getActiveProducts(),
    getConcerns(),
    getIngredients(),
    getFeaturedReviews(4),
  ]);

  const signatures = products.filter((product) => product.isFeatured);
  const rated = products.filter((product) => product.rating);
  const totalReviews = rated.reduce(
    (sum, product) => sum + product.rating!.count,
    0,
  );
  const averageRating = totalReviews
    ? rated.reduce(
        (sum, product) => sum + product.rating!.value * product.rating!.count,
        0,
      ) / totalReviews
    : 5;
  const testimonials = reviews.slice(0, 3);
  const heroQuote = reviews[3] ?? reviews[0];

  return (
    <>
      <Hero />
      <TrustMarquee />

      <div className="glow-botanical">
        {/* Intro — floating rounded panel */}
        <section className="container-site py-20 sm:py-28">
          <Reveal>
            <div className="grid overflow-hidden rounded-2xl bg-mist-deep shadow-[0_30px_80px_-50px_rgba(18,59,48,0.45)] lg:grid-cols-2">
              <div className="relative min-h-[380px] lg:min-h-[560px]">
                <Image
                  src="/media/brand/02.jpg"
                  alt="The Puro face and body pack collection"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex items-center px-7 py-14 sm:px-14 lg:px-16">
                <div className="max-w-[500px]">
                  <p className="eyebrow">Age-old wisdom, modern care</p>
                  <h2 className="heading-lg mt-6 text-emerald">
                    Botanicals our grandmothers trusted,{" "}
                    <em>made for today.</em>
                  </h2>
                  <p className="body-copy mt-7">
                    Long before beauty aisles, there was Pithi — the golden
                    turmeric ritual before a wedding — and Ubtan, the
                    clay-and-citrus paste that brought out skin&rsquo;s own
                    glow. Puro pairs these rituals with modern skin science:
                    home-grown turmeric, saffron, Aquaxyl™, volcanic clays and
                    essential oils.
                  </p>
                  <Link
                    href="/shop"
                    className="link-underline mt-9 text-emerald"
                  >
                    Discover the collection{" "}
                    <ArrowRight size={14} strokeWidth={1.25} />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* The Signatures — carousel */}
        <section className="container-site pb-24 sm:pb-32">
          <div className="mb-12 flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="The Signatures"
              title={
                <>
                  Our most <em>loved</em> rituals
                </>
              }
              align="left"
              className="max-sm:text-center"
            />
            <Link href="/shop" className="link-underline shrink-0 text-emerald">
              Shop all <ArrowRight size={14} strokeWidth={1.25} />
            </Link>
          </div>
          <ProductCarousel products={signatures} />
        </section>
      </div>

      {/* The weekend edit — triptych */}
      <section className="bg-emerald py-24 text-ivory sm:py-32">
        <div className="container-site">
          <SectionHeading
            eyebrow="The Weekend Edit"
            title={
              <>
                Detoxify, polish, soothe.{" "}
                <em className="text-gold-soft">Glow.</em>
              </>
            }
            description="Three weekly rituals that turn twenty minutes into a moment that is entirely yours."
            tone="light"
          />
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {RITUAL_EDIT.map((item, index) => {
              const product = bySlug(products, item.slug);
              if (!product) return null;
              return (
                <Reveal key={item.slug} delay={index * 0.12}>
                  <Link href={`/products/${item.slug}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                      <Image
                        src={item.image}
                        alt={product.name}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover transition duration-[1600ms] ease-out group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-6 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-display text-[17px] italic text-gold-soft">
                          {item.verb}
                        </p>
                        <h3 className="mt-1 font-display text-[26px] font-light">
                          {product.name}
                        </h3>
                        <p className="mt-2 text-[15px] leading-relaxed text-ivory/70">
                          {product.headline}
                        </p>
                      </div>
                      <ArrowUpRight
                        size={20}
                        strokeWidth={1}
                        className="mt-2 shrink-0 text-gold-soft transition group-hover:-translate-y-1 group-hover:translate-x-1"
                      />
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ingredients */}
      {ingredients.length > 0 && (
        <section
          id="ingredients"
          className="glow-botanical-alt scroll-mt-24 py-24 sm:py-32"
        >
          <div className="container-site">
            <SectionHeading
              eyebrow="From the Earth"
              title={
                <>
                  Ingredients with a <em>story</em>
                </>
              }
              description="Familiar botanicals, thoughtfully sourced and blended with care."
            />
            <div className="mt-16 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-3">
              {ingredients.map((ingredient, index) => (
                <Reveal key={ingredient.id} delay={(index % 3) * 0.1}>
                  <div className="group">
                    <div className="relative aspect-square overflow-hidden rounded-2xl">
                      {ingredient.imageUrl && (
                        <Image
                          src={ingredient.imageUrl}
                          alt={ingredient.name}
                          fill
                          sizes="(min-width: 1024px) 33vw, 50vw"
                          className="object-cover transition duration-[1600ms] group-hover:scale-105"
                        />
                      )}
                    </div>
                    <h3 className="mt-6 font-display text-[26px] font-light text-emerald">
                      {ingredient.name}
                    </h3>
                    <p className="mt-2 max-w-[360px] text-[14px] leading-7 text-stone">
                      {ingredient.benefits}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* The Ritual — palace arches on emerald */}
      <section
        id="ritual"
        className="relative scroll-mt-24 overflow-hidden bg-emerald-deep py-24 text-ivory sm:py-32"
      >
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-emerald-soft/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 -left-40 h-[480px] w-[480px] rounded-full bg-gold/10 blur-3xl" />
        <div className="container-site relative">
          <SectionHeading
            eyebrow="The Puro Ritual"
            title={
              <>
                Four steps to <em className="text-gold-soft">radiant</em> skin
              </>
            }
            description="Cleanse, exfoliate, mask and hydrate — the weekly ritual our formulas are designed around."
            tone="light"
          />

          <div className="relative mt-16 grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
            {/* Gold thread linking the steps */}
            <div className="pointer-events-none absolute inset-x-[12%] top-[calc(50%-3.5rem)] hidden h-px bg-gradient-to-r from-gold/0 via-gold/50 to-gold/0 lg:block" />
            {RITUAL.map((item, index) => {
              const product = bySlug(products, item.slug);
              if (!product) return null;
              const image = product.images[0];
              return (
                <Reveal key={item.step} delay={index * 0.12}>
                  <Link
                    href={`/products/${product.slug}`}
                    className="group block text-center"
                  >
                    <div className="relative mx-auto aspect-[3/4] w-full max-w-[300px] overflow-hidden rounded-t-full bg-parchment p-3 ring-1 ring-gold/40 ring-offset-[6px] ring-offset-emerald-deep transition duration-700 group-hover:ring-gold">
                      <div className="relative h-full w-full overflow-hidden rounded-t-full bg-parchment">
                        {image && (
                          <Image
                            src={image.imageUrl}
                            alt={product.name}
                            fill
                            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                            className="object-cover mix-blend-multiply transition duration-[1400ms] group-hover:scale-[1.05]"
                          />
                        )}
                      </div>
                    </div>
                    <span className="relative z-10 mx-auto -mt-6 flex h-12 w-12 items-center justify-center rounded-full border border-gold/60 bg-emerald-deep font-display text-[18px] text-gold-soft">
                      0{index + 1}
                    </span>
                    <h3 className="mt-5 font-display text-[34px] font-light">
                      {item.step}
                    </h3>
                    <p className="mt-2 text-[12px] uppercase tracking-[0.22em] text-gold-soft">
                      {product.name}
                    </p>
                    <p className="mx-auto mt-4 max-w-[280px] text-[16px] leading-[1.8] text-ivory/75">
                      {item.note}
                    </p>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Collections */}
      <section className="glow-botanical bg-mist-deep py-24 sm:py-32">
        <div className="container-site">
          <SectionHeading
            eyebrow="Explore"
            title={
              <>
                Shop by <em>collection</em>
              </>
            }
          />
          <div className="mt-16 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {COLLECTIONS.filter(
              (collection) => collection.slug !== "wellness",
            ).map((collection, index) => (
              <Reveal key={collection.slug} delay={index * 0.08}>
                <Link
                  href={`/collections/${collection.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                    <Image
                      src={collection.image}
                      alt={collection.title}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover transition duration-[1600ms] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/75 via-emerald-deep/10 to-transparent" />
                    <div className="absolute inset-x-5 bottom-5 flex items-end justify-between text-ivory sm:inset-x-7 sm:bottom-7">
                      <h3 className="font-display text-[26px] font-light sm:text-[32px]">
                        {collection.name}
                      </h3>
                      <ArrowUpRight
                        size={20}
                        strokeWidth={1}
                        className="mb-1.5 transition group-hover:-translate-y-1 group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Sa-Ni-Sa — full-bleed brand meaning */}
      <section
        id="story"
        className="relative scroll-mt-24 overflow-hidden text-ivory"
      >
        <Image
          src="/media/products/good-cleanse-face-wash/04.jpg"
          alt="Good Cleanse Face Wash beside a lit diya"
          fill
          sizes="100vw"
          className="object-cover object-[50%_60%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-deep/90 via-emerald-deep/60 to-emerald-deep/10" />
        <div className="container-site relative flex min-h-[640px] items-center py-24">
          <Reveal className="max-w-[560px]">
            <p className="eyebrow text-gold-soft">The heart of Puro</p>
            <h2 className="heading-lg mt-6">
              Every purchase{" "}
              <em className="text-gold-soft">empowers a woman.</em>
            </h2>
            <p className="mt-7 text-[16px] leading-[1.9] text-ivory/80">
              Puro Body &amp; Soul is a division of{" "}
              <strong className="font-normal text-ivory">
                Shramik Naari Sangh
              </strong>{" "}
              — Sa-Ni-Sa — a charitable organisation. For every product you buy,
              you help a rural woman to stand on her own feet and live a life of
              dignity.
            </p>
            <p className="mt-5 font-display text-[22px] italic text-gold-soft">
              Beauty that gives back. Ethical, inside out.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-7">
              <Link href="/shop" className="btn-outline-light rounded-full px-9">
                Shop with purpose <ArrowRight size={15} strokeWidth={1.25} />
              </Link>
              <Link href="/our-story" className="link-underline text-ivory">
                Read our story
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Concerns */}
      <section className="glow-botanical-alt">
        <div className="container-site py-24 sm:py-32">
          <div className="grid overflow-hidden rounded-2xl bg-emerald-deep text-ivory lg:grid-cols-[1fr_1.15fr]">
            <div className="relative min-h-[360px]">
              <Image
                src="/media/brand/01.jpg"
                alt="The Puro Body & Soul collection"
                fill
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="px-7 py-14 sm:px-14 lg:px-16">
              <Reveal>
                <p className="eyebrow text-gold-soft">Find your match</p>
                <h2 className="heading-lg mt-6">
                  Shop by <em className="text-gold-soft">concern</em>
                </h2>
              </Reveal>
              {(["skin", "hair"] as const).map((type) => (
                <div key={type} className="mt-10">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/50">
                    {type === "skin" ? "For your skin" : "For your hair"}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {concerns
                      .filter((concern) => concern.type === type)
                      .map((concern) => (
                        <Link
                          key={concern.id}
                          href={`/concerns/${concern.slug}`}
                          className="rounded-full border border-ivory/25 px-5 py-2.5 font-display text-[17px] transition hover:border-gold-soft hover:bg-gold-soft hover:text-emerald-deep"
                        >
                          {concern.name}
                        </Link>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials
        reviews={testimonials}
        totalReviews={totalReviews}
        averageRating={averageRating}
      />

      {/* Why Puro — education accordion */}
      <section
        id="why-puro"
        className="glow-botanical scroll-mt-24 border-y border-line bg-mist-deep py-24 sm:py-32"
      >
        <div className="container-site grid gap-14 lg:grid-cols-[1fr_1.6fr]">
          <SectionHeading
            eyebrow="Why Puro"
            title={
              <>
                Good to <em>know</em>
              </>
            }
            description="What goes into every Puro ritual — and what we stand for."
            align="left"
          />
          <Accordion items={WHY_PURO} />
        </div>
      </section>

      {/* Gifting — floating rounded panel */}
      <section className="glow-botanical-alt">
        <div className="container-site py-24 sm:py-32">
          <Reveal>
            <div className="grid items-stretch overflow-hidden rounded-2xl bg-mist-deep shadow-[0_30px_80px_-50px_rgba(18,59,48,0.45)] lg:grid-cols-2">
              <div className="relative min-h-[420px] lg:min-h-[600px]">
                <Image
                  src="/media/products/radiant-glow-luxurious-kit/02.jpg"
                  alt="The Radiant Glow peacock keepsake box"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex items-center px-7 py-14 sm:px-14 lg:px-16">
                <div className="max-w-[500px]">
                  <p className="eyebrow">The Gift Edit</p>
                  <h2 className="heading-lg mt-6 text-emerald">
                    Give the gift of <em>a ritual.</em>
                  </h2>
                  <p className="body-copy mt-7">
                    Inspired by palace gardens and the grace of the peacock, our
                    keepsake boxes arrive ready to gift — curated rituals for
                    weddings, festivals and the people who matter most.
                  </p>
                  <Link
                    href="/collections/gifting"
                    className="btn-primary mt-10 rounded-full px-9"
                  >
                    Explore gift sets{" "}
                    <ArrowRight size={15} strokeWidth={1.25} />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Quote band */}
      {heroQuote && (
        <section className="bg-emerald py-20 text-center text-ivory sm:py-24">
          <Reveal className="container-site">
            <Stars rating={heroQuote.rating} size={16} />
            <p className="mx-auto mt-7 max-w-[900px] font-display text-[30px] font-light leading-[1.3] sm:text-[42px]">
              &ldquo;{heroQuote.title}&rdquo;
            </p>
            <p className="mt-5 text-[12px] uppercase tracking-[0.24em] text-gold-soft">
              {heroQuote.author} · {heroQuote.productName}
            </p>
            <Link href="/shop" className="link-underline mt-10 text-ivory">
              Shop now <ArrowRight size={14} strokeWidth={1.25} />
            </Link>
          </Reveal>
        </section>
      )}
    </>
  );
}
