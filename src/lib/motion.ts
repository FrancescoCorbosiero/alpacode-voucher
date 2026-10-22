/* ============================================================
   Alpacode · Segnala un amico — motion engine.
   GSAP (ScrollTrigger + SplitText) with Lenis smooth scrolling: the
   engine of alpacode-website's src/lib/motion.ts (same attribute API,
   same rules of the house), plus the moments this page is made of —
   the sticker you can tug, the alpaca that leaps from step to step and
   trots along the ticker, the link that decodes itself, the QR that
   prints, the burst when your link is ready.

   The CSS half lives in styles/motion.css (the above-the-fold intro and
   the effects' states); the alpaca's body language in lib/alpaca.ts.

   Attribute API:
   ─ Reveals
     data-split[="lines|wipe|words|blur|chars|pop"]
                       heading — split reveal (default: dealt in turn)
     data-reveal       block — fades up when it enters
     data-strut        bar — draws in from the left
     data-pop          icon — stamps in with an elastic twist
     data-progress     rail: [data-progress-fill] gets --p (0→1),
                       [data-progress-step] children .is-reached; its
                       [data-steps-runner] alpaca leaps from step to
                       step (desktop) — or, with data-here, waits on
                       the step you are at
     data-print        QR tile — prints itself row by row when it enters
   ─ Scroll-driven
     data-hero         hero: the copy drifts off, the photo settles in
     .ticker           marquee: follows scroll speed and direction; its
                       [data-alpaca-walker] alpacas walk with it
     data-speed="0.15" parallax drift, as a fraction of own height
   ─ To touch
     data-magnetic     pulled toward the pointer, leans in 3D (sticker)
     data-tilt         leans toward the pointer in 3D (portal card)
     data-alpaca       a living alpaca: little signs of life, leans in
                       when hovered, skips when tapped;
                       ="walk-in" walks into place first,
                       ="lost" looks around first (404)
   ─ For the page scripts (they choreograph, this file has the moves):
     scrollToTarget, panelEnter, revealPanel, nudge, scramble, printQr,
     celebrate

   Rules of the house:
   - Nothing is hidden by CSS. Below-the-fold elements are hidden here,
     at init — a page whose script fails is simply a static page.
   - Reveals hand control back to the stylesheet (clearProps), so hover
     transforms keep working.
   - Everything is created per page inside gsap.context() and
     gsap.matchMedia(), and can be reverted in one call.
   - prefers-reduced-motion: no Lenis, no scroll animation, no play; the
     exported effects become no-ops (or write their end state).
   ============================================================ */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { rigOf, idle, playful, walkIn, leapTo, hop, lookAround, marchers } from "./alpaca";

gsap.registerPlugin(ScrollTrigger, SplitText);

const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const reduced = (): boolean => reducedQuery.matches;
/* Magnets, tilt and hover play only make sense with a mouse. */
const fineQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
const fine = (): boolean => fineQuery.matches;
/* The steps rail and the chat preview exist from here up (landing.css). */
const DESKTOP = "(min-width: 1025px)";

const EASE = "power4.out";

/* ---------- Selectors ---------- */

const HEADINGS = [".section-head h2", ".rf-final-display", "[data-split]"].join(",");

const BLOCKS = [
  ".section-head .lede",
  ".rf-steps-lede",
  ".rf-payout-option",
  ".rf-step",
  ".rf-studio-lede",
  ".rf-studio-points li",
  ".rf-invited",
  ".rf-studio-box",
  ".rf-qr-band",
  ".rf-why-item",
  ".rf-faq-item",
  ".rf-cross",
  ".rf-final-sub",
  ".rf-final-actions",
  ".rf-legal-section",
  ".foot-value",
  ".foot-terms",
  "[data-reveal]",
].join(",");

const STRUTS = [".strut-short", "[data-strut]"].join(",");
const KICKERS = [".section-head .sec-num", ".rf-steps-head .sec-num", ".rf-studio-intro .sec-num", ".rf-final .sec-num"].join(",");

/* ---------- Helpers ---------- */

/** True when the element starts inside (or above) the first screen. Those
 *  are left alone: hiding them now would flash already-painted content. */
const inFirstView = (el: Element): boolean => el.getBoundingClientRect().top < window.innerHeight * 0.92;

/** Intro-animated (CSS) elements have already moved. */
const skipIntro = (el: Element): boolean => !!el.closest(".intro-lines, [data-intro], [data-hero]");

/* ---------- Lenis ---------- */

let lenis: Lenis | null = null;

