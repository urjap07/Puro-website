/**
 * Sets (or clears) a product's launch date, which puts it on the New Arrivals
 * page for 90 days from that date.
 *
 *   npm run db:launch -- <product-slug>              # launched today
 *   npm run db:launch -- <product-slug> 2026-12-01   # launched on a date
 *   npm run db:launch -- <product-slug> clear        # remove from New Arrivals
 *   npm run db:launch -- list                        # show launch dates
 *
 * Afterwards run `npm run db:snapshot` and commit, so the live site (which
 * reads the catalogue snapshot) picks it up.
 */
import fs from "node:fs";
import mysql from "mysql2/promise";

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

const [slug, when] = process.argv.slice(2);

/** Today's date in India, as YYYY-MM-DD. */
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

async function main() {
  if (!slug) {
    console.error("Usage: npm run db:launch -- <product-slug> [YYYY-MM-DD | clear]   or   npm run db:launch -- list");
    process.exitCode = 1;
    return;
  }

  if (slug === "list") {
    const [rows] = await pool.query(
      "SELECT slug, DATE_FORMAT(launched_at, '%Y-%m-%d') AS launched FROM products WHERE is_active = 1 ORDER BY launched_at IS NULL, launched_at DESC, slug",
    );
    for (const row of rows) console.log(`${(row.launched ?? "—").padEnd(12)} ${row.slug}`);
    return;
  }

  const date = when === "clear" ? null : (when ?? today());
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.error(`"${date}" isn't a date. Use YYYY-MM-DD, e.g. 2026-12-01.`);
    process.exitCode = 1;
    return;
  }

  const [result] = await pool.query("UPDATE products SET launched_at = ? WHERE slug = ?", [date, slug]);
  if (result.affectedRows === 0) {
    const [rows] = await pool.query("SELECT slug FROM products WHERE slug LIKE ? LIMIT 5", [`%${slug.split("-")[0]}%`]);
    console.error(`No product with slug "${slug}".${rows.length ? ` Did you mean: ${rows.map((row) => row.slug).join(", ")}?` : ""}`);
    process.exitCode = 1;
    return;
  }
  if (!date) console.log(`✓ ${slug} removed from New Arrivals.`);
  else {
    const days = Math.floor((Date.parse(`${today()}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`)) / 86_400_000);
    if (days < 0) console.log(`✓ ${slug} launches on ${date} — it joins New Arrivals that day, for 90 days.`);
    else if (days >= 90) console.log(`✓ ${slug} launch date set to ${date} — that's over 90 days ago, so it won't show on New Arrivals.`);
    else console.log(`✓ ${slug} launched on ${date} — on New Arrivals for ${90 - days} more ${90 - days === 1 ? "day" : "days"}.`);
  }
  console.log("  Run `npm run db:snapshot` and commit to update the live site.");
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
