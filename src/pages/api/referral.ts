/* ============================================================
   POST /api/referral — the program's only endpoint.

   kind "referrer"  name + email (+ phone, payout) -> issues the
                    personal code and invite link.
   kind "direct"    the referrer's details + the friend's (name,
                    email and/or phone, need, note) and an explicit
                    "they agreed to be contacted" tick.
   kind "friend"    a request sent from an invite page, carrying
                    the referral code (or none, for a direct visit).

   Every accepted submission is appended to the ledger and emailed
   to the studio (SES; without AWS_REGION it is logged instead, so
   the flow is testable locally). A submission is only refused when
   it would otherwise be lost: mail failed AND ledger unavailable.
   Abuse guards mirror alpacode.it's /api/contact.
   ============================================================ */
import type { APIRoute } from "astro";
import { business } from "../../data/business";
import { shared, type NeedId, type PayoutId } from "../../data/shared";
import { invitePath, nameFromCode, normalizeCode } from "../../lib/referral-code";
import { issueCode } from "../../lib/server/codes";
import { append, priorReferral, referrerByCode, type LedgerEntry, type Person } from "../../lib/server/ledger";
import { sendMail } from "../../lib/server/mail";
import { readEnv } from "../../lib/server/env";
import type { Lang } from "../../i18n/types";

export const prerender = false;

const MAX_BODY_BYTES = 20_000;
const MAX_FIELD = 200;
const RATE_LIMIT = 8; // submissions…
const RATE_WINDOW_MS = 10 * 60_000; // …per IP per window

const PAYOUTS: PayoutId[] = ["bonifico", "paypal", "buono"];
const NEEDS: NeedId[] = ["sito", "ecommerce", "software", "formazione", "altro"];
const NEED_LABEL: Record<NeedId, string> = {
  sito: "Sito web",
  ecommerce: "E-commerce",
  software: "Software / gestionale",
  formazione: "Formazione",
  altro: "Non lo sa ancora",
};

/* ---------- guards ---------- */
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_WINDOW_MS;
  const recent = (hits.get(ip) ?? []).filter((t) => t > cutoff);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 1000) {
    for (const [k, v] of hits) if (!v.some((t) => t > cutoff)) hits.delete(k);
  }
  return recent.length > RATE_LIMIT;
}

/** Behind Cloudflare prefer CF-Connecting-IP; behind Caddy alone the last
 *  X-Forwarded-For entry is the one our proxy wrote (see alpacode.it). */