function createLenis(): void {
  if (lenis || reduced()) return;
  lenis = new Lenis({ lerp: 0.1, allowNestedScroll: true });
  lenis.on("scroll", ScrollTrigger.update);
}

gsap.ticker.add((time) => lenis?.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/** Scroll to an element or a position — smooth when Lenis runs. `done`
 *  runs once the page has arrived (an estimate without Lenis). */
export function scrollToTarget(target: HTMLElement | number, done?: () => void): void {
  if (lenis) {
    let offset = -16;
    if (typeof target !== "number" && target.getBoundingClientRect().top < 0) {
      // Scrolling up brings the header back: leave room for it.
      offset -= document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;
    }
    lenis.scrollTo(target, { offset, duration: 1.2, onComplete: done ? () => done() : undefined });
    return;
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: reduced() ? "auto" : "smooth" });
  } else {
    target.scrollIntoView({ behavior: reduced() ? "auto" : "smooth" });
  }
  if (done) window.setTimeout(done, reduced() ? 0 : 650);
}

/* Same-page anchors glide instead of jumping. */
document.addEventListener(
  "click",
  (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const el = e.target instanceof Element ? e.target : null;
    if (el?.closest("[data-scroll-top]")) {
      e.preventDefault();
      scrollToTarget(0);
      return;
    }
    const a = el?.closest<HTMLAnchorElement>("a[href*='#']");
    if (!a || !lenis) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    scrollToTarget(target);
    history.replaceState(history.state, "", url.hash);
  },
  true,
);

/* ---------- Header ---------- */

let lastY = 0;
function onScroll(): void {
  const y = window.scrollY;
  const header = document.querySelector<HTMLElement>(".site-header");
  if (header) {
    header.classList.toggle("scrolled", y > 8);
    if (!reduced()) {
      if (y > 320 && y > lastY + 4) header.classList.add("is-hidden");
      else if (y < lastY - 4 || y <= 320) header.classList.remove("is-hidden");
    }
  }
  document.querySelector<HTMLElement>("[data-scroll-top]")?.classList.toggle("is-visible", y > 700);
  // On phones the WhatsApp button would sit on the hero CTA: it waits below the fold.
  document.querySelector<HTMLElement>("[data-fab]")?.classList.toggle("is-past-fold", y > window.innerHeight * 0.6);
  lastY = y;
}
window.addEventListener("scroll", onScroll, { passive: true });

/* ---------- Effects layer (the burst) ---------- */

function fxLayer(): HTMLElement {
  let layer = document.querySelector<HTMLElement>(".fx-layer");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "fx-layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);
  }
  return layer;
}

/* The house confetti: the sticker's blue struts, the ticker's square
   ticks, euro signs and the odd tiny alpaca. */
const MINI_ALPACA =
  '<svg viewBox="0 0 100 120" fill="currentColor" aria-hidden="true"><path d="M55 20Q55 9 57 2Q60 7 61.5 13.5L63.5 13Q65 6 68 1Q70 7 69.5 13.5Q76 12 80 17L87 21.5Q90.5 23.5 89.5 27Q88.5 30.5 84 30.5L76.5 31Q71 32 70 38L69.5 57Q73.5 66 70.5 77L71 116Q71 118 69 118L65 118L64 89L62 89L61.5 117L56.5 117L56 85Q42 90 29.5 85L29.5 117L24 117L23 94L21 94L20.5 117L15 117L14.5 85Q8.5 78 9 67Q9 60 12 57Q6.5 56.5 7 52.5Q8 48.5 13.5 50.5Q31 45.5 49.5 48.5Q55 49.5 55 43L55 26Z"/></svg>';
const BITS = ["strut", "square", "euro", "strut", "square", "alpaca"] as const;
const BIT_COLORS = ["var(--blue)", "var(--ink)", "var(--blue-deep)", "#8fb0f5"];

/** A burst of brand confetti from the middle of an element. */
export function celebrate(origin: Element, opts: { count?: number; spread?: number } = {}): void {
  if (reduced()) return;
  const { count = 30, spread = 1 } = opts;
  const r = origin.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + Math.min(r.height / 2, 60);
  const layer = fxLayer();
  for (let i = 0; i < count; i++) {
    const kind = BITS[i % BITS.length] ?? "square";
    const bit = document.createElement("span");
    bit.className = `fx-bit fx-${kind}`;
    if (kind === "euro") bit.textContent = "€";
    if (kind === "alpaca") bit.innerHTML = MINI_ALPACA;
    bit.style.color = BIT_COLORS[i % BIT_COLORS.length] ?? "var(--blue)";
    layer.appendChild(bit);
    const angle = (i / count) * Math.PI * 2 + gsap.utils.random(-0.25, 0.25);
    const dist = gsap.utils.random(110, 250) * spread;
    gsap.set(bit, { left: cx, top: cy, xPercent: -50, yPercent: -50, scale: 0, rotation: gsap.utils.random(-90, 90) });
    gsap
      .timeline({ onComplete: () => bit.remove() })
      .to(bit, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - 70 * spread,
        scale: 1,
        rotation: `+=${gsap.utils.random(-160, 160)}`,
        duration: gsap.utils.random(0.55, 0.85),
        ease: "power3.out",
      })
      .to(bit, {
        y: `+=${gsap.utils.random(180, 340)}`,
        rotation: `+=${gsap.utils.random(-120, 120)}`,
        opacity: 0,
        duration: gsap.utils.random(0.9, 1.4),
        ease: "power1.in",
      });
  }
}

