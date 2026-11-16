import { NextResponse } from "next/server";
import { prepareCheckout } from "@/lib/checkout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/checkout/prepare — validates the address-and-delivery stage of
 * checkout on the server (contact, address, pincode with India Post, stock
 * and prices) and returns the delivery zone and confirmed totals.
 * No order is created and nothing is charged: payment opens in Release 2.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errors: { form: "Invalid request." } }, { status: 400 });
  }
  try {
    const result = await prepareCheckout(body);
    return NextResponse.json(result, { status: result.ok ? 200 : 422, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Checkout prepare failed:", error);
    return NextResponse.json({ ok: false, errors: { form: "We couldn't check your order just now. Please try again." } }, { status: 500 });
  }
}
