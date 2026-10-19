/* =====================================================================
   The alpaca's moves — for the rigged silhouette in
   components/Alpaca.astro. Pure GSAP, no state outside the element.
   Keep this file identical in alpacode-website and alpacode-voucher:
   each site's lib/motion.ts only decides where its alpacas walk.

   The rig (SVG groups; each pivot is in data-pivot, SVG user units):
     .alpaca-rig    the whole animal — bob and hops (y, user units)
     .alpaca-neck   neck + head: sways, nods       └ .alpaca-ear: flicks
     .alpaca-tail   flicks
     .alpaca-leg    data-leg f1 f2 (fore) h1 h2 (hind): swing from the knee
   The drawing faces right; face(-1) mirrors the whole <svg> (CSS
   transform), so x/y/scaleX on the <svg> are the animal's place on the
   page and everything inside is its body language.

   Motion only: callers check prefers-reduced-motion before using any of
   this, and the silhouette at rest is complete without it.
   ===================================================================== */
import { gsap } from "gsap";

type Leg = "f1" | "f2" | "h1" | "h2";

export interface Rig {
  svg: SVGSVGElement;
  root: SVGGElement;
  neck?: SVGGElement;
  ear?: SVGGElement;
  tail?: SVGGElement;
  legs: Partial<Record<Leg, SVGGElement>>;
}

/** Lateral-sequence walk: near hind, near fore, far hind, far fore. */
const WALK: Record<Leg, number> = { h1: 0, f1: Math.PI / 2, h2: Math.PI, f2: Math.PI * 1.5 };
const TAU = Math.PI * 2;

const legsOf = (rig: Rig, which: "fore" | "hind" | "all" = "all"): SVGGElement[] => {
  const keys: Leg[] = which === "fore" ? ["f1", "f2"] : which === "hind" ? ["h1", "h2"] : ["f1", "f2", "h1", "h2"];
  return keys.flatMap((k) => (rig.legs[k] ? [rig.legs[k]] : []));
};

/** The rig of an alpaca <svg>, every piece's pivot set. */
export function rigOf(svg: SVGSVGElement): Rig | null {
  const root = svg.querySelector<SVGGElement>(".alpaca-rig");
  if (!root) return null;
  const legs: Rig["legs"] = {};
  svg.querySelectorAll<SVGGElement>(".alpaca-leg").forEach((g) => {
    legs[g.dataset.leg as Leg] = g;
  });
  svg.querySelectorAll<SVGGElement>("[data-pivot]").forEach((g) => gsap.set(g, { svgOrigin: g.dataset.pivot }));
  return {
    svg,
    root,
    neck: svg.querySelector<SVGGElement>(".alpaca-neck") ?? undefined,
    ear: svg.querySelector<SVGGElement>(".alpaca-ear") ?? undefined,
    tail: svg.querySelector<SVGGElement>(".alpaca-tail") ?? undefined,
    legs,
  };
}

/** Which way it looks: 1 as drawn (right), -1 mirrored. */
export const facing = (rig: Rig): 1 | -1 => ((gsap.getProperty(rig.svg, "scaleX") as number) < 0 ? -1 : 1);

/** Turns round to face `dir`: a squash through zero width with a skip. */
export function face(rig: Rig, dir: 1 | -1, instant = false): gsap.core.Timeline | null {
  if (facing(rig) === dir) return null;
  if (instant) {
    gsap.set(rig.svg, { scaleX: dir });
    return null;
  }
  return gsap
    .timeline()
    .to(rig.svg, { scaleX: dir, duration: 0.38, ease: "power2.inOut", overwrite: "auto" }, 0)
    .to(rig.root, { y: -6, duration: 0.19, ease: "power2.out", yoyo: true, repeat: 1 }, 0);
}

/** Walk cycle, driven by distance: step(px) poses the legs, the head nod,
 *  the tail and the bob for that much ground covered. Per frame, so it
 *  writes through quickSetters instead of creating tweens. */
export function walker(rig: Rig, strideLength: number) {
  const legs = (Object.keys(WALK) as Leg[]).flatMap((k) => {
    const g = rig.legs[k];
    return g ? [{ set: gsap.quickSetter(g, "rotation", "deg") as (v: number) => void, offset: WALK[k] }] : [];
  });
  const neck = rig.neck ? (gsap.quickSetter(rig.neck, "rotation", "deg") as (v: number) => void) : null;
  const tail = rig.tail ? (gsap.quickSetter(rig.tail, "rotation", "deg") as (v: number) => void) : null;
  const bob = gsap.quickSetter(rig.root, "y") as (v: number) => void;
  let phase = 0;
  const pose = (amp: number): void => {
    legs.forEach((l) => l.set(Math.sin(phase + l.offset) * amp));
    neck?.(Math.sin(phase * 2) * 1.6 * (amp / 11));
    tail?.(Math.sin(phase) * 5 * (amp / 11));
    bob((-1.3 * (1 - Math.cos(phase * 2))) / 2 * (amp / 11));
  };
  return {
    /** Advance by `px` of ground (either sign walks forward). */
    step(px: number, amp = 11): void {
      phase = (phase + (Math.abs(px) / strideLength) * TAU) % TAU;
      pose(amp);
    },
    /** Settle every piece back to rest. */
    halt(duration = 0.45): gsap.core.Tween {
      return gsap.to([...legsOf(rig), rig.neck, rig.tail, rig.root].filter(Boolean), {
        rotation: 0,
        y: 0,
        duration,
        ease: "power2.out",
        overwrite: "auto",
      });
    },
  };
}