/* ---------- Effects for the page scripts ---------- */

const GLYPHS_UP = "ABCDEFGHJKMNPQRSTVWXYZ0123456789";
const GLYPHS_LOW = "abcdefghjkmnpqrstvwxyz0123456789";
const decoding = new WeakMap<Element, gsap.core.Tween>();

/** Text that decodes itself: characters cycle through random glyphs and
 *  settle in turn, left to right. Separators hold their place, so the
 *  shape of a link reads from the first frame. Works on inputs too. */
export function scramble(el: HTMLElement | HTMLInputElement, text: string, duration = 1.1): gsap.core.Tween | null {
  const write = (s: string): void => {
    if (el instanceof HTMLInputElement) el.value = s;
    else el.textContent = s;
  };
  decoding.get(el)?.kill(); // a new text takes over from one still decoding
  if (reduced()) {
    write(text);
    return null;
  }
  const chars = [...text];
  const n = chars.length;
  const fixed = (c: string): boolean => /[\s./:\-_@]/.test(c);
  const glyph = (c: string): string => {
    const set = c === c.toLowerCase() && c !== c.toUpperCase() ? GLYPHS_LOW : GLYPHS_UP;
    return set.charAt(Math.floor(Math.random() * set.length));
  };
  const noise = chars.map(glyph);
  const state = { p: 0 };
  let frame = 0;
  const tween = gsap.to(state, {
    p: 1,
    duration,
    ease: "power1.inOut",
    onUpdate: () => {
      // Re-roll the noise every third frame: a decoder, not a strobe.
      if (frame++ % 3 === 0) chars.forEach((c, i) => (noise[i] = glyph(c)));
      const settled = Math.floor(state.p * n);
      write(chars.map((c, i) => (i < settled || fixed(c) ? c : noise[i])).join(""));
    },
    onComplete: () => write(text),
  });
  decoding.set(el, tween);
  return tween;
}

/** The QR prints itself: rows uncovered one by one under a blue scan bar. */
export function printQr(tile: HTMLElement, opts: { delay?: number; trigger?: boolean } = {}): gsap.core.Timeline | null {
  const svg = tile.querySelector("svg");
  if (reduced() || !svg) return null;
  const rows = Number(svg.getAttribute("viewBox")?.split(/\s+/)[3]) || 30;
  let bar = tile.querySelector<HTMLElement>(".qr-scan");
  if (!bar) {
    bar = document.createElement("span");
    bar.className = "qr-scan";
    bar.setAttribute("aria-hidden", "true");
    tile.appendChild(bar);
  }
  const tl = gsap.timeline({
    delay: opts.delay ?? 0,
    scrollTrigger: opts.trigger ? { trigger: tile, start: "top 82%", once: true } : undefined,
  });
  tl.fromTo(svg, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.15, ease: `steps(${rows})`, clearProps: "clipPath" }, 0)
    .fromTo(bar, { top: "0%" }, { top: "100%", duration: 1.15, ease: "none" }, 0)
    .fromTo(bar, { opacity: 0 }, { opacity: 1, duration: 0.12 }, 0)
    .to(bar, { opacity: 0, duration: 0.3, ease: "power1.out" }, 1.15);
  return tl;
}

/** A tab's panel comes in from the side it was asked from; its fields
 *  follow in a cascade. dir: 1 forward, -1 back. */
export function panelEnter(panel: HTMLElement, dir: 1 | -1): void {
  if (reduced()) return;
  gsap.fromTo(panel, { x: 36 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55, ease: "power3.out", clearProps: "transform,opacity" });
  gsap.from(panel.querySelectorAll(".rf-form-title, .rf-form-intro, .rf-form > .field, .rf-group > legend, .rf-group > .field, .rf-field-pair, .rf-choice, .rf-consent, .rf-submit"), {
    y: 16,
    opacity: 0,
    duration: 0.5,
    ease: "power2.out",
    stagger: 0.035,
    delay: 0.05,
    clearProps: "transform,opacity",
  });
}

