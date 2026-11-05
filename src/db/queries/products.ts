import { cache } from "react";
import { RowDataPacket } from "mysql2";
import pool from "@/lib/db";

/* --------------------------------
   Database row types
--------------------------------- */

interface ProductRow extends RowDataPacket {
    id: number;
    name: string;
    slug: string;
    summary: string | null;
    description: string | null;
    how_to_use: string | null;
    full_ingredients_list: string | null;
    headline: string | null;
    tagline: string | null;
    skin_type: string | null;
    sub_category: string | null;
    key_ingredients: string | null;
    benefits: string[] | null;
    certifications: string[] | null;
    size_label: string | null;
    shelf_life: string | null;
    storage_instructions: string | null;
    is_featured: number;
    is_active: number;
    created_at: Date;
}

interface VariantRow extends RowDataPacket {
    id: number;
    product_id: number;
    sku: string;
    variant_name: string;
    price: number;
    compare_at_price: number | null;
    stock_quantity: number;
    weight_grams: number | null;
}

interface CategoryRow extends RowDataPacket {
    product_id: number;
    id: number;
    name: string;
    slug: string;
}

interface ConcernRow extends RowDataPacket {
    product_id: number;
    id: number;
    name: string;
    slug: string;
    description: string | null;
}

interface ImageRow extends RowDataPacket {
    id: number;
    product_id: number;
    image_url: string;
    alt_text: string | null;
    display_order: number;
}

/* --------------------------------
   Product response types
--------------------------------- */

export interface Product {
    id: number;
    name: string;
    slug: string;
    summary: string | null;
    description: string | null;
    howToUse: string | null;
    ingredients: string | null;
    headline: string | null;
    tagline: string | null;
    skinType: string | null;
    subCategory: string | null;
    keyIngredients: string | null;
    benefits: string[];
    certifications: string[];
    sizeLabel: string | null;
    shelfLife: string | null;
    storage: string | null;
    isFeatured: boolean;
    categories: {
        id: number;
        name: string;
        slug: string;
    }[];
    concerns: {
        id: number;
        name: string;
        slug: string;
        description: string | null;
    }[];
    images: {
        id: number;
        imageUrl: string;
        altText: string | null;
        displayOrder: number;
    }[];
    variants: {
        id: number;
        sku: string;
        name: string;
        price: number;
        compareAtPrice: number | null;
        stockQuantity: number;
        weightGrams: number | null;
    }[];
}

/* --------------------------------
   Attach related data to products
--------------------------------- */

async function attachProductRelations(
    productRows: ProductRow[]
): Promise<Product[]> {
    if (productRows.length === 0) {
        return [];
    }

    const productIds = productRows.map((product) => product.id);

    const placeholders = productIds.map(() => "?").join(", ");

    // Fetch active product variants
    const [variants] = await pool.query<VariantRow[]>(
        `
      SELECT
        id,
        product_id,
        sku,
        variant_name,
        price,
        compare_at_price,
        stock_quantity,
        weight_grams
      FROM product_variants
      WHERE product_id IN (${placeholders})
        AND is_active = 1
      ORDER BY id ASC
    `,
        productIds
    );

    // Fetch product categories
    const [categories] = await pool.query<CategoryRow[]>(
        `
      SELECT
        pc.product_id,
        c.id,
        c.name,
        c.slug
      FROM product_categories pc
      INNER JOIN categories c
        ON pc.category_id = c.id
      WHERE pc.product_id IN (${placeholders})
      ORDER BY c.name ASC
    `,
        productIds
    );

    // Fetch product concerns
    const [concerns] = await pool.query<ConcernRow[]>(
        `
      SELECT
        pco.product_id,
        c.id,
        c.name,
        c.slug,
        c.description
      FROM product_concerns pco
      INNER JOIN concerns c
        ON pco.concern_id = c.id
      WHERE pco.product_id IN (${placeholders})
      ORDER BY c.name ASC
    `,
        productIds
    );

    // Fetch product images
    const [images] = await pool.query<ImageRow[]>(
        `
      SELECT
        id,
        product_id,
        image_url,
        alt_text,
        display_order
      FROM product_images
      WHERE product_id IN (${placeholders})
      ORDER BY display_order ASC, id ASC
    `,
        productIds
    );

    // Group related records by product ID
    const variantsMap = new Map<number, VariantRow[]>();
    const categoriesMap = new Map<number, CategoryRow[]>();
    const concernsMap = new Map<number, ConcernRow[]>();
    const imagesMap = new Map<number, ImageRow[]>();

    for (const variant of variants) {
        const existing = variantsMap.get(variant.product_id) || [];
        existing.push(variant);
        variantsMap.set(variant.product_id, existing);
    }

    for (const category of categories) {
        const existing = categoriesMap.get(category.product_id) || [];
        existing.push(category);
        categoriesMap.set(category.product_id, existing);
    }

    for (const concern of concerns) {
        const existing = concernsMap.get(concern.product_id) || [];
        existing.push(concern);
        concernsMap.set(concern.product_id, existing);
    }

    for (const image of images) {
        const existing = imagesMap.get(image.product_id) || [];
        existing.push(image);
        imagesMap.set(image.product_id, existing);
    }

    // Return complete product objects
    return productRows.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        summary: product.summary,
        description: product.description,
        howToUse: product.how_to_use,
        ingredients: product.full_ingredients_list,
        headline: product.headline,
        tagline: product.tagline,
        skinType: product.skin_type,
        subCategory: product.sub_category,
        keyIngredients: product.key_ingredients,
        benefits: product.benefits ?? [],
        certifications: product.certifications ?? [],
        sizeLabel: product.size_label,
        shelfLife: product.shelf_life,
        storage: product.storage_instructions,
        isFeatured: Boolean(product.is_featured),

        categories: (categoriesMap.get(product.id) || []).map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
        })),

        concerns: (concernsMap.get(product.id) || []).map((concern) => ({
            id: concern.id,
            name: concern.name,
            slug: concern.slug,
            description: concern.description,
        })),

        images: (imagesMap.get(product.id) || []).map((image) => ({
            id: image.id,
            imageUrl: image.image_url,
            altText: image.alt_text,
            displayOrder: image.display_order,
        })),

        variants: (variantsMap.get(product.id) || []).map((variant) => ({
            id: variant.id,
            sku: variant.sku,
            name: variant.variant_name,
            price: Number(variant.price),
            compareAtPrice:
                variant.compare_at_price === null
                    ? null
                    : Number(variant.compare_at_price),
            stockQuantity: variant.stock_quantity,
            weightGrams: variant.weight_grams,
        })),
    }));
}

