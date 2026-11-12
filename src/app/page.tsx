import type { Metadata } from "next";
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
import { cutoutFor } from "@/lib/cutouts";
import { formatPrice } from "@/lib/format";
import { JOURNAL } from "@/lib/journal";
import CinematicHero, { type HeroProduct } from "@/components/home/CinematicHero";
import ShelfDisplay, { type Shelf, type ShelfProduct } from "@/components/home/ShelfDisplay";
import Apothecary, { type ApothecaryItem } from "@/components/home/Apothecary";
import IngredientExplorer, { type ExplorerIngredient } from "@/components/home/IngredientExplorer";
import ConcernFinder, { type FinderProduct } from "@/components/home/ConcernFinder";
import Testimonials from "@/components/home/Testimonials";
import Reveal from "@/components/ui/Reveal";
import ImageReveal from "@/components/motion/ImageReveal";
import Parallax from "@/components/motion/Parallax";
import ScrollWords from "@/components/motion/ScrollWords";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "PURO Body & Soul — The Art of Conscious Skin" },
  description:
    "Discover PURO Body & Soul: thoughtfully formulated face, body and hair care with turmeric, saffron, aloe and botanical oils. Cruelty-free, dermatologically tested and made to give back.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "PURO Body & Soul — The Art of Conscious Skin",
    description: "Thoughtfully formulated face, body and hair care where botanical ingredients meet considered formulation.",
    images: ["/media/video/hero-wide-poster.jpg"],
    type: "website",
  },
};

/** Products that rise in the hero, left · centre · right. */
const HERO_SLUGS = ["aquench-soothing-hydrogel", "glow-up-pithi-pack", "vita-clay-ubtan-pack"];

/** Collection a product belongs to, for colouring its carton in the Apothecary. */
function shelfOf(product: Product): ApothecaryItem["shelf"] {
  for (const key of ["gifting", "face", "body", "hair"] as const) {
    if (inCollection([product], key).length) return key;
  }
  return "wellness";
}

/** Category visuals for Section 3. */
const CATEGORY_ART: Record<string, { image: string; position?: string; line: string }> = {
  face: {
    image: "/media/products/aqua-riche-night-repair-gel-cream/04.jpg",
    line: "Cleansers, packs and gels for clear, luminous skin.",
  },
  body: {
    image: "/media/products/sheavibe-lotion/03.jpg",
    line: "Polish, cleanse and nourish — soft from head to toe.",
  },
  hair: {
    image: "/media/products/terra-tress-hair-scalp-oil/02.jpg",
    line: "Botanical oils that care for the scalp and every strand.",
  },
};

const PRINCIPLES = [
  {
    title: "A story that gives back",
    text: "PURO Body & Soul is a division of Shramik Naari Sangh (Sa-Ni-Sa), a charitable organisation. Every purchase helps a rural woman stand on her own feet and live a life of dignity.",
  },
  {
    title: "Formulation, considered",
    text: "We pair historical beauty knowledge with contemporary research. Every formula is dermatologically tested and crafted in a GMP-certified facility.",
  },
  {
    title: "Ingredients with intent",
    text: "Botanical extracts and essential oils — turmeric, saffron, aloe, clays and cold-pressed oils — chosen for the role they play, never for decoration.",
  },
  {
    title: "Conscious, inside out",
    text: "Certified cruelty-free by PETA, free from harmful toxins, and packed with recyclable materials wherever we can. Honest about how and where things are made.",
  },
];

/** Glass tint for each collection card, principle and journal category. */
const CATEGORY_TINT: Record<string, string> = { face: "tint-quartz", body: "tint-saffron", hair: "tint-lilac" };
const PRINCIPLE_TINTS = [
  { glass: "tint-quartz", number: "text-quartz-deep" },
  { glass: "tint-sage", number: "text-sage-deep" },
  { glass: "tint-saffron", number: "text-saffron-deep" },
  { glass: "tint-lilac", number: "text-lilac-deep" },
];
const JOURNAL_TINT: Record<string, string> = { Rituals: "tint-saffron", Routines: "tint-quartz", Ingredients: "tint-sage" };

