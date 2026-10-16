import { business } from "../data/business";
import type { Lang } from "../i18n/types";

const locale = (lang: Lang) => (lang === "it" ? "it-IT" : "en-US");

/** The studio — the same Organization the main site publishes, by @id. */
export function organizationSchema() {
  const site = `${business.website}/`;
  return {
    "@type": "Organization",
    "@id": `${site}#org`,
    name: business.name,
    alternateName: "Alpacode",
    url: site,
    email: business.email,
    vatID: `IT${business.vat}`,
    logo: `${site}logo.png`,
    areaServed: ["Monza", "Milano", "Italia"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Monza",
      addressRegion: "MB",
      addressCountry: "IT",
    },
    sameAs: [business.linkedin],
  };
}

export function webPageSchema(opts: { url: string; name: string; description: string; lang: Lang }) {
  return {
    "@type": "WebPage",
    url: opts.url,
    name: opts.name,
    description: opts.description,
    inLanguage: locale(opts.lang),
    publisher: { "@id": `${business.website}/#org` },
  };
}

export function faqPageSchema(faqs: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
