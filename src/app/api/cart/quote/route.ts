import { NextResponse } from "next/server";
import { z } from "zod";
import { quoteCart } from "@/lib/cart-pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const QuoteRequest = z.object({
  items: z
    .array(
      z.object({
        variantId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(99),
        seenPrice: z.number().nonnegative().max(1_000_000).optional(),
      }),
    )
    .max(50),
});

/**
 * POST /api/cart/quote — recalculates the bag from the database.
 * Body: { items: [{ variantId, quantity, seenPrice? }] }
 * Replies with each line's current price, stock and buyable quantity, and
 * the totals. Prices sent by the browser are only used to say "this changed".
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON." }, { status: 400 });
  }

  const parsed = QuoteRequest.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid bag.", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const quote = await quoteCart(parsed.data.items);
    return NextResponse.json({ success: true, quote }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Cart quote failed:", error);
    return NextResponse.json({ success: false, message: "We couldn't check your bag just now." }, { status: 500 });
  }
}
