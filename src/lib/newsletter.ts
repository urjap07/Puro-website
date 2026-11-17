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

export type SubscribeResult =
  | { ok: true }
  | { ok: false; reason: "not-configured" | "invalid" | "rate-limited" | "network" | "rejected"; message: string };

/** Sends a sign-up to Formspree. Never throws. */
export async function subscribe(email: string, details: { page: string; honeypot?: string }): Promise<SubscribeResult> {
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
