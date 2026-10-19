/* ============================================================
   Landing behaviour — vanilla TS, no dependencies beyond the QR
   encoder. In order:
   1. the sticker counts up to its amount (motion-safe only);
   2. the payout choice stays in sync everywhere on the page;
   3. tabs (ARIA pattern, arrow keys);
   4. the live chat-bubble preview follows what you type;
   5. both forms post to /api/referral and end on the share panel;
   6. the share panel: copy, WhatsApp, Telegram, email, native
      share, a QR of the invite (also swapped into the QR band) —
      a fresh link arrives decoding itself, its QR prints and the
      page celebrates (the moves live in lib/motion.ts);
   7. a generated link is remembered in this browser only.
   ============================================================ */
import { qrSvg } from "../lib/qr";
import { codePrefix, firstName } from "../lib/referral-code";
import { scrollToTarget, panelEnter, revealPanel, nudge, scramble, printQr, celebrate } from "../lib/motion";
import {
  checked,
  errorText,
  postReferral,
  setBusy,
  setStatus,
  validate,
  value,
  wireLiveClear,
  isEmail,
  markInvalid,
  type FormErrors,
} from "./forms";

interface StudioI18n {
  lang: "it" | "en";
  site: string;
  message: string;
  emailSubject: string;
  resultTitle: string;
  welcomeBack: string;
  copied: string;
  copy: string;
  cardTitle: string;
  cardTitleAnon: string;
  pending: string;
  directBody: string;
  sending: string;
  errors: FormErrors;
  qrLabel: string;
  qrTitle: string;
  qrBody: string;
  invitePrefix: string;
}

interface Stored {
  name: string;
  code: string;
  link: string;
  t: number;
}

const STORE_KEY = "alpacode_referral_v1";
const CONTACT_EMAIL = "info@alpacode.it";
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

/* ---------- 1. Sticker counter ---------- */
function countUp(): void {
  const live = $("[data-count-to]");
  if (!live || reduced) return;
  const to = Number(live.dataset.countTo) || 0;
  const tpl = live.dataset.countTemplate ?? "{n}";
  if (!to) return;
  const delay = 520;
  const dur = 1100;
  const start = performance.now() + delay;
  live.textContent = tpl.replace("{n}", "0");
  const ease = (t: number) => 1 - Math.pow(2, -10 * t);
  const frame = (now: number) => {
    const t = Math.min(1, Math.max(0, (now - start) / dur));
    live.textContent = tpl.replace("{n}", String(Math.round(ease(t) * to)));
    if (t < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/* ---------- 2. Payout sync ---------- */
function syncPayouts(): void {
  document.addEventListener("change", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLInputElement) || !t.checked) return;
    if (t.name !== "payout" && t.name !== "payout-pick") return;
    $$<HTMLInputElement>('input[name="payout"], input[name="payout-pick"]').forEach((r) => {
      if (r !== t) r.checked = r.value === t.value;
    });
  });
}

/* ---------- 3. Tabs ---------- */
function tabs(root: HTMLElement): void {
  const list = $$<HTMLButtonElement>("[role='tab']", root);
  const select = (tab: HTMLButtonElement, focus = false) => {
    const from = list.findIndex((t) => t.getAttribute("aria-selected") === "true");
    const to = list.indexOf(tab);
    list.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls") ?? "");
      if (panel) panel.hidden = !on;
      // The new panel slides in from the side of the tab it came from.
      if (panel && on && from !== to) panelEnter(panel, to > from ? 1 : -1);
    });
    if (focus) tab.focus();
  };
  list.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (e) => {
      const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      let next: number | null = null;
      if (e.key in keys) next = (i + (keys[e.key] ?? 0) + list.length) % list.length;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = list.length - 1;
      const target = next === null ? undefined : list[next];
      if (!target) return;
      e.preventDefault();
      select(target, true);
    });
  });
}

