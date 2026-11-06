"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

/** Front-end only for now — not yet connected to an email provider. */
export default function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <p className="mt-8 font-display text-[20px] italic text-gold-soft">
        Thank you — we&rsquo;ll be in touch soon.
      </p>
    );
  }

  return (
    <form
      className="mt-8 flex max-w-[440px] border-b border-ivory/30 focus-within:border-gold-soft"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        placeholder="Your email address"
        className="min-w-0 flex-1 bg-transparent py-4 text-[15px] text-ivory outline-none placeholder:text-ivory/40"
      />
      <button
        type="submit"
        className="flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-gold-soft transition hover:text-ivory"
      >
        Subscribe <ArrowRight size={14} strokeWidth={1.25} />
      </button>
    </form>
  );
}
