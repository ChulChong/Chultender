#!/usr/bin/env python3
"""Normalize the hand-drawn cocktail illustrations to a consistent size/position.

ChatGPT generated each of the 46 drinks independently, so the drawing's
scale and position on the transparent canvas varies a lot from image to
image. This script:

  1. Finds the bounding box of non-transparent pixels in each PNG.
  2. Scales that content to a fixed height (capped by a max width so wide
     drinks don't overflow the canvas).
  3. Pastes it onto a fixed-size transparent canvas, horizontally centered
     and bottom-aligned to the same baseline.

So every drink ends up rendered at the same scale, sitting on the same
"floor" line, regardless of how ChatGPT happened to frame the original.

Usage:
    python3 scripts/normalize_images.py scripts/new-images scripts/normalized-images
"""
import sys
import os
from PIL import Image

CANVAS_W = 1000
CANVAS_H = 1000
TARGET_H = 860       # scaled content height
MAX_W = 900           # cap width so tall+wide drinks still fit
BOTTOM_MARGIN = 40    # px from canvas bottom to content's bottom edge
ALPHA_THRESHOLD = 10  # pixels with alpha above this count as "content"


def normalize(path, out_path):
    im = Image.open(path).convert("RGBA")
    alpha = im.getchannel("A")
    bbox = alpha.point(lambda p: 255 if p > ALPHA_THRESHOLD else 0).getbbox()
    if bbox is None:
        print(f"  ! {os.path.basename(path)}: fully transparent, skipping")
        return False

    content = im.crop(bbox)
    cw, ch = content.size

    scale = TARGET_H / ch
    if cw * scale > MAX_W:
        scale = MAX_W / cw
    new_w, new_h = max(1, round(cw * scale)), max(1, round(ch * scale))
    content = content.resize((new_w, new_h), Image.LANCZOS)

    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    x = (CANVAS_W - new_w) // 2
    y = CANVAS_H - BOTTOM_MARGIN - new_h
    canvas.paste(content, (x, y), content)
    canvas.save(out_path)
    return True


def main():
    if len(sys.argv) != 3:
        print("Usage: python3 scripts/normalize_images.py <in_dir> <out_dir>")
        sys.exit(1)

    in_dir, out_dir = sys.argv[1], sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)

    files = sorted(f for f in os.listdir(in_dir) if f.lower().endswith(".png"))
    if not files:
        print(f"No .png files found in {in_dir}")
        sys.exit(1)

    print(f"Normalizing {len(files)} images from {in_dir} -> {out_dir}")
    ok = 0
    for f in files:
        if normalize(os.path.join(in_dir, f), os.path.join(out_dir, f)):
            ok += 1
            print(f"  ✓ {f}")

    print(f"\n{ok}/{len(files)} normalized.")


if __name__ == "__main__":
    main()
