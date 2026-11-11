import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Closing banner: the hero film in a framed card with a last call to shop. */
export default function ExpandingFilm() {
  return (
    <section className="bg-pearl pb-12 sm:pb-16">
      <div className="container-site">
        <div className="relative isolate flex min-h-[420px] items-center overflow-hidden rounded-[28px] text-ivory shadow-[0_40px_80px_-50px_rgba(5,38,47,0.9)] ring-1 ring-gold/20 sm:min-h-[480px]">
          <video
            className="absolute inset-0 -z-10 h-full w-full object-cover motion-reduce:hidden"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster="/media/video/hero-wide-poster.jpg"
            aria-hidden="true"
          >
            <source src="/media/video/hero-wide.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 -z-10 bg-[url('/media/video/hero-wide-poster.jpg')] bg-cover bg-center motion-safe:hidden" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#062a34]/95 via-[#062a34]/70 to-[#062a34]/20" />
          <div className="max-w-[640px] p-8 sm:p-12 lg:p-16">
            <p className="eyebrow text-gold-soft">Begin today</p>
            <h2 className="mt-3 font-display text-[48px] leading-[0.98] sm:text-[72px]">
              Your ritual <em className="text-gold-soft">awaits.</em>
            </h2>
            <p className="mt-4 max-w-[440px] text-[16px] leading-[1.75] text-ivory/80">
              Botanical care delivered to your door across India and the world — free in India on orders over ₹500.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f1e2bd] via-[#d9b97a] to-[#c59a55] px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink transition hover:brightness-105"
              >
                Shop the collection <ArrowRight size={15} strokeWidth={1.6} />
              </Link>
              <Link href="/collections/gifting" className="btn-outline-light rounded-full px-8">
                Gift sets
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
