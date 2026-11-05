import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import {
  getActiveProducts,
  getConcerns,
  getIngredients,
  type Product,
} from "@/db/queries/products";
import { COLLECTIONS } from "@/lib/collections";
import Hero from "@/components/home/Hero";
import TrustMarquee from "@/components/home/TrustMarquee";
import ProductCard from "@/components/product/ProductCard";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Accordion from "@/components/ui/Accordion";

export const dynamic = "force-dynamic";

const PACK_EDIT = [
  {
    slug: "glow-up-pithi-pack",
    verb: "Brighten",
    image: "/media/products/glow-up-pithi-pack/05.jpg",
  },
  {
    slug: "vita-clay-ubtan-pack",
    verb: "Detoxify",
    image: "/media/products/vita-clay-ubtan-pack/03.jpg",
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

const FAQS = [
  {
    title: "Are Puro products suitable for sensitive skin?",
    content:
      "Every Puro formula is dermatologically tested and cruelty-free. Each product page lists the skin types it is made for — Aloe Vibe Shower Gel, for example, is suitable for all skin types including sensitive. As with any new product, we recommend a patch test first.",
  },
  {
    title: "Where should I begin?",
    content:
      "Start with the four-step ritual: a cleanser suited to your skin, Scrubulush to exfoliate, a weekly Pithi or Ubtan pack, and Aquench or Aqua Riche to hydrate. Or explore by concern — hydration, brightening, tan removal or oil control.",
  },
  {
    title: "What is a Pithi pack?",
    content:
      "Pithi is a traditional pre-wedding beauty ritual built around turmeric. Our Glow Up Pithi Pack blends home-grown turmeric with saffron, rice bran oil and natural clays — age-old wisdom in a tube, made for everyday radiance.",
  },
  {
    title: "How long do the products last?",
    content:
      "Most Puro formulas have a shelf life of 18 months from the date of manufacture; our artisanal bathing bars last 24 months. Store them in a cool, dry place away from direct sunlight.",
  },
  {
    title: "Do you offer gift sets?",
    content:
      "Yes — our Gift Edit includes keepsake boxes inspired by palace gardens, from the Peacock Radiant Glow Kit to travel and foot-spa rituals. They arrive ready to gift.",
  },
];

function bySlug(products: Product[], slug: string) {
  return products.find((product) => product.slug === slug);
}

export default async function Home() {
  const [products, concerns, ingredients] = await Promise.all([
    getActiveProducts(),
    getConcerns(),
    getIngredients(),
  ]);

  const signatures = products.filter((product) => product.isFeatured).slice(0, 4);

  return (
    <>
      <Hero />
      <TrustMarquee />

      {/* Brand statement */}
      <section className="container-site py-24 text-center sm:py-32">
        <Reveal>
          <p className="ornament text-[9px]">◆</p>
          <p className="mx-auto mt-10 max-w-[980px] font-display text-[30px] font-light leading-[1.35] text-emerald sm:text-[42px] lg:text-[50px]">
            Self-care is not another thing to do. It is a{" "}
            <em className="text-gold-deep">return to yourself</em> — through familiar
            botanicals, unhurried rituals and the quiet joy of taking time.
          </p>
        </Reveal>
      </section>

      {/* The Signatures */}
      <section className="container-site pb-24 sm:pb-32">
        <div className="mb-14 flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end">
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
        <div className="grid grid-cols-2 gap-x-4 gap-y-14 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
          {signatures.map((product, index) => (
            <Reveal key={product.id} delay={index * 0.08}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* The Pack Edit — triptych */}
      <section className="bg-emerald py-24 text-ivory sm:py-32">
        <div className="container-site">
          <SectionHeading
            eyebrow="The Pack Edit"
            title={
              <>
                Three packs. <em className="text-gold-soft">One weekly ritual.</em>
              </>
            }
            description="Rooted in the traditions of Pithi and Ubtan, our packs turn twenty minutes into a moment that is entirely yours."
            tone="light"
          />
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {PACK_EDIT.map((item, index) => {
              const product = bySlug(products, item.slug);
              if (!product) return null;
              return (
                <Reveal key={item.slug} delay={index * 0.12}>
                  <Link href={`/products/${item.slug}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden">
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
                        <p className="font-display text-[15px] italic text-gold-soft">
                          {item.verb}
                        </p>
                        <h3 className="mt-1 font-display text-[26px] font-light">
                          {product.name}
                        </h3>
                        <p className="mt-2 text-[13px] text-ivory/60">{product.headline}</p>
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

      {/* Heritage story */}
      <section id="story" className="scroll-mt-24">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[460px] lg:min-h-[760px]">
            <Image
              src="/media/products/glow-up-pithi-pack/04.jpg"
              alt="Glow Up Pithi Pack with turmeric, clay and rice bran oil"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex items-center bg-parchment px-6 py-20 sm:px-14 lg:px-20">
            <Reveal className="max-w-[520px]">
              <p className="eyebrow">Our Story</p>
              <h2 className="heading-lg mt-6 text-emerald">
                Age-old wisdom, <em>in a tube.</em>
              </h2>
              <p className="body-copy mt-8">
                Long before beauty aisles, there was Pithi — the golden turmeric ritual
                performed before a wedding, passed gently from one generation to the next.
                There was Ubtan, the clay-and-citrus paste that brought out the skin&rsquo;s
                own glow.
              </p>
              <p className="body-copy mt-5">
                Puro began with these rituals. We pair home-grown turmeric, saffron,
                sandalwood and volcanic clays with modern skin science, creating formulas
                that are cruelty-free, non-toxic and dermatologically tested — ethical,
                inside out.
              </p>
              <div className="mt-10 grid grid-cols-3 gap-6 border-t border-line pt-8">
                {[
                  ["15", "Botanical formulas"],
                  ["100%", "Cruelty-free"],
                  ["18", "Months shelf life"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <p className="font-display text-[34px] font-light text-emerald">{value}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-stone">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* The Ritual */}
      <section id="ritual" className="scroll-mt-24 py-24 sm:py-32">
        <div className="container-site">
          <SectionHeading
            eyebrow="The Puro Ritual"
            title={
              <>
                Four steps to <em>radiant</em> skin
              </>
            }
            description="Cleanse, exfoliate, mask and hydrate — the weekly ritual our formulas are designed around."
          />
          <div className="mt-16 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {RITUAL.map((item, index) => {
              const product = bySlug(products, item.slug);
              if (!product) return null;
              const image = product.images[0];
              return (
                <Reveal key={item.step} delay={index * 0.1}>
                  <Link href={`/products/${product.slug}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-parchment">
                      {image && (
                        <Image
                          src={image.imageUrl}
                          alt={product.name}
                          fill
                          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition duration-[1400ms] group-hover:scale-[1.04]"
                        />
                      )}
                      <span className="absolute left-5 top-4 font-display text-[54px] font-light leading-none text-gold/80">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="mt-6 font-display text-[30px] font-light text-emerald">
                      {item.step}
                    </h3>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-gold-deep">
                      {product.name}
                    </p>
                    <p className="mt-3 text-[14px] leading-7 text-stone">{item.note}</p>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ingredients */}
      {ingredients.length > 0 && (
        <section id="ingredients" className="scroll-mt-24 bg-parchment py-24 sm:py-32">
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
                    <div className="relative aspect-square overflow-hidden">
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

      {/* Collections */}
      <section className="container-site py-24 sm:py-32">
        <SectionHeading
          eyebrow="Explore"
          title={
            <>
              Shop by <em>collection</em>
            </>
          }
        />
        <div className="mt-16 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {COLLECTIONS.filter((collection) => collection.slug !== "wellness").map(
            (collection, index) => (
              <Reveal key={collection.slug} delay={index * 0.08}>
                <Link href={`/collections/${collection.slug}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden">
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
            )
          )}
        </div>
      </section>

      {/* Concerns */}
      <section className="bg-emerald-deep text-ivory">
        <div className="grid lg:grid-cols-[1fr_1.1fr]">
          <div className="relative min-h-[380px] lg:min-h-[640px]">
            <Image
              src="/media/brand/01.jpg"
              alt="The Puro Body & Soul collection"
              fill
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex items-center px-6 py-20 sm:px-14 lg:px-20">
            <div className="w-full max-w-[560px]">
              <Reveal>
                <p className="eyebrow text-gold-soft">Find your match</p>
                <h2 className="heading-lg mt-6">
                  Shop by <em className="text-gold-soft">concern</em>
                </h2>
              </Reveal>
              <ul className="mt-12 border-t border-ivory/15">
                {concerns.map((concern) => {
                  const count = products.filter((product) =>
                    product.concerns.some((c) => c.slug === concern.slug)
                  ).length;
                  return (
                    <li key={concern.id} className="border-b border-ivory/15">
                      <Link
                        href={`/concerns/${concern.slug}`}
                        className="group flex items-center justify-between gap-6 py-6"
                      >
                        <span>
                          <span className="block font-display text-[26px] font-light transition group-hover:text-gold-soft sm:text-[30px]">
                            {concern.name}
                          </span>
                          <span className="mt-1 block text-[13px] text-ivory/55">
                            {concern.description}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-4 text-[10px] uppercase tracking-[0.22em] text-gold-soft">
                          {count}
                          <ArrowUpRight
                            size={18}
                            strokeWidth={1}
                            className="transition group-hover:-translate-y-1 group-hover:translate-x-1"
                          />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Gifting */}
      <section className="container-site py-24 sm:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden bg-parchment">
              <Image
                src="/media/products/radiant-glow-luxurious-kit/02.jpg"
                alt="The Radiant Glow peacock keepsake box"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.1} className="max-w-[520px]">
            <p className="eyebrow">The Gift Edit</p>
            <h2 className="heading-lg mt-6 text-emerald">
              Give the gift of <em>a ritual.</em>
            </h2>
            <p className="body-copy mt-8">
              Inspired by palace gardens and the grace of the peacock, our keepsake boxes
              arrive ready to gift — curated rituals for weddings, festivals and the people
              who matter most.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/collections/gifting" className="btn-primary">
                Explore gift sets <ArrowRight size={15} strokeWidth={1.25} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 border-t border-line bg-parchment/50 py-24 sm:py-32">
        <div className="container-site grid gap-14 lg:grid-cols-[1fr_1.6fr]">
          <SectionHeading
            eyebrow="Questions"
            title={
              <>
                Good to <em>know</em>
              </>
            }
            align="left"
          />
          <Accordion items={FAQS} />
        </div>
      </section>
    </>
  );
}
