/**
 * Adds the columns online orders need to the existing `orders` and
 * `order_items` tables. Safe to re-run: only missing columns are added.
 *
 *   npm run db:orders
 */
import fs from "node:fs";
import mysql from "mysql2/promise";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((line) => line.includes("=") && !line.trim().startsWith("#"))
    .map((line) => [line.slice(0, line.indexOf("=")).trim(), line.slice(line.indexOf("=") + 1).trim()]),
);

const pool = env.DATABASE_URL
  ? mysql.createPool({ uri: env.DATABASE_URL })
  : mysql.createPool({
      socketPath: env.DB_HOST ? undefined : env.DB_SOCKET_PATH,
      host: env.DB_HOST,
      port: env.DB_PORT ? Number(env.DB_PORT) : undefined,
      user: env.DB_USER,
      password: env.DB_PASSWORD || "",
      database: env.DB_NAME,
    });

const COLUMNS = {
  orders: {
    guest_name: "VARCHAR(120) NULL AFTER guest_email",
    guest_phone: "VARCHAR(20) NULL AFTER guest_name",
    payment_method: "VARCHAR(20) NOT NULL DEFAULT 'cod' AFTER status",
    payment_status: "VARCHAR(20) NOT NULL DEFAULT 'unpaid' AFTER payment_method",
    delivery_zone: "VARCHAR(20) NULL AFTER shipping_address",
    gift_message: "VARCHAR(200) NULL",
    delivery_instructions: "VARCHAR(200) NULL",
    // A private token in the confirmation link, so only the customer can open their order page.
    access_token: "CHAR(32) NULL",
    // The browser's id for this attempt: a retried or double-clicked "Place order" can't create two orders.
    request_id: "VARCHAR(64) NULL",
    updated_at: "TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
  },
  order_items: {
    product_id: "INT NULL AFTER order_id",
    product_slug: "VARCHAR(255) NULL AFTER product_name",
  },
};

async function main() {
  for (const [table, columns] of Object.entries(COLUMNS)) {
    const [existing] = await pool.query(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
      [table],
    );
    const have = new Set(existing.map((row) => row.COLUMN_NAME));
    for (const [column, definition] of Object.entries(columns)) {
      if (have.has(column)) continue;
      await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      console.log(`+ ${table}.${column}`);
    }
  }
  const [indexes] = await pool.query("SHOW INDEX FROM orders WHERE Key_name = 'request_id'");
  if (!indexes.length) {
    await pool.query("ALTER TABLE orders ADD UNIQUE KEY request_id (request_id)");
    console.log("+ unique index orders.request_id");
  }
  console.log("✓ Orders tables are up to date.");
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
