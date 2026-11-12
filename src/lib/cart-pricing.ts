import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";

/**
 * Server-side bag pricing. The browser keeps a copy of the bag for speed, but
 * prices, stock and totals are always recalculated here from the database —
 * the browser is never the source of truth for what something costs.
 */

/** Most of one item a single order can hold. */
export const MAX_LINE_QUANTITY = 10;
/** Orders at or above this subtotal (in rupees) ship free within India. */
export const FREE_DELIVERY_THRESHOLD = 500;

export interface QuoteRequestLine {
  variantId: number;
  quantity: number;
  /** The price the shopper last saw, to tell them if it changed. */
  seenPrice?: number;
}

export type LineStatus =
  | "ok"
  /** Price is different from what the shopper last saw. */
  | "price_changed"
  /** Fewer in stock than requested; quantity was lowered. */
  | "reduced"
  /** None left in stock. */
  | "sold_out"
  /** No longer sold (removed or deactivated). */
  | "unavailable";

export interface QuoteLine {
  variantId: number;
  productId: number | null;
  slug: string | null;
  name: string | null;
  variantName: string | null;
  image: string | null;
  /** Current price per item, from the database. */
  price: number;
  compareAtPrice: number | null;
  stock: number;
  requested: number;
  /** Quantity that can actually be bought (0 when sold out or unavailable). */
  quantity: number;
  lineTotal: number;
  status: LineStatus;
  /** Set when status is "price_changed". */
  previousPrice?: number;
}

export interface CartQuote {
  lines: QuoteLine[];
  /** Items that can be bought right now. */
  count: number;
  subtotal: number;
  freeDelivery: boolean;
  remainingForFreeDelivery: number;
  /** True when any line needs the shopper's attention. */
  hasChanges: boolean;
  checkedAt: string;
}

interface VariantRow extends RowDataPacket {
  variant_id: number;
  product_id: number;
  slug: string;
  name: string;
  variant_name: string;
  price: string;
  compare_at_price: string | null;
  stock_quantity: number;
  variant_active: number;
  product_active: number;
  image_url: string | null;
}

export async function quoteCart(request: QuoteRequestLine[]): Promise<CartQuote> {
  // One line per variant (if a variant appears twice, the quantities add up).
  const wanted = new Map<number, QuoteRequestLine>();
  for (const line of request) {
    const existing = wanted.get(line.variantId);
    wanted.set(line.variantId, existing ? { ...existing, quantity: existing.quantity + line.quantity } : line);
  }

  const ids = [...wanted.keys()];
  const rows = new Map<number, VariantRow>();
  if (ids.length) {
    const [found] = await pool.query<VariantRow[]>(
      `
        SELECT
          v.id AS variant_id,
          p.id AS product_id,
          p.slug,
          p.name,
          v.variant_name,
          v.price,
          v.compare_at_price,
          v.stock_quantity,
          v.is_active AS variant_active,
          p.is_active AS product_active,
          (
            SELECT pi.image_url FROM product_images pi
            WHERE pi.product_id = p.id
            ORDER BY pi.display_order ASC, pi.id ASC
            LIMIT 1
          ) AS image_url
        FROM product_variants v
        INNER JOIN products p ON p.id = v.product_id
        WHERE v.id IN (?)
      `,
      [ids],
    );
    for (const row of found) rows.set(row.variant_id, row);
  }

  const lines: QuoteLine[] = ids.map((variantId) => {
    const asked = wanted.get(variantId)!;
    const requested = Math.max(1, Math.min(MAX_LINE_QUANTITY, Math.floor(asked.quantity)));
    const row = rows.get(variantId);

    if (!row || !row.variant_active || !row.product_active) {
      return {
        variantId,
        productId: row?.product_id ?? null,
        slug: row?.slug ?? null,
        name: row?.name ?? null,
        variantName: row?.variant_name ?? null,
        image: row?.image_url ?? null,
        price: 0,
        compareAtPrice: null,
        stock: 0,
        requested,
        quantity: 0,
        lineTotal: 0,
        status: "unavailable",
      };
    }

    const price = Number(row.price);
    const stock = Math.max(0, row.stock_quantity);
    const quantity = Math.min(requested, stock);
    const priceChanged = asked.seenPrice !== undefined && Math.abs(asked.seenPrice - price) >= 0.01;
    const status: LineStatus =
      stock === 0 ? "sold_out" : quantity < requested ? "reduced" : priceChanged ? "price_changed" : "ok";

    return {
      variantId,
      productId: row.product_id,
      slug: row.slug,
      name: row.name,
      variantName: row.variant_name,
      image: row.image_url,
      price,
      compareAtPrice: row.compare_at_price === null ? null : Number(row.compare_at_price),
      stock,
      requested,
      quantity,
      lineTotal: Math.round(price * quantity * 100) / 100,
      status,
      ...(priceChanged ? { previousPrice: asked.seenPrice } : {}),
    };
  });

  const subtotal = Math.round(lines.reduce((sum, line) => sum + line.lineTotal, 0) * 100) / 100;
  return {
    lines,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal,
    freeDelivery: subtotal >= FREE_DELIVERY_THRESHOLD,
    remainingForFreeDelivery: Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal),
    hasChanges: lines.some((line) => line.status !== "ok"),
    checkedAt: new Date().toISOString(),
  };
}