/** The "no-no" shake on fields that need fixing. */
export function nudge(fields: Iterable<Element>): void {
  const list = Array.from(fields);
  if (reduced() || !list.length) return;
  gsap.fromTo(list, { x: 0 }, { keyframes: { x: [-10, 9, -6, 4, 0] }, duration: 0.45, ease: "none", clearProps: "transform" });
}

/** A panel that has just been swapped in (the share panel, a form's
 *  thank-you): its pieces drop in one after another. */
export function revealPanel(panel: HTMLElement): void {
  if (reduced()) return;
  gsap.from(panel.children, { y: 26, opacity: 0, duration: 0.6, ease: "power3.out", stagger: 0.06, clearProps: "transform,opacity" });
}

/* ---------- Per-page effects ---------- */

let ctx: gsap.Context | null = null;
let mm: gsap.MatchMedia | null = null;
let pageBody: HTMLElement | null = null;
let cleanups: (() => void)[] = [];

/** A listener removed with the page. */
function on<K extends keyof HTMLElementEventMap>(
  el: HTMLElement,
  type: K,
  fn: (e: HTMLElementEventMap[K]) => void,
  opts?: AddEventListenerOptions,
): void {
  el.addEventListener(type, fn, opts);
  cleanups.push(() => el.removeEventListener(type, fn, opts));
}

/* Headings don't all enter the same way: each one gets a variant, asked
   for (data-split="wipe") or dealt in turn down the page, so two
   neighbouring sections never repeat the same move.
     lines  each line rises out of its mask
     wipe   each line is uncovered left to right
     words  words pop up out of their own masks, tilted slightly
     blur   lines come into focus while drifting up
     chars  letters settle one by one (short headings only)
     pop    words jump in with a spring and a tilt (asked for only) */
type HeadingVariant = "lines" | "wipe" | "words" | "blur" | "chars" | "pop";
const CYCLE: HeadingVariant[] = ["lines", "wipe", "words", "blur", "chars"];

function headingVariant(el: HTMLElement, index: number): HeadingVariant {
  const asked = el.dataset.split as HeadingVariant | undefined;
  if (asked && (CYCLE.includes(asked) || asked === "pop")) return asked;
  const v = CYCLE[index % CYCLE.length] ?? "lines";
  // Letter by letter only reads well on a few words.
  return v === "chars" && (el.textContent ?? "").trim().length > 26 ? "words" : v;
}

function headingTween(self: SplitText, v: HeadingVariant, trigger: HTMLElement): gsap.core.Tween {
  const scrollTrigger = { trigger, start: "top 88%", once: true };
  switch (v) {
    case "wipe":
      return gsap.fromTo(
        self.lines,
        { clipPath: "inset(-20% 100% -20% 0%)" },
        { clipPath: "inset(-20% 0% -20% 0%)", duration: 1.3, ease: "power3.inOut", stagger: 0.12, clearProps: "clipPath", scrollTrigger },
      );
    case "words":
      return gsap.from(self.words, { yPercent: 110, rotate: 4, duration: 0.9, ease: "power3.out", stagger: 0.035, scrollTrigger });
    case "blur":
      return gsap.from(self.lines, {
        opacity: 0,
        y: 28,
        filter: "blur(14px)",
        duration: 1.2,
        ease: "power2.out",
        stagger: 0.1,
        clearProps: "filter",
        scrollTrigger,
      });
    case "chars":
      return gsap.from(self.chars, { opacity: 0, yPercent: 60, duration: 0.7, ease: "power3.out", stagger: 0.022, scrollTrigger });
    case "pop":
      return gsap.from(self.words, {
        opacity: 0,
        y: 46,
        scale: 0.6,
        rotation: () => gsap.utils.random(-10, 10),
        duration: 0.9,
        ease: "back.out(2)",
        stagger: 0.05,
        scrollTrigger,
      });
    default:
      return gsap.from(self.lines, { yPercent: 115, duration: 1.15, ease: EASE, stagger: 0.085, scrollTrigger });
  }
}

function splitHeadings(): void {
  let n = 0;
  gsap.utils.toArray<HTMLElement>(HEADINGS).forEach((el) => {
    if (skipIntro(el) || inFirstView(el)) return;
    const v = headingVariant(el, n++);
    SplitText.create(el, {
      type: v === "words" || v === "pop" ? "words,lines" : v === "chars" ? "chars,words" : "lines",
      mask: v === "lines" ? "lines" : v === "words" ? "words" : undefined,
      linesClass: "split-line",
      wordsClass: "split-word",
      autoSplit: true,
      onSplit: (self) => headingTween(self, v, el),
    });
  });
}

