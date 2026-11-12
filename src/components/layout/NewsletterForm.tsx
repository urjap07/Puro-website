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
          className="flex items-center gap-3 rounded-[28px] bg-white/60 px-6 py-4 font-display text-[22px] italic text-plum shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_0_0_1px_rgba(255,255,255,0.7),0_12px_28px_-16px_rgba(125,104,168,0.55)] backdrop-blur-md"
        >
          <Check size={18} strokeWidth={1.5} /> Welcome to the ritual — we&rsquo;ll be in touch soon.
        </motion.p>
      ) : (
        <motion.form
          key="form"
          exit={{ opacity: 0, y: -10 }}
          className="flex w-full items-center gap-2 rounded-full bg-white/55 p-1.5 pl-6 shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_0_0_1px_rgba(255,255,255,0.7),inset_0_2px_6px_rgba(14,39,42,0.08),0_12px_28px_-18px_rgba(14,39,42,0.45)] backdrop-blur-md backdrop-saturate-150 transition focus-within:bg-white/75 focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_0_0_1px_rgba(125,104,168,0.7),0_0_0_3px_rgba(205,189,230,0.45)]"
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
            className="min-w-0 flex-1 bg-transparent py-3 text-[16px] text-midnight caret-lilac-deep outline-none placeholder:text-stone"
          />
          <button
            type="submit"
            className="btn-iris group shrink-0 !gap-2 !px-5 !py-3.5 !tracking-[0.18em] sm:!px-7"
          >
            <span className="hidden sm:inline">Subscribe</span>
            <ArrowRight size={16} strokeWidth={1.4} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
