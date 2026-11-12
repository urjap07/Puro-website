/**
 * Saves the catalogue (products, concerns, ingredients, approved reviews)
 * from the local database to src/data/catalogue-snapshot.json. The site
 * reads that snapshot when no database is configured — e.g. on Netlify
 * before a hosted MySQL is set up.
 *
 *   npm run dev            # in another terminal, with the local database running
 *   npm run db:snapshot
 *
 * Re-run after changing products, prices, stock or reviews, then commit.
 */
import fs from "node:fs";

const base = process.env.SNAPSHOT_FROM ?? "http://localhost:3000";
const response = await fetch(`${base}/api/dev/snapshot`);
if (!response.ok) {
  console.error(`Couldn't read ${base}/api/dev/snapshot (${response.status}). Is the dev server running with the database?`);
  process.exit(1);
}
const data = await response.json();
fs.mkdirSync("src/data", { recursive: true });
fs.writeFileSync("src/data/catalogue-snapshot.json", JSON.stringify(data) + "\n");
console.log(
  `✓ Snapshot saved: ${data.products.length} products, ${data.concerns.length} concerns, ` +
    `${data.ingredients.length} ingredients, ${data.reviews.length} reviews`,
);
