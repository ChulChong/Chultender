// Normalize the hand-drawn cocktail illustrations to a consistent size/position.
//
// ChatGPT generated each drink independently, so the drawing's scale and
// position on the transparent canvas varies a lot from image to image.
// This script:
//
//   1. Finds the bounding box of non-transparent pixels in each PNG.
//   2. Scales that content to a fixed height (capped by a max width so
//      wide drinks don't overflow the canvas).
//   3. Pastes it onto a fixed-size transparent canvas, horizontally
//      centered and bottom-aligned to the same baseline.
//
// So every drink ends up rendered at the same scale, sitting on the same
// "floor" line, regardless of how ChatGPT happened to frame the original.
//
// Usage:
//   node scripts/normalize-images.js scripts/new-images scripts/normalized-images
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const CANVAS_W = 1000;
const CANVAS_H = 1000;
const TARGET_H = 860; // scaled content height
const MAX_W = 900; // cap width so tall+wide drinks still fit
const BOTTOM_MARGIN = 40; // px from canvas bottom to content's bottom edge
const ALPHA_THRESHOLD = 10; // pixels with alpha above this count as "content"

// Scans the raw RGBA buffer for the bounding box of pixels whose alpha
// exceeds ALPHA_THRESHOLD — sharp has no built-in equivalent of PIL's
// Image.getbbox(), so this walks the buffer by hand.
function findContentBBox(data, width, height, channels) {
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * channels + 3];
      if (alpha > ALPHA_THRESHOLD) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null; // fully transparent
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

async function normalize(inPath, outPath) {
  const image = sharp(inPath).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  const bbox = findContentBBox(data, info.width, info.height, info.channels);
  if (!bbox) {
    console.log(`  ! ${path.basename(inPath)}: fully transparent, skipping`);
    return false;
  }

  let scale = TARGET_H / bbox.height;
  if (bbox.width * scale > MAX_W) scale = MAX_W / bbox.width;
  const newW = Math.max(1, Math.round(bbox.width * scale));
  const newH = Math.max(1, Math.round(bbox.height * scale));

  const contentBuffer = await sharp(inPath)
    .ensureAlpha()
    .extract(bbox)
    .resize(newW, newH, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();

  const left = Math.round((CANVAS_W - newW) / 2);
  const top = CANVAS_H - BOTTOM_MARGIN - newH;

  await sharp({
    create: {
      width: CANVAS_W,
      height: CANVAS_H,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: contentBuffer, left, top }])
    .png()
    .toFile(outPath);

  return true;
}

async function main() {
  const [, , inDir, outDir] = process.argv;
  if (!inDir || !outDir) {
    console.log("Usage: node scripts/normalize-images.js <in_dir> <out_dir>");
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });

  const files = fs
    .readdirSync(inDir)
    .filter((f) => f.toLowerCase().endsWith(".png"))
    .sort();
  if (files.length === 0) {
    console.log(`No .png files found in ${inDir}`);
    process.exit(1);
  }

  console.log(`Normalizing ${files.length} images from ${inDir} -> ${outDir}`);
  let ok = 0;
  for (const f of files) {
    const didWrite = await normalize(path.join(inDir, f), path.join(outDir, f));
    if (didWrite) {
      ok += 1;
      console.log(`  ✓ ${f}`);
    }
  }

  console.log(`\n${ok}/${files.length} normalized.`);
}

main();
