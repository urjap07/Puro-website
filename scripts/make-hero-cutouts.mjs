/**
 * High-resolution cut-outs of the three hero tubes, made from the original
 * studio packshots (pure white background) and cleaned for dark grounds.
 *
 *   node scripts/make-hero-cutouts.mjs
 *
 * Writes public/media/cutouts/hero/<slug>.webp at HEIGHT px tall, so the
 * opening scene stays crisp on retina screens. The background (and the soft
 * studio shadow under each tube) is found by flood-filling light, neutral
 * pixels from the image edges; the mask edge is then tightened, feathered and
 * pulled away from white so no halo shows on midnight teal.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = "public/images/Product Images";
const OUT = "public/media/cutouts/hero";
const WORK = 2600; // working height in px
const HEIGHT = 1600; // output height in px

const SOURCES = {
  "glow-up-pithi-pack": "03. Glow up Pithi Pack/Copy of IMG_9400 copy.jpg",
  "aquench-soothing-hydrogel": "06. Aquench soothing gel/Copy of IMG_9438 copy.jpg",
  "vita-clay-ubtan-pack": "04. Vita Clay Ubtan Pack/Copy of IMG_9420 copy.jpg",
};

fs.mkdirSync(OUT, { recursive: true });

async function cut(slug, file) {
  const { data, info } = await sharp(path.join(ROOT, file))
    .rotate()
    .resize({ height: WORK })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;

  // Background: very light and neutral. The studio shadow is neutral grey, so
  // below the product we accept darker neutrals too.
  const neutral = (i) => Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]);
  const light = (i) => Math.min(data[i], data[i + 1], data[i + 2]);

  // Find the product's lowest solid row (the cap) to know where the shadow starts.
  const bg = new Uint8Array(w * h);
  const stack = [];
  const isBg = (p, y, capLine) => {
    const i = p * 3;
    // Around the caps: the soft, slightly warm studio shadow also counts.
    if (capLine !== null && y > capLine) return neutral(i) <= 26 && light(i) > 140;
    // Elsewhere only the true studio white, so the white tube crimps survive.
    return neutral(i) <= 8 && light(i) >= 246;
  };

  const fill = (capLine) => {
    bg.fill(0);
    const push = (x, y) => {
      const p = y * w + x;
      if (bg[p] || !isBg(p, y, capLine)) return;
      bg[p] = 1;
      stack.push(p);
    };
    for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
    for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
    while (stack.length) {
      const p = stack.pop();
      const x = p % w, y = (p / w) | 0;
      if (x > 0) push(x - 1, y);
      if (x < w - 1) push(x + 1, y);
      if (y > 0) push(x, y - 1);
      if (y < h - 1) push(x, y + 1);
    }
  };

  // First pass with the strict rule, then find the bottom of the product and
  // re-run allowing the neutral shadow beneath it to count as background.
  fill(null);
  // The cap is the dark band at the foot of the tube; the shadow sits beside it.
  let bottom = 0;
  for (let y = h - 1; y >= 0 && !bottom; y--) {
    let solid = 0;
    for (let x = 0; x < w; x++) if (!bg[y * w + x] && light((y * w + x) * 3) < 120) solid++;
    if (solid > w * 0.04) bottom = y;
  }
  let capTop = bottom;
  for (let y = bottom; y > 0; y--) {
    let dark = 0;
    for (let x = 0; x < w; x++) if (!bg[y * w + x] && light((y * w + x) * 3) < 90) dark++;
    if (dark < w * 0.02) { capTop = y; break; }
  }
  fill(capTop + 4);

  // Alpha: erode by 3px, then feather with a 5px box blur.
  const alpha = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p++) alpha[p] = bg[p] ? 0 : 255;
  const erode = (src, r) => {
    const out = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let m = 255;
      for (let dy = -r; dy <= r && m; dy++) {
        const yy = y + dy; if (yy < 0 || yy >= h) { m = 0; break; }
        for (let dx = -r; dx <= r; dx++) {
          const xx = x + dx; if (xx < 0 || xx >= w) { m = 0; break; }
          if (src[yy * w + xx] < m) m = src[yy * w + xx];
        }
      }
      out[y * w + x] = m;
    }
    return out;
  };
  const blur = (src, r) => {
    const tmp = new Float32Array(w * h), out = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) { let s = 0; for (let x = -r; x < w + r; x++) { const add = src[y * w + Math.min(w - 1, Math.max(0, x + r))]; const sub = x - r - 1 >= 0 ? src[y * w + Math.min(w - 1, x - r - 1)] : src[y * w]; s += add - (x - r - 1 >= 0 ? sub : 0); if (x >= 0 && x < w) tmp[y * w + x] = s / (2 * r + 1); } }
    for (let x = 0; x < w; x++) { let s = 0; for (let y = -r; y < h + r; y++) { const add = tmp[Math.min(h - 1, Math.max(0, y + r)) * w + x]; const sub = y - r - 1 >= 0 ? tmp[Math.min(h - 1, y - r - 1) * w + x] : 0; s += add - sub; if (y >= 0 && y < h) out[y * w + x] = Math.round(s / (2 * r + 1)); } }
    return out;
  };
  const soft = blur(erode(alpha, 3), 2);

  const rgba = Buffer.alloc(w * h * 4);
  for (let p = 0; p < w * h; p++) {
    const a = soft[p];
    const k = a < 250 ? 0.5 * (1 - a / 255) : 0; // pull edge pixels away from white
    for (let c = 0; c < 3; c++) rgba[p * 4 + c] = Math.round(data[p * 3 + c] * (1 - k));
    rgba[p * 4 + 3] = a;
  }

  await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .trim({ threshold: 1 })
    .resize({ height: HEIGHT })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(path.join(OUT, `${slug}.webp`));
  const meta = await sharp(path.join(OUT, `${slug}.webp`)).metadata();
  console.log(slug, `${meta.width}x${meta.height}`);
}

for (const [slug, file] of Object.entries(SOURCES)) await cut(slug, file);
