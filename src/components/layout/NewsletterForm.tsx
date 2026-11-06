"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

/** Front-end only for now — not yet connected to an email provider. */
export default function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.p
          key="thanks"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-full border border-gold-soft/40 bg-ivory/[0.06] px-6 py-4 font-display text-[22px] italic text-gold-soft"
        >
          <Check size={18} strokeWidth={1.5} /> Welcome to the ritual — we&rsquo;ll be in touch soon.
        </motion.p>
      ) : (
        <motion.form
          key="form"
          exit={{ opacity: 0, y: -10 }}
          className="flex w-full items-center gap-2 rounded-full border border-ivory/20 bg-ivory/[0.06] p-1.5 pl-6 backdrop-blur transition focus-within:border-gold-soft/70 focus-within:bg-ivory/[0.09]"
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
            className="min-w-0 flex-1 bg-transparent py-3 text-[16px] text-ivory outline-none placeholder:text-ivory/45"
          />
          <button
            type="submit"
            className="group flex shrink-0 items-center gap-2 rounded-full bg-ivory px-5 py-3.5 text-[12px] font-medium uppercase tracking-[0.18em] text-ink transition duration-300 hover:bg-gold-soft sm:px-7"
          >
            <span className="hidden sm:inline">Subscribe</span>
            <ArrowRight size={16} strokeWidth={1.4} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
