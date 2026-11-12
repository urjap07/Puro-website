import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-site flex min-h-[70vh] items-center justify-center py-16 sm:py-24">
      <div className="glass tint-lilac flex w-full max-w-[680px] flex-col items-center rounded-[32px] px-6 py-14 text-center sm:px-14 sm:py-20">
        <p className="ornament text-[9px]">◆</p>
        <h1 className="heading-lg mt-8 text-midnight">
          This page has <em className="text-iris pr-2">wandered off</em>
        </h1>
        <p className="body-copy mt-5 max-w-[420px]">
          The page you are looking for may have moved. Let us guide you back to the collection.
        </p>
        <Link href="/shop" className="btn-primary mt-10">
          Explore the collection
        </Link>
      </div>
    </section>
  );
}