/** Words that are too generic to match an ingredient to a product. */
const GENERIC = new Set(["vera", "butter", "volcanic", "extract", "natural", "oil", "oils"]);

function ingredientKeywords(name: string) {
  return name
    .toLowerCase()
    .split(/[\s&,]+/)
    .filter((word) => word.length > 3 && !GENERIC.has(word));
}

function firstSentences(text: string | null, count = 2) {
  if (!text) return null;
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  return sentences.slice(0, count).join(" ").trim();
}

function inCollection(products: Product[], slug: string) {
  const collection = COLLECTIONS.find((item) => item.slug === slug);
  return collection
    ? products.filter((product) => product.categories.some((category) => collection.categorySlugs.includes(category.slug)))
    : [];
}

function SectionLabel({ index, children, tone = "dark" }: { index: string; children: React.ReactNode; tone?: "dark" | "light" }) {
  return (
    <p className={tone === "dark" ? "label text-champagne-deep" : "label text-champagne"}>
      <span className="tabular-nums">{index}</span> — {children}
    </p>
  );
}

export default async function Home() {
  const [products, concerns, ingredients, reviews] = await Promise.all([
    getActiveProducts(),
    getConcerns(),
    getIngredients(),
    getFeaturedReviews(8),
  ]);

  const bySlug = (slug: string) => products.find((product) => product.slug === slug);
  const byReviews = (list: Product[]) =>
    [...list].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || (b.rating?.count ?? 0) - (a.rating?.count ?? 0));

  // ---- Hero ----
  const heroProducts: HeroProduct[] = HERO_SLUGS.flatMap((slug) => {
    const product = bySlug(slug);
    const cutout = cutoutFor(slug);
    return product && cutout ? [{ slug, name: product.name, cutout: `/media/cutouts/hero/${slug}.webp` }] : [];
  });

  // ---- Categories ----
  const categories = COLLECTIONS.filter((collection) => collection.slug in CATEGORY_ART).map((collection) => ({
    ...collection,
    ...CATEGORY_ART[collection.slug],
    count: inCollection(products, collection.slug).length,
  }));

  // ---- Shelves (Section 3 · gallery) ----
  const toShelf = (product: Product): ShelfProduct => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    images: product.images.slice(0, 1),
    variants: product.variants.slice(0, 1),
    category: product.subCategory ?? product.categories[0]?.name ?? null,
    headline: product.headline ?? product.summary,
    size: product.sizeLabel ?? product.variants[0]?.name ?? null,
    cutout: cutoutFor(product.slug),
  });
  const shelves: Shelf[] = [
    { key: "face", title: "Face care", href: "/collections/face" },
    { key: "body", title: "Body care", href: "/collections/body" },
    { key: "hair", title: "Hair & scalp", href: "/collections/hair" },
    { key: "gifting", title: "Gift sets", href: "/collections/gifting" },
  ]
    .map((shelf) => ({ ...shelf, products: byReviews(inCollection(products, shelf.key)).map(toShelf) }))
    .filter((shelf) => shelf.products.length > 0);

  // ---- The Apothecary (Section 5 · featured) ----
  const apothecary: ApothecaryItem[] = byReviews(products).map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    images: product.images.slice(0, 1),
    variants: product.variants.slice(0, 1),
    shelf: shelfOf(product),
    category: product.subCategory ?? product.categories[0]?.name ?? null,
    headline: product.tagline ?? product.headline,
    keyIngredients: product.keyIngredients?.split(",").map((item) => item.trim()).filter(Boolean) ?? [],
    benefits: product.benefits,
    ritual: firstSentences(product.howToUse, 1),
    price: product.variants[0] ? formatPrice(product.variants[0].price) : null,
    size: product.sizeLabel ?? product.variants[0]?.name ?? null,
    cutout: cutoutFor(product.slug) ? `/media/cutouts/dark/${product.slug}.webp` : null,
    photo: (product.images[2] ?? product.images[1] ?? product.images[0])?.imageUrl ?? null,
  }));

  // ---- Ingredients ----
  const explorer: ExplorerIngredient[] = ingredients.map((ingredient) => {
    const words = ingredientKeywords(ingredient.name);
    const related = products.filter((product) => {
      const keys = (product.keyIngredients ?? "").toLowerCase();
      return words.some((word) => keys.includes(word));
    });
    return {
      slug: ingredient.slug,
      name: ingredient.name,
      role: ingredient.benefits,
      image: ingredient.imageUrl,
      products: byReviews(related).map((product) => ({
        slug: product.slug,
        name: product.name,
        image: product.images[0]?.imageUrl ?? null,
        price: product.variants[0] ? formatPrice(product.variants[0].price) : null,
      })),
    };
  });

  // ---- Finder ----
  const finderProducts: FinderProduct[] = products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    headline: product.headline,
    images: product.images.slice(0, 1),
    variants: product.variants.slice(0, 1),
    concernSlugs: product.concerns.map((concern) => concern.slug),
  }));

  // ---- Reviews ----
  const rated = products.filter((product) => product.rating);
  const totalReviews = rated.reduce((sum, product) => sum + product.rating!.count, 0);
  const averageRating = totalReviews
    ? rated.reduce((sum, product) => sum + product.rating!.value * product.rating!.count, 0) / totalReviews
    : 0;
  const reviewImages = Object.fromEntries(
    products.map((product) => [
      product.slug,
      (product.images[2] ?? product.images[1] ?? product.images[0])?.imageUrl ?? "/media/brand/02.jpg",
    ]),
  );

  return (
    <>
      {/* ═════ 1 · Cinematic hero ═════ */}
      <CinematicHero products={heroProducts} />

      {/* ═════ 2 · Brand introduction ═════ */}
      <section id="atelier" className="bg-pearl scroll-mt-20 py-24 sm:py-32 lg:py-40">
        <div className="container-site">
          <Reveal>
            <SectionLabel index="01">The Atelier</SectionLabel>
          </Reveal>
          <Reveal delay={0.1} className="glass mt-10 rounded-[28px] px-6 py-10 sm:rounded-[36px] sm:px-12 sm:py-14 lg:px-16 lg:py-20">
            <p className="max-w-[1180px] font-display text-[34px] font-light leading-[1.08] tracking-[-0.01em] text-midnight sm:text-[58px] lg:text-[76px]">
              Where{" "}
              <span className="relative mx-1 inline-block h-[0.78em] w-[1.5em] translate-y-[0.08em] overflow-hidden rounded-full align-baseline">
                <Image src="/media/products/glow-up-pithi-pack/04.jpg" alt="" fill sizes="120px" className="object-cover" />
              </span>{" "}
              botanical wisdom meets <em className="text-iris pr-[0.05em]">modern formulation</em> — care that is{" "}
              <span className="relative mx-1 inline-block h-[0.78em] w-[1.5em] translate-y-[0.08em] overflow-hidden rounded-full align-baseline">
                <Image src="/media/products/aquench-soothing-hydrogel/03.jpg" alt="" fill sizes="120px" className="object-cover" />
              </span>{" "}
              felt, never hurried.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:mt-16 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <ImageReveal className="aspect-[4/5] rounded-[28px] shadow-[0_40px_80px_-50px_rgba(14,39,42,0.7)]">
                <Parallax strength={8}>
                  <Image
                    src="/media/products/terra-tress-hair-scalp-oil/05.jpg"
                    alt="A dropper of botanical oil above a glass bowl with lavender"
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                </Parallax>
              </ImageReveal>
            </div>
            <div className="flex flex-col justify-end lg:col-span-6 lg:col-start-7">
              <ImageReveal className="hidden aspect-[16/10] rounded-[28px] shadow-[0_40px_80px_-50px_rgba(14,39,42,0.7)] lg:block" delay={0.15}>
                <Image
                  src="/media/brand/01.jpg"
                  alt="The PURO collection of face and body care"
                  fill
                  sizes="45vw"
                  className="object-cover"
                />
              </ImageReveal>
              <Reveal className="glass tint-apricot relative z-10 rounded-[28px] p-7 sm:p-10 lg:-ml-[22%] lg:-mt-32 lg:max-w-[600px]">
                <ScrollWords
                  text="PURO began with a simple belief: that skincare should be as honest as it is beautiful. We look to the turmeric, saffron and clays generations have trusted, and refine them with the care of a modern laboratory."
                  className="font-display text-[24px] leading-[1.35] text-graphite sm:text-[28px]"
                />
                <Link href="/our-story" className="link-underline mt-10 text-midnight">
                  Our philosophy <ArrowRight size={14} strokeWidth={1.3} />
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═════ 3 · Categories ═════ */}
      <section aria-labelledby="categories-title" className="bg-pearl py-24 sm:py-32">
        <div className="container-site">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <Reveal>
              <SectionLabel index="02">The Collections</SectionLabel>
              <h2 id="categories-title" className="heading-lg mt-6 text-midnight">
                Care for <em className="text-iris pr-[0.08em]">every part</em> of you.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <Link href="/shop" className="link-underline text-midnight">
                Shop all <ArrowRight size={14} strokeWidth={1.3} />
              </Link>
            </Reveal>
          </div>

          <div className="no-scrollbar -mx-5 mt-14 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-4 sm:mx-0 sm:pb-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0 lg:gap-8">
            {categories.map((category, index) => (
              <Reveal key={category.slug} delay={index * 0.12} className="w-[78vw] shrink-0 snap-start sm:w-auto">
                <Link href={`/collections/${category.slug}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[28px] bg-mist-deep shadow-[0_40px_70px_-45px_rgba(14,39,42,0.75)]">
                    <Image
                      src={category.image}
                      alt={`${category.title} by PURO`}
                      fill
                      sizes="(min-width: 640px) 32vw, 78vw"
                      className="object-cover transition duration-[1.6s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
                    <span className="glass-strong absolute left-4 top-4 rounded-full px-3 py-1.5 text-[11px] font-medium tabular-nums tracking-[0.24em] text-midnight">
                      0{index + 1}
                    </span>
                    {/* Caption plate of tinted glass, coloured by collection */}
                    <span
                      className={`glass ${CATEGORY_TINT[category.slug] ?? "tint-champagne"} absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 rounded-[22px] p-4 text-midnight sm:inset-x-4 sm:bottom-4 sm:p-5`}
                    >
                      <span>
                        <span className="block font-display text-[40px] font-light italic leading-none lg:text-[52px]">{category.name}</span>
                        <span className="mt-2 block text-[11px] font-medium uppercase tracking-[0.22em] text-graphite">
                          {category.count} formulas
                        </span>
                      </span>
                      <span className="btn-glass h-11 w-11 shrink-0 !p-0 transition duration-500 group-hover:rotate-45">
                        <ArrowUpRight size={17} strokeWidth={1.3} />
                      </span>
                    </span>
                  </div>
                  <div className="mt-5 px-1">
                    <h3 className="font-display text-[26px] leading-tight text-midnight">{category.title}</h3>
                    <p className="mt-1.5 max-w-[320px] text-[14px] leading-[1.65] text-stone">{category.line}</p>
                  </div>
                  <span className="sr-only">Explore {category.title}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═════ 4 · Product gallery: the PURO shelves ═════ */}
      <section id="shop" aria-labelledby="gallery-title" className="bg-pearl scroll-mt-20 py-24 sm:py-32">
        <div className="container-site">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <Reveal>
              <SectionLabel index="03">The Shelves</SectionLabel>
              <h2 id="gallery-title" className="heading-lg mt-6 max-w-[760px] text-midnight">
                Take something <em className="text-iris pr-[0.08em]">off the shelf.</em>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-[340px] text-[14px] leading-[1.7] text-stone">
                Browse the way you would in our atelier. Tap + to drop a formula into your basket, or the heart to save it.
              </p>
            </Reveal>
          </div>
          <div className="mt-14">
            <ShelfDisplay shelves={shelves} />
          </div>
        </div>
      </section>

      {/* ═════ 5 · Featured products: the Apothecary ═════ */}
      <Apothecary items={apothecary} />

      {/* ═════ 6 · Ingredient explorer ═════ */}
      {explorer.length > 0 && (
        <section id="ingredients" aria-labelledby="ingredients-title" className="bg-pearl scroll-mt-20 py-24 text-midnight sm:py-32">
          <div className="container-site">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <Reveal>
                <SectionLabel index="05">The Ingredient Library</SectionLabel>
                <h2 id="ingredients-title" className="heading-lg mt-6">
                  Know what you <em className="text-iris pr-[0.08em]">put on your skin.</em>
                </h2>
              </Reveal>
              <Reveal delay={0.1} className="self-end">
                <p className="max-w-[520px] text-[16px] leading-[1.8] text-stone">
                  Every PURO formula is built around a handful of familiar botanicals. Choose one to see the role it plays and
                  the formulas you&rsquo;ll find it in.
                </p>
              </Reveal>
            </div>
            <div className="mt-14 sm:mt-20">
              <IngredientExplorer ingredients={explorer} />
            </div>
          </div>
        </section>
      )}

      {/* ═════ 7 · Skincare discovery ═════ */}
      {concerns.length > 0 && (
        <section id="finder" aria-labelledby="finder-title" className="bg-pearl scroll-mt-20 py-24 sm:py-32">
          <div className="container-site">
            <div className="mx-auto max-w-[760px] text-center">
              <Reveal>
                <p className="label justify-center text-champagne-deep">
                  <span className="tabular-nums">06</span> — Skincare Finder
                </p>
                <h2 id="finder-title" className="heading-lg mt-6 text-midnight">
                  Find your <em className="text-iris pr-[0.08em]">ritual.</em>
                </h2>
                <p className="mx-auto mt-5 max-w-[520px] text-[16px] leading-[1.8] text-stone">
                  Choose skin or hair, tell us what you&rsquo;d like to focus on, and we&rsquo;ll suggest formulas to explore.
                </p>
              </Reveal>
            </div>
            <div className="mt-14">
              <ConcernFinder concerns={concerns} products={finderProducts} />
            </div>
            <p className="mx-auto mt-10 max-w-[620px] text-center text-[12px] leading-[1.7] text-stone">
              The finder suggests products based on the concerns each formula was designed for. It is a guide to discovery and
              does not diagnose or treat any medical condition.
            </p>
          </div>
        </section>
      )}

      {/* ═════ 8 · Brand philosophy ═════ */}
      <section id="philosophy" aria-labelledby="philosophy-title" className="bg-pearl py-24 text-midnight sm:py-32">
        <div className="container-site grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <Reveal>
                <SectionLabel index="07">Our Philosophy</SectionLabel>
                <h2 id="philosophy-title" className="heading-lg mt-6">
                  Made with intention. <em className="text-iris pr-[0.08em]">Worn with conscience.</em>
                </h2>
              </Reveal>
              <ImageReveal className="mt-12 hidden aspect-[5/4] rounded-[28px] shadow-[0_40px_80px_-50px_rgba(14,39,42,0.7)] lg:block">
                <Image
                  src="/media/products/good-cleanse-face-wash/04.jpg"
                  alt="Good Cleanse Face Wash beside a lit diya"
                  fill
                  sizes="40vw"
                  className="object-cover object-[50%_60%]"
                />
              </ImageReveal>
            </div>
          </div>
          <ol className="space-y-4 sm:space-y-5 lg:col-span-6 lg:col-start-7">
            {PRINCIPLES.map((principle, index) => (
              <Reveal key={principle.title} delay={index * 0.05}>
                <li
                  className={`glass glass-hover ${PRINCIPLE_TINTS[index % PRINCIPLE_TINTS.length].glass} grid grid-cols-[40px_1fr] gap-3 rounded-[26px] p-6 sm:grid-cols-[64px_1fr] sm:gap-4 sm:rounded-[30px] sm:p-10`}
                >
                  <span className={`font-display text-[26px] italic ${PRINCIPLE_TINTS[index % PRINCIPLE_TINTS.length].number}`}>0{index + 1}</span>
                  <div>
                    <h3 className="font-display text-[32px] font-light leading-[1.05] sm:text-[40px]">{principle.title}</h3>
                    <p className="mt-4 max-w-[520px] text-[15px] leading-[1.8] text-graphite sm:text-[16px]">{principle.text}</p>
                  </div>
                </li>
              </Reveal>
            ))}
            <Reveal>
              <li className="pt-6">
                <Link href="/our-story" className="btn-iris rounded-full px-9">
                  Read our story <ArrowRight size={15} strokeWidth={1.3} />
                </Link>
              </li>
            </Reveal>
          </ol>
        </div>
      </section>

      {/* ═════ 9 · Journal ═════ */}
      <section id="journal" aria-labelledby="journal-title" className="bg-pearl scroll-mt-20 py-24 sm:py-32">
        <div className="container-site">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <Reveal>
              <SectionLabel index="08">The Journal</SectionLabel>
              <h2 id="journal-title" className="heading-lg mt-6 text-midnight">
                Notes on <em className="text-iris pr-[0.08em]">ritual &amp; craft.</em>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-[360px] text-[14px] leading-[1.7] text-stone">
                Ingredient stories, routines and the traditions behind our formulas. New pieces arrive soon.
              </p>
            </Reveal>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-6 lg:gap-8">
            {JOURNAL.map((article, index) => (
              <Reveal key={article.slug} delay={index * 0.1}>
                <article className={`glass glass-hover ${JOURNAL_TINT[article.category] ?? "tint-champagne"} rounded-[30px] p-3 pb-7 sm:p-3.5 sm:pb-8 ${index === 1 ? "md:mt-16" : ""}`}>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-mist-deep">
                    <Image src={article.image} alt={article.imageAlt} fill sizes="(min-width: 768px) 30vw, 100vw" className="object-cover" />
                    <span className="glass-strong absolute left-3 top-3 rounded-full px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-midnight">
                      {article.category}
                    </span>
                  </div>
                  <div className="px-3 sm:px-4">
                  <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.22em] text-stone">
                    {article.readTime} · Coming soon
                  </p>
                  <h3 className="mt-2 font-display text-[28px] leading-[1.1] text-midnight">{article.title}</h3>
                  <p className="mt-3 text-[14px] leading-[1.7] text-stone">{article.excerpt}</p>
                  {article.product && (
                    <Link href={`/products/${article.product.slug}`} className="link-underline mt-5 text-midnight">
                      {article.product.label}
                    </Link>
                  )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═════ 10 · Customer reviews ═════ */}
      {reviews.length > 0 && (
        <section aria-label="Customer reviews" className="bg-pearl py-16 sm:py-24">
          <div className="container-site">
            <div className="overflow-hidden rounded-[28px] shadow-[0_50px_100px_-50px_rgba(125,104,168,0.75)] ring-1 ring-white/70 sm:rounded-[36px]">
              <Testimonials reviews={reviews} totalReviews={totalReviews} averageRating={averageRating} images={reviewImages} />
            </div>
          </div>
        </section>
      )}

      {/* 11 · Newsletter and 12 · Footer live in the site footer. */}
    </>
  );
}
