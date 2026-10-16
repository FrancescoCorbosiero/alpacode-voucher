/* ============================================================
   Motion engine — GSAP (ScrollTrigger + SplitText) with Lenis
   smooth scrolling. A trimmed port of alpacode-website's
   src/lib/motion.ts (same attribute API, same feel), minus what a
   single page doesn't need (view transitions, video hero, map).

   Attribute API:
     data-split[="lines|wipe|words|blur|chars"]  heading reveal
     data-reveal       any block — fades up when it enters
     data-strut        bar — draws in from the left
     data-progress     rail: [data-progress-fill] gets --p (0→1),
                       [data-progress-step] children .is-reached

   Rules of the house:
   - Nothing is hidden by CSS. Blocks are hidden here, at init, and
     only if they are below the fold — a page whose script fails is
     simply a static page.
   - Reveals hand control back to the stylesheet (clearProps).
   - prefers-reduced-motion: no Lenis, no scroll animation.
   ============================================================ */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduced = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const EASE = "power4.out";

const HEADINGS = [".section-head h2", ".rf-final-display", "[data-split]"].join(",");

const BLOCKS = [
  ".section-head .lede",
  ".rf-payout-option",
  ".rf-step",
  ".rf-why-item",
  ".rf-faq-item",
  ".rf-cross",
  ".rf-qr-band",
  ".rf-studio-intro",
  ".rf-studio-box",
  ".rf-final-sub",
  ".rf-final-actions",
  "[data-reveal]",
].join(",");

const STRUTS = [".strut-short", "[data-strut]"].join(",");
const KICKERS = ".section-head .sec-num";

/** Starts inside (or above) the first screen: leave it alone. */
const inFirstView = (el: Element): boolean => el.getBoundingClientRect().top < window.innerHeight * 0.92;
const skipIntro = (el: Element): boolean => !!el.closest(".intro-lines, [data-intro], [data-hero]");

/* ---------- Lenis ---------- */
let lenis: Lenis | null = null;

function createLenis(): void {
  if (lenis || reduced()) return;
  lenis = new Lenis({
    lerp: 0.1,
    allowNestedScroll: true,
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/** Scroll to an element or a position — smooth when Lenis runs. */
export function scrollToTarget(target: HTMLElement | number): void {
  if (lenis) {
    let offset = -16;
    if (typeof target !== "number" && target.getBoundingClientRect().top < 0) {
      // Scrolling up brings the header back: leave room for it.
      offset -= document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;
    }
    lenis.scrollTo(target, { offset, duration: 1.2 });
    return;
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: reduced() ? "auto" : "smooth" });
  } else {
    target.scrollIntoView({ behavior: reduced() ? "auto" : "smooth" });
  }
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

/* ---------- Scroll effects ---------- */
type HeadingVariant = "lines" | "wipe" | "words" | "blur" | "chars";
const CYCLE: HeadingVariant[] = ["lines", "wipe", "words", "blur", "chars"];

function headingVariant(el: HTMLElement, index: number): HeadingVariant {
  const asked = el.dataset.split as HeadingVariant | undefined;
  if (asked && CYCLE.includes(asked)) return asked;
  const v = CYCLE[index % CYCLE.length] ?? "lines";
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
      type: v === "words" ? "words,lines" : v === "chars" ? "chars,words" : "lines",
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
  gsap.utils.toArray<HTMLElement>(KICKERS).forEach((el) => {
    if (inFirstView(el)) return;
    gsap.fromTo(
      el,
      { "--kick": 0, opacity: 0 },
      { "--kick": 1, opacity: 1, duration: 1, ease: EASE, clearProps: "opacity", scrollTrigger: { trigger: el, start: "top 90%", once: true } },
    );
  });
}

function progressRails(): void {
  gsap.utils.toArray<HTMLElement>("[data-progress]").forEach((root) => {
    const fill = root.querySelector<HTMLElement>("[data-progress-fill]");
    const steps = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-progress-step]"));
    fill?.style.setProperty("--p", "0");
    ScrollTrigger.create({
      trigger: root,
      start: "top 75%",
      end: "bottom 55%",
      scrub: true,
      onUpdate: (self) => {
        fill?.style.setProperty("--p", self.progress.toFixed(4));
        steps.forEach((s, i) => s.classList.toggle("is-reached", self.progress >= i / steps.length - 0.001));
      },
    });
  });
}

/* Anything still waiting to be revealed shows up when focus lands in it. */
document.addEventListener("focusin", (e) => {
  const pending = e.target instanceof Element && e.target.closest<HTMLElement>("[data-motion-pending]");
  if (!pending) return;
  pending.removeAttribute("data-motion-pending");
  gsap.to(pending, { opacity: 1, y: 0, duration: 0.3, overwrite: true, clearProps: "opacity,transform,transition" });
});

function init(): void {
  lastY = window.scrollY;
  onScroll();
  if (reduced()) return;
  document.documentElement.classList.add("has-motion");
  createLenis();
  splitHeadings();
  revealBlocks();
  drawStruts();
  progressRails();
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

/* Forms swapping panels change the page height: keep triggers honest. */
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
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
