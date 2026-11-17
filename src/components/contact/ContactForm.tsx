"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Check, Loader2, Send } from "lucide-react";
import { FieldError, field, labelText } from "@/components/account/AddressForm";
import { type ContactErrors, type ContactInput, sendContact, validateContact } from "@/lib/contact";
import { ASK_ORDER_NUMBER, CONTACT, CONTACT_TOPICS } from "@/lib/support";
import { useAccount } from "@/lib/account-store";

const BLANK: ContactInput = { name: "", email: "", phone: "", topic: "" as ContactInput["topic"], order: "", message: "" };

/** "Write to us" — sent to Formspree (see lib/contact.ts). */
export default function ContactForm() {
  const [values, setValues] = useState<ContactInput>(BLANK);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [problem, setProblem] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const params = useSearchParams();
  const orders = useAccount((state) => state.orders);

  // Opened from an order page ("Need help with this order?"): fill in the order.
  useEffect(() => {
    useAccount.persist.rehydrate();
    const order = params.get("order")?.trim().toUpperCase().slice(0, 40);
    if (order) setValues((current) => ({ ...current, topic: "An order I've placed", order }));
  }, [params]);

  const set = (key: keyof ContactInput) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    const result = validateContact(values);
    if (!result.ok) {
      setErrors(result.errors);
      // Move focus to the first field that needs attention.
      const first = Object.keys(result.errors)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus("sending");
    setProblem(null);
    const honeypot = String(new FormData(event.currentTarget).get("_gotcha") ?? "");
    const sent = await sendContact(result.data, honeypot);
    if (sent.ok) {
      setStatus("sent");
    } else {
      setStatus("error");
      setProblem(sent.message);
    }
  };

  const describe = (key: keyof ContactInput) => (errors[key] ? `contact-${key}-error` : undefined);
  const showOrder = ASK_ORDER_NUMBER && values.topic === "An order I've placed";

  return (
    <AnimatePresence mode="wait">
      {status === "sent" ? (
        <motion.div key="sent" role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="py-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f6e3c8,#efc3c8_50%,#d6c8ee)] text-midnight">
            <Check size={24} strokeWidth={1.6} />
          </span>
          <h3 className="mt-5 font-display text-[34px] leading-tight text-midnight">Thank you, {values.name.trim().split(" ")[0]}</h3>
          <p className="mx-auto mt-3 max-w-[380px] text-[15px] leading-[1.7] text-stone">
            Your message is on its way to us. {CONTACT.replyTime} We&rsquo;ll write back to <strong className="font-medium text-midnight">{values.email.trim()}</strong>.
          </p>
          <button
            type="button"
            onClick={() => {
              setValues(BLANK);
              setStatus("idle");
            }}
            className="btn-glass mt-7 !px-7 !py-3"
          >
            Send another message
          </button>
        </motion.div>
      ) : (
        <motion.form key="form" ref={formRef} noValidate onSubmit={onSubmit} exit={{ opacity: 0, y: -10 }} className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className={labelText}>Your name</span>
            <input name="name" autoComplete="name" value={values.name} onChange={set("name")} aria-invalid={!!errors.name || undefined} aria-describedby={describe("name")} className={field} />
            <FieldError id="contact-name-error" message={errors.name} />
          </label>
          <label className="block">
            <span className={labelText}>Email</span>
            <input name="email" type="email" inputMode="email" autoComplete="email" value={values.email} onChange={set("email")} aria-invalid={!!errors.email || undefined} aria-describedby={describe("email")} className={field} />
            <FieldError id="contact-email-error" message={errors.email} />
          </label>
          <label className="block">
            <span className={labelText}>
              Phone <span className="font-normal normal-case tracking-normal text-stone">(optional)</span>
            </span>
            <input name="phone" type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={set("phone")} aria-invalid={!!errors.phone || undefined} aria-describedby={describe("phone")} className={field} />
            <FieldError id="contact-phone-error" message={errors.phone} />
          </label>
          <label className="block">
            <span className={labelText}>What&rsquo;s it about?</span>
            <select name="topic" value={values.topic} onChange={set("topic")} aria-invalid={!!errors.topic || undefined} aria-describedby={describe("topic")} className={clsx(field, "cursor-pointer", !values.topic && "text-stone/70")}>
              <option value="" disabled>
                Choose a topic
              </option>
              {CONTACT_TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
            <FieldError id="contact-topic-error" message={errors.topic} />
          </label>
          {showOrder && (
            <label className="block sm:col-span-2">
              <span className={labelText}>
                Order number <span className="font-normal normal-case tracking-normal text-stone">(optional — from your order confirmation)</span>
              </span>
              <input
                name="order"
                list="contact-my-orders"
                autoComplete="off"
                placeholder="e.g. PURO-261117-7K3Q"
                value={values.order}
                onChange={set("order")}
                className={clsx(field, "font-mono uppercase tracking-[0.06em] placeholder:font-sans placeholder:normal-case placeholder:tracking-normal")}
              />
              {orders.length > 0 && (
                <datalist id="contact-my-orders">
                  {orders.map((order) => (
                    <option key={order.number} value={order.number}>
                      {order.summary}
                    </option>
                  ))}
                </datalist>
              )}
              <span className="mt-1 block text-[12px] text-stone">It&rsquo;s on your order confirmation and under Your orders in your account.</span>
            </label>
          )}
          <label className="block sm:col-span-2">
            <span className={labelText}>Your message</span>
            <textarea
              name="message"
              rows={6}
              value={values.message}
              onChange={set("message")}
              aria-invalid={!!errors.message || undefined}
              aria-describedby={describe("message")}
              className={clsx(field, "h-auto resize-y py-3 leading-[1.6]")}
            />
            <FieldError id="contact-message-error" message={errors.message} />
          </label>
          {/* Spam trap, hidden from people and screen readers. */}
          <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px opacity-0" />
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <button type="submit" disabled={status === "sending"} className="btn-primary !px-9 !py-3.5 disabled:cursor-wait disabled:opacity-80">
              {status === "sending" ? <Loader2 size={15} strokeWidth={1.6} className="animate-spin" /> : <Send size={15} strokeWidth={1.6} />}
              {status === "sending" ? "Sending" : "Send message"}
            </button>
            <p className="text-[12px] leading-[1.6] text-stone">We only use your details to reply to this message.</p>
          </div>
          <p aria-live="polite" className={clsx("text-[13px] text-rose-700 sm:col-span-2", !problem && "sr-only")}>
            {problem ?? ""}
          </p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
