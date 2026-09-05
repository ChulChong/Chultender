// Re-uploads freshly generated cocktail images over the existing ones in
// Supabase Storage. Since every cocktail's image_url already points at
// `cocktail-photos/<id>.png` (see migrate-cocktails.js), overwriting the
// object at that same path is enough — no database update needed, the
// same public URL just starts serving the new image.
//
// Usage:
//   1. Save each generated image as <id>.png (see scripts/cocktail-photo-prompts.md
//      for the id/filename per drink) into a local folder, e.g. scripts/new-images/.
//   2. node scripts/reupload-cocktail-images.js scripts/new-images

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = require("ws");
}
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY in .env.local.");
  process.exit(1);
}

const imagesDir = process.argv[2];
if (!imagesDir) {
  console.error("Usage: node scripts/reupload-cocktail-images.js <folder-of-images>");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  const files = fs.readdirSync(imagesDir).filter((f) => f.toLowerCase().endsWith(".png"));
  if (files.length === 0) {
    console.error(`No .png files found in ${imagesDir}`);
    process.exit(1);
  }
  console.log(`Found ${files.length} images in ${imagesDir}. Uploading...`);

  let succeeded = 0;
  const failed = [];

  for (const file of files) {
    const filePath = path.join(imagesDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    try {
      const { error } = await supabase.storage
        .from("cocktail-photos")
        .upload(file, fileBuffer, { contentType: "image/png", upsert: true });
      if (error) throw error;
      succeeded += 1;
      console.log(`  ✓ ${file}`);
    } catch (error) {
      failed.push(file);
      console.error(`  ✗ ${file}: ${error.message || error}`);
    }
  }

  console.log(`\n${succeeded}/${files.length} uploaded.`);
  if (failed.length > 0) {
    console.log(`${failed.length} failed — re-run this script to retry (upserts are safe).`);
    process.exitCode = 1;
  }
}

main();
