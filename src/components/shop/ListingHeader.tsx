import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

interface ListingHeaderProps {
  eyebrow: string;
  title: string;
  description?: string | null;
  image?: string;
}

export default function ListingHeader({ eyebrow, title, description, image }: ListingHeaderProps) {
  if (!image) {
    return (
      <section className="border-b border-line bg-parchment/60 py-20 text-center sm:py-24">
        <Reveal className="container-site">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="heading-xl mt-6 text-emerald">{title}</h1>
          {description && (
            <p className="body-copy mx-auto mt-6 max-w-[560px]">{description}</p>
          )}
        </Reveal>
      </section>
    );
  }

  return (
    <section className="grid bg-emerald text-ivory lg:grid-cols-2">
      <div className="flex items-center px-6 py-16 sm:px-12 lg:py-20 lg:pl-[max(3rem,calc((100vw-1440px)/2+3rem))]">
        <Reveal>
          <nav aria-label="Breadcrumb" className="text-[10px] uppercase tracking-[0.22em] text-ivory/60">
            <Link href="/" className="hover:text-ivory">Home</Link>
            <span className="mx-3 text-gold-soft">/</span>
            <Link href="/shop" className="hover:text-ivory">Shop</Link>
          </nav>
          <p className="eyebrow mt-10 text-gold-soft">{eyebrow}</p>
          <h1 className="heading-xl mt-5">{title}</h1>
          {description && (
            <p className="mt-6 max-w-[460px] text-[15px] leading-[1.9] text-ivory/70">
              {description}
            </p>
          )}
        </Reveal>
      </div>
      <div className="relative min-h-[320px] lg:min-h-[480px]">
        <Image src={image} alt="" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
      </div>
    </section>
  );
}
