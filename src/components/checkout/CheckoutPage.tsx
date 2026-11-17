"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import {
  AlertCircle,
  Banknote,
  Check,
  ChevronRight,
  CreditCard,
  Gift,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Plus,
  ShoppingBag,
  Truck,
} from "lucide-react";
import type { Address } from "@/lib/account-schema";
import { defaultAddress, orderHref, useAccount } from "@/lib/account-store";
import type { PlacedOrder } from "@/lib/orders";
import { notifyTeamOfOrder } from "@/lib/order-notify";
import { useCart } from "@/lib/cart-store";
import { useCheckout, type CheckoutStep } from "@/lib/checkout-store";
import type { CheckoutResult } from "@/lib/checkout";
import { ContactSchema } from "@/lib/checkout-contact";
import { deliveryWindow, useDestination } from "@/lib/delivery";
import { cutoutFor } from "@/lib/cutouts";
import { formatPrice } from "@/lib/format";
import { BagNotices, PriceCheckStatus, useBagTotals } from "@/components/cart/BagCheck";
import { useCartQuote } from "@/lib/cart-quote";
import { WELL_SHADOW, wellTint } from "@/components/cart/wellTint";
import AddressForm, { FieldError, field, labelText } from "@/components/account/AddressForm";

const EASE = [0.22, 1, 0.36, 1] as const;
const ORDER: CheckoutStep[] = ["contact", "address", "delivery", "payment"];

/* ------------------------------------------------------------------ */