function revealBlocks(): void {
  const blocks = gsap.utils.toArray<HTMLElement>(BLOCKS).filter((el) => !skipIntro(el) && !inFirstView(el));
  if (!blocks.length) return;
  gsap.set(blocks, { opacity: 0, y: 44, transition: "none" });
  blocks.forEach((el) => el.setAttribute("data-motion-pending", ""));
  ScrollTrigger.batch(blocks, {
    start: "top 90%",
    once: true,
    onEnter: (batch) => {
      batch.forEach((el) => el.removeAttribute("data-motion-pending"));
      // A jump (anchor, find-in-page) hands over every block it skipped in
      // one batch: the ones already above the viewport show at once, the
      // rest keep a short stagger.
      const passed = batch.filter((el) => el.getBoundingClientRect().bottom < 0);
      const entering = batch.filter((el) => !passed.includes(el));
      if (passed.length) gsap.set(passed, { overwrite: true, clearProps: "opacity,transform,transition" });
      if (!entering.length) return;
      gsap.to(entering, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: "power3.out",
        stagger: entering.length > 5 ? { amount: 0.45 } : 0.09,
        overwrite: true,
        clearProps: "opacity,transform,transition",
      });
    },
  });
}

function drawStruts(): void {
  gsap.utils.toArray<HTMLElement>(STRUTS).forEach((el) => {
    if (skipIntro(el) || inFirstView(el)) return;
    gsap.from(el, {
      scaleX: 0,
      transformOrigin: "left center",
      duration: 1.2,
      ease: EASE,
      clearProps: "transform",
      scrollTrigger: { trigger: el, start: "top 92%", once: true },
    });
  });
  // Kicker struts are ::before pseudo-elements: drive them through --kick.
  gsap.utils.toArray<HTMLElement>(KICKERS).forEach((el) => {
    if (inFirstView(el)) return;
    gsap.fromTo(
      el,
      { "--kick": 0, opacity: 0 },
      { "--kick": 1, opacity: 1, duration: 1, ease: EASE, clearProps: "opacity", scrollTrigger: { trigger: el, start: "top 90%", once: true } },
    );
  });
}

/* Icons that stamp in: a twist and an elastic landing. */
function pops(): void {
  gsap.utils.toArray<HTMLElement>("[data-pop]").forEach((el, i) => {
    if (inFirstView(el)) return;
    gsap.from(el, {
      scale: 0,
      rotation: i % 2 ? 90 : -90,
      duration: 1.15,
      ease: "elastic.out(1, 0.5)",
      delay: 0.15,
      clearProps: "transform",
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });
  });
}

/* Parallax drift, as a fraction of the element's own height. */
function parallax(): void {
  gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
    const speed = parseFloat(el.dataset.speed ?? "0.15") || 0.15;
    gsap.fromTo(
      el,
      { yPercent: -speed * 50 },
      { yPercent: speed * 50, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
    );
  });
}

/* The hero lets go as the page scrolls: the copy drifts up and dims, the
   photo settles closer. (The intro itself is CSS, in motion.css.) */
function hero(): void {
  const root = document.querySelector<HTMLElement>("[data-hero]");
  if (!root) return;
  const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true } });
  const copy = root.querySelector(".rf-hero-copy");
  const img = root.querySelector(".rf-photo-img");
  if (copy) tl.to(copy, { yPercent: -10, opacity: 0.2, ease: "none" }, 0);
  if (img) tl.fromTo(img, { scale: 1 }, { scale: 1.07, yPercent: 4, ease: "none" }, 0);
}

/* The progress rail of "Come funziona?": the fill follows the scroll, the
   steps light up as it passes (their number tile gives a little jolt),
   and on desktop the alpaca leaps along the tiles — or, on the invite
   page (data-here), waits on the step the visitor is at and skips when
   it lights up. */
