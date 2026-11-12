/**
 * Links products to the brand-approved ingredient library, so the shop can
 * filter by ingredient and the ingredient explorer can list formulas.
 *
 * A product is linked when its KEY ingredients (the brand-approved list on
 * the product sheet, not the full INCI list) mention one of the keywords
 * below. Safe to re-run: the table is created if missing and links are
 * rebuilt from scratch.
 */

/** Keywords that identify each ingredient in a product's key ingredients. */
export const INGREDIENT_KEYWORDS = {
  turmeric: ["turmeric"],
  "rice-walnut": ["walnut", "rice extract"],
  "aloe-vera": ["aloe"],
  "volcanic-clay": ["clay"],
  "shea-cocoa-butter": ["shea", "cocoa"],
  "lavender-rosemary": ["lavender", "rosemary"],
};

export async function linkIngredients(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_ingredients (
      product_id INT NOT NULL,
      ingredient_id INT NOT NULL,
      PRIMARY KEY (product_id, ingredient_id),
      KEY idx_product_ingredients_ingredient (ingredient_id),
      CONSTRAINT fk_product_ingredients_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
      CONSTRAINT fk_product_ingredients_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients (id) ON DELETE CASCADE
    )
  `);

  const [ingredients] = await pool.query("SELECT id, slug FROM ingredients");
  const [products] = await pool.query("SELECT id, key_ingredients FROM products");

  const links = [];
  for (const product of products) {
    const keys = (product.key_ingredients ?? "").toLowerCase();
    if (!keys) continue;
    for (const ingredient of ingredients) {
      const words = INGREDIENT_KEYWORDS[ingredient.slug] ?? [];
      // Whole words only: "rice extract" must not match "licorice extract".
      if (words.some((word) => new RegExp(`\\b${word}`).test(keys))) links.push([product.id, ingredient.id]);
    }
  }

  await pool.query("DELETE FROM product_ingredients");
  if (links.length) await pool.query("INSERT INTO product_ingredients (product_id, ingredient_id) VALUES ?", [links]);
  return links.length;
}
