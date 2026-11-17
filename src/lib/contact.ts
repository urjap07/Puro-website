import { z } from "zod";
import { CONTACT_TOPICS } from "@/lib/support";

/**
 * The contact form, sent to Formspree.
 *
 * Uses NEXT_PUBLIC_FORMSPREE_CONTACT_ID when set (a separate Formspree form
 * for messages); otherwise the newsletter form, with a "Contact:" subject so
 * messages are easy to tell apart from sign-ups.
 */
const FORM_ID =
  process.env.NEXT_PUBLIC_FORMSPREE_CONTACT_ID?.trim() || process.env.NEXT_PUBLIC_FORMSPREE_NEWSLETTER_ID?.trim() || null;

export const ContactSchema = z.object({
  name: z.string().trim().min(2, "Please tell us your name.").max(80, "That name is a little long."),
  email: z.string().trim().min(1, "Please enter your email address.").pipe(z.email("Please enter a valid email address, like name@example.com.")),
  phone: z
    .string()
    .trim()
    .max(20)
    .refine((value) => value === "" || /^[+\d][\d\s-]{6,}$/.test(value), "Please enter a valid phone number, or leave it blank."),
  topic: z.enum(CONTACT_TOPICS, { message: "Please choose what your message is about." }),
  order: z.string().trim().max(40),
  message: z.string().trim().min(10, "Please write a little more so we can help.").max(3000, "Please keep your message under 3,000 characters."),
});

export type ContactInput = z.input<typeof ContactSchema>;
export type ContactErrors = Partial<Record<keyof ContactInput, string>>;

export function validateContact(input: ContactInput): { ok: true; data: z.output<typeof ContactSchema> } | { ok: false; errors: ContactErrors } {
  const parsed = ContactSchema.safeParse(input);
  if (parsed.success) return { ok: true, data: parsed.data };
  const errors: ContactErrors = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof ContactInput;
    errors[key] ??= issue.message;
  }
  return { ok: false, errors };
}

export type SendResult = { ok: true } | { ok: false; message: string };

/** Sends a validated message to Formspree. Never throws. */
export async function sendContact(data: z.output<typeof ContactSchema>, honeypot: string): Promise<SendResult> {
  if (!FORM_ID) {
    return { ok: false, message: "Our contact form isn't switched on yet. Please email or call us using the details on this page." };
  }
  try {
    const response = await fetch(`https://formspree.io/f/${encodeURIComponent(FORM_ID)}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone || "—",
        topic: data.topic,
        order: data.order || "—",
        message: data.message,
        _subject: `Contact: ${data.topic} — ${data.name}`,
        _replyto: data.email,
        _gotcha: honeypot,
      }),
    });
    if (response.ok) return { ok: true };
    if (response.status === 429) return { ok: false, message: "Too many messages just now — please try again in a minute." };
    return { ok: false, message: "We couldn't send your message just now. Please try again, or email us directly." };
  } catch {
    return { ok: false, message: "You seem to be offline. Please check your connection and try again." };
  }
}
