import type { PlacedOrder } from "@/lib/orders";

/**
 * Emails the team about a new order through Formspree, until there's an
 * admin area. Uses NEXT_PUBLIC_FORMSPREE_ORDERS_ID when set, otherwise the
 * contact or newsletter form (the subject line starts "New order").
 * Fire-and-forget: the order is already saved, so a failure here never
 * affects the customer.
 */
const FORM_ID =
  process.env.NEXT_PUBLIC_FORMSPREE_ORDERS_ID?.trim() ||
  process.env.NEXT_PUBLIC_FORMSPREE_CONTACT_ID?.trim() ||
  process.env.NEXT_PUBLIC_FORMSPREE_NEWSLETTER_ID?.trim() ||
  null;

const rupees = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export function notifyTeamOfOrder(order: PlacedOrder, origin: string) {
  if (!FORM_ID) return;
  const a = order.address;
  const lines = order.items.map((item) => `${item.quantity} × ${item.name} (${item.variantName}) — ${rupees(item.lineTotal)}`);
  const body = {
    order: order.number,
    _subject: `New order ${order.number} — ${rupees(order.total)} (Cash on delivery)`,
    _replyto: order.email,
    customer: `${order.name} · +91 ${order.phone} · ${order.email}`,
    deliver_to: [a.fullName, a.line1, a.landmark ? `Near ${a.landmark}` : "", `${a.city}, ${a.state} ${a.pincode}`, `+91 ${a.phone}`].filter(Boolean).join("\n"),
    items: lines.join("\n"),
    totals: `Items ${rupees(order.subtotal)} · Delivery ${order.deliveryFee ? rupees(order.deliveryFee) : "FREE"} · Total ${rupees(order.total)}`,
    payment: "Cash on delivery — collect on delivery",
    delivery: `${order.zone.label} (${order.zone.min}–${order.zone.max} days)`,
    gift_message: order.giftMessage ?? "—",
    instructions: order.instructions ?? "—",
    order_page: `${origin}/orders/${order.number}?t=${order.token}`,
  };
  fetch(`https://formspree.io/f/${encodeURIComponent(FORM_ID)}`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {
    // The order is saved; the team can still see it in the database.
  });
}
