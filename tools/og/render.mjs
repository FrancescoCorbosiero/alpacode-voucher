#!/usr/bin/env node
/* ============================================================
   OG card renderer — tools/og/*.svg  ->  public/*.jpg
   (ported from alpacode-website/tools/og/render.mjs)

   Link-preview scrapers (WhatsApp, Facebook, LinkedIn, Telegram…)
   don't render SVG og:images, so the SVGs here are design masters
   and this script rasterises them to the 1200×630 images the pages
   serve. Headless Chrome with the brand fonts (@fontsource) and
   the hero photo (public/media) inlined — no extra dependencies.
   JPEG, not PNG: the cards carry a photo, and WhatsApp drops
   preview images much above ~300 kB.

   Run after editing a card:   npm run og
   Chrome is auto-detected; override with OG_CHROME=/path/to/chrome.
   ============================================================ */
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 630;

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..");
const outDir = join(root, "public");

const FONTS = [
  ["Archivo Black", 400, "@fontsource/archivo-black/files/archivo-black-latin-400-normal.woff2"],
  ["Manrope", 500, "@fontsource/manrope/files/manrope-latin-500-normal.woff2"],
  ["Manrope", 700, "@fontsource/manrope/files/manrope-latin-700-normal.woff2"],
  ["Manrope", 800, "@fontsource/manrope/files/manrope-latin-800-normal.woff2"],
  ["Caveat", 600, "@fontsource/caveat/files/caveat-latin-600-normal.woff2"],
];
const fontCss = FONTS.map(([family, weight, rel]) => {
  const woff2 = readFileSync(join(root, "node_modules", rel)).toString("base64");
  return `@font-face{font-family:"${family}";font-style:normal;font-weight:${weight};src:url(data:font/woff2;base64,${woff2}) format("woff2")}`;
}).join("\n");

const photo = `data:image/jpeg;base64,${readFileSync(join(root, "public", "media", "amici-laptop-800.jpg")).toString("base64")}`;

function findChrome() {
  const candidates = [
    process.env.OG_CHROME,
    "/opt/pw-browsers/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean);
  for (const c of candidates) if (existsSync(c)) return c;
  for (const c of ["google-chrome", "chromium", "chromium-browser"]) {
    try {
      execFileSync("which", [c], { stdio: "pipe" });
      return c;
    } catch {
      /* keep looking */
    }
  }
  throw new Error("No Chrome/Chromium found. Set OG_CHROME=/path/to/chrome and re-run.");
}

const chrome = findChrome();
const work = mkdtempSync(join(tmpdir(), "og-"));
const sources = readdirSync(here).filter((f) => f.endsWith(".svg")).sort();
if (!sources.length) {
  console.error("No .svg sources in tools/og/ — nothing to render.");
  process.exit(1);
}

try {
  for (const [i, file] of sources.entries()) {
    const svg = readFileSync(join(here, file), "utf8").replaceAll("{{PHOTO}}", photo);
    const html = `<!doctype html><meta charset="utf-8"><style>${fontCss}\nhtml,body{margin:0;padding:0}svg{display:block}</style>${svg}`;
    const page = join(work, `page-${i}.html`);
    const shot = join(work, `shot-${i}.png`);
    writeFileSync(page, html);
    execFileSync(
      chrome,
      [
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        // Oversized on purpose: new headless reserves room for a phantom toolbar.
        `--window-size=${WIDTH + 200},${HEIGHT + 200}`,
        "--virtual-time-budget=4000",
        `--screenshot=${shot}`,
        `file://${page}`,
      ],
      { stdio: "pipe" },
    );
    const out = join(outDir, file.replace(/\.svg$/, ".jpg"));
    await sharp(shot)
      .extract({ left: 0, top: 0, width: WIDTH, height: HEIGHT })
      .jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: "4:4:4" })
      .toFile(out);
    const meta = await sharp(out).metadata();
    if (meta.width !== WIDTH || meta.height !== HEIGHT) throw new Error(`${file}: rendered ${meta.width}×${meta.height}`);
    const kb = Math.round(readFileSync(out).length / 1024);
    if (kb > 300) console.warn(`! ${file}: ${kb} kB — WhatsApp may skip previews above ~300 kB`);
    console.log(`✓ ${file} -> public/${file.replace(/\.svg$/, ".jpg")} (${kb} kB)`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
