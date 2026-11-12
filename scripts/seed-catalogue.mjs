/**
 * Adds product-detail columns and seeds the catalogue.
 *
 *   python3 scripts/export-catalogue.py   # xlsx -> scripts/data/catalogue.json
 *   node scripts/optimize-images.mjs      # raw photos -> public/media
 *   npm run db:seed                       # this script
 *
 * Sources, in order of precedence:
 *   catalogue.json        — the product sheet (names, prices, copy, benefits)
 *   live-additions.json   — products/kit contents/concerns from purobodysoul.com
 *   live-site.json        — full ingredients, warnings, ratings, reviews (live site)
 *   gift-sets-draft.json  — placeholder copy for gift sets not yet confirmed
 *
 * Safe to re-run: schema changes are only applied when missing and rows are rewritten.
 */
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import { linkIngredients } from "./lib/ingredient-links.mjs";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((line) => line.includes("="))
    .map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1).trim()])
);

const readJson = (file) => JSON.parse(fs.readFileSync(`scripts/data/${file}`, "utf8"));
const catalogue = readJson("catalogue.json");
const giftSetDrafts = readJson("gift-sets-draft.json");
const additions = readJson("live-additions.json");
const liveSite = readJson("live-site.json");

const PRODUCT_COLUMNS = {
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
  frequency: "VARCHAR(100) NULL",
  warnings: "JSON NULL",
  kit_contents: "JSON NULL",
  // Aggregate rating carried over from the previous store (purobodysoul.com).
  rating_value: "DECIMAL(2,1) NULL",
  rating_count: "INT NULL",
  is_classic: "TINYINT(1) NOT NULL DEFAULT 0",
};

/** Products shown in "The Signatures" on the homepage. */
const FEATURED_SLUGS = [
  "glow-up-pithi-pack",
  "vita-clay-ubtan-pack",
  "aqua-riche-night-repair-gel-cream",
  "sheavibe-lotion",
  "hydroclock-foaming-facewash",
  "scrubulush-exfoliator",
  "terra-tress-hair-scalp-oil",
  "aquench-soothing-hydrogel",
];

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

async function columnsOf(table) {
  const [rows] = await pool.query(
    "SELECT COLUMN_NAME, IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
    [table]
  );
  return new Map(rows.map((row) => [row.COLUMN_NAME, row]));
}