function progressRails(media: gsap.MatchMedia): void {
  gsap.utils.toArray<HTMLElement>("[data-progress]").forEach((root) => {
    const fill = root.querySelector<HTMLElement>("[data-progress-fill]");
    const steps = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-progress-step]"));
    const here = root.dataset.here !== undefined ? Number(root.dataset.here) : null;
    // Without the script the rail renders full (--p defaults to 1).
    fill?.style.setProperty("--p", "0");
    cleanups.push(() => fill?.style.removeProperty("--p"));

    let reach: ((i: number) => void) | null = null;
    const runner = root.querySelector<SVGSVGElement>("[data-steps-runner]");
    if (runner) {
      media.add(DESKTOP, () => {
        const r = stepsRunner(root, runner, steps, here);
        reach = r.reach;
        return () => {
          reach = null;
          r.stop();
        };
      });
    }

    let reached = -1;
    ScrollTrigger.create({
      trigger: root,
      start: "top 75%",
      end: "bottom 55%",
      scrub: true,
      onUpdate: (self) => {
        fill?.style.setProperty("--p", self.progress.toFixed(4));
        let last = -1;
        steps.forEach((s, i) => {
          const on = self.progress >= i / steps.length - 0.001;
          if (on && !s.classList.contains("is-reached")) {
            const tile = s.querySelector(".rf-step-n");
            if (tile) gsap.fromTo(tile, { scale: 0.72 }, { scale: 1, duration: 0.8, ease: "elastic.out(1, 0.45)", clearProps: "transform" });
          }
          s.classList.toggle("is-reached", on);
          if (on) last = i;
        });
        if (last !== reached) {
          reached = last;
          if (last >= 0) reach?.(last);
        }
      },
    });
  });
}

/** The alpaca on the step tiles: what to do when a step is reached, and
 *  how to stop (the media query that made it can go away on resize). */
function stepsRunner(
  root: HTMLElement,
  runner: SVGSVGElement,
  steps: HTMLElement[],
  here: number | null,
): { reach: (i: number) => void; stop: () => void } {
  const rig = rigOf(runner);
  if (!rig) return { reach: () => undefined, stop: () => undefined };
  const tiles = steps.map((s) => s.querySelector<HTMLElement>(".rf-step-n") ?? s);
  let xs: number[] = [];
  let at = here ?? 0;
  // Leap targets, measured against where the CSS stands the runner (on
  // step `here`, or the first), so x = 0 is that tile.
  const measure = (): void => {
    const home = tiles[here ?? 0]?.getBoundingClientRect();
    if (!home) return;
    xs = tiles.map((t) => t.getBoundingClientRect().left - home.left);
    gsap.set(runner, { x: xs[at] ?? 0 });
  };
  measure();
  ScrollTrigger.addEventListener("refreshInit", measure);
  // It drops onto its tile as the steps come in — not a moment before, or it
  // would stand on thin air while they are still hidden.
  if (!inFirstView(root)) {
    gsap.from(runner, {
      y: -90,
      opacity: 0,
      duration: 0.9,
      ease: "bounce.out",
      delay: 0.35,
      scrollTrigger: { trigger: root, start: "top 88%", once: true },
    });
  }
  const stopIdle = idle(rig, () => ScrollTrigger.isInViewport(root, 0.1));
  return {
    reach: (i: number): void => {
      if (here !== null) {
        // The invite page: the alpaca stays on "Sei qui" and skips when it lights up.
        if (i === here) hop(rig, 16);
        return;
      }
      if (i === at || xs[i] === undefined) return;
      const far = Math.abs(i - at) > 1;
      at = i;
      leapTo(rig, xs[i] ?? 0, { height: far ? 74 : 52, duration: far ? 0.95 : 0.72 });
    },
    stop: (): void => {
      ScrollTrigger.removeEventListener("refreshInit", measure);
      stopIdle();
      gsap.killTweensOf([runner, rig.root, ...runner.querySelectorAll("g")]);
      gsap.set(runner, { clearProps: "transform,opacity" });
    },
  };
}

/** XL-marquee behaviour on the ticker: drifts on its own, speeds up with
 *  the scroll and follows its direction; the alpaca riding it faces the
 *  way it runs and walks with it. Driven by the GSAP ticker only while
 *  on screen. */
function marquees(): void {
  gsap.utils.toArray<HTMLElement>(".ticker").forEach((root) => {
    const track = root.querySelector<HTMLElement>(".ticker-track");
    if (!track) return;
    track.style.animation = "none";
    const crew = marchers(root.querySelectorAll<SVGSVGElement>("[data-alpaca-walker]"));
    let x = 0;
    let dir = -1;
    let boost = 0;
    let half = track.scrollWidth / 2;
    let active = false;
    let hovered = false;
    const BASE = 56; // px/s
    const tick = (_time: number, dt: number): void => {
      if (!active || hovered) return;
      const dx = dir * (BASE + boost) * (dt / 1000);
      x += dx;
      if (x <= -half) x += half;
      else if (x > 0) x -= half;
      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
      crew.move(dx, dt);
      boost *= 0.94;
    };
    gsap.ticker.add(tick);
    const st = ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => (active = self.isActive),
      onRefresh: () => (half = track.scrollWidth / 2),
      onUpdate: (self) => {
        boost = Math.min(Math.abs(self.getVelocity()) * 0.35, 900);
        dir = self.direction === -1 ? 1 : -1;
      },
    });
    on(root, "mouseenter", () => void (hovered = true));
    on(root, "mouseleave", () => void (hovered = false));
    cleanups.push(() => {
      gsap.ticker.remove(tick);
      st.kill();
      track.style.removeProperty("transform");
      track.style.removeProperty("animation");
    });
  });
}

