"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { subscribe } from "@/lib/newsletter";
import { SITE } from "@/lib/site";

const STORAGE_KEY = "puro-letter-subscribed";

type Status = "idle" | "sending" | "done" | "error";

/** The Puro Letter sign-up, sent to Formspree (see lib/newsletter.ts). */
export default function NewsletterForm() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [returning, setReturning] = useState(false);

  // Someone who has already joined on this device sees a thank-you instead.
  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY)) {
        setReturning(true);
        setStatus("done");
      }
    } catch {
      // Storage blocked; show the form.
    }
  }, []);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    const honeypot = String(new FormData(event.currentTarget).get("website") ?? "");
    setStatus("sending");
    setMessage(null);
    const result = await subscribe(email, { page: window.location.pathname, honeypot });
    if (result.ok) {
      setStatus("done");
      try {
        window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      } catch {
        // Storage blocked; the thank-you still shows.
      }
    } else {
      setStatus("error");
      setMessage(result.message);
    }
  };

  const errorId = `${id}-error`;

  return (
    <div>
      <AnimatePresence mode="wait">
        {status === "done" ? (
          <motion.div
            key="thanks"
            role="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] bg-white/60 px-6 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_0_0_1px_rgba(255,255,255,0.7),0_12px_28px_-16px_rgba(125,104,168,0.55)] backdrop-blur-md"
          >
            <p className="flex items-center gap-3 font-display text-[22px] italic text-plum">
              <Check size={18} strokeWidth={1.5} /> {returning ? "You're already on the list — thank you." : "Welcome to the ritual — we'll be in touch soon."}
            </p>
            {returning && (
              <button
                type="button"
                onClick={() => {
                  setReturning(false);
                  setEmail("");
                  setStatus("idle");
                }}
                className="mt-1 pl-[30px] text-[13px] text-stone underline underline-offset-4 hover:text-midnight"
              >
                Sign up a different email
              </button>
            )}
          </motion.div>
        ) : (
          <motion.form
            key="form"
            exit={{ opacity: 0, y: -10 }}
            noValidate
            onSubmit={onSubmit}
            aria-describedby={message ? errorId : undefined}
            className={clsx(
              "flex w-full items-center gap-2 rounded-full bg-white/55 p-1.5 pl-6 shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_0_0_1px_rgba(255,255,255,0.7),inset_0_2px_6px_rgba(14,39,42,0.08),0_12px_28px_-18px_rgba(14,39,42,0.45)] backdrop-blur-md backdrop-saturate-150 transition focus-within:bg-white/75 focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_0_0_1px_rgba(125,104,168,0.7),0_0_0_3px_rgba(205,189,230,0.45)]",
              status === "error" && "shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_0_0_1px_rgba(178,58,72,0.55),0_12px_28px_-18px_rgba(14,39,42,0.45)]",
            )}
          >
            <label htmlFor={`${id}-email`} className="sr-only">
              Email address
            </label>
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (status === "error") {
                  setStatus("idle");
                  setMessage(null);
                }
              }}
              aria-invalid={status === "error" || undefined}
              aria-describedby={message ? errorId : undefined}
              placeholder="Your email address"
              className="min-w-0 flex-1 bg-transparent py-3 text-[16px] text-midnight caret-lilac-deep outline-none placeholder:text-stone"
            />
            {/* Spam trap, hidden from people and screen readers. */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px opacity-0" />
            <button
              type="submit"
              disabled={status === "sending"}
              className="btn-iris group shrink-0 !gap-2 !px-5 !py-3.5 !tracking-[0.18em] disabled:cursor-wait disabled:opacity-80 sm:!px-7"
            >
              <span className="hidden sm:inline">{status === "sending" ? "Joining" : "Subscribe"}</span>
              {status === "sending" ? (
                <Loader2 size={16} strokeWidth={1.6} className="animate-spin" aria-label="Signing you up" />
              ) : (
                <ArrowRight size={16} strokeWidth={1.4} className="transition-transform duration-300 group-hover:translate-x-1" />
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <p id={errorId} aria-live="polite" className={clsx("min-h-[1.25rem] px-6 pt-2 text-[13px]", message ? "text-rose-700" : "text-transparent")}>
        {message ?? " "}
      </p>
      {status !== "done" && (
        <p className={clsx("px-6 text-[12px] leading-[1.6] text-stone", message && "mt-2")}>
          We&rsquo;ll only use your email to send the Puro Letter. To unsubscribe at any time, write to{" "}
          <a href={`mailto:${SITE.email}`} className="underline underline-offset-2 hover:text-midnight">
            {SITE.email}
          </a>
          .
        </p>
      )}
    </div>
  );
}
