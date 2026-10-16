/* ============================================================
   QR codes as inline SVG — one function for the build (the static
   QR in the band) and the browser (the personal QR, drawn after the
   API hands out a link). Square modules, error correction M, a quiet
   zone of 2 modules; the three finder squares in the deep brand blue
   (6.8:1 on white — scanners only care about luminance contrast).
   ============================================================ */
import { encode } from "uqr";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export interface QrOptions {
  /** Accessible name; without it the SVG is decorative. */
  label?: string;
  quiet?: number;
  fg?: string;
  finder?: string;
  bg?: string;
}

/** Position-pattern cells (7×7 in three corners). */
function isFinder(x: number, y: number, size: number): boolean {
  const inBox = (bx: number, by: number) => x >= bx && x < bx + 7 && y >= by && y < by + 7;
  return inBox(0, 0) || inBox(size - 7, 0) || inBox(0, size - 7);
}

export function qrSvg(text: string, opts: QrOptions = {}): string {
  const { label, quiet = 2, fg = "#0b0e14", finder = "#2756c2", bg = "#ffffff" } = opts;
  const qr = encode(text, { ecc: "M", border: 0 });
  const n = qr.size;
  const full = n + quiet * 2;
  let body = "";
  let corners = "";
  qr.data.forEach((row, y) => {
    let x = 0;
    while (x < n) {
      if (!row[x]) {
        x++;
        continue;
      }
      const finderRun = isFinder(x, y, n);
      let run = 1;
      while (x + run < n && row[x + run] && isFinder(x + run, y, n) === finderRun) run++;
      const seg = `M${x + quiet} ${y + quiet}h${run}v1h-${run}z`;
      if (finderRun) corners += seg;
      else body += seg;
      x += run;
    }
  });
  const a11y = label ? `role="img" aria-label="${esc(label)}"` : `aria-hidden="true"`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${full} ${full}" shape-rendering="crispEdges" ${a11y}>` +
    `<rect width="${full}" height="${full}" fill="${bg}"/>` +
    `<path fill="${fg}" d="${body}"/>` +
    `<path fill="${finder}" d="${corners}"/>` +
    `</svg>`
  );
}
