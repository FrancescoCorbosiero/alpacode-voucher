import { DEFAULT_LANG, type Lang } from "./types";

const trim = (slug: string) => slug.replace(/^\/+|\/+$/g, "");

/**
 * Localized, root-relative URL for a slug (same convention as
 * alpacode-website): Italian at the root, English under /en/, pages with
 * a trailing slash.
 *   localizePath("",        "it") -> "/"
 *   localizePath("privacy", "en") -> "/en/privacy/"
 */
export function localizePath(slug: string, lang: Lang): string {
  const [rawPath, ...hashParts] = trim(slug).split("#");
  const clean = rawPath ?? "";
  const hash = hashParts.length ? `#${hashParts.join("#")}` : "";
  const suffix = clean && !clean.includes(".") ? "/" : "";
  if (lang === DEFAULT_LANG) {
    return clean ? `/${clean}${suffix}${hash}` : `/${hash}`;
  }
  return clean ? `/en/${clean}${suffix}${hash}` : `/en/${hash}`;
}

export function otherLang(lang: Lang): Lang {
  return lang === "it" ? "en" : "it";
}

/** Replace {key} placeholders in a copy string. */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => values[k] ?? m);
}
