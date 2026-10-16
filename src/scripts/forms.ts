/* ============================================================
   Form helpers shared by the landing and the invite page:
   validation with field highlighting, the JSON POST to
   /api/referral, busy state and status messages. Vanilla, no deps.
   ============================================================ */

export interface FormErrors {
  generic: string;
  rate: string;
  validation: string;
  consent: string;
  contactNeeded: string;
  network: string;
}

export interface ApiResult {
  ok: boolean;
  error?: string;
  code?: string;
  link?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isEmail = (v: string): boolean => v.length <= 254 && EMAIL_RE.test(v);

type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export function value(form: HTMLFormElement, name: string): string {
  const el = form.elements.namedItem(name);
  if (!el) return "";
  if (el instanceof RadioNodeList) return el.value;
  if (el instanceof HTMLInputElement && el.type === "checkbox") return el.checked ? "on" : "";
  return (el as Control).value.trim();
}

export function checked(form: HTMLFormElement, name: string): boolean {
  const el = form.elements.namedItem(name);
  return el instanceof HTMLInputElement && el.checked;
}

function wrapperOf(el: Element): HTMLElement | null {
  return el.closest<HTMLElement>(".field, .rf-consent, .rf-field-pair");
}

export function markInvalid(el: Control): void {
  el.setAttribute("aria-invalid", "true");
  wrapperOf(el)?.classList.add("is-invalid");
}

export function clearInvalid(form: HTMLFormElement): void {
  form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
  form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
}

/** Clear a field's error state as soon as the visitor edits it. */
export function wireLiveClear(form: HTMLFormElement): void {
  form.addEventListener("input", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    t.removeAttribute("aria-invalid");
    wrapperOf(t)?.classList.remove("is-invalid");
  });
}

/**
 * Required / email / consent checks. Returns the error key and the first
 * offending control, or null when the form is fine.
 */
export function validate(form: HTMLFormElement): { key: keyof FormErrors; el: Control } | null {
  clearInvalid(form);
  let first: { key: keyof FormErrors; el: Control } | null = null;
  const controls = Array.from(form.elements).filter(
    (el): el is Control =>
      (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) &&
      el.name !== "website",
  );
  for (const el of controls) {
    let bad = false;
    let key: keyof FormErrors = "validation";
    if (el instanceof HTMLInputElement && el.type === "checkbox") {
      if (el.required && !el.checked) {
        bad = true;
        key = "consent";
      }
    } else if (el instanceof HTMLInputElement && el.type === "radio") {
      continue;
    } else {
      const v = el.value.trim();
      if (el.required && !v) bad = true;
      else if (v && el instanceof HTMLInputElement && el.type === "email" && !isEmail(v)) bad = true;
    }
    if (bad) {
      markInvalid(el);
      if (!first) first = { key, el };
    }
  }
  return first;
}

export function setBusy(form: HTMLFormElement, busy: boolean, sendingLabel: string): void {
  const btn = form.querySelector<HTMLButtonElement>("[data-submit]");
  const label = form.querySelector<HTMLElement>("[data-submit-label]");
  if (!btn || !label) return;
  if (busy) {
    label.dataset.idle ??= label.textContent ?? "";
    label.textContent = sendingLabel;
    btn.disabled = true;
    btn.setAttribute("aria-busy", "true");
  } else {
    if (label.dataset.idle) label.textContent = label.dataset.idle;
    btn.disabled = false;
    btn.removeAttribute("aria-busy");
  }
}

export function setStatus(form: HTMLFormElement, text: string, tone: "error" | "ok" = "error"): void {
  const el = form.querySelector<HTMLElement>("[data-status]");
  if (!el) return;
  el.textContent = text;
  el.classList.toggle("is-error", tone === "error" && !!text);
}

/** Maps an API failure to a human sentence. */
export function errorText(errors: FormErrors, status: number, code: string | undefined, email: string): string {
  if (status === 0) return errors.network;
  if (status === 429) return errors.rate;
  if (code === "consent") return errors.consent;
  if (code === "contact") return errors.contactNeeded;
  if (status === 422) return errors.validation;
  return errors.generic.replace("{email}", email);
}

export async function postReferral(body: Record<string, unknown>): Promise<{ status: number; data: ApiResult }> {
  try {
    const res = await fetch("/api/referral", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    let data: ApiResult = { ok: false };
    try {
      data = (await res.json()) as ApiResult;
    } catch {
      /* non-JSON error page */
    }
    return { status: res.status, data };
  } catch {
    return { status: 0, data: { ok: false, error: "network" } };
  }
}