async function migrate() {
  const productColumns = await columnsOf("products");
  for (const [column, definition] of Object.entries(PRODUCT_COLUMNS)) {
    if (!productColumns.has(column)) {
      await pool.query(`ALTER TABLE products ADD COLUMN ${column} ${definition}`);
      console.log(`+ products.${column}`);
    }
  }

  const concernColumns = await columnsOf("concerns");
  if (!concernColumns.has("type")) {
    await pool.query("ALTER TABLE concerns ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'skin'");
    console.log("+ concerns.type");
  }

  // Reviews imported from the previous store have an author name but no account.
  const reviewColumns = await columnsOf("reviews");
  if (reviewColumns.get("user_id")?.IS_NULLABLE === "NO") {
    await pool.query("ALTER TABLE reviews MODIFY user_id INT NULL");
    console.log("~ reviews.user_id nullable");
  }
  if (!reviewColumns.has("author_name")) {
    await pool.query("ALTER TABLE reviews ADD COLUMN author_name VARCHAR(120) NULL");
    console.log("+ reviews.author_name");
  }
  if (!reviewColumns.has("source")) {
    await pool.query("ALTER TABLE reviews ADD COLUMN source VARCHAR(40) NULL");
    console.log("+ reviews.source");
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

/** Creates rows for products that exist on the live site but not in the sheet. */
async function insertNewProducts() {
  for (const item of additions.newProducts) {
    const [[existing]] = await pool.query("SELECT id FROM products WHERE id = ?", [item.id]);
    if (!existing) {
      await pool.query("INSERT INTO products (id, name, slug, is_active) VALUES (?, ?, ?, 1)", [
        item.id,
        item.name,
        item.slug,
      ]);
      await pool.query(
        "INSERT INTO product_variants (product_id, sku, variant_name, price, stock_quantity, weight_grams, is_active) VALUES (?, ?, ?, ?, ?, 0, 1)",
        [item.id, `PURO-${item.slug.slice(0, 10).toUpperCase()}`, item.sizeLabel ?? "Gift box", item.price, item.stock]
      );
      console.log(`+ product ${item.slug}`);
    }
    await pool.query("UPDATE product_variants SET stock_quantity = ? WHERE product_id = ?", [
      item.stock,
      item.id,
    ]);

    const [[category]] = await pool.query("SELECT id FROM categories WHERE slug = ?", [item.category]);
    await pool.query("DELETE FROM product_categories WHERE product_id = ?", [item.id]);
    await pool.query("INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)", [
      item.id,
      category.id,
    ]);
  }
}

/** One normalised record per product, merging every data source. */
function buildRecords(slugById) {
  const fromSheet = catalogue.map((item) => {
    const draft = giftSetDrafts[String(item.id)] ?? {};
    return {
      id: item.id,
      name: item.name.replace(" - Diffuser Aromatherapy", ""),
      price: item.price,
      sizeLabel: item.sizeLabel,
      headline: item.headline ?? draft.headline ?? null,
      tagline: item.tagline ?? draft.tagline ?? null,
      skinType: item.skinType,
      subCategory: item.subCategory,
      description: item.description ?? draft.description ?? null,
      howToUse: item.howToUse ?? draft.howToUse ?? null,
      keyIngredients: item.keyIngredients,
      benefits: item.benefits.length ? item.benefits : draft.benefits ?? [],
      certifications: item.certifications,
      shelfLife: item.shelfLife,
      storage: item.storage,
    };
  });

  return [...fromSheet, ...additions.newProducts].map((record) => {
    const slug = slugById.get(record.id);
    const kit = additions.kitContents[slug] ?? {};
    const live = liveSite[slug] ?? {};
    return {
      ...record,
      slug,
      headline: kit.headline ?? record.headline,
      description: kit.description ?? record.description,
      howToUse: kit.howToUse ?? record.howToUse,
      kitContents: kit.contents ?? null,
      fullIngredients: live.fullIngredients ?? null,
      frequency: live.frequency ?? null,
      // Drop label-only lines such as "Warning :".
      warnings: (live.warnings ?? []).filter((line) => !/:\s*$/.test(line)),
      rating: live.rating ?? null,
      isClassic: record.isClassic ?? additions.classicSlugs.includes(slug),
    };
  });
}

async function seedProducts() {
  const [rows] = await pool.query("SELECT id, slug FROM products");
  const slugById = new Map(rows.map((row) => [row.id, row.slug]));

  for (const item of buildRecords(slugById)) {
    if (!item.slug) {
      console.warn(`! No database product with id ${item.id} (${item.name})`);
      continue;
    }

    await pool.query(
      `UPDATE products SET
         name = ?, summary = ?, headline = ?, tagline = ?, skin_type = ?,
         sub_category = ?, description = ?, how_to_use = ?, key_ingredients = ?,
         full_ingredients_list = ?, benefits = ?, certifications = ?, size_label = ?,
         shelf_life = ?, storage_instructions = ?, frequency = ?, warnings = ?,
         kit_contents = ?, rating_value = ?, rating_count = ?, is_classic = ?, is_featured = ?
       WHERE id = ?`,
      [
        item.name,
        item.headline,
        item.headline,
        item.tagline,
        item.skinType,
        item.subCategory,
        item.description,
        item.howToUse,
        item.keyIngredients,
        item.fullIngredients,
        JSON.stringify(item.benefits),
        JSON.stringify(item.certifications),
        item.sizeLabel,
        item.shelfLife,
        item.storage,
        item.frequency,
        item.warnings.length ? JSON.stringify(item.warnings) : null,
        item.kitContents ? JSON.stringify(item.kitContents) : null,
        item.rating?.value ?? null,
        item.rating?.count ?? null,
        item.isClassic ? 1 : 0,
        FEATURED_SLUGS.includes(item.slug) ? 1 : 0,
        item.id,
      ]
    );

    await pool.query(
      "UPDATE product_variants SET price = ?, variant_name = ? WHERE product_id = ?",
      [item.price, item.sizeLabel ?? "Gift box", item.id]
    );

    const images = productImages(item.slug);
    await pool.query("DELETE FROM product_images WHERE product_id = ?", [item.id]);
    for (const [index, url] of images.entries()) {
      await pool.query(
        "INSERT INTO product_images (product_id, image_url, alt_text, display_order) VALUES (?, ?, ?, ?)",
        [item.id, url, `${item.name} by Puro Body & Soul`, index]
      );
    }

    console.log(`✓ ${item.slug} — ${images.length} images`);
  }
}

async function seedConcerns() {
  const [products] = await pool.query("SELECT id, slug FROM products");
  const idBySlug = new Map(products.map((row) => [row.slug, row.id]));

  await pool.query("DELETE FROM product_concerns");
  await pool.query("DELETE FROM concerns");
  for (const [index, concern] of additions.concerns.entries()) {
    const [result] = await pool.query(
      "INSERT INTO concerns (id, name, slug, description, type) VALUES (?, ?, ?, ?, ?)",
      [index + 1, concern.name, concern.slug, concern.description, concern.type]
    );
    for (const slug of additions.concernProducts[concern.slug] ?? []) {
      await pool.query("INSERT INTO product_concerns (product_id, concern_id) VALUES (?, ?)", [
        idBySlug.get(slug),
        result.insertId,
      ]);
    }
  }
  console.log(`✓ ${additions.concerns.length} concerns linked`);
}

async function seedReviews() {
  const [products] = await pool.query("SELECT id, slug FROM products");
  const idBySlug = new Map(products.map((row) => [row.slug, row.id]));

  await pool.query("DELETE FROM reviews WHERE source = 'purobodysoul.com'");
  let count = 0;
  for (const [slug, entry] of Object.entries(liveSite)) {
    for (const review of entry.reviews ?? []) {
      await pool.query(
        `INSERT INTO reviews (product_id, user_id, author_name, rating, title, comment, is_approved, source, created_at)
         VALUES (?, NULL, ?, ?, ?, ?, 1, 'purobodysoul.com', ?)`,
        [idBySlug.get(slug), review.author, review.rating, review.title, review.body, review.date || null]
      );
      count++;
    }
  }
  console.log(`✓ ${count} reviews imported`);
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
  await migrate();
  await insertNewProducts();
  await seedProducts();
  await seedConcerns();
  await seedReviews();
  await seedIngredients();
  console.log(`✓ ${await linkIngredients(pool)} product–ingredient links`);
} finally {
  await pool.end();
}