/* The chat preview plays the message arriving: "typing…", then the
   bubble pops in from its corner. */
function chatPreview(media: gsap.MatchMedia): void {
  const screen = document.querySelector<HTMLElement>(".rf-preview-screen");
  const bubble = screen?.querySelector<HTMLElement>(".rf-bubble");
  if (!screen || !bubble || inFirstView(screen)) return;
  media.add(DESKTOP, () => {
    const dots = document.createElement("span");
    dots.className = "rf-typing";
    dots.setAttribute("aria-hidden", "true");
    dots.innerHTML = "<i></i><i></i><i></i>";
    screen.appendChild(dots);
    gsap.set(bubble, { opacity: 0, scale: 0.6, transformOrigin: "100% 0%" });
    gsap.set(dots, { opacity: 0, scale: 0.5, transformOrigin: "100% 0%" });
    gsap
      .timeline({ scrollTrigger: { trigger: screen, start: "top 78%", once: true } })
      .to(dots, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2.2)" })
      .fromTo(dots.children, { y: 0 }, { y: -4, duration: 0.24, ease: "sine.inOut", yoyo: true, repeat: 3, stagger: 0.11 }, 0.15)
      .to(dots, { opacity: 0, scale: 0.5, duration: 0.2, ease: "power2.in" }, 1.15)
      .to(bubble, { opacity: 1, scale: 1, duration: 0.65, ease: "back.out(1.8)", clearProps: "opacity,transform" }, 1.2);
    return () => dots.remove();
  });
}

/* Picking a payout: the icon tile flips like a coin. */
function coinFlips(): void {
  const picker = document.querySelector<HTMLElement>("[data-payout-picker]");
  if (!picker) return;
  on(picker, "change", (e) => {
    const input = e.target instanceof HTMLInputElement ? e.target : null;
    const icon = input?.closest(".rf-payout-option")?.querySelector(".rf-payout-icon");
    if (!icon) return;
    gsap.fromTo(icon, { scale: 1 }, { scale: 1.14, duration: 0.3, ease: "power2.out", yoyo: true, repeat: 1 });
    gsap.fromTo(
      icon,
      { rotationY: 0 },
      { rotationY: 360, transformPerspective: 500, duration: 0.85, ease: "power3.out", clearProps: "transform" },
    );
  });
}

/* FAQ: <details> open and close with a height tween instead of a jump.
   The answer sits in .rf-faq-a, so padding never fights the tween. */
function accordions(): void {
  gsap.utils.toArray<HTMLDetailsElement>("details.rf-faq-item").forEach((d) => {
    const summary = d.querySelector<HTMLElement>("summary");
    const body = d.querySelector<HTMLElement>(".rf-faq-a");
    if (!summary || !body) return;
    let tween: gsap.core.Tween | null = null;
    on(summary, "click", (e) => {
      e.preventDefault();
      tween?.kill();
      if (d.open && !d.classList.contains("is-closing")) {
        d.classList.add("is-closing");
        tween = gsap.to(body, {
          height: 0,
          opacity: 0,
          duration: 0.42,
          ease: "power3.inOut",
          onComplete: () => {
            d.open = false;
            d.classList.remove("is-closing");
            gsap.set(body, { clearProps: "height,opacity,overflow" });
          },
        });
      } else {
        // Clicked again while closing: open back up from where it is.
        const from = d.classList.contains("is-closing") ? body.offsetHeight : 0;
        d.classList.remove("is-closing");
        d.open = true;
        tween = gsap.fromTo(
          body,
          { height: from, opacity: from ? Number(gsap.getProperty(body, "opacity")) : 0, overflow: "hidden" },
          { height: "auto", opacity: 1, duration: 0.55, ease: "power3.out", clearProps: "height,opacity,overflow" },
        );
      }
    });
  });
}

/* Leaning toward the pointer in 3D; the magnetic ones also follow it a
   little and spring back. */
