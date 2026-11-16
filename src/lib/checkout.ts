import { z } from "zod";
import { AddressSchema } from "@/lib/account-schema";
import { ContactSchema } from "@/lib/checkout-contact";
import { type CartQuote, type QuoteRequestLine, quoteCart } from "@/lib/cart-pricing";
import { DELIVERY_ZONES, type DeliveryZone, pincodeLooksMaharashtra, pincodeProblem } from "@/lib/delivery-rules";
import { lookupIndiaPost } from "@/lib/pincode-lookup";

/**
 * The address-and-delivery stage of checkout, checked on the server.
 * Payment isn't enabled yet (Release 2), so this is as far as an order goes:
 * everything the shopper entered is validated, the pincode is confirmed with
 * India Post, and the bag is re-priced from the database.
 */


export const CheckoutRequest = z.object({
  items: z
    .array(
      z.object({
        variantId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(99),
        seenPrice: z.number().nonnegative().max(1_000_000).optional(),
      }),
    )
    .min(1, "Your bag is empty.")
    .max(50),
  contact: ContactSchema,
  address: AddressSchema,
  gift: z.object({ enabled: z.boolean(), message: z.string().trim().max(200, "Keep the gift message under 200 characters.").optional() }).optional(),
  instructions: z.string().trim().max(200, "Keep delivery instructions under 200 characters.").optional(),
});
export type CheckoutRequestBody = z.input<typeof CheckoutRequest>;

export interface CheckoutDelivery {
  zone: DeliveryZone;
  /** 0 when free; null when the charge is confirmed at payment. */
  fee: number | null;
  freeDelivery: boolean;
  remainingForFreeDelivery: number;
  /** Whether India Post confirmed the pincode (false when it couldn't be reached). */
  pincodeVerified: boolean;
}

export type CheckoutResult =
  | {
      ok: true;
      quote: CartQuote;
      delivery: CheckoutDelivery;
      /** Things to show but not block on. */
      warnings: string[];
    }
  | {
      ok: false;
      /** Field-level problems, keyed like the form ("address.pincode", "contact.email", "items"). */
      errors: Record<string, string>;
      quote?: CartQuote;
    };

export async function prepareCheckout(body: unknown): Promise<CheckoutResult> {
  const parsed = CheckoutRequest.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.slice(0, 2).join(".") || "form";
      errors[key] ??= issue.message;
    }
    return { ok: false, errors };
  }
  const { items, address } = parsed.data;
  const warnings: string[] = [];
  const errors: Record<string, string> = {};

  // Pincode: format, India Post, and that it belongs to the chosen state.
  let pincodeVerified = false;
  let inMaharashtra = pincodeLooksMaharashtra(address.pincode);
  const problem = pincodeProblem(address.pincode);
  if (problem) {
    errors["address.pincode"] = problem;
  } else {
    const lookup = await lookupIndiaPost(address.pincode);
    if (lookup.status === "not_found") {
      errors["address.pincode"] = "India Post doesn't recognise this pincode.";
    } else if (lookup.status === "ok") {
      pincodeVerified = true;
      inMaharashtra = lookup.state.toLowerCase() === "maharashtra";
      if (lookup.state.toLowerCase() !== address.state.toLowerCase()) {
        errors["address.state"] = `Pincode ${address.pincode} is in ${lookup.state}, not ${address.state}.`;
      }
    } else {
      warnings.push("We couldn't confirm your pincode with India Post just now; we'll check it again before dispatch.");
    }
  }

  // Bag: re-priced from the database; nothing sold out or unavailable may go through.
  const quote = await quoteCart(items as QuoteRequestLine[]);
  const blocked = quote.lines.filter((line) => line.status === "sold_out" || line.status === "unavailable");
  if (quote.count === 0) {
    errors.items = "Nothing in your bag can be ordered right now.";
  } else if (blocked.length) {
    errors.items = `${blocked.map((line) => line.name ?? "An item").join(", ")} ${blocked.length === 1 ? "is" : "are"} no longer available — please remove ${blocked.length === 1 ? "it" : "them"} from your bag.`;
  }
  if (quote.lines.some((line) => line.status === "price_changed" || line.status === "reduced")) {
    warnings.push("Some prices or quantities in your bag changed — your summary shows the current ones.");
  }

  if (Object.keys(errors).length) return { ok: false, errors, quote };

  const zone = inMaharashtra ? DELIVERY_ZONES.maharashtra : DELIVERY_ZONES.india;
  return {
    ok: true,
    quote,
    warnings,
    delivery: {
      zone,
      fee: quote.freeDelivery ? 0 : null,
      freeDelivery: quote.freeDelivery,
      remainingForFreeDelivery: quote.remainingForFreeDelivery,
      pincodeVerified,
    },
  };
}
