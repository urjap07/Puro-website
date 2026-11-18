"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { z } from "zod";
import { Check, Loader2, Send, X } from "lucide-react";
import { FieldError, field, labelText } from "@/components/account/AddressForm";
import { SITE } from "@/lib/site";

/**
 * "Get a price quote" for hotels and spas, sent to Formspree. Uses
 * NEXT_PUBLIC_FORMSPREE_CONTACT_ID when set, otherwise the newsletter form,
 * with a "Quote request" subject so it stands out.
 */
const FORM_ID =
  process.env.NEXT_PUBLIC_FORMSPREE_CONTACT_ID?.trim() || process.env.NEXT_PUBLIC_FORMSPREE_NEWSLETTER_ID?.trim() || null;

const Quote = z.object({
  name: z.string().trim().min(2, "Please tell us your name.").max(80),
  phone: z
    .string()
    .trim()
    .refine((value) => /^[+\d][\d\s-]{6,}$/.test(value), "Please enter a valid phone number."),
  email: z.string().trim().min(1, "Please enter your email address.").pipe(z.email("Please enter a valid email address.")),
  business: z.string().trim().min(2, "Please enter your hotel, spa or company name.").max(120),
  interest: z.string().trim().min(1, "Please choose what you're interested in."),
  quantity: z.string().trim().max(120),
  message: z.string().trim().max(2000),
});
type QuoteInput = z.input<typeof Quote>;
type Errors = Partial<Record<keyof QuoteInput, string>>;

const BLANK: QuoteInput = { name: "", phone: "", email: "", business: "", interest: "", quantity: "", message: "" };

