"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { z } from "zod";
import { Check, Loader2, PenLine, Star, X } from "lucide-react";
import { FieldError, field, labelText } from "@/components/account/AddressForm";

/**
 * "Leave a review", sent to Formspree for the team to read. Reviews aren't
 * published automatically: the team approves them first (the PRD's review
 * moderation), then they're added to the catalogue.
 */
const FORM_ID =
  process.env.NEXT_PUBLIC_FORMSPREE_CONTACT_ID?.trim() || process.env.NEXT_PUBLIC_FORMSPREE_NEWSLETTER_ID?.trim() || null;

const Review = z.object({
  name: z.string().trim().min(2, "Please tell us your name.").max(60),
  email: z.string().trim().min(1, "Please enter your email address.").pipe(z.email("Please enter a valid email address.")),
  rating: z.number().int().min(1, "Please choose a star rating.").max(5),
  title: z.string().trim().max(80),
  body: z.string().trim().min(10, "Please write a little more about your experience.").max(2000),
});
type Errors = Partial<Record<keyof z.input<typeof Review>, string>>;

export default function ReviewForm({ productName }: { productName: string }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({ name: "", email: "", rating: 0, title: "", body: "" });
  const [hover, setHover] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [problem, setProblem] = useState<string | null>(null);

  const set = (key: "name" | "email" | "title" | "body") => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    const parsed = Review.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) next[issue.path[0] as keyof Errors] ??= issue.message;
      setErrors(next);
      return;
    }
    if (!FORM_ID) {
      setProblem("Reviews aren't switched on yet — please try again soon.");
      return;
    }
    setStatus("sending");
    setProblem(null);
    try {
      const response = await fetch(`https://formspree.io/f/${encodeURIComponent(FORM_ID)}`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          _subject: `New review (${parsed.data.rating}★): ${productName}`,
          _replyto: parsed.data.email,
          _gotcha: String(new FormData(event.currentTarget).get("_gotcha") ?? ""),
          type: "Product review — approve before publishing",
          product: productName,
          name: parsed.data.name,
          email: parsed.data.email,
          rating: `${parsed.data.rating} / 5`,
          title: parsed.data.title || "—",
          review: parsed.data.body,
          page: window.location.href,
        }),
      });
      if (response.ok) setStatus("sent");
      else {
        setStatus("idle");
        setProblem("We couldn't send your review just now. Please try again.");
      }
    } catch {
      setStatus("idle");
      setProblem("You seem to be offline. Please check your connection and try again.");
    }
  };

  if (status === "sent") {
    return (
      <div role="status" className="glass tint-sage mt-8 rounded-[24px] p-5">
        <p className="relative z-[2] flex items-center gap-2 font-display text-[22px] leading-tight text-midnight">
          <Check size={18} strokeWidth={1.8} /> Thank you, {values.name.trim().split(" ")[0]}!
        </p>
        <p className="relative z-[2] mt-1 text-[14px] text-stone">Your review has been sent. We publish reviews once our team has read them.</p>
      </div>
    );
  }

  return (
    <div className="glass tint-apricot mt-8 rounded-[24px] p-5">
      <div className="relative z-[2] flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[22px] leading-tight text-midnight">Tried this ritual?</p>
          <p className="mt-1 text-[14px] text-stone">We&rsquo;d love to hear how it felt.</p>
        </div>
        {open && (
          <button type="button" onClick={() => setOpen(false)} aria-label="Close review form" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-white/60">
            <X size={16} strokeWidth={1.6} />
          </button>
        )}
      </div>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="btn-glass relative z-[2] mt-4 !px-6 !py-3 !text-[11px]">
          <PenLine size={14} strokeWidth={1.6} /> Leave a review
        </button>
      ) : (
        <AnimatePresence>
          <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} noValidate onSubmit={submit} className="relative z-[2] mt-4 space-y-4">
            <fieldset>
              <legend className={labelText}>Your rating</legend>
              <div className="mt-1.5 flex gap-1" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const lit = star <= (hover || values.rating);
                  return (
                    <button
                      key={star}
                      type="button"
                      aria-label={`${star} star${star > 1 ? "s" : ""}`}
                      aria-pressed={values.rating === star}
                      onMouseEnter={() => setHover(star)}
                      onClick={() => {
                        setValues((current) => ({ ...current, rating: star }));
                        setErrors((current) => ({ ...current, rating: undefined }));
                      }}
                      className="rounded-md p-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5E4B8A]"
                    >
                      <Star size={26} strokeWidth={1.3} className={clsx(lit ? "fill-saffron text-saffron-deep" : "text-stone/50")} />
                    </button>
                  );
                })}
              </div>
              <FieldError id="review-rating-error" message={errors.rating} />
            </fieldset>
            <label className="block">
              <span className={labelText}>Your name</span>
              <input name="name" autoComplete="name" value={values.name} onChange={set("name")} aria-invalid={!!errors.name || undefined} className={field} />
              <FieldError id="review-name-error" message={errors.name} />
            </label>
            <label className="block">
              <span className={labelText}>Email <span className="font-normal normal-case tracking-normal text-stone">(not published)</span></span>
              <input name="email" type="email" autoComplete="email" value={values.email} onChange={set("email")} aria-invalid={!!errors.email || undefined} className={field} />
              <FieldError id="review-email-error" message={errors.email} />
            </label>
            <label className="block">
              <span className={labelText}>Title <span className="font-normal normal-case tracking-normal text-stone">(optional)</span></span>
              <input name="title" value={values.title} onChange={set("title")} className={field} />
            </label>
            <label className="block">
              <span className={labelText}>Your review</span>
              <textarea name="body" rows={4} value={values.body} onChange={set("body")} aria-invalid={!!errors.body || undefined} className={clsx(field, "h-auto resize-y py-3 leading-[1.6]")} />
              <FieldError id="review-body-error" message={errors.body} />
            </label>
            <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px opacity-0" />
            <button type="submit" disabled={status === "sending"} className="btn-primary w-full !py-3 disabled:cursor-wait disabled:opacity-80">
              {status === "sending" && <Loader2 size={15} className="animate-spin" />}
              {status === "sending" ? "Sending" : "Send review"}
            </button>
            <p className="text-[12px] leading-[1.6] text-stone">Reviews are published once our team has read them.</p>
            <p aria-live="polite" className={clsx("text-[13px] text-rose-700", !problem && "sr-only")}>
              {problem ?? ""}
            </p>
          </motion.form>
        </AnimatePresence>
      )}
    </div>
  );
}
