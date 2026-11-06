import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HeartHandshake, Leaf, Rabbit } from "lucide-react";
import {
  getActiveProducts,
  getConcerns,
  getFeaturedReviews,
  getIngredients,
  type Product,
} from "@/db/queries/products";
import { COLLECTIONS } from "@/lib/collections";
import { formatPrice } from "@/lib/format";
import Hero from "@/components/home/Hero";
import TrustMarquee from "@/components/home/TrustMarquee";
import Testimonials from "@/components/home/Testimonials";
import RitualScene, { type RitualSceneStep } from "@/components/home/RitualScene";
import Reveal from "@/components/ui/Reveal";
import MaskReveal from "@/components/ui/MaskReveal";
import ScrollWords from "@/components/motion/ScrollWords";
import ImageReveal from "@/components/motion/ImageReveal";
import Parallax from "@/components/motion/Parallax";
import Counter from "@/components/motion/Counter";
import GhostWord from "@/components/motion/GhostWord";
import DrawLine from "@/components/motion/DrawLine";
import FloatImage from "@/components/motion/FloatImage";
import RotatingSeal from "@/components/ui/RotatingSeal";
import ConcernFinder, { type FinderProduct } from "@/components/home/ConcernFinder";
import IngredientCards from "@/components/home/IngredientCards";
import CollectionShowcase, { type ShowcaseCollection } from "@/components/home/CollectionShowcase";
import SignatureStage from "@/components/home/SignatureStage";
import WeekendStack, { type WeekendRitual } from "@/components/home/WeekendStack";
import GiftFan, { type GiftSet } from "@/components/home/GiftFan";
import KnowledgeTabs, { type KnowledgeItem } from "@/components/home/KnowledgeTabs";
import ExpandingFilm from "@/components/home/ExpandingFilm";

export const dynamic = "force-dynamic";

const PHILOSOPHY =
  "Botanical care made the slow way — the turmeric, saffron and clay our grandmothers trusted, refined for modern skin and made to give back.";

const WEEKEND_EDIT = [
  {
    slug: "vita-clay-ubtan-pack",
    verb: "Detoxify",
    day: "Friday evening",
    minutes: "15 min",
    steps: ["Smooth a thick layer over clean skin.", "Rest while the clays draw out the week.", "Rinse with warm water and pat dry."],
    image: "/media/products/vita-clay-ubtan-pack/04.jpg",
    ground: "radial-gradient(80% 90% at 100% 0%, #8a4a33 0%, transparent 60%), linear-gradient(150deg, #5e2f22 0%, #3b1d16 100%)",
  },
  {
    slug: "scrubulush-exfoliator",
    verb: "Polish",
    day: "Saturday morning",
    minutes: "10 min",
    steps: ["Massage over damp skin in slow circles.", "Let rice and walnut lift dull, tired cells.", "Rinse to reveal soft, polished skin."],
    image: "/media/products/scrubulush-exfoliator/04.jpg",
    ground: "radial-gradient(80% 90% at 100% 0%, #8e2f5b 0%, transparent 60%), linear-gradient(150deg, #5b1d3b 0%, #33101f 100%)",
  },
  {
    slug: "aquench-soothing-hydrogel",
    verb: "Soothe",
    day: "Sunday night",
    minutes: "5 min",
    steps: ["Warm a little gel between your palms.", "Press gently over face and neck.", "Let aloe cool and calm overnight."],
    image: "/media/products/aquench-soothing-hydrogel/03.jpg",
    ground: "radial-gradient(80% 90% at 100% 0%, #2f7a70 0%, transparent 60%), linear-gradient(150deg, #1d4d47 0%, #0f2b27 100%)",
  },
];

