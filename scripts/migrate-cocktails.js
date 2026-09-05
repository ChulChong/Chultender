// One-off migration: reads the 46 hand-coded cocktails out of
// src/components/Recipes.js and upserts them into Supabase (table
// `cocktails`, storage bucket `cocktail-photos`), carrying over each
// drink's already hand-picked background/font color as-is.
//
// Usage (after filling in .env.local — see .env.local.example):
//   node scripts/migrate-cocktails.js
//
// Safe to re-run: both the storage upload and the table write use
// upsert, so a partial failure can just be retried.

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
// Node 20 has no global WebSocket (added in 22); supabase-js's realtime
// client needs one to even construct, though this script never uses
// realtime — polyfill with the `ws` package already in node_modules.
if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = require("ws");
}
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "Missing REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY in .env.local — copy .env.local.example and fill it in first."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const RECIPES_PATH = path.join(__dirname, "..", "src", "components", "Recipes.js");
const IMAGE_DIR = path.join(__dirname, "..", "src", "image");

// Recipes.js is an ES module (webpack `import x from "*.png"` asset
// imports) that plain Node can't require directly. It's parsed as text
// instead: build an { identifier -> filename } map from the import lines,
// then substitute those identifiers into the `recipes` array literal so
// it becomes plain, evaluable JS (see below) — no build step needed.
function loadRecipes() {
  const source = fs.readFileSync(RECIPES_PATH, "utf8");

  const imageMap = {};
  const importRegex = /import (\w+) from "\.\.\/image\/([^"]+)";/g;
  let match;
  while ((match = importRegex.exec(source))) {
    imageMap[match[1]] = match[2];
  }

  const arrayMatch = source.match(/export const recipes = (\[[\s\S]*\]);/);
  if (!arrayMatch) {
    throw new Error("Could not find `export const recipes = [...]` in Recipes.js");
  }

  const arrayLiteral = arrayMatch[1].replace(/image:\s*(\w+),/g, (full, identifier) => {
    const filename = imageMap[identifier];
    if (!filename) {
      throw new Error(`No matching image import for \`${identifier}\` in Recipes.js`);
    }
    return `image: ${JSON.stringify(filename)},`;
  });

  // Trusted local source file, not user input — safe to evaluate.
  // eslint-disable-next-line no-new-func
  return new Function(`return ${arrayLiteral};`)();
}

async function migrateOne(recipe) {
  const imagePath = path.join(IMAGE_DIR, recipe.image);
  const fileBuffer = fs.readFileSync(imagePath);
  const storagePath = `${recipe.id}.png`;

  const { error: uploadError } = await supabase.storage
    .from("cocktail-photos")
    .upload(storagePath, fileBuffer, { contentType: "image/png", upsert: true });
  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from("cocktail-photos")
    .getPublicUrl(storagePath);

  const { error: upsertError } = await supabase.from("cocktails").upsert(
    {
      id: recipe.id,
      name: recipe.name,
      ingredients: recipe.ingredients,
      details: recipe.details,
      cup: recipe.cup,
      image_url: publicUrlData.publicUrl,
      background_color: recipe.backgroundcolor,
      font_color: recipe.fontcolor,
      is_show: recipe.IsShow ?? true,
    },
    { onConflict: "id" }
  );
  if (upsertError) throw upsertError;
}

async function main() {
  const recipes = loadRecipes();
  console.log(`Found ${recipes.length} cocktails in Recipes.js. Migrating...`);

  let succeeded = 0;
  const failed = [];

  for (const recipe of recipes) {
    try {
      await migrateOne(recipe);
      succeeded += 1;
      console.log(`  ✓ ${recipe.name}`);
    } catch (error) {
      failed.push({ name: recipe.name, error });
      console.error(`  ✗ ${recipe.name}: ${error.message || error}`);
    }
  }

  console.log(`\n${succeeded}/${recipes.length} migrated.`);
  if (failed.length > 0) {
    console.log(`${failed.length} failed — re-run this script to retry (upserts are safe).`);
    process.exitCode = 1;
  }
}

main();