/** Alpacas riding a marquee: they face the way the band runs and walk
 *  with it, legs keyed to the distance — up to four strides a second;
 *  past that, when the scroll hurries the band, the stride lengthens into
 *  a trot instead of turning into a blur. Call move() every frame. */
export function marchers(svgs: Iterable<SVGSVGElement>) {
  const crew = Array.from(svgs).flatMap((svg) => {
    const rig = rigOf(svg);
    if (!rig) return [];
    const stride = (svg.getBoundingClientRect().width || 24) * 0.95;
    return [{ rig, stride, walk: walker(rig, stride) }];
  });
  let dir: 1 | -1 | 0 = 0;
  return {
    /** dx: px the band moved this frame (its sign is the direction); dt: ms. */
    move(dx: number, dt: number): void {
      if (!crew.length || !dx || !dt) return;
      const d: 1 | -1 = dx < 0 ? -1 : 1;
      if (d !== dir) {
        // Facing is set outright the first time, turned into afterwards.
        crew.forEach((c) => face(c.rig, d, dir === 0));
        dir = d;
      }
      const speed = Math.abs(dx) / (dt / 1000);
      crew.forEach((c) => {
        const maxStep = c.stride * 4 * (dt / 1000);
        c.walk.step(Math.min(Math.abs(dx), maxStep), gsap.utils.clamp(10, 19, 8 + speed / 45));
      });
    },
  };
}

/* ── Gestures ─────────────────────────────────────────────────────── */

export function flickEar(rig: Rig): gsap.core.Timeline {
  const tl = gsap.timeline();
  if (!rig.ear) return tl;
  return tl
    .to(rig.ear, { rotation: -24, duration: 0.09, ease: "power2.out", overwrite: "auto" })
    .to(rig.ear, { rotation: 0, duration: 0.6, ease: "elastic.out(1, 0.35)" });
}

