/**
 * Rebuilds the product ↔ ingredient links (see scripts/lib/ingredient-links.mjs).
 *
 *   npm run db:ingredients
 *
 * Also runs automatically at the end of `npm run db:seed`.
 */
import fs from "node:fs";
import mysql from "mysql2/promise";
import { linkIngredients } from "./lib/ingredient-links.mjs";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((line) => line.includes("="))
    .map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1).trim()]),
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

try {
  const count = await linkIngredients(pool);
  console.log(`✓ ${count} product–ingredient links`);
} finally {
  await pool.end();
}
