#!/usr/bin/env node
/* ============================================================
   Hero photo variants — tools/media/*.jpg -> public/media/
   The invite page renders on demand, where Astro's image service
   would re-encode on every request; so the responsive variants
   (AVIF, WebP, JPEG at three widths) are produced once, here, and
   served as static files by both pages (src/components/HeroPhoto).

   Run after replacing the master photo:   npm run media
   The master is the flyer's photo, upscaled 3x (EDSR) from the
   1024px flyer. Drop a sharper original over it and re-run.
   ============================================================ */
import { mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "..", "..", "public", "media");
mkdirSync(out, { recursive: true });

const MASTERS = ["amici-laptop"];
const WIDTHS = [480, 800, 1180];

for (const name of MASTERS) {
  const src = join(here, `${name}.jpg`);
  const meta = await sharp(src).metadata();
  for (const w of WIDTHS) {
    const width = Math.min(w, meta.width ?? w);
    const base = sharp(src).resize({ width, withoutEnlargement: true });
    const jobs = [
      [base.clone().avif({ quality: 52, effort: 6 }), "avif"],
      [base.clone().webp({ quality: 74 }), "webp"],
      [base.clone().jpeg({ quality: 78, progressive: true, mozjpeg: true }), "jpg"],
    ];
    for (const [pipeline, ext] of jobs) {
      const file = join(out, `${name}-${w}.${ext}`);
      await pipeline.toFile(file);
      console.log(`✓ public/media/${name}-${w}.${ext} (${Math.round(statSync(file).size / 1024)} kB)`);
    }
  }
}
