import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

/** Header height — the hero slides underneath the transparent header. */
const HEADER_OFFSET = "-mt-[88px]";

export default function Hero() {
  return (
    <section
      className={`relative ${HEADER_OFFSET} flex min-h-[100svh] items-end overflow-hidden bg-emerald text-ivory lg:items-center`}
    >
      {/* Photograph bleeds in from the right and dissolves into emerald */}
      <div className="absolute inset-0 lg:left-[38%]">
        <Image
          src="/media/products/glow-up-pithi-pack/05.jpg"
          alt="Glow Up Pithi Pack on a stone plinth with gold ribbon"
          fill
          priority
          sizes="(min-width: 1024px) 62vw, 100vw"
          className="object-cover object-[50%_0%] lg:object-[50%_35%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald from-40% via-emerald/85 via-60% to-emerald/0 lg:from-0% lg:via-50% lg:bg-gradient-to-r lg:from-emerald lg:via-emerald/20 lg:to-transparent" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-emerald-deep/70 to-transparent" />
      </div>

      <div className="container-site relative z-10 pb-20 pt-40 lg:py-40">
        <Reveal className="max-w-[640px]">
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-gold-soft/70" />
            <p className="eyebrow text-gold-soft">Ethical inside out</p>
          </div>
          <h1 className="heading-xl mt-8">
            Rituals rooted in <em className="font-normal text-gold-soft">nature</em>,
            <br className="hidden sm:block" /> made for the modern you.
          </h1>
          <p className="mt-8 max-w-[460px] text-[16px] leading-[1.9] text-ivory/80">
            Botanical skin, body and hair care crafted with turmeric, saffron, aloe and
            age-old wisdom — and every purchase supports the women of Sa-Ni-Sa.
          </p>
          <div className="mt-11 flex flex-wrap items-center gap-7">
            <Link href="/shop" className="btn-outline-light rounded-full px-9">
              Shop the collection <ArrowRight size={15} strokeWidth={1.25} />
            </Link>
            <Link href="#ritual" className="link-underline text-ivory">
              Discover the ritual
            </Link>
          </div>
        </Reveal>
      </div>

      <div className="absolute bottom-8 right-8 z-10 hidden items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-ivory/60 lg:flex">
        <span className="h-10 w-px animate-pulse bg-ivory/40" />
        Scroll
      </div>
    </section>
  );
}