/* --------------------------------
   Get all active products
--------------------------------- */

export const getActiveProducts = cache(async (): Promise<Product[]> => {
    const [products] = await pool.query<ProductRow[]>(
        `
      SELECT
        id,
        name,
        slug,
        summary,
        description,
        how_to_use,
        full_ingredients_list,
        headline,
        tagline,
        skin_type,
        sub_category,
        key_ingredients,
        benefits,
        certifications,
        size_label,
        shelf_life,
        storage_instructions,
        is_featured,
        is_active,
        created_at
      FROM products
      WHERE is_active = 1
      ORDER BY id ASC
    `
    );

    return attachProductRelations(products);
});

/* --------------------------------
   Get one product by slug
--------------------------------- */

export const getProductBySlug = cache(async (
    slug: string
): Promise<Product | null> => {
    const [products] = await pool.query<ProductRow[]>(
        `
      SELECT
        id,
        name,
        slug,
        summary,
        description,
        how_to_use,
        full_ingredients_list,
        headline,
        tagline,
        skin_type,
        sub_category,
        key_ingredients,
        benefits,
        certifications,
        size_label,
        shelf_life,
        storage_instructions,
        is_featured,
        is_active,
        created_at
      FROM products
      WHERE slug = ?
        AND is_active = 1
      LIMIT 1
    `,
        [slug]
    );

    if (products.length === 0) {
        return null;
    }

    const result = await attachProductRelations(products);

    return result[0] ?? null;
});

/* --------------------------------
   Concerns and ingredients
--------------------------------- */

export interface Concern {
    id: number;
    name: string;
    slug: string;
    description: string | null;
}

export interface Ingredient {
    id: number;
    name: string;
    slug: string;
    benefits: string | null;
    imageUrl: string | null;
}

interface IngredientRow extends RowDataPacket {
    id: number;
    name: string;
    slug: string;
    benefits: string | null;
    image_url: string | null;
}

export const getConcerns = cache(async (): Promise<Concern[]> => {
    const [concerns] = await pool.query<(Concern & RowDataPacket)[]>(
        `SELECT id, name, slug, description FROM concerns ORDER BY id ASC`
    );

    return concerns.map(({ id, name, slug, description }) => ({
        id,
        name,
        slug,
        description,
    }));
});

export const getIngredients = cache(async (): Promise<Ingredient[]> => {
    const [ingredients] = await pool.query<IngredientRow[]>(
        `SELECT id, name, slug, benefits, image_url FROM ingredients ORDER BY id ASC`
    );

    return ingredients.map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        slug: ingredient.slug,
        benefits: ingredient.benefits,
        imageUrl: ingredient.image_url,
    }));
});
