import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getActiveProducts, getConcerns } from "@/db/queries/products";
import SkincareFinder from "@/components/finder/SkincareFinder";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Skincare Finder",
  description: "Answer four quick questions and we'll suggest PURO formulas — or a full ritual — for your face, body or hair.",
  alternates: { canonical: "/finder" },
};

export default async function FinderPage() {
  const [products, concerns] = await Promise.all([getActiveProducts(), getConcerns()]);
  return (
    <div className="pb-24">
      <div className="container-site pt-8 sm:pt-12">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-stone">
          <Link href="/" className="underline-offset-4 hover:text-midnight hover:underline">
            Home
          </Link>
          <ChevronRight size={13} strokeWidth={1.4} />
          <span className="text-ink">Skincare finder</span>
        </nav>
        <div className="mt-8 text-center">
          <p className="label justify-center text-[#5E4B8A]">Skincare Finder</p>
        </div>
        <h1 className="sr-only">Skincare finder</h1>
        <div className="mt-6">
          <Suspense>
            <SkincareFinder products={products} concerns={concerns} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
