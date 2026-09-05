// Derives a theme color straight from an uploaded photo — no image
// library needed, just Canvas: downscale, bucket pixels into a coarse
// histogram, and take the most common bucket's average color. `fontColor`
// is picked from that color's luminance so the drink name stays readable.

const SAMPLE_SIZE = 40;
const BUCKET_STEP = 32; // quantize each channel into 256/32 = 8 levels

function toHex(value) {
  return Math.round(value).toString(16).padStart(2, "0");
}

export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };
    img.src = url;
  });
}

// `image` is a loaded HTMLImageElement (see loadImageFromFile above).
export function extractColor(image) {
  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_SIZE;
  canvas.height = SAMPLE_SIZE;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

  const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const buckets = new Map();

  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a < 128) continue; // skip transparent pixels

    const key = [
      Math.floor(r / BUCKET_STEP),
      Math.floor(g / BUCKET_STEP),
      Math.floor(b / BUCKET_STEP),
    ].join(",");

    const bucket = buckets.get(key) ?? { r: 0, g: 0, b: 0, count: 0 };
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    bucket.count += 1;
    buckets.set(key, bucket);
  }

  let winner = null;
  for (const bucket of buckets.values()) {
    if (!winner || bucket.count > winner.count) winner = bucket;
  }

  if (!winner) {
    return { backgroundColor: "#819651", fontColor: "#ffffff" };
  }

  const r = winner.r / winner.count;
  const g = winner.g / winner.count;
  const b = winner.b / winner.count;
  const backgroundColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

  // WCAG-style relative luminance to decide light vs. dark text.
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const fontColor = luminance > 0.55 ? "#1a1a1a" : "#ffffff";

  return { backgroundColor, fontColor };
}
