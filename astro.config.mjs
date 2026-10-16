// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";

/* Public origin of this landing. It ends up in canonicals, og:url, the QR
   code and — most importantly — in every personal invite link the API
   hands out, so set it to the real domain before building for production
   (Docker passes it as a build arg). */
const SITE_URL = (process.env.SITE_URL || "https://voucher.alpacode.it").replace(/\/+$/, "");

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  // Static by default: the landing and the privacy notice are prerendered.
  // The invite page (/invito/<code>) and /api/referral opt out and run on
  // the standalone Node server.
  output: "static",
  adapter: node({ mode: "standalone" }),
  i18n: {
    locales: ["it", "en"],
    defaultLocale: "it",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  // The sticker counter, the forms and the share panel live in a single
  // page; nothing to prefetch.
  prefetch: false,
});