export function flickTail(rig: Rig): gsap.core.Timeline {
  const tl = gsap.timeline();
  if (!rig.tail) return tl;
  return tl
    .to(rig.tail, { rotation: 18, duration: 0.12, ease: "power2.out", overwrite: "auto" })
    .to(rig.tail, { rotation: -6, duration: 0.16, ease: "power1.inOut" })
    .to(rig.tail, { rotation: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
}

/** Head down to graze a look, then back up. */
export function nod(rig: Rig): gsap.core.Timeline {
  const tl = gsap.timeline();
  if (!rig.neck) return tl;
  return tl
    .to(rig.neck, { rotation: 9, duration: 0.55, ease: "power2.inOut", overwrite: "auto" })
    .to(rig.neck, { rotation: -2, duration: 0.5, ease: "power2.inOut" }, "+=0.35")
    .to(rig.neck, { rotation: 0, duration: 0.6, ease: "power2.out" });
}

/** Head up, ears pricked: something caught its attention. */
export function alert(rig: Rig): gsap.core.Timeline {
  const tl = gsap.timeline();
  if (rig.neck) tl.to(rig.neck, { rotation: -6, duration: 0.35, ease: "power3.out", overwrite: "auto" }, 0);
  tl.add(flickEar(rig), 0.12);
  if (rig.neck) tl.to(rig.neck, { rotation: 0, duration: 0.8, ease: "power2.inOut" }, 1.4);
  return tl;
}

/** Looks the other way and back — the lost alpaca's move. */
export function lookAround(rig: Rig): gsap.core.Timeline {
  const dir = facing(rig);
  const tl = gsap.timeline();
  tl.add(face(rig, dir === 1 ? -1 : 1) ?? gsap.timeline())
    .add(alert(rig), "+=0.1")
    .add(() => void face(rig, dir), "+=0.6");
  return tl;
}

/** A skip on the spot: legs tucked in the air, an ear for balance. */
export function hop(rig: Rig, height = 14): gsap.core.Timeline {
  const tl = gsap.timeline();
  tl.to(rig.root, { y: -height, duration: 0.24, ease: "power2.out", overwrite: "auto" }, 0)
    .to(rig.root, { y: 0, duration: 0.42, ease: "bounce.out" }, 0.24)
    .to(legsOf(rig, "fore"), { rotation: -18, duration: 0.18, ease: "power2.out" }, 0)
    .to(legsOf(rig, "hind"), { rotation: 18, duration: 0.18, ease: "power2.out" }, 0)
    .to(legsOf(rig), { rotation: 0, duration: 0.3, ease: "power2.inOut" }, 0.26)
    .add(flickEar(rig), 0.04)
    .add(flickTail(rig), 0.1);
  return tl;
}

/** Leaps to x (px, on the <svg>) in an arc, legs stretched out like a
 *  gallop, facing the way it goes. */
export function leapTo(rig: Rig, x: number, opts: { height?: number; duration?: number } = {}): gsap.core.Timeline {
  const from = Number(gsap.getProperty(rig.svg, "x")) || 0;
  const { height = 54, duration = 0.72 } = opts;
  const dir: 1 | -1 = x >= from ? 1 : -1;
  const tl = gsap.timeline();
  const turn = face(rig, dir);
  const t0 = turn ? 0.2 : 0;
  if (turn) tl.add(turn, 0);
  tl.to(rig.svg, { x, duration, ease: "power1.inOut", overwrite: "auto" }, t0)
    .to(rig.svg, { y: -height, duration: duration / 2, ease: "power2.out", overwrite: "auto" }, t0)
    .to(rig.svg, { y: 0, duration: duration / 2, ease: "power2.in" }, t0 + duration / 2)
    // Crouch, stretch out in the air, gather for the landing.
    .to(legsOf(rig, "fore"), { rotation: -26, duration: duration * 0.35, ease: "power2.out" }, t0)
    .to(legsOf(rig, "hind"), { rotation: 24, duration: duration * 0.35, ease: "power2.out" }, t0)
    .to(legsOf(rig), { rotation: 0, duration: duration * 0.4, ease: "power2.inOut" }, t0 + duration * 0.6)
    .to(rig.neck ?? {}, { rotation: -7, duration: duration * 0.4, ease: "power2.out" }, t0)
    .to(rig.neck ?? {}, { rotation: 0, duration: duration * 0.5, ease: "power2.out" }, t0 + duration * 0.55)
    // Touchdown: the body sinks into the legs and springs back.
    .to(rig.root, { y: 2.5, duration: 0.09, ease: "power1.out" }, t0 + duration)
    .to(rig.root, { y: 0, duration: 0.4, ease: "elastic.out(1, 0.45)" }, t0 + duration + 0.09);
  return tl;
}

/** Walks `distance` px into its place (positive: arriving from the
 *  left), legs cycling with the ground covered. With `fade` it comes out
 *  of nothing over the first stretch, up to `opacity` (the one its
 *  stylesheet gives it), then hands opacity back to the stylesheet.
 *  Faces the way it walks. */
export function walkIn(
  rig: Rig,
  distance: number,
  opts: { duration?: number; fade?: boolean; opacity?: number; ease?: string } = {},
): gsap.core.Timeline {
  const { duration = 1.8, fade = false, opacity = 1, ease = "power1.out" } = opts;
  const width = rig.svg.getBoundingClientRect().width || 100;
  const walk = walker(rig, width * 0.95);
  const state = { x: -distance };
  let last = state.x;
  face(rig, distance >= 0 ? 1 : -1, true);
  const tl = gsap.timeline();
  tl.set(rig.svg, { x: state.x })
    .to(state, {
      x: 0,
      duration,
      ease,
      onUpdate: () => {
        gsap.set(rig.svg, { x: state.x });
        walk.step(state.x - last);
        last = state.x;
      },
    })
    .add(walk.halt(0.5));
  if (fade) tl.fromTo(rig.svg, { opacity: 0 }, { opacity, duration: duration * 0.45, ease: "power1.in", clearProps: "opacity" }, 0);
  return tl;
}

/** Signs of life at random intervals while `awake()` says so: an ear, the
 *  tail, a nod, a glance up. Returns the off switch. */
export function idle(rig: Rig, awake: () => boolean = () => true, pace: [number, number] = [2.4, 6]): () => void {
  const moves = [flickEar, flickEar, flickTail, flickTail, nod, alert];
  let call: gsap.core.Tween | null = null;
  const queue = (): void => {
    call = gsap.delayedCall(gsap.utils.random(pace[0], pace[1]), () => {
      if (awake()) gsap.utils.random(moves)(rig);
      queue();
    });
  };
  queue();
  return () => call?.kill();
}

/** Pointer play: leans in curious while hovered (fine pointers), skips
 *  when clicked or tapped. Returns the cleanup. */
export function playful(rig: Rig, target: Element = rig.svg): () => void {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const enter = (): void => {
    if (rig.neck) gsap.to(rig.neck, { rotation: 7, duration: 0.6, ease: "power3.out", overwrite: "auto" });
    flickEar(rig);
  };
  const leave = (): void => {
    if (rig.neck) gsap.to(rig.neck, { rotation: 0, duration: 0.9, ease: "elastic.out(1, 0.5)", overwrite: "auto" });
  };
  const tap = (): void => void hop(rig);
  if (fine) {
    target.addEventListener("pointerenter", enter);
    target.addEventListener("pointerleave", leave);
  }
  target.addEventListener("click", tap);
  return () => {
    target.removeEventListener("pointerenter", enter);
    target.removeEventListener("pointerleave", leave);
    target.removeEventListener("click", tap);
  };
}
