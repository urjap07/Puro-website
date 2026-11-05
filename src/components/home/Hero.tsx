import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-emerald text-ivory">
      <div className="grid lg:min-h-[min(calc(100vh-126px),860px)] lg:grid-cols-[1fr_1.05fr]">
        <div className="relative z-10 flex flex-col justify-center px-6 py-20 sm:px-12 lg:py-24 lg:pl-[max(3rem,calc((100vw-1440px)/2+3rem))] lg:pr-16">
          <Reveal>
            <p className="eyebrow text-gold-soft">Ethical inside out</p>
            <h1 className="heading-xl mt-7 max-w-[620px]">
              Rituals rooted in <em className="font-normal text-gold-soft">nature</em>, made for
              the modern you.
            </h1>
            <p className="mt-8 max-w-[440px] text-[16px] leading-[1.9] text-ivory/75">
              Botanical skin, body and hair care crafted with turmeric, saffron, aloe and
              age-old wisdom — cruelty-free and dermatologically tested.
            </p>
            <div className="mt-11 flex flex-wrap items-center gap-6">
              <Link href="/shop" className="btn-gold">
                Shop the collection <ArrowRight size={15} strokeWidth={1.25} />
              </Link>
              <Link href="#ritual" className="link-underline text-ivory">
                Discover the ritual
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="relative min-h-[520px] sm:min-h-[640px] lg:min-h-0">
          <Image
            src="/media/products/glow-up-pithi-pack/05.jpg"
            alt="Glow Up Pithi Pack on a stone plinth with gold ribbon"
            fill
            priority
            sizes="(min-width: 1024px) 52vw, 100vw"
            className="object-cover object-[50%_40%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald/40 via-transparent to-transparent max-lg:hidden" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald to-transparent lg:hidden" />

          <Link
            href="/products/glow-up-pithi-pack"
            className="group absolute bottom-6 right-6 flex items-center gap-4 bg-ivory/95 py-3.5 pl-5 pr-4 text-emerald backdrop-blur transition hover:bg-ivory sm:bottom-10 sm:right-10"
          >
            <span>
              <span className="block text-[9px] uppercase tracking-[0.28em] text-gold-deep">
                Bestseller
              </span>
              <span className="mt-1 block font-display text-[19px]">Glow Up Pithi Pack</span>
            </span>
            <ArrowRight
              size={16}
              strokeWidth={1.25}
              className="transition group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
