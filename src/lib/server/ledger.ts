/* ============================================================
   Referral ledger — one JSON object per line, appended for every
   accepted submission (REFERRAL_LEDGER, default ./data/referrals.jsonl).

   Why a file: the program's rules need memory ("a person can be
   referred only once", "who owns code MARIO-7K2QX?") and email
   alone can't answer that. A JSONL file is grep-able, trivially
   backed up and good for thousands of rows — the scale of a
   studio's referral program. The ledger never blocks a request:
   if it can't be written, the API logs a warning and carries on
   (the email still goes out, and the log keeps the submission).
   ============================================================ */
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { readEnv } from "./env";

export interface Person {
  name: string;
  email: string;
  phone: string;
}

export type LedgerEntry =
  | { t: string; kind: "referrer"; lang: string; code: string; referrer: Person; payout: string }
  | {
      t: string;
      kind: "direct";
      lang: string;
      code: string;
      referrer: Person;
      payout: string;
      friend: Person & { need: string; note: string };
    }
  | { t: string; kind: "friend"; lang: string; ref: string; friend: Person & { need: string; message: string } };

function ledgerPath(): string | null {
  const p = readEnv("REFERRAL_LEDGER") ?? "./data/referrals.jsonl";
  return p === "off" ? null : resolve(p);
}

let warned = false;
function warnOnce(err: unknown): void {
  if (warned) return;
  warned = true;
  console.warn(`[referral] ledger unavailable (${(err as Error)?.message ?? err}) — submissions are still emailed and logged.`);
}

/** True when the entry is safely on disk. */
export async function append(entry: LedgerEntry): Promise<boolean> {
  const path = ledgerPath();
  if (!path) return false;
  try {
    await mkdir(dirname(path), { recursive: true });
    await appendFile(path, JSON.stringify(entry) + "\n", "utf8");
    return true;
  } catch (err) {
    warnOnce(err);
    return false;
  }
}

async function readAll(): Promise<LedgerEntry[]> {
  const path = ledgerPath();
  if (!path) return [];
  try {
    const raw = await readFile(path, "utf8");
    const out: LedgerEntry[] = [];
    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      try {
        out.push(JSON.parse(line) as LedgerEntry);
      } catch {
        /* a torn line: skip it */
      }
    }
    return out;
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code !== "ENOENT") warnOnce(err);
    return [];
  }
}

/** The person behind a code (latest registration wins). */
export async function referrerByCode(code: string): Promise<Person | null> {
  const rows = await readAll();
  for (let i = rows.length - 1; i >= 0; i--) {
    const r = rows[i];
    if (r && (r.kind === "referrer" || r.kind === "direct") && r.code === code) return r.referrer;
  }
  return null;
}

const normEmail = (e: string) => e.trim().toLowerCase();
const normPhone = (p: string) => p.replace(/[^\d+]/g, "").replace(/^00/, "+").replace(/^\+39/, "");

/** First earlier referral of the same person (by email or phone), if any. */
export async function priorReferral(friend: { email: string; phone: string }): Promise<LedgerEntry | null> {
  const email = friend.email ? normEmail(friend.email) : "";
  const phone = friend.phone ? normPhone(friend.phone) : "";
  if (!email && phone.length < 6) return null;
  const rows = await readAll();
  for (const r of rows) {
    if (r.kind !== "direct" && r.kind !== "friend") continue;
    const f = r.friend;
    if (email && f.email && normEmail(f.email) === email) return r;
    if (phone.length >= 6 && f.phone && normPhone(f.phone) === phone) return r;
  }
  return null;
}
