/* ============================================================
   Referral codes — shared by the API (which issues them) and the
   pages (which read them back out of invite links).

   Shape: <FIRST NAME>-<5 chars>, e.g. MARIO-7K2QX.
   - The prefix is the referrer's first name in plain ASCII, so the
     invite page can greet the friend by name without a database.
   - The suffix is Crockford base32 of an HMAC of the referrer's
     email (see src/lib/server/codes.ts): the same email always gets
     the same code, so a lost link is regenerated, not re-issued.
   ============================================================ */
import type { Lang } from "../i18n/types";

/** Crockford base32 alphabet: no I, L, O, U — nothing to misread. */
export const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export const CODE_RE = /^[A-Z]{1,12}-[0-9A-HJKMNP-TV-Z]{5}$/;

/** Prefixes used when a name has no Latin letters to keep. */
export const ANON_PREFIX: Record<Lang, string> = { it: "AMICO", en: "FRIEND" };

/** "Niccolò Rossi" -> "NICCOLO". Max 12 letters. */
export function codePrefix(fullName: string, lang: Lang = "it"): string {
  const first = fullName.trim().split(/\s+/)[0] ?? "";
  const ascii = first
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  return (ascii || ANON_PREFIX[lang]).slice(0, 12);
}

/** Uppercases and validates a code coming from a URL or a form. */
export function normalizeCode(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const c = raw.trim().toUpperCase();
  return CODE_RE.test(c) ? c : null;
}

/** "MARIO-7K2QX" -> "Mario"; null for the anonymous prefixes. */
export function nameFromCode(code: string): string | null {
  const p = code.split("-")[0] ?? "";
  if (!p || Object.values(ANON_PREFIX).includes(p)) return null;
  return p.charAt(0) + p.slice(1).toLowerCase();
}

/** Root-relative path of a referrer's invite page. */
export function invitePath(code: string, lang: Lang): string {
  return lang === "en" ? `/en/invito/${code}` : `/invito/${code}`;
}

/** First name for greetings: "mario rossi" -> "Mario". */
export function firstName(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0] ?? "";
  return first ? first.charAt(0).toLocaleUpperCase() + first.slice(1) : "";
}