function pointerPlay(): void {
  if (!fine()) return;
  gsap.utils.toArray<HTMLElement>("[data-tilt], [data-magnetic]").forEach((el) => {
    const magnetic = el.hasAttribute("data-magnetic");
    const max = magnetic ? 12 : 5;
    const rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3.out" });
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3.out" });
    const xTo = magnetic ? gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" }) : null;
    const yTo = magnetic ? gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" }) : null;
    on(el, "pointerenter", () => gsap.set(el, { transformPerspective: 800 }));
    on(el, "pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      rx(-py * max);
      ry(px * max * 1.2);
      xTo?.(px * r.width * 0.16);
      yTo?.(py * r.height * 0.16);
    });
    on(el, "pointerleave", () => {
      gsap.to(el, {
        rotationX: 0,
        rotationY: 0,
        x: 0,
        y: 0,
        duration: 0.9,
        ease: "elastic.out(1, 0.5)",
        overwrite: "auto",
        clearProps: "transform",
      });
    });
  });
}

/* QR tiles marked data-print print themselves when they scroll in. */
function prints(): void {
  gsap.utils.toArray<HTMLElement>("[data-print]").forEach((tile) => {
    if (!inFirstView(tile)) printQr(tile, { trigger: true });
  });
}

/* Living alpacas: little signs of life while on screen (an ear, the tail,
   a nod), a lean when hovered, a skip when tapped — wherever the pointer
   can reach them (the finale's sits behind the copy, pointer-events:
   none, and only idles). */
function alpacas(): void {
  gsap.utils.toArray<SVGSVGElement>("svg[data-alpaca]").forEach((svg) => {
    const rig = rigOf(svg);
    if (!rig) return;
    const awake = (): boolean => !document.hidden && ScrollTrigger.isInViewport(svg, 0.05);
    const page = document.body;
    const live = (): void => {
      if (pageBody !== page) return; // a walk that ended after the page changed
      cleanups.push(idle(rig, awake), playful(rig));
    };
    const mode = svg.dataset.alpaca;
    if (mode === "walk-in" && !inFirstView(svg)) {
      // It walks in from the dark, a few strides from the left, once it is
      // well into view — up to the opacity its stylesheet sets.
      const opacity = Number(getComputedStyle(svg).opacity) || 1;
      gsap.set(svg, { opacity: 0 });
      ScrollTrigger.create({
        // Its own middle, not its section's top: in a tall band the section
        // starts long before the alpaca (at the bottom) is on screen.
        trigger: svg,
        start: "center 75%",
        once: true,
        onEnter: () => {
          walkIn(rig, svg.getBoundingClientRect().width * 0.42, { fade: true, opacity, duration: 2.1 }).eventCallback("onComplete", live);
        },
      });
      return;
    }
    if (mode === "lost") {
      gsap.delayedCall(1.6, () => {
        lookAround(rig).eventCallback("onComplete", live);
      });
      return;
    }
    live();
  });
}

/* Anything still waiting to be revealed shows up the moment keyboard
   focus lands inside it. */
document.addEventListener("focusin", (e) => {
  const pending = e.target instanceof Element && e.target.closest<HTMLElement>("[data-motion-pending]");
  if (!pending) return;
  pending.removeAttribute("data-motion-pending");
  gsap.to(pending, { opacity: 1, y: 0, duration: 0.3, overwrite: true, clearProps: "opacity,transform,transition" });
});

function initPage(): void {
  if (pageBody === document.body) return; // already initialised for this page
  teardownPage();
  pageBody = document.body;
  lastY = window.scrollY;
  onScroll();
  if (reduced()) return;
  document.documentElement.classList.add("has-motion");
  createLenis();
  mm = gsap.matchMedia();
  const media = mm;
  ctx = gsap.context(() => {
    hero();
    splitHeadings();
    revealBlocks();
    drawStruts();
    pops();
    parallax();
    progressRails(media);
    marquees();
    chatPreview(media);
    coinFlips();
    accordions();
    pointerPlay();
    prints();
    alpacas();
  });
  ScrollTrigger.sort();
  // Fonts change line breaks and heights: measure again once they're in.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

function teardownPage(): void {
  cleanups.forEach((fn) => fn());
  cleanups = [];
  mm?.revert();
  mm = null;
  ctx?.revert();
  ctx = null;
  document.querySelector(".fx-layer")?.replaceChildren();
}

/* Forms swapping panels and FAQs opening change the page height: keep
   trigger positions honest. */
let refreshTimer = 0;
let lastHeight = 0;
new ResizeObserver(() => {
  const h = document.documentElement.scrollHeight;
  if (Math.abs(h - lastHeight) < 2) return;
  lastHeight = h;
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
}).observe(document.documentElement);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPage);
} else {
  initPage();
}
