import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-site flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="ornament text-[9px]">◆</p>
      <h1 className="heading-lg mt-8 text-emerald">
        This page has <em>wandered off</em>
      </h1>
      <p className="body-copy mt-5 max-w-[420px]">
        The page you are looking for may have moved. Let us guide you back to the collection.
      </p>
      <Link href="/shop" className="btn-primary mt-10">
        Explore the collection
      </Link>
    </section>
  );
}
