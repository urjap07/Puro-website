import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { ChevronRight, FileText, Info } from "lucide-react";
import { POLICIES, POLICIES_DRAFT, POLICIES_UPDATED, type Block, getPolicy } from "@/lib/policies";
import { SITE } from "@/lib/site";

interface PolicyPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return POLICIES.map((policy) => ({ slug: policy.slug }));
}

export async function generateMetadata({ params }: PolicyPageProps): Promise<Metadata> {
  const policy = getPolicy((await params).slug);
  return policy
    ? { title: policy.title, description: policy.description, alternates: { canonical: `/policies/${policy.slug}` } }
    : { title: "Policy not found" };
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, index) =>
        typeof block === "string" ? (
          <p key={index} className="mt-3 text-[15px] leading-[1.8] text-graphite first:mt-0">
            {block}
          </p>
        ) : (
          <ul key={index} className="mt-3 space-y-2">
            {block.list.map((item) => (
              <li key={item} className="flex gap-3 text-[15px] leading-[1.7] text-graphite">
                <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#5E4B8A]/60" />
                {item}
              </li>
            ))}
          </ul>
        ),
      )}
    </>
  );
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const policy = getPolicy((await params).slug);
  if (!policy) notFound();

  return (
    <div className="pb-24">
      <div className="container-site pt-8 sm:pt-12">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[13px] text-stone">
          <Link href="/" className="underline-offset-4 hover:text-midnight hover:underline">
            Home
          </Link>
          <ChevronRight size={13} strokeWidth={1.4} />
          <Link href="/policies" className="underline-offset-4 hover:text-midnight hover:underline">
            Policies
          </Link>
          <ChevronRight size={13} strokeWidth={1.4} />
          <span className="text-ink">{policy.title}</span>
        </nav>

        <header className="mt-8 max-w-[820px]">
          <p className="label text-[#5E4B8A]">Policies</p>
          <h1 className="mt-5 font-display text-[44px] font-light leading-[1.02] text-midnight sm:text-[64px]">{policy.title}</h1>
          <p className="mt-4 text-[13px] text-stone">Last updated {POLICIES_UPDATED}</p>
          <p className="mt-5 max-w-[680px] text-[17px] leading-[1.8] text-graphite">{policy.intro}</p>
          {POLICIES_DRAFT && !policy.final && (
            <p className="glass tint-saffron mt-6 flex items-start gap-3 rounded-[20px] px-5 py-4 text-[14px] leading-[1.6] text-[#5f430f]">
              <Info size={17} strokeWidth={1.6} className="relative z-[2] mt-0.5 shrink-0" />
              <span className="relative z-[2]">
                We&rsquo;re finalising this policy, so some details may change. If anything here matters to your order, please{" "}
                <Link href="/contact" className="font-semibold underline underline-offset-2">
                  check with us
                </Link>
                .
              </span>
            </p>
          )}
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
          {/* Contents + other policies */}
          <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <nav aria-label="On this page" className="glass rounded-[24px] p-5">
              <p className="relative z-[2] text-[11px] font-semibold uppercase tracking-[0.22em] text-stone">On this page</p>
              <ol className="relative z-[2] mt-3 space-y-1.5">
                {policy.sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="block rounded-[10px] py-1 text-[14px] text-graphite transition hover:text-midnight hover:underline hover:underline-offset-4">
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <nav aria-label="Other policies" className="mt-4 px-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone">All policies</p>
              <ul className="mt-3 flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                {POLICIES.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/policies/${item.slug}`}
                      aria-current={item.slug === policy.slug ? "page" : undefined}
                      className={clsx(
                        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[14px] transition lg:rounded-[10px] lg:px-0",
                        item.slug === policy.slug ? "bg-white/70 font-semibold text-midnight lg:bg-transparent" : "bg-white/40 text-graphite hover:text-midnight lg:bg-transparent",
                      )}
                    >
                      <FileText size={14} strokeWidth={1.5} className="text-stone" /> {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Policy */}
          <article className="glass-strong min-w-0 rounded-[32px] p-6 sm:p-10">
            <div className="relative z-[2] space-y-10">
              {policy.sections.map((section, index) => (
                <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-28">
                  <h2 id={`${section.id}-title`} className="flex items-baseline gap-3 font-display text-[28px] leading-tight text-midnight sm:text-[32px]">
                    <span className="font-sans text-[13px] font-semibold tabular-nums text-[#5E4B8A]">{String(index + 1).padStart(2, "0")}</span>
                    {section.heading}
                  </h2>
                  <div className="mt-4">
                    <Blocks blocks={section.body} />
                  </div>
                </section>
              ))}
            </div>
            <div className="relative z-[2] mt-12 rounded-[22px] bg-white/55 p-5 ring-1 ring-inset ring-white/80 sm:p-6">
              <p className="font-display text-[22px] text-midnight">Questions about this policy?</p>
              <p className="mt-1 text-[14px] leading-[1.7] text-stone">
                Write to{" "}
                <a href={`mailto:${SITE.email}`} className="font-medium text-midnight underline underline-offset-2">
                  {SITE.email}
                </a>
                , call {SITE.phone}, or{" "}
                <Link href="/contact" className="font-medium text-midnight underline underline-offset-2">
                  send us a message
                </Link>
                .
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
