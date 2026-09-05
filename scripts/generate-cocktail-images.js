// Generates each cocktail's photo with the OpenAI Images API and uploads
// it straight to Supabase Storage (upsert) — the fully automated
// alternative to scripts/cocktail-photo-prompts.md +
// reupload-cocktail-images.js. Same prompt style, same storage path
// convention (cocktail-photos/<id>.png), so image_url doesn't need any
// database update either.
//
// Setup: add OPENAI_API_KEY=... to .env.local (needs billing enabled on
// the OpenAI account — image generation isn't free).
//
// Usage:
//   node scripts/generate-cocktail-images.js              # all 46
//   node scripts/generate-cocktail-images.js mintjulep     # just one, to preview first

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = require("ws");
}
const { createClient } = require("@supabase/supabase-js");
const OpenAI = require("openai");

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY in .env.local.");
  process.exit(1);
}
if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in .env.local.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const RECIPES_PATH = path.join(__dirname, "..", "src", "components", "Recipes.js");

// Same text-parsing approach as migrate-cocktails.js — Recipes.js is an ES
// module (webpack `import x from "*.png"` asset imports) that plain Node
// can't require directly.
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
    if (!filename) throw new Error(`No matching image import for \`${identifier}\` in Recipes.js`);
    return `image: ${JSON.stringify(filename)},`;
  });

  // Trusted local source file, not user input — safe to evaluate.
  // eslint-disable-next-line no-new-func
  return new Function(`return ${arrayLiteral};`)();
}

const GLASS_NAMES = {
  ontherock: "rocks (old fashioned) glass",
  highball: "highball glass",
  flute: "champagne flute",
  coupe: "coupe glass",
  martini: "martini glass",
  julep: "polished silver julep cup",
};

function buildPrompt(recipe) {
  const glass = GLASS_NAMES[recipe.cup] || "cocktail glass";
  const ingredientsText = recipe.ingredients.filter(Boolean).join(", ");
  return (
    `Professional product photography of a "${recipe.name}" cocktail served in a ${glass}, ` +
    `made with: ${ingredientsText}. Crushed or cubed ice as appropriate, garnished ` +
    `appropriately for the drink, clean white background, soft professional studio lighting, ` +
    `sharp focus, photorealistic, high resolution, no text or watermark.`
  );
}

async function generateAndUpload(recipe) {
  const prompt = buildPrompt(recipe);

  const result = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "1024x1024",
    quality: "medium",
  });

  const b64 = result.data[0].b64_json;
  const buffer = Buffer.from(b64, "base64");

  const storagePath = `${recipe.id}.png`;
  const { error: uploadError } = await supabase.storage
    .from("cocktail-photos")
    .upload(storagePath, buffer, { contentType: "image/png", upsert: true });
  if (uploadError) throw uploadError;
}

async function main() {
  const recipes = loadRecipes();
  const filterId = process.argv[2];
  const targets = filterId ? recipes.filter((r) => r.id === filterId) : recipes;

  if (filterId && targets.length === 0) {
    console.error(`No cocktail with id "${filterId}" found.`);
    process.exit(1);
  }

  console.log(`Generating ${targets.length} image(s)...`);

  let succeeded = 0;
  const failed = [];

  for (const recipe of targets) {
    try {
      await generateAndUpload(recipe);
      succeeded += 1;
      console.log(`  ✓ ${recipe.name}`);
    } catch (error) {
      failed.push(recipe.name);
      console.error(`  ✗ ${recipe.name}: ${error.message || error}`);
    }
    // Small pause between requests to stay well under rate limits.
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`\n${succeeded}/${targets.length} generated and uploaded.`);
  if (failed.length > 0) {
    console.log(`${failed.length} failed — re-run (upserts are safe) to retry just those.`);
    process.exitCode = 1;
  }
}

main();
