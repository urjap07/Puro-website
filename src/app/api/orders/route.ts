import { NextResponse } from "next/server";
import { placeOrder } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/orders — places an order (Cash on Delivery). Everything is
 * re-checked on the server; returns the order number and the private token
 * for its confirmation page.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errors: { form: "Invalid request." } }, { status: 400 });
  }
  try {
    const result = await placeOrder(body);
    if (result.ok) return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({ ok: false, errors: result.errors }, { status: result.status, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Placing order failed:", error);
    return NextResponse.json(
      { ok: false, errors: { form: "We couldn't place your order just now. Nothing has been charged — please try again." } },
      { status: 500 },
    );
  }
}
