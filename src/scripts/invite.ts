/* ============================================================
   Invite page behaviour — the friend's request form. The referral
   code (from the URL, validated server-side when the page was
   rendered) travels with the request so the referrer is credited.
   ============================================================ */
import { firstName } from "../lib/referral-code";
import { scrollToTarget, revealPanel, nudge, celebrate } from "../lib/motion";
import { checked, errorText, postReferral, setBusy, setStatus, validate, value, wireLiveClear, type FormErrors } from "./forms";

interface InviteI18n {
  lang: "it" | "en";
  ref: string;
  sending: string;
  errors: FormErrors;
  successBody: string;
}

function init(): void {
  const root = document.querySelector<HTMLElement>("[data-invite]");
  const i18nEl = root?.querySelector("[data-invite-i18n]");
  const form = root?.querySelector<HTMLFormElement>("form[data-form='friend']");
  if (!root || !i18nEl || !form) return;
  const i18n = JSON.parse(i18nEl.textContent ?? "{}") as InviteI18n;
  const forms = root.querySelector<HTMLElement>("[data-forms]");
  const result = root.querySelector<HTMLElement>("[data-result]");
  const body = root.querySelector<HTMLElement>("[data-result-body]");
  const title = root.querySelector<HTMLElement>("[data-result-title]");

  wireLiveClear(form);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus(form, "");
    const bad = validate(form);
    if (bad) {
      setStatus(form, i18n.errors[bad.key]);
      nudge(form.querySelectorAll(".is-invalid"));
      bad.el.focus();
      return;
    }
    setBusy(form, true, i18n.sending);
    const name = value(form, "name");
    const { status, data } = await postReferral({
      kind: "friend",
      lang: i18n.lang,
      ref: i18n.ref,
      name,
      email: value(form, "email"),
      phone: value(form, "phone"),
      need: value(form, "need"),
      message: value(form, "message"),
      consent: checked(form, "consent"),
      website: value(form, "website"),
    });
    setBusy(form, false, i18n.sending);
    if (status !== 200 || !data.ok) {
      setStatus(form, errorText(i18n.errors, status, data.error, "info@alpacode.it"));
      return;
    }
    form.reset();
    if (body) body.textContent = i18n.successBody.replace("{name}", firstName(name));
    if (forms) forms.hidden = true;
    if (result) {
      result.hidden = false;
      revealPanel(result);
      scrollToTarget(result, () => celebrate(title ?? result, { count: 24, spread: 0.85 }));
      title?.focus({ preventScroll: true });
    }
    document.querySelector("[data-sticky]")?.remove();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
