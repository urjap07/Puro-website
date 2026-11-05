/**
 * Builds web-ready product photography from the raw shoot folders.
 *
 *   node scripts/optimize-images.mjs
 *
 * Reads the curated picks in scripts/data/image-manifest.json and writes
 * public/media/products/<slug>/01.jpg, 02.jpg … (first file = hero packshot).
 * Studio packshots are trimmed and re-framed to 4:5 so small bottles fill the card.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SOURCE_ROOT = "public/images/Product Images";
const OUTPUT_ROOT = "public/media/products";
const MAX_EDGE = 1800;
const QUALITY = 80;

const manifest = JSON.parse(
  fs.readFileSync("scripts/data/image-manifest.json", "utf8")
);

/** Average colour of the top-left corner, used to pad trimmed packshots. */
async function sampleBackground(input) {
  const { data } = await sharp(input)
    .extract({ left: 0, top: 0, width: 24, height: 24 })
    .resize(1, 1)
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { r: data[0], g: data[1], b: data[2] };
}

/** Is this a plain studio shot (light, near-uniform corners)? */
async function isStudioShot(input) {
  const { width, height } = await sharp(input).metadata();
  const corners = [
    [0, 0],
    [width - 24, 0],
    [0, height - 24],
    [width - 24, height - 24],
  ];
  const samples = [];
  for (const [left, top] of corners) {
    const { data } = await sharp(input)
      .extract({ left, top, width: 24, height: 24 })
      .resize(1, 1)
      .raw()
      .toBuffer({ resolveWithObject: true });
    samples.push((data[0] + data[1] + data[2]) / 3);
  }
  return Math.min(...samples) > 200 && Math.max(...samples) - Math.min(...samples) < 25;
}

/** Trim empty studio space and centre the product on a 4:5 canvas. */
async function frameStudioShot(input) {
  const background = await sampleBackground(input);
  const trimmed = await sharp(input)
    .trim({ background, threshold: 28 })
    .toBuffer({ resolveWithObject: true });

  const { width, height } = trimmed.info;
  // Product occupies ~72% of the canvas height (or 68% of width for wide jars/sets).
  let canvasHeight = Math.round(height / 0.72);
  let canvasWidth = Math.round(canvasHeight * 0.8);
  if (width / 0.68 > canvasWidth) {
    canvasWidth = Math.round(width / 0.68);
    canvasHeight = Math.round(canvasWidth * 1.25);
  }

  const framed = await sharp({
    create: { width: canvasWidth, height: canvasHeight, channels: 3, background },
  })
    .composite([
      {
        input: trimmed.data,
        left: Math.round((canvasWidth - width) / 2),
        top: Math.round((canvasHeight - height) / 2),
      },
    ])
    .png()
    .toBuffer();

  // Lift the studio backdrop to pure white so packshots match and blend cleanly.
  return sharp(framed)
    .removeAlpha()
    .linear(
      [255 / background.r, 255 / background.g, 255 / background.b],
      [0, 0, 0]
    )
    .png()
    .toBuffer();
}

async function processImage(source, destination, { frame }) {
  const oriented = await sharp(source).rotate().toBuffer();
  let pipeline = oriented;
  if (frame && (await isStudioShot(oriented))) {
    pipeline = await frameStudioShot(oriented);
  }
  await sharp(pipeline)
    .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: QUALITY, mozjpeg: true, progressive: true })
    .toFile(destination);
}

for (const [slug, { folder, files, frame = true }] of Object.entries(manifest)) {
  const outputDir =
    slug === "brand" ? "public/media/brand" : path.join(OUTPUT_ROOT, slug);
  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });

  for (const [index, file] of files.entries()) {
    const destination = path.join(
      outputDir,
      `${String(index + 1).padStart(2, "0")}.jpg`
    );
    // Only the lead packshot is re-framed; lifestyle shots keep their composition.
    await processImage(path.join(SOURCE_ROOT, folder, file), destination, {
      frame: frame && index === 0 && slug !== "brand",
    });
  }
  console.log(`✓ ${slug} (${files.length})`);
}