function StepPanel({
  number,
  title,
  icon: Icon,
  step,
  current,
  summary,
  onEdit,
  children,
}: {
  number: number;
  title: string;
  icon: typeof Mail;
  step: CheckoutStep;
  current: CheckoutStep;
  summary?: React.ReactNode;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  const state = step === current ? "active" : ORDER.indexOf(step) < ORDER.indexOf(current) ? "done" : "upcoming";
  return (
    <section
      aria-labelledby={`step-${step}`}
      aria-current={state === "active" ? "step" : undefined}
      className={clsx("rounded-[30px] p-5 transition sm:p-7", state === "active" ? "glass-strong" : "glass", state === "upcoming" && "opacity-60")}
    >
      <div className="relative z-[2] flex items-center gap-4">
        <span
          className={clsx(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold",
            state === "done"
              ? "bg-[linear-gradient(135deg,#f6e3c8,#efc3c8_50%,#d6c8ee)] text-midnight-deep"
              : state === "active"
                ? "bg-midnight text-ivory"
                : "bg-white/60 text-stone",
          )}
        >
          {state === "done" ? <Check size={17} strokeWidth={2} /> : number}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={`step-${step}`} className="flex items-center gap-2 font-display text-[24px] leading-tight text-midnight sm:text-[28px]">
            <Icon size={18} strokeWidth={1.5} className="text-stone" /> {title}
          </h2>
          {state === "done" && summary && <div className="mt-1 truncate text-[14px] text-stone">{summary}</div>}
        </div>
        {state === "done" && onEdit && (
          <button type="button" onClick={onEdit} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#5E4B8A] hover:bg-white/60">
            <Pencil size={13} strokeWidth={1.6} /> Change
          </button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {state === "active" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="relative z-[2] overflow-hidden"
          >
            <div className="pt-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function AddressLines({ address }: { address: Address }) {
  return (
    <>
      <strong className="font-semibold text-midnight">{address.fullName}</strong>, {address.line1}
      {address.landmark ? `, near ${address.landmark}` : ""}, {address.city}, {address.state} {address.pincode} · +91 {address.phone}
    </>
  );
}

/* ------------------------------------------------------------------ */

function OrderSummary({ prepared }: { prepared: Extract<CheckoutResult, { ok: true }> | null }) {
  const items = useCart((state) => state.items);
  const quote = useCartQuote((state) => state.quote);
  const { subtotal, count } = useBagTotals(items);
  const lineOf = (variantId: number) => quote?.lines.find((line) => line.variantId === variantId);

  const delivery = prepared?.delivery;
  const total = subtotal + (delivery?.fee ?? 0);

  return (
    <aside aria-label="Order summary" className="glass-strong rounded-[30px] p-5 sm:p-6 lg:sticky lg:top-[100px]">
      <div className="relative z-[2] flex items-center justify-between">
        <h2 className="font-display text-[26px] text-midnight">Your order</h2>
        <Link href="/cart" className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#5E4B8A] underline-offset-4 hover:underline">
          Edit bag
        </Link>
      </div>
      <ul className="relative z-[2] mt-4 max-h-[320px] space-y-3 overflow-y-auto pr-1" data-lenis-prevent>
        {items.map((item) => {
          const line = lineOf(item.variantId);
          const cutout = cutoutFor(item.slug);
          const soldOut = line?.status === "sold_out";
          return (
            <li key={item.variantId} className={clsx("flex items-center gap-3", soldOut && "opacity-55")}>
              <span className={clsx("relative h-16 w-14 shrink-0 overflow-hidden rounded-[14px]", wellTint(item.slug), WELL_SHADOW)}>
                {cutout ? (
                  <Image src={cutout} alt="" fill sizes="56px" className="object-contain p-1.5" />
                ) : (
                  item.image && <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
                )}
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-midnight px-1 text-[10px] font-semibold text-ivory">
                  {item.quantity}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-[18px] leading-tight text-midnight">{item.name}</span>
                <span className="block text-[12px] text-stone">{soldOut ? "Sold out — not included" : item.variantName}</span>
              </span>
              <span className="text-[14px] font-medium tabular-nums text-graphite">{formatPrice((line?.price ?? item.price) * item.quantity)}</span>
            </li>
          );
        })}
      </ul>

      <dl className="relative z-[2] mt-5 space-y-2 border-t border-midnight/10 pt-4 text-[14px] text-stone">
        <div className="flex justify-between">
          <dt>Items ({count})</dt>
          <dd className="tabular-nums text-ink">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Delivery</dt>
          <dd className="text-ink">
            {!delivery ? "Calculated at the next step" : delivery.fee === 0 ? <span className="font-semibold text-[#45633D]">FREE</span> : formatPrice(delivery.fee)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-midnight/10 pt-3">
          <dt className="text-[12px] font-semibold uppercase tracking-[0.2em]">{delivery ? "Total" : "Total before delivery"}</dt>
          <dd className="font-display text-[30px] leading-none text-midnight">{formatPrice(total)}</dd>
        </div>
      </dl>
      <PriceCheckStatus className="relative z-[2] mt-2 justify-end" />
      {delivery && !delivery.freeDelivery && (
        <p className="relative z-[2] mt-3 rounded-[16px] bg-white/55 px-3.5 py-2.5 text-[13px] text-graphite">
          Add {formatPrice(delivery.remainingForFreeDelivery)} more for free delivery.
        </p>
      )}
    </aside>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Checkout: contact → address → delivery → payment, each checked on the
 * server. Orders are placed with Cash on Delivery (lib/orders.ts); online
 * payment (Razorpay: UPI, cards, net banking) opens in Release 2.
 */
export default function CheckoutPage() {
  const [ready, setReady] = useState(false);
  const items = useCart((state) => state.items);
  const profile = useAccount((state) => state.profile);
  const saveProfile = useAccount((state) => state.saveProfile);
  const addresses = useAccount((state) => state.addresses);
  const setDestination = useDestination((state) => state.setDestination);
  const checkout = useCheckout();
  const { step, setStep, update } = checkout;
  const refreshQuote = useCartQuote((state) => state.refresh);

  const [emailDraft, setEmailDraft] = useState("");
  const [remember, setRemember] = useState(true);
  const [contactError, setContactError] = useState<string | undefined>();
  const [adding, setAdding] = useState(false);
  const [prepared, setPrepared] = useState<Extract<CheckoutResult, { ok: true }> | null>(null);
  const [checking, setChecking] = useState(false);
  const [problems, setProblems] = useState<Record<string, string> | null>(null);
  const [placing, setPlacing] = useState(false);
  const [placedNumber, setPlacedNumber] = useState<string | null>(null);
  const router = useRouter();
  const clearBag = useCart((state) => state.clear);
  const addOrder = useAccount((state) => state.addOrder);
  // One id per attempt: pressing "Place order" twice, or retrying after a
  // network blip, can't create two orders.
  const attempt = useRef<string | null>(null);

  useEffect(() => {
    useAccount.persist.rehydrate();
    useCheckout.persist.rehydrate();
    setReady(true);
    refreshQuote();
  }, [refreshQuote]);

  // Pre-fill the email, and pick the default address, once everything has loaded.
  useEffect(() => {
    if (!ready) return;
    setEmailDraft((current) => current || checkout.email || profile.email);
    if (!checkout.addressId || !addresses.some((address) => address.id === checkout.addressId)) {
      const fallback = defaultAddress(addresses);
      if (fallback) update({ addressId: fallback.id });
    }
  }, [ready, profile.email, addresses, checkout.addressId, checkout.email, update]);

  const address = addresses.find((item) => item.id === checkout.addressId) ?? null;
  const bagKey = useMemo(() => JSON.stringify(items.map((item) => [item.variantId, item.quantity])), [items]);

  // The delivery stage is always confirmed by the server, and re-confirmed if the bag changes.
  useEffect(() => {
    if (!ready || (step !== "delivery" && step !== "payment") || !address || !checkout.email) return;
    let live = true;
    setChecking(true);
    setProblems(null);
    fetch("/api/checkout/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: (JSON.parse(bagKey) as [number, number][]).map(([variantId, quantity]) => ({ variantId, quantity })),
        contact: { email: checkout.email },
        address: { label: address.label, fullName: address.fullName, phone: address.phone, line1: address.line1, landmark: address.landmark ?? "", city: address.city, state: address.state, pincode: address.pincode },
        gift: { enabled: checkout.giftEnabled, message: checkout.giftMessage },
        instructions: checkout.instructions,
      }),
    })
      .then((response) => response.json() as Promise<CheckoutResult>)
      .then((result) => {
        if (!live) return;
        if (result.ok) {
          setPrepared(result);
        } else {
          setPrepared(null);
          setProblems(result.errors);
          // Send the shopper back to the step that needs fixing.
          if (Object.keys(result.errors).some((key) => key.startsWith("address"))) setStep("address");
          else if (Object.keys(result.errors).some((key) => key.startsWith("contact"))) setStep("contact");
        }
      })
      .catch(() => live && setProblems({ form: "We couldn't check your order just now. Please try again." }))
      .finally(() => live && setChecking(false));
    return () => {
      live = false;
    };
    // Gift and instructions don't change the delivery result, so they don't trigger a re-check.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, step, address?.id, checkout.email, bagKey]);

  if (!ready) return <div className="min-h-[60vh]" />;

  // Just placed: the bag is now empty while the confirmation page opens.
  if (placedNumber) {
    return (
      <div className="container-site flex min-h-[60vh] items-center justify-center py-16">
        <p role="status" className="flex items-center gap-3 font-display text-[26px] text-midnight">
          <Loader2 size={22} className="animate-spin text-[#5E4B8A]" /> Order {placedNumber} placed — opening it…
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-site py-16">
        <div className="glass-strong mx-auto flex max-w-[560px] flex-col items-center rounded-[32px] px-6 py-16 text-center">
          <span className="glass tint-quartz flex h-20 w-20 items-center justify-center rounded-full">
            <ShoppingBag size={30} strokeWidth={1} className="relative z-[2] text-quartz-deep" />
          </span>
          <h1 className="mt-6 font-display text-[36px] leading-tight text-midnight">Your bag is empty</h1>
          <p className="mt-2 text-[15px] leading-7 text-stone">Add a ritual or two, then come back to check out.</p>
          <Link href="/shop" className="btn-primary mt-7 px-9">
            Browse the shelves
          </Link>
        </div>
      </div>
    );
  }

  const continueContact = (event: React.FormEvent) => {
    event.preventDefault();
    const result = ContactSchema.safeParse({ email: emailDraft });
    if (!result.success) {
      setContactError(result.error.issues[0]?.message);
      return;
    }
    setContactError(undefined);
    update({ email: result.data.email });
    if (remember) saveProfile({ ...profile, email: result.data.email });
    setStep("address");
  };

  const continueAddress = () => {
    if (!address) return;
    setDestination({ country: "IN", pincode: address.pincode, district: address.city, state: address.state });
    setStep("delivery");
  };

  const zone = prepared?.delivery.zone;
  const problemList = problems ? Object.entries(problems) : [];
  const orderTotal = prepared ? Math.round((prepared.quote.subtotal + prepared.delivery.fee) * 100) / 100 : null;

  const placeOrder = async () => {
    if (!prepared || !address || orderTotal === null || placing) return;
    setPlacing(true);
    setProblems(null);
    attempt.current ??= globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
          contact: { email: checkout.email },
          address: { label: address.label, fullName: address.fullName, phone: address.phone, line1: address.line1, landmark: address.landmark ?? "", city: address.city, state: address.state, pincode: address.pincode },
          gift: { enabled: checkout.giftEnabled, message: checkout.giftMessage },
          instructions: checkout.instructions,
          paymentMethod: "cod",
          requestId: attempt.current,
          expectedTotal: orderTotal,
        }),
      });
      const result = (await response.json()) as { ok: true; order: PlacedOrder } | { ok: false; errors: Record<string, string> };
      if (!result.ok) {
        setProblems(result.errors);
        // Totals or stock changed: start a fresh attempt once the shopper has reviewed.
        attempt.current = null;
        refreshQuote();
        setPlacing(false);
        return;
      }
      const { order } = result;
      const first = order.items[0];
      const more = order.items.reduce((sum, item) => sum + item.quantity, 0) - (first?.quantity ?? 0);
      addOrder({
        number: order.number,
        token: order.token,
        placedAt: order.placedAt,
        total: order.total,
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        summary: first ? `${first.name}${more > 0 ? ` + ${more} more` : ""}` : "",
        paymentMethod: "cod",
      });
      notifyTeamOfOrder(order, window.location.origin);
      setPlacedNumber(order.number);
      router.push(orderHref(order));
      clearBag();
      checkout.reset();
    } catch {
      setProblems({ form: "We couldn't reach our server to place your order. Please check your connection and try again — you won't be charged twice." });
      setPlacing(false);
    }
  };

  return (
    <div className="pb-24">
      <div className="container-site pt-8 sm:pt-12">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-stone">
          <Link href="/cart" className="underline-offset-4 hover:text-midnight hover:underline">
            Bag
          </Link>
          <ChevronRight size={13} strokeWidth={1.4} />
          <span className="text-ink">Checkout</span>
        </nav>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-[44px] font-light leading-none text-midnight sm:text-[60px]">
            Checkout<em className="text-iris pl-3 pr-1">securely</em>
          </h1>
          <p className="flex items-center gap-2 text-[13px] text-stone">
            <Lock size={14} strokeWidth={1.6} /> Prices and stock are checked again when you place your order
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px] xl:gap-8">
          <div className="order-last space-y-4 lg:order-first">
            {problemList.length > 0 && (
              <div role="alert" className="glass tint-quartz flex items-start gap-3 rounded-[22px] p-4 text-[14px] text-[#6b2f3c]">
                <AlertCircle size={17} strokeWidth={1.8} className="relative z-[2] mt-0.5 shrink-0" />
                <ul className="relative z-[2] space-y-1">
                  {problemList.map(([key, message]) => (
                    <li key={key}>{message}</li>
                  ))}
                </ul>
              </div>
            )}
            <BagNotices />

            {/* 1 · Contact */}
            <StepPanel number={1} title="Contact" icon={Mail} step="contact" current={step} summary={checkout.email} onEdit={() => setStep("contact")}>
              <form onSubmit={continueContact} noValidate>
                <div>
                  <label className="block">
                    <span className={labelText}>Email for order updates</span>
                    <input
                      type="email"
                      value={emailDraft}
                      onChange={(event) => setEmailDraft(event.target.value)}
                      autoComplete="email"
                      placeholder="you@example.com"
                      aria-invalid={Boolean(contactError)}
                      aria-describedby={contactError ? "checkout-email-error" : undefined}
                      className={field}
                    />
                  </label>
                  <FieldError id="checkout-email-error" message={contactError} />
                </div>
                <label className="mt-4 flex items-center gap-3 text-[14px] text-graphite">
                  <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 accent-[#5E4B8A]" />
                  Remember my email on this device
                </label>
                <button type="submit" className="btn-primary mt-6 !px-9 !py-3.5">
                  Continue to delivery address
                </button>
              </form>
            </StepPanel>

            {/* 2 · Address */}
            <StepPanel
              number={2}
              title="Delivery address"
              icon={MapPin}
              step="address"
              current={step}
              summary={address && <AddressLines address={address} />}
              onEdit={() => setStep("address")}
            >
              {addresses.length > 0 && !adding && (
                <div role="radiogroup" aria-label="Saved addresses" className="grid gap-3 md:grid-cols-2">
                  {addresses.map((item) => {
                    const selected = item.id === checkout.addressId;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => update({ addressId: item.id })}
                        className={clsx(
                          "flex flex-col rounded-[22px] p-4 text-left text-[14px] leading-[1.6] transition",
                          selected
                            ? "bg-white/85 shadow-[0_14px_30px_-18px_rgba(94,75,138,0.6)] ring-2 ring-[#5E4B8A]"
                            : "bg-white/50 ring-1 ring-inset ring-white/80 hover:bg-white/70",
                        )}
                      >
                        <span className="flex items-center justify-between">
                          <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-midnight">{item.label}</span>
                          <span className={clsx("flex h-5 w-5 items-center justify-center rounded-full border", selected ? "border-[#5E4B8A] bg-[#5E4B8A] text-ivory" : "border-graphite/30")}>
                            {selected && <Check size={12} strokeWidth={2.4} />}
                          </span>
                        </span>
                        <span className="mt-2 text-graphite">
                          <AddressLines address={item} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {adding || addresses.length === 0 ? (
                <AddressForm
                  onDone={(saved) => {
                    setAdding(false);
                    if (saved) update({ addressId: saved.id });
                  }}
                />
              ) : (
                <button type="button" onClick={() => setAdding(true)} className="mt-4 flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold text-[#5E4B8A] hover:bg-white/60">
                  <Plus size={15} strokeWidth={1.8} /> Deliver to a new address
                </button>
              )}

              {!adding && addresses.length > 0 && (
                <button type="button" disabled={!address} onClick={continueAddress} className="btn-primary mt-6 !px-9 !py-3.5 disabled:opacity-50">
                  Deliver here
                </button>
              )}
            </StepPanel>

            {/* 3 · Delivery */}
            <StepPanel
              number={3}
              title="Delivery"
              icon={Truck}
              step="delivery"
              current={step}
              summary={zone && `Standard · ${zone.label} · ${deliveryWindow(zone)}${checkout.giftEnabled ? " · Gift" : ""}`}
              onEdit={() => setStep("delivery")}
            >
              {checking && !prepared ? (
                <p className="flex items-center gap-2 text-[14px] text-stone">
                  <Loader2 size={16} className="animate-spin motion-reduce:animate-none" /> Checking your address, stock and prices…
                </p>
              ) : prepared && zone ? (
                <>
                  <div className="glass tint-aqua flex items-start gap-4 rounded-[22px] p-4 sm:p-5">
                    <span className="relative z-[2] flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/70 text-[#2C6468]">
                      <Truck size={19} strokeWidth={1.5} />
                    </span>
                    <div className="relative z-[2] flex-1">
                      <p className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-display text-[22px] text-midnight">Standard delivery</span>
                        <span className="text-[14px] font-semibold text-midnight">
                          {prepared.delivery.fee === 0 ? "FREE" : formatPrice(prepared.delivery.fee)}
                        </span>
                      </p>
                      <p className="mt-1 text-[14px] text-graphite">
                        Arrives <strong className="font-semibold">{deliveryWindow(zone)}</strong> · {zone.label}, {zone.min}–{zone.max} days
                      </p>
                      {address && <p className="mt-1 text-[13px] text-stone">To {address.city} {address.pincode}{prepared.delivery.pincodeVerified ? " · pincode confirmed with India Post" : ""}</p>}
                      {prepared.warnings.map((warning) => (
                        <p key={warning} className="mt-2 text-[13px] text-[#7A500C]">{warning}</p>
                      ))}
                    </div>
                  </div>

                  <label className="mt-5 flex items-center gap-3 text-[15px] text-graphite">
                    <input type="checkbox" checked={checkout.giftEnabled} onChange={(event) => update({ giftEnabled: event.target.checked })} className="h-4 w-4 accent-[#5E4B8A]" />
                    <Gift size={16} strokeWidth={1.5} className="text-quartz-deep" /> This is a gift — leave out prices and add a note
                  </label>
                  {checkout.giftEnabled && (
                    <label className="mt-3 block">
                      <span className={labelText}>Gift message</span>
                      <textarea
                        value={checkout.giftMessage}
                        onChange={(event) => update({ giftMessage: event.target.value.slice(0, 200) })}
                        rows={3}
                        placeholder="Happy birthday! A little ritual for you."
                        className={clsx(field, "h-auto py-3")}
                      />
                      <span className="mt-1 block text-right text-[12px] text-stone">{checkout.giftMessage.length}/200</span>
                    </label>
                  )}
                  <label className="mt-4 block">
                    <span className={labelText}>Delivery instructions (optional)</span>
                    <input
                      value={checkout.instructions}
                      onChange={(event) => update({ instructions: event.target.value.slice(0, 200) })}
                      placeholder="e.g. Leave with the security desk"
                      className={field}
                    />
                  </label>
                  <button type="button" onClick={() => setStep("payment")} className="btn-primary mt-6 !px-9 !py-3.5">
                    Continue to payment
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setStep("address")} className="btn-glass !px-8 !py-3">
                  Review your address
                </button>
              )}
            </StepPanel>

            {/* 4 · Payment */}
            <StepPanel number={4} title="Payment" icon={CreditCard} step="payment" current={step}>
              <div role="radiogroup" aria-label="Payment method" className="grid gap-3">
                <button
                  type="button"
                  role="radio"
                  aria-checked="true"
                  className="flex items-start gap-4 rounded-[22px] bg-white/85 p-4 text-left shadow-[0_14px_30px_-18px_rgba(94,75,138,0.6)] ring-2 ring-[#5E4B8A] sm:p-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f6e3c8,#efc3c8_50%,#d6c8ee)] text-midnight">
                    <Banknote size={19} strokeWidth={1.5} />
                  </span>
                  <span className="flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-display text-[22px] leading-tight text-midnight">Cash on delivery</span>
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#5E4B8A] bg-[#5E4B8A] text-ivory">
                        <Check size={12} strokeWidth={2.4} />
                      </span>
                    </span>
                    <span className="mt-1 block text-[14px] leading-[1.6] text-graphite">
                      Pay {orderTotal !== null ? <strong className="font-semibold">{formatPrice(orderTotal)}</strong> : "the total"} in cash or by UPI to the delivery partner when your order arrives.
                    </span>
                  </span>
                </button>
                <div aria-disabled="true" className="flex items-start gap-4 rounded-[22px] bg-white/40 p-4 opacity-70 ring-1 ring-inset ring-white/70 sm:p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/70 text-stone">
                    <Lock size={17} strokeWidth={1.6} />
                  </span>
                  <span>
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-[22px] leading-tight text-midnight">Pay online</span>
                      <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone">Coming soon</span>
                    </span>
                    <span className="mt-1 block text-[14px] text-stone">UPI, cards and net banking.</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={placeOrder}
                disabled={!prepared || checking || placing}
                className="btn-iris mt-6 h-12 w-full !gap-2 !py-0 !font-semibold disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:!px-10"
              >
                {placing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={1.8} />}
                {placing ? "Placing your order…" : `Place order${orderTotal !== null ? ` · ${formatPrice(orderTotal)}` : ""}`}
              </button>
              <p className="mt-3 text-[13px] leading-[1.6] text-stone">
                By placing your order you agree to pay {orderTotal !== null ? formatPrice(orderTotal) : "the total"} on delivery. You&rsquo;ll get an order number straight away.
              </p>
            </StepPanel>
          </div>

          <div className="lg:order-last">
            <OrderSummary prepared={prepared} />
          </div>
        </div>
      </div>
    </div>
  );
}
