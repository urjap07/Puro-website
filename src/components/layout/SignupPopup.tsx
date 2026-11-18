"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { ArrowRight, Check, Loader2, X } from "lucide-react";
import { DIAL_CODES, NewsletterEmail, SUBSCRIBED_KEY, phoneProblem, subscribe } from "@/lib/newsletter";
import { useCart } from "@/lib/cart-store";
import { SITE } from "@/lib/site";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Seconds on the site before the pop-up appears. */
const DELAY = 8;
/** Days to wait before showing it again after it's closed. */
const SNOOZE_DAYS = 14;
/** Seconds to wait after the homepage film or the bag has closed. */
const AFTER_BUSY = 5;
const DISMISSED_KEY = "puro-signup-popup-dismissed";

/** Pages where an interruption would get in the way. */
const QUIET = [/^\/checkout/, /^\/orders\//, /^\/policies/, /^\/newsletter/];

const readStorage = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
const writeStorage = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage blocked: the pop-up may show again next visit.
  }
};

/**
 * "Join the PURO family" — a sign-up pop-up for the Puro Letter (email and
 * phone), sent to Formspree like the footer form. Shown once, a few seconds
 * into a visit; never to someone who has joined, and not again for two weeks
 * after it's closed.
 */
export default function SignupPopup() {
  const id = useId();
  const pathname = usePathname();
  const bagOpen = useCart((state) => state.isOpen);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [dialCode, setDialCode] = useState<string>(DIAL_CODES[0].code);
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ email?: string; phone?: string; form?: string }>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const shown = useRef(false);

  const quiet = QUIET.some((pattern) => pattern.test(pathname));

  // Decide whether, and when, to show it.
  useEffect(() => {
    // Preview: add ?signup=1 to any address to open it straight away
    // (ignores "already joined" and "closed recently" on this device).
    if (!shown.current && new URLSearchParams(window.location.search).get("signup") === "1") {
      const preview = setTimeout(() => {
        shown.current = true;
        returnFocus.current = document.activeElement as HTMLElement | null;
        setOpen(true);
      }, 600);
      return () => clearTimeout(preview);
    }
    if (shown.current || quiet) return;
    if (readStorage(SUBSCRIBED_KEY)) return;
    const dismissed = Number(readStorage(DISMISSED_KEY) ?? 0);
    if (dismissed && Date.now() - dismissed < SNOOZE_DAYS * 24 * 60 * 60 * 1000) return;

    let timer: ReturnType<typeof setTimeout>;
    let waited = false;
    // Note when the homepage film finishes, even if that's before the first check.
    let filmEndedAt = 0;
    let filmSeen = false;
    const root = document.documentElement;
    const watcher = new MutationObserver(() => {
      if (root.dataset.heroIntro === "on") filmSeen = true;
      else if (filmSeen && !filmEndedAt) filmEndedAt = Date.now();
    });
    watcher.observe(root, { attributes: true, attributeFilter: ["data-hero-intro"] });
    const attempt = () => {
      const sinceFilm = filmEndedAt ? Date.now() - filmEndedAt : Infinity;
      if (sinceFilm < AFTER_BUSY * 1000) {
        timer = setTimeout(attempt, AFTER_BUSY * 1000 - sinceFilm);
        return;
      }
      // Wait for the homepage film, the bag drawer and the menu to be out of the way…
      const film = document.documentElement.dataset.heroIntro;
      const busy = film === "on" || useCart.getState().isOpen || document.body.style.overflow === "hidden";
      if (busy) {
        waited = true;
        timer = setTimeout(attempt, 1000);
        return;
      }
      // …then a few calm seconds more, so the pop-up never lands the moment the film ends.
      if (waited) {
        waited = false;
        timer = setTimeout(attempt, AFTER_BUSY * 1000);
        return;
      }
      if (readStorage(SUBSCRIBED_KEY)) return;
      shown.current = true;
      returnFocus.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    };
    timer = setTimeout(attempt, DELAY * 1000);
    return () => {
      clearTimeout(timer);
      watcher.disconnect();
    };
  }, [quiet]);

  const close = useCallback(() => {
    setOpen(false);
    if (status !== "done") writeStorage(DISMISSED_KEY, String(Date.now()));
    returnFocus.current?.focus?.();
  }, [status]);

  // Close if the visitor heads somewhere quiet (e.g. checkout) or opens the bag.
  useEffect(() => {
    if (open && (quiet || bagOpen)) setOpen(false);
  }, [open, quiet, bagOpen]);

  // Esc closes; Tab stays inside the dialog; the page behind doesn't scroll.
  useEffect(() => {
    if (!open) return;
    const lenis = (window as Window & { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    lenis?.stop();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([tabindex="-1"]), select, a[href]');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [open, close]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    const emailCheck = NewsletterEmail.safeParse(email);
    const next = {
      email: emailCheck.success ? undefined : emailCheck.error.issues[0]?.message,
      phone: phoneProblem(dialCode, phone) ?? undefined,
    };
    setErrors(next);
    if (next.email || next.phone) {
      dialogRef.current?.querySelector<HTMLElement>(next.email ? "[name=email]" : "[name=phone]")?.focus();
      return;
    }
    setStatus("sending");
    const honeypot = String(new FormData(event.currentTarget).get("website") ?? "");
    const digits = phone.replace(/[\s-]/g, "").replace(/^0/, "");
    const result = await subscribe(email, { page: pathname, honeypot, phone: `${dialCode} ${digits}`, source: "Pop-up" });
    if (result.ok) {
      setStatus("done");
      writeStorage(SUBSCRIBED_KEY, new Date().toISOString());
    } else {
      setStatus("idle");
      setErrors({ form: result.message });
    }
  };

  const field =
    "h-12 rounded-full bg-white/80 px-5 text-[15px] text-midnight shadow-[inset_0_1px_2px_rgba(14,39,42,0.08),inset_0_0_0_1px_rgba(255,255,255,0.8)] outline-none transition placeholder:text-stone/60 focus:bg-white focus:ring-2 focus:ring-[#5E4B8A]/50";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="signup"
          className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button type="button" aria-label="Close" tabIndex={-1} onClick={close} className="absolute inset-0 bg-midnight-deep/45 backdrop-blur-[3px]" />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-title`}
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative grid max-h-[calc(100dvh-24px)] w-full max-w-[880px] overflow-y-auto rounded-[28px] bg-[#fbf7f1] shadow-[0_40px_90px_-30px_rgba(14,39,42,0.65)] sm:rounded-[34px] md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]"
            data-lenis-prevent
          >
            <div className="relative hidden min-h-[460px] md:block">
              <Image src="/media/brand/03.jpg" alt="Glow Up Pithi Pack, Vita Clay Ubtan Pack, Scrubulush Exfoliator and Aquench Soothing Hydrogel" fill sizes="440px" className="object-cover" priority />
            </div>
            <div className="relative px-6 pb-7 pt-12 sm:px-10 sm:pb-10 sm:pt-14">
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                autoFocus
                className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-midnight shadow-[0_6px_16px_-10px_rgba(14,39,42,0.5)] transition hover:bg-white sm:right-5 sm:top-5"
              >
                <X size={18} strokeWidth={1.6} />
              </button>

              {status === "done" ? (
                <div role="status" className="flex min-h-[300px] flex-col items-center justify-center text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f6e3c8,#efc3c8_50%,#d6c8ee)] text-midnight">
                    <Check size={24} strokeWidth={1.6} />
                  </span>
                  <h2 id={`${id}-title`} className="mt-5 font-display text-[36px] leading-tight text-midnight">
                    Welcome to the <em className="text-iris pr-1">family.</em>
                  </h2>
                  <p className="mt-3 max-w-[320px] text-[15px] leading-[1.7] text-stone">You&rsquo;ll be the first to hear about new rituals and offers.</p>
                  <button type="button" onClick={close} className="btn-primary mt-7 !px-8 !py-3.5">
                    Continue shopping
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#8E4F5B]">The PURO family</p>
                  <h2 id={`${id}-title`} className="mt-3 font-display text-[34px] font-light leading-[1.08] text-midnight sm:text-[40px]">
                    Join the PURO family and be the first to know about <em className="text-iris pr-1">future discounts.</em>
                  </h2>
                  <form onSubmit={onSubmit} noValidate className="mt-7 space-y-4">
                    <label className="block">
                      <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-midnight">Email address</span>
                      <input
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          if (errors.email || errors.form) setErrors({ ...errors, email: undefined, form: undefined });
                        }}
                        aria-invalid={Boolean(errors.email) || undefined}
                        aria-describedby={errors.email ? `${id}-email-error` : undefined}
                        placeholder="you@example.com"
                        className={clsx(field, "mt-1.5 w-full")}
                      />
                      {errors.email && (
                        <span id={`${id}-email-error`} className="mt-1 block px-2 text-[12px] font-medium text-[#8E4F5B]">
                          {errors.email}
                        </span>
                      )}
                    </label>
                    <div>
                      <label htmlFor={`${id}-phone`} className="text-[12px] font-semibold uppercase tracking-[0.16em] text-midnight">
                        Phone
                      </label>
                      <div className="mt-1.5 flex gap-2">
                        <label className="sr-only" htmlFor={`${id}-dial`}>
                          Country code
                        </label>
                        <select
                          id={`${id}-dial`}
                          value={dialCode}
                          onChange={(event) => setDialCode(event.target.value)}
                          className={clsx(field, "w-[112px] shrink-0 cursor-pointer !px-3")}
                        >
                          {DIAL_CODES.map((option) => (
                            <option key={option.code} value={option.code}>
                              {option.flag} {option.code}
                            </option>
                          ))}
                        </select>
                        <input
                          id={`${id}-phone`}
                          name="phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel-national"
                          value={phone}
                          onChange={(event) => {
                            setPhone(event.target.value);
                            if (errors.phone || errors.form) setErrors({ ...errors, phone: undefined, form: undefined });
                          }}
                          aria-invalid={Boolean(errors.phone) || undefined}
                          aria-describedby={errors.phone ? `${id}-phone-error` : undefined}
                          placeholder={dialCode === "+91" ? "98765 43210" : "Phone number"}
                          className={clsx(field, "min-w-0 flex-1")}
                        />
                      </div>
                      {errors.phone && (
                        <span id={`${id}-phone-error`} className="mt-1 block px-2 text-[12px] font-medium text-[#8E4F5B]">
                          {errors.phone}
                        </span>
                      )}
                    </div>
                    {/* Spam trap, hidden from people and screen readers. */}
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px opacity-0" />
                    <button type="submit" disabled={status === "sending"} className="btn-primary group !mt-6 w-full !py-3.5 disabled:cursor-wait disabled:opacity-80 sm:w-auto sm:!px-10">
                      {status === "sending" ? <Loader2 size={15} className="animate-spin" /> : null}
                      {status === "sending" ? "Joining" : "Join now"}
                      {status !== "sending" && <ArrowRight size={15} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />}
                    </button>
                    <p aria-live="polite" className={clsx("text-[13px] text-rose-700", !errors.form && "sr-only")}>
                      {errors.form ?? ""}
                    </p>
                    <p className="text-[12px] leading-[1.6] text-stone">
                      We&rsquo;ll only use your details to share PURO news and offers. To unsubscribe at any time, write to{" "}
                      <a href={`mailto:${SITE.email}`} className="underline underline-offset-2 hover:text-midnight">
                        {SITE.email}
                      </a>
                      .
                    </p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
