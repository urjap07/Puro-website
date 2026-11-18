import { z } from "zod";

/**
 * The Puro Letter sign-up, sent to Formspree (https://formspree.io).
 *
 * Set NEXT_PUBLIC_FORMSPREE_NEWSLETTER_ID to the form's ID — the part after
 * /f/ in its endpoint, e.g. "xyzabcde" for https://formspree.io/f/xyzabcde —
 * in .env.local, then restart the dev server. Each sign-up then appears in
 * the Formspree dashboard and is emailed to the form's owner.
 */
export const NEWSLETTER_FORM_ID = process.env.NEXT_PUBLIC_FORMSPREE_NEWSLETTER_ID?.trim() || null;

export const NewsletterEmail = z
  .string()
  .trim()
  .min(1, "Please enter your email address.")
  .max(254, "That email address is too long.")
  .pipe(z.email("Please enter a valid email address, like name@example.com."));

/** Remembers on this device that the visitor has joined (shared by the footer form and the pop-up). */
export const SUBSCRIBED_KEY = "puro-letter-subscribed";

/** Country codes offered for the phone number (India first). */
export const DIAL_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+1", country: "USA / Canada", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
] as const;

/** Why a phone number can't be right, or null. Indian mobiles are 10 digits starting 6–9. */
export function phoneProblem(dialCode: string, value: string): string | null {
  const digits = value.replace(/[\s-]/g, "");
  if (!digits) return "Please enter your phone number.";
  if (!/^\d+$/.test(digits)) return "A phone number has digits only.";
  if (dialCode === "+91") return /^[6-9]\d{9}$/.test(digits.replace(/^0/, "")) ? null : "Please enter a 10-digit Indian mobile number.";
  return digits.length >= 6 && digits.length <= 14 ? null : "Please enter a valid phone number.";
}

export type SubscribeResult =
  | { ok: true }
  | { ok: false; reason: "not-configured" | "invalid" | "rate-limited" | "network" | "rejected"; message: string };

/** Sends a sign-up to Formspree. Never throws. */
export async function subscribe(
  email: string,
  details: { page: string; honeypot?: string; phone?: string; source?: string },
): Promise<SubscribeResult> {
  const parsed = NewsletterEmail.safeParse(email);
  if (!parsed.success) return { ok: false, reason: "invalid", message: parsed.error.issues[0]?.message ?? "Please check your email address." };

  if (!NEWSLETTER_FORM_ID) {
    return {
      ok: false,
      reason: "not-configured",
      message: "Sign-ups open very soon. In the meantime, write to us at puro@sanisa.co.in and we'll add you.",
    };
  }

  try {
    const response = await fetch(`https://formspree.io/f/${encodeURIComponent(NEWSLETTER_FORM_ID)}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        email: parsed.data,
        list: "The Puro Letter",
        ...(details.phone ? { phone: details.phone } : {}),
        source: details.source ?? "Footer",
        page: details.page,
        _subject: "New Puro Letter sign-up",
        // Formspree's spam trap: real people leave this empty.
        _gotcha: details.honeypot ?? "",
      }),
    });
    if (response.ok) return { ok: true };
    if (response.status === 429) {
      return { ok: false, reason: "rate-limited", message: "Too many attempts just now — please try again in a minute." };
    }
    const body = (await response.json().catch(() => null)) as { errors?: { field?: string; message?: string }[] } | null;
    const emailError = body?.errors?.find((error) => error.field === "email");
    return {
      ok: false,
      reason: emailError ? "invalid" : "rejected",
      message: emailError
        ? "Please enter a valid email address, like name@example.com."
        : "We couldn't sign you up just now. Please try again, or write to puro@sanisa.co.in.",
    };
  } catch {
    return { ok: false, reason: "network", message: "You seem to be offline. Please check your connection and try again." };
  }
}
