import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { Banknote, CheckCircle2, Gift, MapPin, MessageCircle, PackageCheck, Truck } from "lucide-react";
import { getActiveProducts } from "@/db/queries/products";
import { getOrder } from "@/lib/orders";
import { cutoutFor } from "@/lib/cutouts";
import { formatPrice } from "@/lib/format";
import { SITE } from "@/lib/site";
import CopyOrderNumber from "@/components/orders/CopyOrderNumber";

export const dynamic = "force-dynamic";

interface OrderPageProps {
  params: Promise<{ number: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const { number } = await params;
  return { title: `Order ${number}`, robots: { index: false, follow: false } };
}

const DATE = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
const PLACED = new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Kolkata" });

const STATUS: Record<string, string> = {
  pending: "Order placed",
  confirmed: "Confirmed",
  processing: "Being packed",
  shipped: "On its way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** An order's confirmation page; opens only with the private link (…?t=token). */
export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  const [{ number }, query] = await Promise.all([params, searchParams]);
  const token = typeof query.t === "string" ? query.t : null;
  const order = await getOrder(decodeURIComponent(number), token);

  if (!order) {
    return (
      <div className="container-site flex min-h-[60vh] items-center justify-center py-16">
        <div className="glass-strong w-full max-w-[560px] rounded-[32px] px-6 py-12 text-center sm:px-12">
          <h1 className="relative z-[2] font-display text-[38px] leading-tight text-midnight">We couldn&rsquo;t open this order</h1>
          <p className="relative z-[2] mx-auto mt-4 max-w-[420px] text-[15px] leading-[1.7] text-stone">
            Order pages open only from the link on this device&rsquo;s{" "}
            <Link href="/account#orders" className="font-semibold text-[#5E4B8A] underline-offset-4 hover:underline">
              Your orders
            </Link>{" "}
            list. If you need help with an order, write to us with your order number.
          </p>
          <Link href="/contact" className="btn-primary relative z-[2] mt-8 !px-8 !py-3.5">
            Contact us
          </Link>
        </div>
      </div>
    );
  }

  const placed = new Date(order.placedAt);
  const from = new Date(placed);
  from.setDate(from.getDate() + order.zone.min);
  const to = new Date(placed);
  to.setDate(to.getDate() + order.zone.max);
  const products = await getActiveProducts();
  const imageFor = (slug: string | null) => {
    const product = slug ? products.find((item) => item.slug === slug) : undefined;
    return { cutout: slug ? cutoutFor(slug) : null, image: product?.images[0]?.imageUrl ?? null };
  };
  const firstName = order.name.trim().split(/\s+/)[0];
  const cancelled = order.status === "cancelled";

  return (
    <div className="pb-24">
      <div className="container-site pt-8 sm:pt-12">
        {/* Thank-you */}
        <section className="glass-strong mx-auto max-w-[860px] rounded-[36px] px-6 py-10 text-center sm:px-12 sm:py-14">
          <span className="relative z-[2] mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f6e3c8,#efc3c8_50%,#d6c8ee)] text-midnight">
            <CheckCircle2 size={28} strokeWidth={1.5} />
          </span>
          <p className="relative z-[2] mt-5 text-[12px] font-semibold uppercase tracking-[0.24em] text-[#5E4B8A]">{STATUS[order.status] ?? "Order placed"}</p>
          <h1 className="relative z-[2] mt-3 font-display text-[40px] font-light leading-[1.05] text-midnight sm:text-[56px]">
            {cancelled ? (
              "This order was cancelled"
            ) : (
              <>
                Thank you, <em className="text-iris pr-1">{firstName}.</em>
              </>
            )}
          </h1>
          {!cancelled && (
            <p className="relative z-[2] mx-auto mt-4 max-w-[520px] text-[16px] leading-[1.7] text-stone">
              Your order is placed. We&rsquo;ll pack it with care and send updates to <strong className="font-medium text-midnight">{order.email}</strong>.
            </p>
          )}
          <div className="relative z-[2] mt-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-stone">Your order number</p>
            <div className="mt-3">
              <CopyOrderNumber number={order.number} />
            </div>
            <p className="mt-3 text-[13px] text-stone">Keep it handy — quote it if you contact us about this order. Placed {PLACED.format(placed)}.</p>
          </div>
        </section>

        <div className="mx-auto mt-6 grid max-w-[860px] gap-5 md:grid-cols-2">
          {/* Payment */}
          <section className="glass tint-saffron rounded-[28px] p-6">
            <h2 className="relative z-[2] flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#7A500C]">
              <Banknote size={16} strokeWidth={1.6} /> Payment
            </h2>
            <p className="relative z-[2] mt-3 font-display text-[26px] leading-tight text-midnight">Cash on delivery</p>
            <p className="relative z-[2] mt-1 text-[14px] leading-[1.6] text-graphite">
              Please keep <strong className="font-semibold">{formatPrice(order.total)}</strong> ready — pay in cash or by UPI to the delivery partner when your order arrives.
            </p>
          </section>
          {/* Delivery */}
          <section className="glass tint-aqua rounded-[28px] p-6">
            <h2 className="relative z-[2] flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#2C6468]">
              <Truck size={16} strokeWidth={1.6} /> Delivery
            </h2>
            <p className="relative z-[2] mt-3 font-display text-[26px] leading-tight text-midnight">
              {DATE.format(from)} – {DATE.format(to)}
            </p>
            <p className="relative z-[2] mt-1 text-[14px] text-graphite">
              Standard delivery · {order.zone.label}, {order.zone.min}–{order.zone.max} days
            </p>
          </section>
        </div>

        <div className="mx-auto mt-5 grid max-w-[860px] gap-5 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          {/* Items */}
          <section aria-labelledby="items-title" className="glass-strong rounded-[28px] p-6">
            <h2 id="items-title" className="relative z-[2] flex items-center gap-2.5 font-display text-[26px] text-midnight">
              <PackageCheck size={20} strokeWidth={1.4} className="text-stone" /> In your order
            </h2>
            <ul className="relative z-[2] mt-4 space-y-3">
              {order.items.map((item) => {
                const { cutout, image } = imageFor(item.slug);
                return (
                  <li key={`${item.slug}-${item.variantName}`} className="flex items-center gap-3">
                    <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-[14px] bg-white/70">
                      {cutout ? (
                        <Image src={cutout} alt="" fill sizes="56px" className="object-contain p-1.5" />
                      ) : (
                        image && <Image src={image} alt="" fill sizes="56px" className="object-cover" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      {item.slug ? (
                        <Link href={`/products/${item.slug}`} className="block truncate font-display text-[19px] leading-tight text-midnight underline-offset-4 hover:underline">
                          {item.name}
                        </Link>
                      ) : (
                        <span className="block truncate font-display text-[19px] leading-tight text-midnight">{item.name}</span>
                      )}
                      <span className="block text-[12px] text-stone">
                        {item.variantName} · {item.quantity} × {formatPrice(item.unitPrice)}
                      </span>
                    </span>
                    <span className="text-[14px] font-medium tabular-nums text-graphite">{formatPrice(item.lineTotal)}</span>
                  </li>
                );
              })}
            </ul>
            <dl className="relative z-[2] mt-5 space-y-2 border-t border-midnight/10 pt-4 text-[14px] text-stone">
              <div className="flex justify-between">
                <dt>Items</dt>
                <dd className="tabular-nums text-ink">{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Delivery</dt>
                <dd className={clsx("tabular-nums", order.deliveryFee ? "text-ink" : "font-semibold text-[#45633D]")}>{order.deliveryFee ? formatPrice(order.deliveryFee) : "FREE"}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-midnight/10 pt-3">
                <dt className="text-[12px] font-semibold uppercase tracking-[0.2em]">To pay on delivery</dt>
                <dd className="font-display text-[30px] leading-none text-midnight">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>

          <div className="flex flex-col gap-5">
            {/* Address */}
            <section className="glass rounded-[28px] p-6">
              <h2 className="relative z-[2] flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-midnight">
                <MapPin size={15} strokeWidth={1.6} /> Delivering to
              </h2>
              <address className="relative z-[2] mt-3 not-italic text-[14px] leading-[1.7] text-graphite">
                <strong className="font-semibold text-midnight">{order.address.fullName}</strong>
                <br />
                {order.address.line1}
                {order.address.landmark ? (
                  <>
                    <br />
                    Near {order.address.landmark}
                  </>
                ) : null}
                <br />
                {order.address.city}, {order.address.state} {order.address.pincode}
                <br />
                +91 {order.address.phone}
              </address>
              {order.instructions && <p className="relative z-[2] mt-3 text-[13px] text-stone">Instructions: {order.instructions}</p>}
            </section>
            {order.giftMessage !== null && (
              <section className="glass tint-quartz rounded-[28px] p-6">
                <h2 className="relative z-[2] flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8E4F5B]">
                  <Gift size={15} strokeWidth={1.6} /> Gift
                </h2>
                <p className="relative z-[2] mt-3 font-display text-[20px] italic leading-snug text-midnight">
                  {order.giftMessage ? `“${order.giftMessage}”` : "Packed as a gift, without prices."}
                </p>
              </section>
            )}
            {/* Help */}
            <section className="glass tint-lilac rounded-[28px] p-6">
              <h2 className="relative z-[2] font-display text-[22px] text-midnight">Need help with this order?</h2>
              <div className="relative z-[2] mt-4 flex flex-wrap gap-2">
                <Link href={`/contact?order=${encodeURIComponent(order.number)}`} className="btn-primary !px-6 !py-3 !text-[11px]">
                  Contact us
                </Link>
                <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="btn-glass !px-5 !py-3 !text-[11px]">
                  <MessageCircle size={14} strokeWidth={1.6} /> WhatsApp
                </a>
              </div>
            </section>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-[860px] flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn-glass !px-8 !py-3.5">
            Continue shopping
          </Link>
          <Link href="/account#orders" className="btn-glass !px-8 !py-3.5">
            Your orders
          </Link>
        </div>
      </div>
    </div>
  );
}