function clientIp(request: Request, fallback: string): string {
  const cf = request.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;
  const last = request.headers.get("x-forwarded-for")?.split(",").pop()?.trim();
  return last || fallback;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

const isEmail = (v: string) => v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const str = (v: unknown, max = MAX_FIELD): string => (typeof v === "string" ? v : "").trim().slice(0, max);
const oneOf = <T extends string>(v: unknown, list: readonly T[], fallback: T): T =>
  list.includes(v as T) ? (v as T) : fallback;

function siteOrigin(): string {
  return (readEnv("SITE_URL") ?? import.meta.env.SITE ?? "https://voucher.alpacode.it").replace(/\/+$/, "");
}

const ROME: Intl.DateTimeFormatOptions = {
  timeZone: "Europe/Rome",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};
const stamp = (d = new Date()) => d.toLocaleString("it-IT", ROME);

const lines = (rows: (string | null | false | undefined)[]) => rows.filter((r): r is string => typeof r === "string").join("\n");

function person(body: Record<string, unknown>): Person {
  return { name: str(body.name, 120), email: str(body.email), phone: str(body.phone, 40) };
}

function personLines(label: string, p: Person): string[] {
  return [`${label}: ${p.name}`, `Email: ${p.email || "—"}`, `Telefono: ${p.phone || "—"}`];
}

/* ---------- route ---------- */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ ok: false, error: "unsupported_media_type" }, 415);
  }
  let ip = "unknown";
  try {
    ip = clientIp(request, clientAddress);
  } catch {
    /* clientAddress can throw outside the node server */
  }
  if (rateLimited(ip)) return json({ ok: false, error: "rate_limited" }, 429);

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return json({ ok: false, error: "payload_too_large" }, 413);
    body = JSON.parse(raw) as Record<string, unknown>;
    if (!body || typeof body !== "object") throw new Error("not an object");
  } catch {
    return json({ ok: false, error: "invalid_body" }, 400);
  }

  // Honeypot: pretend all went well, keep nothing.
  if (str(body.website) !== "") return json({ ok: true });

  const kind = str(body.kind);
  const lang: Lang = body.lang === "en" ? "en" : "it";
  if (body.consent !== true) return json({ ok: false, error: "consent" }, 422);

  const site = siteOrigin();
  const t = new Date().toISOString();

  /* ---- 1. A referrer asks for a personal link ---- */
  if (kind === "referrer") {
    const referrer = person(body);
    if (referrer.name.length < 2 || !isEmail(referrer.email)) return json({ ok: false, error: "validation" }, 422);
    const payout = oneOf(body.payout, PAYOUTS, "bonifico");
    const code = issueCode(referrer.name, referrer.email, lang);
    const link = `${site}${invitePath(code, lang)}`;

    const stored = await append({ t, kind: "referrer", lang, code, referrer, payout });
    const mailed = await sendMail({
      subject: `Nuovo link di segnalazione · ${code} · ${referrer.name}`,
      replyTo: referrer.email,
      text: lines([
        "Qualcuno ha generato il proprio link per il programma «Segnala un amico».",
        "",
        `Codice: ${code}`,
        `Link: ${link}`,
        ...personLines("Segnalatore", referrer),
        `Cashback preferito: ${payoutLabel(payout)}`,
        `Lingua: ${lang}`,
        `Data: ${stamp()}`,
        "",
        "Le richieste che arriveranno da questo link riportano lo stesso codice nell'oggetto.",
      ]),
    });
    if (mailed === "failed" && !stored) return json({ ok: false, error: "send_failed" }, 503);
    await confirmToReferrer(referrer, code, link, lang);
    return json({ ok: true, code, link });
  }

  /* ---- 2. A referrer sends us a friend's details ---- */
  if (kind === "direct") {
    const referrer = person(body);
    const f = (body.friend && typeof body.friend === "object" ? body.friend : {}) as Record<string, unknown>;
    const friend = {
      name: str(f.name, 120),
      email: str(f.email),
      phone: str(f.phone, 40),
      need: oneOf(f.need, NEEDS, "altro"),
      note: str(f.note, 1500),
    };
    if (referrer.name.length < 2 || !isEmail(referrer.email) || friend.name.length < 2) {
      return json({ ok: false, error: "validation" }, 422);
    }
    if (!friend.email && !friend.phone) return json({ ok: false, error: "contact" }, 422);
    if (friend.email && !isEmail(friend.email)) return json({ ok: false, error: "validation" }, 422);
    if (body.friendConsent !== true) return json({ ok: false, error: "consent" }, 422);

    const payout = oneOf(body.payout, PAYOUTS, "bonifico");
    const code = issueCode(referrer.name, referrer.email, lang);
    const link = `${site}${invitePath(code, lang)}`;
    const prior = await priorReferral(friend);

    const stored = await append({ t, kind: "direct", lang, code, referrer, payout, friend });
    const mailed = await sendMail({
      subject: `${prior ? "[GIÀ SEGNALATA] " : ""}Segnalazione diretta · ${friend.name} · da ${referrer.name} (${code})`,
      replyTo: referrer.email,
      text: lines([
        "Nuova segnalazione diretta: il segnalatore dichiara di aver informato la persona e di avere il suo consenso a essere contattata.",
        "",
        ...personLines("Persona segnalata", friend),
        `Le serve: ${NEED_LABEL[friend.need]}`,
        friend.note ? `Note: ${friend.note}` : null,
        "",
        ...personLines("Segnalatore", referrer),
        `Codice: ${code}`,
        `Cashback preferito: ${payoutLabel(payout)}`,
        prior ? "" : null,
        prior ? priorNote(prior) : null,
        "",
        `Lingua: ${lang} · Data: ${stamp()}`,
        "Al primo contatto conferma con la persona che è d'accordo a essere contattata (informativa del programma).",
      ]),
    });
    if (mailed === "failed" && !stored) return json({ ok: false, error: "send_failed" }, 503);
    await confirmToReferrer(referrer, code, link, lang);
    return json({ ok: true, code, link });
  }

  /* ---- 3. A friend writes to us from an invite ---- */
  if (kind === "friend") {
    const friend = { ...person(body), need: oneOf(body.need, NEEDS, "altro"), message: str(body.message, 3000) };
    if (friend.name.length < 2 || !isEmail(friend.email)) return json({ ok: false, error: "validation" }, 422);
    const ref = normalizeCode(str(body.ref, 40)) ?? "";
    const owner = ref ? await referrerByCode(ref) : null;
    const prior = await priorReferral(friend);

    const stored = await append({ t, kind: "friend", lang, ref, friend });
    const refLine = !ref
      ? "Segnalatore: nessuno (visita diretta alla pagina invito)"
      : owner
        ? `Segnalatore: ${owner.name} · ${owner.email}${owner.phone ? ` · ${owner.phone}` : ""} (codice ${ref})`
        : `Segnalatore: ${nameFromCode(ref) ?? "—"} · codice ${ref} (non nel registro: cerca il codice nella casella)`;
    const mailed = await sendMail({
      subject: `${prior ? "[GIÀ SEGNALATA] " : ""}${ref ? `Richiesta da invito · ${ref}` : "Richiesta dalla pagina invito"} · ${friend.name}`,
      replyTo: friend.email,
      text: lines([
        "Nuova richiesta dal programma «Segnala un amico» (consenso privacy prestato nel modulo).",
        "",
        `Nome: ${friend.name}`,
        `Email: ${friend.email}`,
        `Telefono: ${friend.phone || "—"}`,
        `Gli serve: ${NEED_LABEL[friend.need]}`,
        friend.message ? "" : null,
        friend.message || null,
        "",
        refLine,
        prior ? priorNote(prior) : null,
        "",
        `Lingua: ${lang} · Data: ${stamp()}`,
      ]),
    });
    if (mailed === "failed" && !stored) return json({ ok: false, error: "send_failed" }, 503);
    return json({ ok: true });
  }

  return json({ ok: false, error: "invalid_kind" }, 400);
};