/* ---------- 4. Live preview ---------- */
function preview(i18n: StudioI18n) {
  const text = $("[data-preview-text]");
  const title = $("[data-preview-title]");
  const time = $("[data-preview-time]");
  if (time) {
    const d = new Date();
    time.textContent = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  const render = (name: string, link?: string) => {
    const first = firstName(name);
    const placeholderLink = `${i18n.invitePrefix}${first ? codePrefix(name, i18n.lang) : "…"}${first ? "-•••••" : ""}`;
    if (text) text.textContent = i18n.message.replace("{link}", link ?? placeholderLink);
    if (title) title.textContent = first ? i18n.cardTitle.replace("{name}", first) : i18n.cardTitleAnon;
  };
  const input = $<HTMLInputElement>("[data-preview-name]");
  input?.addEventListener("input", () => render(input.value));
  return { render };
}

/* ---------- 6. Share panel ---------- */
function sharePanel(i18n: StudioI18n, onReset: () => void) {
  const forms = $("[data-forms]");
  const result = $("[data-result]");
  const titleEl = $("[data-result-title]");
  const linkEl = $<HTMLInputElement>("[data-result-link]");
  const codeEl = $("[data-result-code]");
  const msgEl = $<HTMLTextAreaElement>("[data-result-message]");
  const qrEl = $("[data-result-qr]");
  const notice = $("[data-result-notice]");
  const noticeBody = $("[data-result-notice-body]");
  const copyBtn = $<HTMLButtonElement>("[data-copy]");
  const copyLabel = $("[data-copy-label]");
  const native = $<HTMLButtonElement>("[data-share='native']");
  const band = $("[data-qr-band]");
  const bandTile = $("[data-qr-tile]");
  const bandTitle = $("[data-qr-title]");
  const bandBody = $("[data-qr-body]");
  const bandDefault = {
    // The QR alone: motion.ts may have parked its scan bar in the tile.
    tile: bandTile?.querySelector("svg")?.outerHTML ?? bandTile?.innerHTML ?? "",
    title: bandTitle?.textContent ?? "",
    body: bandBody?.textContent ?? "",
  };
  let link = "";

  const stripLink = (msg: string) => msg.replace(link, "").replace(/\s+$/g, "").replace(/[:\s]+$/, "");
  const updateShares = () => {
    const msg = msgEl?.value.trim() || i18n.message.replace("{link}", link);
    const withLink = msg.includes(link) ? msg : `${msg} ${link}`;
    const wa = $<HTMLAnchorElement>("[data-share='whatsapp']");
    const tg = $<HTMLAnchorElement>("[data-share='telegram']");
    const em = $<HTMLAnchorElement>("[data-share='email']");
    if (wa) wa.href = `https://wa.me/?text=${encodeURIComponent(withLink)}`;
    if (tg) tg.href = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(stripLink(withLink))}`;
    if (em) em.href = `mailto:?subject=${encodeURIComponent(i18n.emailSubject)}&body=${encodeURIComponent(withLink)}`;
  };
  msgEl?.addEventListener("input", updateShares);

  if (native && typeof navigator.share === "function") {
    native.hidden = false;
    native.addEventListener("click", () => {
      const msg = msgEl?.value.trim() || "";
      navigator.share({ title: i18n.emailSubject, text: stripLink(msg), url: link }).catch(() => undefined);
    });
  }

  copyBtn?.addEventListener("click", async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(link);
      ok = true;
    } catch {
      if (linkEl) {
        linkEl.select();
        ok = document.execCommand?.("copy") ?? false;
      }
    }
    if (ok && copyLabel && copyBtn) {
      copyLabel.textContent = i18n.copied;
      copyBtn.classList.add("is-copied");
      window.setTimeout(() => {
        copyLabel.textContent = i18n.copy;
        copyBtn.classList.remove("is-copied");
      }, 2200);
    }
  });
  linkEl?.addEventListener("focus", () => linkEl.select());

  $("[data-reset]")?.addEventListener("click", () => {
    try {
      localStorage.removeItem(STORE_KEY);
    } catch {
      /* storage unavailable */
    }
    if (result) result.hidden = true;
    if (forms) forms.hidden = false;
    if (bandTile) bandTile.innerHTML = bandDefault.tile;
    if (bandTitle) bandTitle.textContent = bandDefault.title;
    if (bandBody) bandBody.textContent = bandDefault.body;
    band?.classList.remove("is-personal");
    onReset();
    $<HTMLInputElement>("#rl-name")?.focus();
  });

  return {
    show(data: Stored, opts: { welcome?: boolean; notice?: string; scroll?: boolean } = {}) {
      link = data.link;
      const first = firstName(data.name);
      if (titleEl) titleEl.textContent = (opts.welcome ? i18n.welcomeBack : i18n.resultTitle).replace("{name}", first);
      if (linkEl) linkEl.value = data.link;
      if (codeEl) codeEl.textContent = data.code;
      if (msgEl) msgEl.value = i18n.message.replace("{link}", data.link);
      if (notice && noticeBody) {
        notice.hidden = !opts.notice;
        noticeBody.textContent = opts.notice ?? "";
      }
      const svg = qrSvg(data.link, { label: i18n.qrLabel });
      if (qrEl) qrEl.innerHTML = svg;
      if (bandTile) bandTile.innerHTML = svg;
      if (bandTitle) bandTitle.textContent = i18n.qrTitle;
      if (bandBody) bandBody.textContent = i18n.qrBody;
      band?.classList.add("is-personal");
      updateShares();
      if (forms) forms.hidden = true;
      if (result) result.hidden = false;
      // The band's personal QR prints itself when it next scrolls in.
      if (bandTile) printQr(bandTile, { trigger: true });
      if (opts.scroll && result) {
        // A fresh link: the panel drops in, link and code decode, the QR
        // prints, and the burst goes off once the page has landed on it.
        revealPanel(result);
        if (linkEl) scramble(linkEl, data.link, 1.25);
        if (codeEl) scramble(codeEl, data.code, 1);
        if (qrEl) printQr(qrEl, { delay: 0.55 });
        scrollToTarget(result, () => celebrate(titleEl ?? result));
        titleEl?.focus({ preventScroll: true });
      } else if (qrEl) {
        printQr(qrEl, { trigger: true });
      }
    },
  };
}

/* ---------- 7. Persistence ---------- */
function load(): Stored | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Stored;
    return s && typeof s.link === "string" && typeof s.code === "string" ? s : null;
  } catch {
    return null;
  }
}
function save(s: Stored): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(s));
  } catch {
    /* private mode / storage blocked: the panel still works this visit */
  }
}

/* The handwritten line's brush stroke draws in when it scrolls into view. */
export function drawHandLines(): void {
  const lines = $$(".rf-hand");
  if (!lines.length) return;
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-drawn");
        io.unobserve(e.target);
      }),
    { threshold: 0.6 },
  );
  lines.forEach((l) => io.observe(l));
}

/* ---------- 5. Forms ---------- */
function init(): void {
  countUp();
  syncPayouts();
  drawHandLines();

  const studio = $("[data-studio]");
  const i18nEl = $("[data-studio-i18n]");
  if (!studio || !i18nEl) return;
  const i18n = JSON.parse(i18nEl.textContent ?? "{}") as StudioI18n;

  tabs(studio);
  const pv = preview(i18n);
  const panel = sharePanel(i18n, () => pv.render($<HTMLInputElement>("#rl-name")?.value ?? ""));

  const stored = load();
  if (stored) {
    panel.show(stored, { welcome: true });
    pv.render(stored.name, stored.link);
  }

  const referrer = $<HTMLFormElement>("form[data-form='referrer']", studio);
  const direct = $<HTMLFormElement>("form[data-form='direct']", studio);

  const fail = (form: HTMLFormElement, status: number, error?: string) => {
    setStatus(form, errorText(i18n.errors, status, error, CONTACT_EMAIL));
  };

  const succeed = (name: string, code: string, link: string, notice?: string) => {
    const data: Stored = { name, code, link, t: Date.now() };
    save(data);
    panel.show(data, { notice, scroll: true });
    pv.render(name, link);
  };

  if (referrer) {
    wireLiveClear(referrer);
    referrer.addEventListener("submit", async (e) => {
      e.preventDefault();
      setStatus(referrer, "");
      const bad = validate(referrer);
      if (bad) {
        setStatus(referrer, i18n.errors[bad.key]);
        nudge(referrer.querySelectorAll(".is-invalid"));
        bad.el.focus();
        return;
      }
      setBusy(referrer, true, i18n.sending);
      const name = value(referrer, "name");
      const { status, data } = await postReferral({
        kind: "referrer",
        lang: i18n.lang,
        name,
        email: value(referrer, "email"),
        phone: value(referrer, "phone"),
        payout: value(referrer, "payout"),
        consent: checked(referrer, "consent"),
        website: value(referrer, "website"),
      });
      setBusy(referrer, false, i18n.sending);
      if (status !== 200 || !data.ok || !data.code || !data.link) return fail(referrer, status, data.error);
      referrer.reset();
      succeed(name, data.code, data.link);
    });
  }

  if (direct) {
    wireLiveClear(direct);
    direct.addEventListener("submit", async (e) => {
      e.preventDefault();
      setStatus(direct, "");
      const bad = validate(direct);
      const fEmail = value(direct, "friendEmail");
      const fPhone = value(direct, "friendPhone");
      const contacts = $$<HTMLInputElement>("[data-contact]", direct);
      if (bad) {
        setStatus(direct, i18n.errors[bad.key]);
        nudge(direct.querySelectorAll(".is-invalid"));
        bad.el.focus();
        return;
      }
      if (!fEmail && !fPhone) {
        contacts.forEach(markInvalid);
        setStatus(direct, i18n.errors.contactNeeded);
        nudge(direct.querySelectorAll(".is-invalid"));
        contacts[0]?.focus();
        return;
      }
      if (fEmail && !isEmail(fEmail)) {
        const el = contacts[0];
        if (el) markInvalid(el);
        setStatus(direct, i18n.errors.validation);
        nudge(direct.querySelectorAll(".is-invalid"));
        el?.focus();
        return;
      }
      setBusy(direct, true, i18n.sending);
      const name = value(direct, "name");
      const friendName = value(direct, "friendName");
      const { status, data } = await postReferral({
        kind: "direct",
        lang: i18n.lang,
        name,
        email: value(direct, "email"),
        phone: value(direct, "phone"),
        payout: value(direct, "payout"),
        friend: {
          name: friendName,
          email: fEmail,
          phone: fPhone,
          need: value(direct, "need"),
          note: value(direct, "note"),
        },
        friendConsent: checked(direct, "friendConsent"),
        consent: checked(direct, "consent"),
        website: value(direct, "website"),
      });
      setBusy(direct, false, i18n.sending);
      if (status !== 200 || !data.ok || !data.code || !data.link) return fail(direct, status, data.error);
      direct.reset();
      const notice = i18n.directBody.replace("{name}", firstName(name)).replace("{friend}", firstName(friendName));
      succeed(name, data.code, data.link, notice);
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