export default function QuoteForm({
  kind,
  interests,
  picked = [],
  onRemove,
}: {
  kind: "Hotel" | "Spa";
  interests: string[];
  /** Products chosen with "Add to quote"; when there are some, "Interested in" is optional. */
  picked?: string[];
  onRemove?: (name: string) => void;
}) {
  const [values, setValues] = useState<QuoteInput>(BLANK);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [problem, setProblem] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const set = (key: keyof QuoteInput) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    const parsed = Quote.safeParse(picked.length && !values.interest ? { ...values, interest: "Selected products" } : values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) next[issue.path[0] as keyof QuoteInput] ??= issue.message;
      setErrors(next);
      formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus();
      return;
    }
    if (!FORM_ID) {
      setProblem(`Our quote form isn't switched on yet. Please email ${SITE.email} or call ${SITE.phone}.`);
      return;
    }
    setStatus("sending");
    setProblem(null);
    const data = parsed.data;
    try {
      const response = await fetch(`https://formspree.io/f/${encodeURIComponent(FORM_ID)}`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          _subject: `Quote request (${kind}): ${data.business} — ${picked.length ? `${picked.length} products` : data.interest}`,
          _replyto: data.email,
          _gotcha: String(new FormData(event.currentTarget).get("_gotcha") ?? ""),
          type: `${kind} quote`,
          name: data.name,
          phone: data.phone,
          email: data.email,
          business: data.business,
          interest: data.interest,
          ...(picked.length ? { products: picked.join(", ") } : {}),
          approx_monthly_requirement: data.quantity || "—",
          message: data.message || "—",
        }),
      });
      if (response.ok) setStatus("sent");
      else {
        setStatus("idle");
        setProblem(response.status === 429 ? "Too many requests just now — please try again in a minute." : `We couldn't send your request. Please try again, or email ${SITE.email}.`);
      }
    } catch {
      setStatus("idle");
      setProblem("You seem to be offline. Please check your connection and try again.");
    }
  };

  const describe = (key: keyof QuoteInput) => (errors[key] ? `quote-${key}-error` : undefined);
  const input = (key: keyof QuoteInput, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className={labelText}>{label}</span>
      <input name={key} value={values[key]} onChange={set(key)} aria-invalid={!!errors[key] || undefined} aria-describedby={describe(key)} className={field} {...props} />
      <FieldError id={`quote-${key}-error`} message={errors[key]} />
    </label>
  );

  return (
    <AnimatePresence mode="wait">
      {status === "sent" ? (
        <motion.div key="sent" role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="py-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f6e3c8,#efc3c8_50%,#d6c8ee)] text-midnight">
            <Check size={24} strokeWidth={1.6} />
          </span>
          <h3 className="mt-5 font-display text-[32px] leading-tight text-midnight">Thank you, {values.name.trim().split(" ")[0]}</h3>
          <p className="mx-auto mt-3 max-w-[400px] text-[15px] leading-[1.7] text-stone">
            We&rsquo;ve received your request for <strong className="font-medium text-midnight">{values.business.trim()}</strong> and will get back to you with a quote shortly.
          </p>
        </motion.div>
      ) : (
        <motion.form key="form" ref={formRef} noValidate onSubmit={onSubmit} exit={{ opacity: 0, y: -10 }} className="grid gap-5 sm:grid-cols-2">
          {picked.length > 0 && (
            <div className="sm:col-span-2">
              <p className={labelText}>Products in your quote ({picked.length})</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {picked.map((name) => (
                  <li key={name} className="flex items-center gap-1 rounded-full bg-white/80 py-1 pl-3 pr-1 text-[13px] text-midnight shadow-[0_6px_14px_-10px_rgba(14,39,42,0.6)]">
                    {name}
                    {onRemove && (
                      <button type="button" onClick={() => onRemove(name)} aria-label={`Remove ${name}`} className="flex h-6 w-6 items-center justify-center rounded-full text-stone hover:bg-midnight/10 hover:text-midnight">
                        <X size={12} strokeWidth={1.8} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {input("name", "Your name", { autoComplete: "name" })}
          {input("phone", "Phone", { type: "tel", inputMode: "tel", autoComplete: "tel" })}
          {input("email", "Email", { type: "email", inputMode: "email", autoComplete: "email" })}
          {input("business", kind === "Hotel" ? "Hotel or company name" : "Spa, salon or company name", { autoComplete: "organization" })}
          <label className="block">
            <span className={labelText}>
              {picked.length ? "Main category" : "Interested in"}
              {picked.length > 0 && <span className="font-normal normal-case tracking-normal text-stone"> (optional)</span>}
            </span>
            <select name="interest" value={values.interest} onChange={set("interest")} aria-invalid={!!errors.interest || undefined} aria-describedby={describe("interest")} className={clsx(field, "cursor-pointer", !values.interest && "text-stone/70")}>
              <option value="" disabled>
                Choose one
              </option>
              {interests.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
              <option value="Something else">Something else</option>
            </select>
            <FieldError id="quote-interest-error" message={errors.interest} />
          </label>
          {input("quantity", "Approx. monthly requirement", { placeholder: "e.g. 500 kits / month" })}
          <label className="block sm:col-span-2">
            <span className={labelText}>
              Anything else? <span className="font-normal normal-case tracking-normal text-stone">(optional)</span>
            </span>
            <textarea name="message" rows={4} value={values.message} onChange={set("message")} placeholder="Sizes, fragrances, branding, delivery city…" className={clsx(field, "h-auto resize-y py-3 leading-[1.6]")} />
          </label>
          <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px opacity-0" />
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <button type="submit" disabled={status === "sending"} className="btn-primary !px-9 !py-3.5 disabled:cursor-wait disabled:opacity-80">
              {status === "sending" ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} strokeWidth={1.6} />}
              {status === "sending" ? "Sending" : "Request a quote"}
            </button>
            <p className="text-[12px] text-stone">
              Or call {SITE.phone} · {SITE.email}
            </p>
          </div>
          <p aria-live="polite" className={clsx("text-[13px] text-rose-700 sm:col-span-2", !problem && "sr-only")}>
            {problem ?? ""}
          </p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
