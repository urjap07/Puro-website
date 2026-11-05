
import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    name: "Face Care",
    description: "Nourish your natural glow",
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=900",
    href: "/shop/face-care",
  },
  {
    name: "Body Care",
    description: "A ritual of everyday indulgence",
    image:
      "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=900",
    href: "/shop/body-care",
  },
  {
    name: "Wellness",
    description: "Find your natural balance",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900",
    href: "/shop/wellness",
  },
];

const concerns = [
  "Dry & Dehydrated Skin",
  "Dullness & Uneven Tone",
  "Hair & Scalp Care",
  "Everyday Wellness",
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* Announcement bar */}
      <div className="bg-puro-forest px-4 py-2 text-center text-xs tracking-[0.15em] text-white">
        A MORE CONSCIOUS WAY TO CARE FOR YOURSELF
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-puro-border bg-puro-cream/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 lg:px-12">
          <nav className="hidden items-center gap-8 text-xs tracking-[0.12em] md:flex">
            <Link href="/shop" className="hover:text-puro-sage">SHOP</Link>
            <Link href="/concerns" className="hover:text-puro-sage">CONCERNS</Link>
            <Link href="/ingredients" className="hover:text-puro-sage">INGREDIENTS</Link>
          </nav>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-center">
            <span className="font-editorial text-3xl font-semibold tracking-[0.12em] text-puro-forest">
              PURO
            </span>
            <span className="block text-[9px] tracking-[0.38em] text-puro-muted">
              BODY SOUL
            </span>
          </Link>

          <nav className="ml-auto flex items-center gap-6 text-xs tracking-[0.12em]">
            <Link href="/about" className="hidden hover:text-puro-sage sm:block">
              OUR STORY
            </Link>
            <Link href="/account" aria-label="My account">
              ACCOUNT
            </Link>
            <Link href="/cart" aria-label="Shopping bag">
              BAG (0)
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[620px] overflow-hidden bg-[#d8d4c7] lg:min-h-[730px]">
        <Image
          src="https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=2200"
          alt="Golden morning sunlight across a peaceful natural landscape"
          fill
          priority
          unoptimized
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#17291f]/75 via-[#17291f]/30 to-transparent" />

        <div className="relative z-10 flex min-h-[620px] items-center px-8 py-20 lg:min-h-[730px] lg:px-24">
          <div className="max-w-2xl text-white">
            <p className="mb-7 text-xs tracking-[0.3em]">
              BEAUTY • WELLNESS • CONSCIOUS LIVING
            </p>

            <h1 className="font-editorial text-6xl leading-[0.98] md:text-8xl">
              Come back
              <br />
              to your
              <br />
              <span className="italic text-[#e8d8b8]">natural self.</span>
            </h1>

            <p className="mt-8 max-w-md text-sm leading-7 text-white/85 md:text-base">
              Thoughtfully chosen rituals and essentials that celebrate
              the connection between your body, mind and soul.
            </p>

            <Link
              href="/shop"
              className="mt-10 inline-flex items-center gap-8 border border-white px-8 py-4 text-xs tracking-[0.2em] transition hover:bg-white hover:text-puro-forest"
            >
              EXPLORE THE COLLECTION <span>↗</span>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 right-10 z-10 hidden text-xs tracking-[0.2em] text-white/80 md:block">
          A LITTLE CLOSER TO NATURE
        </div>
      </section>

      {/* Brand introduction */}
      <section className="bg-puro-cream px-6 py-24 text-center md:py-32">
        <p className="text-xs tracking-[0.25em] text-puro-sage">
          THE PURO PHILOSOPHY
        </p>
        <h2 className="mx-auto mt-7 max-w-4xl font-editorial text-4xl leading-tight text-puro-forest md:text-6xl">
          Not just what you put on your body.
          <br />
          <span className="italic">How you feel within it.</span>
        </h2>
        <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-puro-muted">
          We believe caring for yourself should feel intentional.
          Discover a considered world of beauty and wellness inspired
          by nature and the art of everyday rituals.
        </p>
        <Link
          href="/about"
          className="mt-8 inline-block border-b border-puro-forest pb-2 text-xs tracking-[0.18em] text-puro-forest"
        >
          DISCOVER OUR STORY
        </Link>
      </section>

      {/* Categories */}
      <section className="bg-puro-ivory px-6 py-20 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs tracking-[0.25em] text-puro-sage">
                FIND YOUR RITUAL
              </p>
              <h2 className="mt-3 font-editorial text-5xl text-puro-forest md:text-6xl">
                Explore our world
              </h2>
            </div>
            <Link href="/shop" className="text-xs tracking-[0.15em] text-puro-forest">
              VIEW EVERYTHING ↗
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.name} href={category.href} className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#ddd6c8]">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    unoptimized
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                  <div className="absolute bottom-7 left-7 text-white">
                    <h3 className="font-editorial text-4xl">
                      {category.name}
                    </h3>
                    <p className="mt-2 text-xs tracking-wide text-white/85">
                      {category.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Concerns */}
      <section className="bg-puro-forest px-6 py-24 text-white lg:px-16 lg:py-32">
        <div className="mx-auto grid max-w-[1440px] gap-14 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-xs tracking-[0.25em] text-[#c7c8a9]">
              CARE THAT UNDERSTANDS YOU
            </p>
            <h2 className="mt-6 font-editorial text-5xl leading-tight md:text-7xl">
              Your needs.
              <br />
              Your rituals.
              <br />
              <span className="italic text-[#d9c49b]">Your kind of care.</span>
            </h2>
            <p className="mt-7 max-w-md text-sm leading-7 text-white/70">
              Explore thoughtfully curated collections based on what
              your body and skin need.
            </p>
          </div>

          <div className="divide-y divide-white/20 border-y border-white/20">
            {concerns.map((concern, index) => (
              <Link
                href="/concerns"
                key={concern}
                className="group flex items-center justify-between py-7 transition hover:pl-3"
              >
                <span className="text-sm tracking-wide text-white/90">
                  <span className="mr-5 text-xs text-[#c7c8a9]">
                    0{index + 1}
                  </span>
                  {concern}
                </span>
                <span className="text-xl text-[#d9c49b] transition group-hover:translate-x-2">
                  ↗
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Ingredient story */}
      <section className="grid bg-puro-cream md:grid-cols-2">
        <div className="relative min-h-[420px] md:min-h-[650px]">
          <Image
            src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1200"
            alt="Natural botanical skincare ingredients"
            fill
            unoptimized
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center px-8 py-20 md:px-16 lg:px-24">
          <p className="text-xs tracking-[0.25em] text-puro-sage">
            INSPIRED BY NATURE
          </p>
          <h2 className="mt-6 font-editorial text-5xl leading-tight text-puro-forest md:text-7xl">
            Nature has
            <br />
            <span className="italic">a beautiful way</span>
            <br />
            of caring.
          </h2>
          <p className="mt-7 max-w-md text-sm leading-7 text-puro-muted">
            Discover the ingredients, thoughtful formulations and
            inspiration behind the products you bring into your rituals.
          </p>
          <Link
            href="/ingredients"
            className="mt-9 inline-flex w-fit border-b border-puro-forest pb-2 text-xs tracking-[0.18em] text-puro-forest"
          >
            EXPLORE INGREDIENTS ↗
          </Link>
        </div>
      </section>

      {/* Closing statement */}
      <section className="bg-puro-ivory px-6 py-24 text-center md:py-32">
        <p className="text-xs tracking-[0.25em] text-puro-sage">
          YOUR JOURNEY STARTS HERE
        </p>
        <h2 className="mx-auto mt-6 max-w-3xl font-editorial text-5xl leading-tight text-puro-forest md:text-7xl">
          Make space for
          <br />
          <span className="italic">a little more you.</span>
        </h2>
        <Link
          href="/shop"
          className="mt-10 inline-block bg-puro-forest px-10 py-5 text-xs tracking-[0.2em] text-white transition hover:bg-puro-sage"
        >
          SHOP PURO
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-[#1c3026] px-6 py-16 text-white lg:px-16">
        <div className="mx-auto grid max-w-[1440px] gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <h2 className="font-editorial text-4xl tracking-[0.12em]">
              PURO
            </h2>
            <p className="mt-2 text-[10px] tracking-[0.35em] text-white/60">
              BODY SOUL
            </p>
            <p className="mt-7 max-w-sm text-sm leading-7 text-white/60">
              A considered approach to beauty, wellness and the rituals
              that make you feel more like yourself.
            </p>
          </div>

          <div>
            <h3 className="text-xs tracking-[0.2em]">EXPLORE</h3>
            <div className="mt-6 flex flex-col gap-4 text-sm text-white/65">
              <Link href="/shop">Shop</Link>
              <Link href="/about">Our Story</Link>
              <Link href="/ingredients">Ingredients</Link>
              <Link href="/journal">Journal</Link>
            </div>
          </div>

          <div>
            <h3 className="text-xs tracking-[0.2em]">NEED HELP?</h3>
            <div className="mt-6 flex flex-col gap-4 text-sm text-white/65">
              <Link href="/contact">Contact Us</Link>
              <Link href="/faq">FAQs</Link>
              <Link href="/shipping-policy">Shipping</Link>
              <Link href="/privacy-policy">Privacy Policy</Link>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-[1440px] border-t border-white/15 pt-7 text-xs text-white/45">
          © 2026 Puro Body Soul. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
