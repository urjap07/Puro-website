import { randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import pool from "@/lib/db";
import { hasDatabase } from "@/lib/data-source";
import { CheckoutRequest, prepareCheckout } from "@/lib/checkout";
import { MAX_LINE_QUANTITY } from "@/lib/cart-pricing";
import { DELIVERY_ZONES, type ZoneId } from "@/lib/delivery-rules";
import { ORDERS_ENABLED } from "@/lib/orders-config";

/**
 * Placing an order (server only).
 *
 * Every check from the delivery stage runs again (address, India Post,
 * prices, stock), then — inside one database transaction — the stock rows
 * are locked, the order and its items are saved, and stock is reduced.
 * Payment is Cash on Delivery for now; online payment arrives in Release 2.
 */

export const PlaceOrderRequest = CheckoutRequest.extend({
  paymentMethod: z.literal("cod"),
  /** The browser's id for this attempt, so a retry can't create a second order. */
  requestId: z.string().trim().min(8).max(64),
  /** The total the shopper saw when they pressed "Place order". */
  expectedTotal: z.number().nonnegative(),
});
export type PlaceOrderBody = z.input<typeof PlaceOrderRequest>;

export interface PlacedOrderItem {
  name: string;
  variantName: string;
  slug: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface PlacedOrder {
  number: string;
  token: string;
  placedAt: string;
  status: string;
  paymentMethod: "cod";
  paymentStatus: string;
  email: string;
  name: string;
  phone: string;
  address: { label: string; fullName: string; phone: string; line1: string; landmark?: string; city: string; state: string; pincode: string };
  zone: { id: ZoneId; label: string; min: number; max: number };
  giftMessage: string | null;
  instructions: string | null;
  items: PlacedOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export type PlaceOrderResult =
  | { ok: true; order: PlacedOrder }
  | { ok: false; status: number; errors: Record<string, string> };

/* ---------------- Order numbers ---------------- */

// No 0/O or 1/I, so numbers are easy to read out over the phone.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/** e.g. PURO-261117-7K3Q: the date (IST) plus four random characters. */
function newOrderNumber(now = new Date()) {
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const date = ist.toISOString().slice(2, 10).replace(/-/g, "");
  let suffix = "";
  for (let i = 0; i < 4; i++) suffix += ALPHABET[randomInt(ALPHABET.length)];
  return `PURO-${date}-${suffix}`;
}

export const ORDER_NUMBER_PATTERN = /^PURO-\d{6}-[2-9A-HJ-NP-Z]{4}$/;

/* ---------------- Place ---------------- */

interface LockedVariant extends RowDataPacket {
  id: number;
  product_id: number;
  slug: string;
  name: string;
  variant_name: string;
  price: string;
  stock_quantity: number;
  is_active: number;
  product_active: number;
}

const round = (value: number) => Math.round(value * 100) / 100;

export async function placeOrder(body: unknown): Promise<PlaceOrderResult> {
  // Ordering opens with the payment gateway (lib/orders-config.ts).
  if (!ORDERS_ENABLED) {
    return { ok: false, status: 503, errors: { form: "Online ordering opens soon. Your order hasn't been placed and you haven't been charged." } };
  }
  if (!hasDatabase()) {
    return { ok: false, status: 503, errors: { form: "Ordering isn't available on this version of the site yet." } };
  }
  const parsed = PlaceOrderRequest.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[issue.path.slice(0, 2).join(".") || "form"] ??= issue.message;
    return { ok: false, status: 400, errors };
  }
  const request = parsed.data;

  // Already placed (a retry or double-click)? Return the same order.
  const existing = await findByRequestId(request.requestId);
  if (existing) return { ok: true, order: existing };

  // Every delivery-stage check, again, on the server.
  const prepared = await prepareCheckout(request);
  if (!prepared.ok) return { ok: false, status: 422, errors: prepared.errors };
  const reduced = prepared.quote.lines.filter((line) => line.status === "reduced");
  if (reduced.length) {
    return {
      ok: false,
      status: 409,
      errors: { items: `Only a few of ${reduced.map((line) => line.name).join(", ")} are left — your bag has been updated, please review it.` },
    };
  }
  const deliveryFee = prepared.delivery.fee;
  const quotedTotal = round(prepared.quote.subtotal + deliveryFee);
  if (Math.abs(quotedTotal - request.expectedTotal) >= 0.01) {
    return {
      ok: false,
      status: 409,
      errors: { total: `Your total has changed to ₹${quotedTotal.toLocaleString("en-IN")} — please check your order and place it again.` },
    };
  }

  // Quantities as the server's price check settled them (capped per item, never more than in stock).
  const wanted = new Map<number, number>();
  for (const line of prepared.quote.lines) if (line.quantity > 0) wanted.set(line.variantId, line.quantity);
  const capped = request.items.some((item) => item.quantity > (wanted.get(item.variantId) ?? 0));
  if (capped) {
    return { ok: false, status: 409, errors: { items: `You can order up to ${MAX_LINE_QUANTITY} of each item — please review your bag.` } };
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Lock the stock rows so two shoppers can't buy the last item at once.
    const [rows] = await connection.query<LockedVariant[]>(
      `SELECT v.id, v.product_id, p.slug, p.name, v.variant_name, v.price, v.stock_quantity, v.is_active, p.is_active AS product_active
         FROM product_variants v JOIN products p ON p.id = v.product_id
        WHERE v.id IN (?) FOR UPDATE`,
      [[...wanted.keys()]],
    );
    const byId = new Map(rows.map((row) => [row.id, row]));
    const items: (PlacedOrderItem & { variantId: number; productId: number })[] = [];
    for (const [variantId, quantity] of wanted) {
      const row = byId.get(variantId);
      if (!row || !row.is_active || !row.product_active) {
        await connection.rollback();
        return { ok: false, status: 409, errors: { items: "Something in your bag is no longer available — please review your bag." } };
      }
      if (row.stock_quantity < quantity) {
        await connection.rollback();
        return { ok: false, status: 409, errors: { items: `${row.name} just sold out — please review your bag.` } };
      }
      const unitPrice = Number(row.price);
      items.push({ variantId, productId: row.product_id, name: row.name, variantName: row.variant_name, slug: row.slug, quantity, unitPrice, lineTotal: round(unitPrice * quantity) });
    }
    const subtotal = round(items.reduce((sum, item) => sum + item.lineTotal, 0));
    const total = round(subtotal + deliveryFee);
    if (Math.abs(total - request.expectedTotal) >= 0.01) {
      await connection.rollback();
      return { ok: false, status: 409, errors: { total: `Your total has changed to ₹${total.toLocaleString("en-IN")} — please check your order and place it again.` } };
    }

    const zone = prepared.delivery.zone;
    const token = randomBytes(16).toString("hex");
    const giftMessage = request.gift?.enabled ? request.gift.message?.trim() || "" : null;
    const instructions = request.instructions?.trim() || null;
    const { address, contact } = request;

    const orderId = await insertOrder(connection, {
      subtotal,
      deliveryFee,
      total,
      email: contact.email,
      name: address.fullName,
      phone: address.phone,
      address,
      zoneId: zone.id,
      giftMessage,
      instructions,
      token,
      requestId: request.requestId,
    });

    await connection.query(
      `INSERT INTO order_items (order_id, product_id, variant_id, product_name, product_slug, variant_name, unit_price, quantity, total_price) VALUES ?`,
      [items.map((item) => [orderId.id, item.productId, item.variantId, item.name, item.slug, item.variantName, item.unitPrice, item.quantity, item.lineTotal])],
    );
    for (const item of items) {
      await connection.query("UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE id = ?", [item.quantity, item.variantId]);
    }
    await connection.commit();

    return {
      ok: true,
      order: {
        number: orderId.number,
        token,
        placedAt: new Date().toISOString(),
        status: "pending",
        paymentMethod: "cod",
        paymentStatus: "unpaid",
        email: contact.email,
        name: address.fullName,
        phone: address.phone,
        address,
        zone: { id: zone.id, label: zone.label, min: zone.min, max: zone.max },
        giftMessage,
        instructions,
        items: items.map(({ name, variantName, slug, quantity, unitPrice, lineTotal }) => ({ name, variantName, slug, quantity, unitPrice, lineTotal })),
        subtotal,
        deliveryFee,
        total,
      },
    };
  } catch (error) {
    await connection.rollback().catch(() => {});
    // Two tabs placing the same attempt at once: the other one won, so return its order.
    if (isDuplicate(error, "request_id")) {
      const order = await findByRequestId(request.requestId);
      if (order) return { ok: true, order };
    }
    throw error;
  } finally {
    connection.release();
  }
}

function isDuplicate(error: unknown, key: string) {
  const sqlError = error as { code?: string; sqlMessage?: string };
  return sqlError?.code === "ER_DUP_ENTRY" && Boolean(sqlError.sqlMessage?.includes(key));
}

async function insertOrder(
  connection: PoolConnection,
  values: {
    subtotal: number;
    deliveryFee: number;
    total: number;
    email: string;
    name: string;
    phone: string;
    address: PlacedOrder["address"];
    zoneId: ZoneId;
    giftMessage: string | null;
    instructions: string | null;
    token: string;
    requestId: string;
  },
): Promise<{ id: number; number: string }> {
  // The random part makes a clash very unlikely; if one happens, try a new number.
  for (let attempt = 0; attempt < 5; attempt++) {
    const number = newOrderNumber();
    try {
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO orders
           (order_number, guest_email, guest_name, guest_phone, status, payment_method, payment_status,
            subtotal, shipping_fee, total_amount, shipping_address, delivery_zone, gift_message,
            delivery_instructions, access_token, request_id)
         VALUES (?, ?, ?, ?, 'pending', 'cod', 'unpaid', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          number,
          values.email,
          values.name,
          values.phone,
          values.subtotal,
          values.deliveryFee,
          values.total,
          JSON.stringify(values.address),
          values.zoneId,
          values.giftMessage,
          values.instructions,
          values.token,
          values.requestId,
        ],
      );
      return { id: result.insertId, number };
    } catch (error) {
      if (isDuplicate(error, "order_number")) continue;
      throw error;
    }
  }
  throw new Error("Couldn't generate a unique order number.");
}

/* ---------------- Read ---------------- */

interface OrderRow extends RowDataPacket {
  id: number;
  order_number: string;
  guest_email: string;
  guest_name: string | null;
  guest_phone: string | null;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: string;
  shipping_fee: string;
  total_amount: string;
  shipping_address: PlacedOrder["address"] | string;
  delivery_zone: ZoneId | null;
  gift_message: string | null;
  delivery_instructions: string | null;
  access_token: string | null;
  created_at: Date;
}

interface ItemRow extends RowDataPacket {
  product_name: string;
  product_slug: string | null;
  variant_name: string;
  unit_price: string;
  quantity: number;
  total_price: string;
}

async function hydrate(row: OrderRow): Promise<PlacedOrder> {
  const [items] = await pool.query<ItemRow[]>(
    "SELECT product_name, product_slug, variant_name, unit_price, quantity, total_price FROM order_items WHERE order_id = ? ORDER BY id",
    [row.id],
  );
  const address = typeof row.shipping_address === "string" ? JSON.parse(row.shipping_address) : row.shipping_address;
  const zone = DELIVERY_ZONES[row.delivery_zone ?? "india"];
  return {
    number: row.order_number,
    token: row.access_token ?? "",
    placedAt: new Date(row.created_at).toISOString(),
    status: row.status,
    paymentMethod: "cod",
    paymentStatus: row.payment_status,
    email: row.guest_email,
    name: row.guest_name ?? address.fullName,
    phone: row.guest_phone ?? address.phone,
    address,
    zone: { id: zone.id, label: zone.label, min: zone.min, max: zone.max },
    giftMessage: row.gift_message,
    instructions: row.delivery_instructions,
    items: items.map((item) => ({
      name: item.product_name,
      variantName: item.variant_name,
      slug: item.product_slug,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      lineTotal: Number(item.total_price),
    })),
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.shipping_fee),
    total: Number(row.total_amount),
  };
}

async function findByRequestId(requestId: string): Promise<PlacedOrder | null> {
  const [rows] = await pool.query<OrderRow[]>("SELECT * FROM orders WHERE request_id = ? LIMIT 1", [requestId]);
  return rows[0] ? hydrate(rows[0]) : null;
}

/** An order, for its confirmation page — only with the private token from the link. */
export async function getOrder(number: string, token: string | null): Promise<PlacedOrder | null> {
  if (!hasDatabase() || !token || !ORDER_NUMBER_PATTERN.test(number) || !/^[0-9a-f]{32}$/.test(token)) return null;
  const [rows] = await pool.query<OrderRow[]>("SELECT * FROM orders WHERE order_number = ? LIMIT 1", [number]);
  const row = rows[0];
  if (!row?.access_token) return null;
  const same = timingSafeEqual(Buffer.from(row.access_token), Buffer.from(token));
  return same ? hydrate(row) : null;
}