function payoutLabel(id: PayoutId): string {
  return shared.it.payouts.find((p) => p.id === id)?.short ?? id;
}

function priorNote(prior: LedgerEntry): string {
  const when = stamp(new Date(prior.t));
  const via =
    prior.kind === "direct"
      ? `segnalazione diretta di ${prior.referrer.name} (${prior.code})`
      : prior.kind === "friend"
        ? `richiesta da invito ${prior.ref || "senza codice"}`
        : "registro";
  return `ATTENZIONE: questa persona risulta già segnalata il ${when} (${via}). Vale la prima segnalazione valida.`;
}

/** Optional: the referrer gets their link by email too
 *  (REFERRAL_CONFIRM_EMAILS=1 — needs SES out of the sandbox). */
async function confirmToReferrer(referrer: Person, code: string, link: string, lang: Lang): Promise<void> {
  if (readEnv("REFERRAL_CONFIRM_EMAILS") !== "1") return;
  const it = lang === "it";
  const first = referrer.name.split(/\s+/)[0] ?? "";
  await sendMail({
    to: referrer.email,
    replyTo: readEnv("CONTACT_TO_EMAIL") ?? business.email,
    subject: it ? "Il tuo link Alpacode per segnalare un amico" : "Your Alpacode link to refer a friend",
    text: it
      ? lines([
          `Ciao ${first},`,
          "",
          "ecco il tuo link personale del programma «Segnala un amico»:",
          link,
          "",
          `Il tuo codice: ${code}`,
          "",
          "Mandalo a chi pensi possa servire un sito web o un e-commerce. Se diventa nostro cliente ricevi fino a 100 € di cashback, con bonifico, PayPal o buono acquisto. Ti scriviamo noi a ogni passo.",
          "",
          "Il link resta sempre lo stesso: se lo perdi, rigeneralo con questa email.",
          "",
          "Il team Alpacode",
          business.website,
        ])
      : lines([
          `Hi ${first},`,
          "",
          "here is your personal link for the refer-a-friend program:",
          link,
          "",
          `Your code: ${code}`,
          "",
          "Send it to anyone who might need a website or an online store. If they become our client you get up to €100 cashback, by bank transfer, PayPal or voucher. We'll keep you posted at every step.",
          "",
          "The link never changes: if you lose it, generate it again with this email.",
          "",
          "The Alpacode team",
          business.website,
        ]),
  });
}