const RITUAL = [
  {
    step: "Cleanse",
    slug: "good-cleanse-face-wash",
    mood: "/media/products/good-cleanse-face-wash/04.jpg",
    note: "Two pumps, a gentle lather, sixty seconds of slow circular massage — then rinse with cool water.",
    when: "Morning & night",
    duration: "1 minute",
  },
  {
    step: "Exfoliate",
    slug: "scrubulush-exfoliator",
    mood: "/media/products/scrubulush-exfoliator/04.jpg",
    note: "On damp skin, let rice and walnut lift away dull, tired cells in gentle upward strokes.",
    when: "Twice a week",
    duration: "2 minutes",
  },
  {
    step: "Mask",
    slug: "glow-up-pithi-pack",
    mood: "/media/products/glow-up-pithi-pack/04.jpg",
    note: "A thick layer of turmeric and saffron, twenty unhurried minutes, then rinse to reveal the glow.",
    when: "Once a week",
    duration: "20 minutes",
  },
  {
    step: "Hydrate",
    slug: "aquench-soothing-hydrogel",
    mood: "/media/products/aquench-soothing-hydrogel/03.jpg",
    note: "Press a cool veil of aloe over face and neck until absorbed, to calm and replenish.",
    when: "Every day",
    duration: "1 minute",
  },
];

/** Education rows, in the spirit of "What is tallow? / Why choose ours?" */
const WHY_PURO: KnowledgeItem[] = [
  {
    title: "What are Pithi and Ubtan?",
    lead: "Two age-old Indian beauty rituals, reborn in a tube.",
    content:
      "Pithi is the golden turmeric ritual performed before an Indian wedding; Ubtan is the clay-and-botanical paste our grandmothers swore by. Our Glow Up Pithi Pack and Vita Clay Ubtan Pack bring both into a modern, ready-to-use tube — turmeric, saffron, rice bran oil, volcanic clays and citrus oils, blended for everyday radiance.",
    image: "/media/products/glow-up-pithi-pack/04.jpg",
    icon: "sprout",
    facts: ["Turmeric & saffron", "Volcanic clays", "Rice bran oil"],
    link: { label: "Meet the Glow Up Pithi Pack", href: "/products/glow-up-pithi-pack" },
  },
  {
    title: "Ethical, inside out",
    lead: "Clean beauty, without compromise.",
    content:
      "Puro was founded to raise awareness about clean beauty. Our products are natural, cruelty-free and non-toxic, free from harmful chemicals and toxins. We draw on the potent properties of botanical extracts and essential oils, and pair historical beauty knowledge with contemporary research.",
    image: "/media/brand/03.jpg",
    icon: "leaf",
    facts: ["Natural botanicals", "Cruelty-free", "Non-toxic"],
    link: { label: "Read our story", href: "/our-story" },
  },
  {
    title: "Every purchase supports a woman",
    lead: "Beauty that gives back.",
    content:
      "Puro Body & Soul is a division of Shramik Naari Sangh (Sa-Ni-Sa), a charitable organisation. For every product you buy, you help a rural woman to stand on her own feet and live a life of dignity.",
    image: "/media/products/travel-basics-kit/03.jpg",
    icon: "heart",
    facts: ["Shramik Naari Sangh", "Rural women", "A life of dignity"],
    link: { label: "Discover Sa-Ni-Sa", href: "/our-story" },
  },
  {
    title: "Kind to you, kind to the earth",
    lead: "Light on the planet, honest in every step.",
    content:
      "We strive to minimise our environmental footprint with recyclable packaging and sustainable practices — and we prioritise integrity and honesty, from how we source our ingredients to how our products are made.",
    image: "/media/products/aloe-vibe-shower-gel/02.jpg",
    icon: "recycle",
    facts: ["Recyclable packaging", "Sustainable practices", "Honest sourcing"],
    link: { label: "Shop the collection", href: "/shop" },
  },
  {
    title: "Certified, tested, trusted",
    lead: "Trust you can see on every pack.",
    content:
      "Every Puro product is certified Animal Cruelty-Free by PETA, dermatologically tested, non-toxic and crafted in a GMP-certified facility, so you can trust what goes on your skin.",
    image: "/media/brand/02.jpg",
    icon: "badge",
    facts: ["PETA cruelty-free", "Dermatologically tested", "GMP certified"],
    link: { label: "Shop with confidence", href: "/shop" },
  },
];

function bySlug(products: Product[], slug: string) {
  return products.find((product) => product.slug === slug);
}

/** Small label + large serif title used across the homepage. */
function Heading({
  eyebrow,
  index,
  children,
  light = false,
  className,
}: {
  eyebrow: string;
  /** Chapter number shown before the label, e.g. "01". */
  index?: string;
  children: React.ReactNode;
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <Reveal>
        <p
          className={`flex items-center gap-4 ${light ? "eyebrow text-ivory/60" : "eyebrow"}`}
        >
          {index && (
            <span className="font-display text-[16px] normal-case italic tracking-normal">
              ({index})
            </span>
          )}
          <span>{eyebrow}</span>
          <DrawLine className="w-16 opacity-50 sm:w-24" />
        </p>
      </Reveal>
      <h2
        className={`heading-lg mt-5 ${light ? "text-ivory" : "text-emerald"}`}
      >
        <MaskReveal delay={0.05}>{children}</MaskReveal>
      </h2>
    </div>
  );
}

