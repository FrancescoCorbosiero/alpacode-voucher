/** Company facts — the same values as alpacode-website/src/data/business.ts.
 *  Change them there and here together. */
export const business = {
  name: "Soluzioni Digitali Alpacode",
  wordmark: "ALPACODE",
  email: "info@alpacode.it",
  vat: "14463350968",
  /** WhatsApp number, international format, digits only. Only ever used in
   *  the wa.me click-to-chat link, never rendered as visible text. */
  whatsapp: "393514003240",
  locations: { it: "Monza · Milano · Italia", en: "Monza · Milan · Italy" },
  /** The main website — every "alpacode.it" link points here. */
  website: "https://alpacode.it",
  websiteLabel: "alpacode.it",
  linkedin: "https://www.linkedin.com/company/soluzioni-digitali-alpacode/",
} as const;

/** Pages of the main website this landing links to. */
export const websiteLinks = {
  home: { it: "https://alpacode.it/", en: "https://alpacode.it/en/" },
  partner: { it: "https://alpacode.it/partner/", en: "https://alpacode.it/en/partner/" },
  privacy: { it: "https://alpacode.it/privacy/", en: "https://alpacode.it/en/privacy/" },
  cookie: { it: "https://alpacode.it/cookie/", en: "https://alpacode.it/en/cookie/" },
  terms: { it: "https://alpacode.it/termini/", en: "https://alpacode.it/en/termini/" },
} as const;
