/**
 * Adds product-detail columns and seeds the catalogue from the product sheet.
 *
 *   python3 scripts/export-catalogue.py   # xlsx -> scripts/data/catalogue.json
 *   node scripts/optimize-images.mjs      # raw photos -> public/media
 *   npm run db:seed                       # this script
 *
 * Safe to re-run: columns are only added when missing and every row is rewritten.
 */
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((line) => line.includes("="))
    .map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1).trim()])
);

const catalogue = JSON.parse(fs.readFileSync("scripts/data/catalogue.json", "utf8"));
const giftSetDrafts = JSON.parse(fs.readFileSync("scripts/data/gift-sets-draft.json", "utf8"));

const NEW_COLUMNS = {
  headline: "VARCHAR(255) NULL",
  tagline: "VARCHAR(255) NULL",
  skin_type: "VARCHAR(255) NULL",
  sub_category: "VARCHAR(100) NULL",
  key_ingredients: "TEXT NULL",
  benefits: "JSON NULL",
  certifications: "JSON NULL",
  size_label: "VARCHAR(50) NULL",
  shelf_life: "VARCHAR(255) NULL",
  storage_instructions: "VARCHAR(255) NULL",
};

/** Products shown in "The Signatures" on the homepage. */
const FEATURED_IDS = [3, 4, 7, 9, 2, 5, 11, 6];

const CONCERN_PRODUCTS = {
  "deep-hydration": [2, 6, 7, 8, 9, 10, 12, 16],
  "skin-brightening": [1, 3, 4, 5, 13, 17, 19, 20],
  "tan-removal": [3, 4, 5, 6],
  "oil-control": [1, 4, 6],
  "hair-thinning": [11, 12],
};

const INGREDIENTS = [
  ["Turmeric", "turmeric", "Home-grown and rich in curcumin — the golden heart of our Pithi and Good Cleanse rituals.", "/media/products/glow-up-pithi-pack/04.jpg"],
  ["Rice & Walnut", "rice-walnut", "Gentle natural exfoliants that lift away dead skin and reveal an even, polished tone.", "/media/products/scrubulush-exfoliator/04.jpg"],
  ["Aloe Vera", "aloe-vera", "Cooling and calming, it soothes skin after sun, heat, threading and waxing.", "/media/products/aloe-vibe-shower-gel/02.jpg"],
  ["Volcanic Clay", "volcanic-clay", "Draws out dirt, grime and excess oil, leaving pores refined and skin detoxified.", "/media/products/vita-clay-ubtan-pack/06.jpg"],
  ["Shea & Cocoa Butter", "shea-cocoa-butter", "Rich, melting butters that pamper every layer of skin with lasting softness.", "/media/products/sheavibe-lotion/06.jpg"],
  ["Lavender & Rosemary", "lavender-rosemary", "An aromatic pairing that revitalises the scalp and brings shine back to every strand.", "/media/products/terra-tress-hair-scalp-oil/05.jpg"],
];

const pool = mysql.createPool({
  socketPath: env.DB_SOCKET_PATH,
  user: env.DB_USER,
  password: env.DB_PASSWORD || "",
  database: env.DB_NAME,
});

async function addMissingColumns() {
  const [existing] = await pool.query(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products'"
  );
  const present = new Set(existing.map((row) => row.COLUMN_NAME));
  for (const [column, definition] of Object.entries(NEW_COLUMNS)) {
    if (!present.has(column)) {
      await pool.query(`ALTER TABLE products ADD COLUMN ${column} ${definition}`);
      console.log(`+ products.${column}`);
    }
  }
}

function productImages(slug) {
  const dir = path.join("public/media/products", slug);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".jpg"))
    .sort()
    .map((file) => `/media/products/${slug}/${file}`);
}

async function seedProducts() {
  const [rows] = await pool.query("SELECT id, slug, name FROM products");
  const byId = new Map(rows.map((row) => [row.id, row]));

  for (const item of catalogue) {
    const product = byId.get(item.id);
    if (!product) {
      console.warn(`! No database product with id ${item.id} (${item.name})`);
      continue;
    }

    const draft = giftSetDrafts[String(item.id)] ?? {};
    const headline = item.headline ?? draft.headline ?? null;

    await pool.query(
      `UPDATE products SET
         name = ?, summary = ?, headline = ?, tagline = ?, skin_type = ?,
         sub_category = ?, description = ?, how_to_use = ?, key_ingredients = ?,
         full_ingredients_list = ?, benefits = ?, certifications = ?, size_label = ?,
         shelf_life = ?, storage_instructions = ?, is_featured = ?
       WHERE id = ?`,
      [
        item.name.replace(" - Diffuser Aromatherapy", ""),
        headline,
        headline,
        item.tagline ?? draft.tagline ?? null,
        item.skinType,
        item.subCategory,
        item.description ?? draft.description ?? null,
        item.howToUse ?? draft.howToUse ?? null,
        item.keyIngredients,
        item.keyIngredients,
        JSON.stringify(item.benefits.length ? item.benefits : draft.benefits ?? []),
        JSON.stringify(item.certifications),
        item.sizeLabel,
        item.shelfLife,
        item.storage,
        FEATURED_IDS.includes(item.id) ? 1 : 0,
        item.id,
      ]
    );

    await pool.query(
      "UPDATE product_variants SET price = ?, variant_name = ? WHERE product_id = ?",
      [item.price, item.sizeLabel ?? "Gift box", item.id]
    );

    const images = productImages(product.slug);
    await pool.query("DELETE FROM product_images WHERE product_id = ?", [item.id]);
    for (const [index, url] of images.entries()) {
      await pool.query(
        "INSERT INTO product_images (product_id, image_url, alt_text, display_order) VALUES (?, ?, ?, ?)",
        [item.id, url, `${item.name} by Puro Body & Soul`, index]
      );
    }

    console.log(`✓ ${product.slug} — ${images.length} images`);
  }
}

async function seedConcerns() {
  const [concerns] = await pool.query("SELECT id, slug FROM concerns");
  await pool.query("DELETE FROM product_concerns");
  for (const concern of concerns) {
    for (const productId of CONCERN_PRODUCTS[concern.slug] ?? []) {
      await pool.query(
        "INSERT INTO product_concerns (product_id, concern_id) VALUES (?, ?)",
        [productId, concern.id]
      );
    }
  }
  console.log(`✓ concerns linked`);
}

async function seedIngredients() {
  await pool.query("DELETE FROM ingredients");
  for (const [name, slug, benefits, imageUrl] of INGREDIENTS) {
    await pool.query(
      "INSERT INTO ingredients (name, slug, benefits, image_url) VALUES (?, ?, ?, ?)",
      [name, slug, benefits, imageUrl]
    );
  }
  console.log(`✓ ${INGREDIENTS.length} ingredients`);
}

try {
  await addMissingColumns();
  await seedProducts();
  await seedConcerns();
  await seedIngredients();
} finally {
  await pool.end();
}