export default async function Home() {
  const [products, concerns, ingredients, reviews] = await Promise.all([
    getActiveProducts(),
    getConcerns(),
    getIngredients(),
    getFeaturedReviews(8),
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

  // A lifestyle photograph (not the white packshot) for each reviewed product.
  const reviewImages = Object.fromEntries(
    products.map((product) => [
      product.slug,
      (product.images[2] ?? product.images[1] ?? product.images[0])?.imageUrl ??
        "/media/brand/02.jpg",
    ]),
  );

  const giftingSlugs = COLLECTIONS.find((collection) => collection.slug === "gifting")?.categorySlugs ?? [];

  const weekend: WeekendRitual[] = WEEKEND_EDIT.flatMap((item) => {
    const product = bySlug(products, item.slug);
    if (!product) return [];
    return [
      {
        ...item,
        name: product.name,
        headline: product.headline,
        price: product.variants[0] ? formatPrice(product.variants[0].price) : null,
      },
    ];
  });

  const giftFan: GiftSet[] = products
    .filter((product) => product.categories.some((category) => giftingSlugs.includes(category.slug)))
    .map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      headline: product.headline ?? product.summary,
      price: product.variants[0] ? formatPrice(product.variants[0].price) : null,
      image: product.images[0]?.imageUrl ?? null,
      contents: product.kitContents,
    }));

  const showcase: ShowcaseCollection[] = COLLECTIONS.filter((collection) => collection.slug !== "wellness").map(
    (collection) => {
      const inCollection = products.filter((product) =>
        product.categories.some((category) => collection.categorySlugs.includes(category.slug)),
      );
      const ranked = [...inCollection].sort(
        (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || (b.rating?.count ?? 0) - (a.rating?.count ?? 0),
      );
      return {
        slug: collection.slug,
        name: collection.name,
        title: collection.title,
        description: collection.description,
        image: collection.image,
        count: inCollection.length,
        products: ranked.slice(0, 3).map((product) => ({
          id: product.id,
          slug: product.slug,
          name: product.name,
          image: product.images[0]?.imageUrl ?? null,
          price: product.variants[0] ? formatPrice(product.variants[0].price) : null,
        })),
      };
    },
  );

  const finderProducts: FinderProduct[] = products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    headline: product.headline,
    images: product.images.slice(0, 1),
    variants: product.variants.slice(0, 1),
    concernSlugs: product.concerns.map((concern) => concern.slug),
  }));

  const ritualSteps: RitualSceneStep[] = RITUAL.flatMap((item) => {
    const product = bySlug(products, item.slug);
    if (!product) return [];
    return [
      {
        step: item.step,
        note: item.note,
        when: item.when,
        duration: item.duration,
        mood: item.mood,
        product: {
          id: product.id,
          slug: product.slug,
          name: product.name,
          headline: product.headline,
          images: product.images.slice(0, 1),
          variants: product.variants.slice(0, 1),
        },
      },
    ];
  });

  return (
    <>
      <Hero />
      <TrustMarquee />

      <div className="bg-pearl">

        {/* Philosophy — layered photographs, a turning seal, words that light up */}
      <section className="container-site relative py-24 sm:py-36">
        <div className="grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 xl:gap-28">
          <div className="relative mx-auto w-full max-w-[540px] pb-[12%] lg:mx-0">
            <ImageReveal className="aspect-[4/5] w-[80%] rounded-[26px]">
              <Image
                src="/media/products/glow-up-pithi-pack/04.jpg"
                alt="Glow Up Pithi Pack with turmeric and rose clay"
                fill
                sizes="(min-width: 1024px) 36vw, 80vw"
                className="object-cover"
              />
            </ImageReveal>
            <FloatImage
              src="/media/products/vita-clay-ubtan-pack/06.jpg"
              className="bottom-0 right-0 aspect-[4/5] w-[46%] ring-[6px] ring-mist"
              speed={50}
              rotate={3}
            />
            <RotatingSeal
              text="Ethical inside out · Rooted in age-old wisdom · "
              className="absolute right-[4%] top-[6%] w-[30%] max-w-[150px] text-[44px] sm:text-[56px]"
            />
          </div>

          <div>
            <Reveal>
              <p className="eyebrow flex items-center gap-4">
                <span className="font-display text-[16px] normal-case italic tracking-normal">(00)</span>
                Our philosophy <DrawLine className="w-20 opacity-50" />
              </p>
            </Reveal>
            <ScrollWords
              text={PHILOSOPHY}
              className="mt-8 font-display text-[34px] leading-[1.1] text-emerald sm:text-[44px] xl:text-[52px]"
            />
            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-line pt-8 sm:gap-6">
              {[
                { icon: Leaf, title: "Botanical", text: "Turmeric, saffron, aloe and clays." },
                { icon: Rabbit, title: "Cruelty-free", text: "PETA certified and non-toxic." },
                { icon: HeartHandshake, title: "Gives back", text: "Every purchase supports a woman." },
              ].map(({ icon: Icon, title, text }, index) => (
                <Reveal key={title} delay={index * 0.1}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald/20 text-emerald">
                    <Icon size={18} strokeWidth={1.1} />
                  </span>
                  <p className="mt-4 font-display text-[19px] leading-tight text-emerald sm:text-[22px]">{title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-stone sm:text-[14px]">{text}</p>
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-10">
              <Link href="/our-story" className="btn-primary rounded-full px-9">
                Read our story <ArrowRight size={15} strokeWidth={1.25} />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      </div>

      {/* The Signatures — a product stage */}
      {signatures.length > 0 && (
        <section className="bg-noir py-24 text-ivory sm:py-32">
          <GhostWord word="Signatures" light className="top-[4%]" />
          <div className="container-site">
            <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <Heading index="01" eyebrow="The Signatures" light>
                Our most <em>loved</em> rituals
              </Heading>
              <Link href="/shop" className="btn-outline-light shrink-0 self-start rounded-full px-8 sm:self-auto">
                Shop all <ArrowRight size={14} strokeWidth={1.25} />
              </Link>
            </div>
            <SignatureStage products={signatures} />
          </div>
        </section>
      )}

      {/* The Weekend Edit — cards that stack as you scroll */}
      <section className="bg-pearl pb-24 pt-24 sm:pt-36">
        <div className="container-site">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <Heading index="02" eyebrow="The Weekend Edit">
              Detoxify, polish, soothe. <em>Glow.</em>
            </Heading>
            <Reveal>
              <p className="body-copy max-w-[400px]">
                Three weekend rituals — one for each evening — that turn twenty minutes into a moment that is
                entirely yours.
              </p>
            </Reveal>
          </div>
          <WeekendStack items={weekend} />
        </div>
      </section>

      {/* The Gift Edit — a fan of keepsake boxes */}
      {giftFan.length > 0 && (
        <section className="bg-noir py-24 text-ivory sm:py-36">
          <GhostWord word="Gifting" light direction={-1} className="bottom-[2%]" />
          <div className="pointer-events-none absolute right-[-10%] top-[-20%] h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(circle,rgba(201,163,101,0.22),transparent_60%)]" />
          <div className="container-site">
            <div className="mb-16 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <Heading index="03" eyebrow="The Gift Edit" light>
                Give the gift of <em>a ritual.</em>
              </Heading>
              <Reveal>
                <p className="max-w-[440px] text-[17px] leading-[1.8] text-ivory/70">
                  Keepsake boxes inspired by palace gardens and the grace of the peacock — ready to give for
                  weddings, festivals and the people who matter most.
                </p>
              </Reveal>
            </div>
            <GiftFan gifts={giftFan} />
          </div>
        </section>
      )}

      {/* Ingredients — specimen cards that turn over */}
      {ingredients.length > 0 && (
        <section id="ingredients" className="bg-pearl scroll-mt-24 py-24 sm:py-36 lg:pb-52">
          <GhostWord word="From the earth" className="top-[18%]" />
          <div className="container-site">
            <div className="mb-14 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <Heading index="04" eyebrow="From the earth">
                Ingredients with <em>a story</em>
              </Heading>
              <Reveal>
                <p className="body-copy max-w-[380px]">
                  Familiar botanicals, thoughtfully sourced. Hover or tap a card to turn it over.
                </p>
              </Reveal>
            </div>
            <IngredientCards ingredients={ingredients} />
          </div>
        </section>
      )}

      {/* The Ritual — a pinned, scroll-driven scene */}
      {ritualSteps.length > 0 && <RitualScene steps={ritualSteps} />}

      {/* Collections — a showcase */}
      <section className="bg-pearl-warm py-24 sm:py-36">
        <GhostWord word="Collections" direction={-1} className="bottom-[2%]" />
        <div className="container-site">
          <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <Heading index="06" eyebrow="Explore">
              Shop by <em>collection</em>
            </Heading>
            <Reveal>
              <p className="body-copy max-w-[380px]">Four rituals for every part of you — choose one to see what&rsquo;s inside.</p>
            </Reveal>
          </div>
          <CollectionShowcase collections={showcase} />
        </div>
      </section>

      {/* Banner — Sa-Ni-Sa, with numbers that count up */}
      <section
        id="story"
        className="relative scroll-mt-24 overflow-hidden text-ivory"
      >
        <Parallax strength={12}>
          <Image
            src="/media/products/good-cleanse-face-wash/04.jpg"
            alt="Good Cleanse Face Wash beside a lit diya"
            fill
            sizes="100vw"
            className="object-cover object-[50%_60%]"
          />
        </Parallax>
        <div className="absolute inset-0 bg-ink/60" />
        <div className="container-site relative flex min-h-[88svh] flex-col justify-center py-24 text-center">
          <Heading
            index="07"
            eyebrow="The heart of Puro"
            light
            className="mx-auto max-w-[900px]"
          >
            Every purchase <em>empowers a woman.</em>
          </Heading>
          <Reveal>
            <p className="mx-auto mt-7 max-w-[600px] text-[17px] leading-[1.85] text-ivory/80">
              Puro Body &amp; Soul is a division of Shramik Naari Sangh —
              Sa-Ni-Sa — a charitable organisation. For every product you buy,
              you help a rural woman stand on her own feet and live a life of
              dignity.
            </p>
          </Reveal>
          <div className="mx-auto mt-14 grid w-full max-w-[1080px] grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[
              {
                value: <Counter to={products.length} />,
                label: "Botanical formulas",
              },
              {
                value: <Counter to={totalReviews} />,
                label: "Customer reviews",
              },
              {
                value: <Counter to={averageRating} decimals={1} />,
                label: "Average rating",
              },
              { value: <Counter to={100} suffix="%" />, label: "Cruelty-free" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-[22px] border border-ivory/15 bg-ivory/[0.07] px-4 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md sm:py-10"
              >
                <p className="font-display text-[56px] leading-none sm:text-[76px]">
                  {stat.value}
                </p>
                <p className="mt-4 text-[12px] font-medium uppercase tracking-[0.22em] text-ivory/70">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
          <Reveal className="mt-14">
            <Link
              href="/our-story"
              className="btn-outline-light rounded-full px-9"
            >
              Read our story <ArrowRight size={15} strokeWidth={1.25} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Concerns — find your match */}
      {concerns.length > 0 && (
        <section className="bg-pearl py-24 sm:py-36">
          <GhostWord word="Your match" direction={-1} className="top-[6%]" />
          <div className="container-site">
            <Heading index="08" eyebrow="Find your match" className="mb-12">
              What does your skin <em>need?</em>
            </Heading>
            <ConcernFinder concerns={concerns} products={finderProducts} />
          </div>
        </section>
      )}

      {/* Testimonials — dark editorial spread */}
      <Testimonials
        reviews={reviews}
        totalReviews={totalReviews}
        averageRating={averageRating}
        images={reviewImages}
      />

      {/* Why Puro */}
      <section
        id="why-puro"
        className="bg-pearl-warm scroll-mt-24 py-24 sm:py-36"
      >
        <GhostWord word="Good to know" className="top-[4%]" />
        <div className="container-site">
          <Heading index="09" eyebrow="Why Puro" className="mb-14">
            Good to <em>know.</em>
          </Heading>
          <KnowledgeTabs items={WHY_PURO} />
        </div>
      </section>

      {/* Closing — film opens to fill the screen */}
      <ExpandingFilm />
    </>
  );
}
