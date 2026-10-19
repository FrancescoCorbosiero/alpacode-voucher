/* ============================================================
   Privacy notice of the referral program — /privacy/ and
   /en/privacy/. The main site's policy (alpacode.it/privacy/)
   covers its contact form only; this program also collects data
   about a third person (the friend being referred) and payout
   preferences, so it gets its own short notice, written in the
   same plain register as the site's.

   DRAFT — have it checked by whoever reviews the main site's
   policy before going live.
   ============================================================ */
import type { Lang } from "../i18n/types";

export interface PrivacySection {
  h: string;
  /** Rendered with set:html — trusted, static markup only. */
  body: string;
}
export interface PrivacyCopy {
  title: string;
  description: string;
  kicker: string;
  h1: string;
  lede: string;
  updated: string;
  sections: PrivacySection[];
  back: string;
}

export const privacy: Record<Lang, PrivacyCopy> = {
  it: {
    title: "Informativa privacy · Programma «Segnala un amico» — Alpacode",
    description: "Come trattiamo i dati di chi segnala e di chi viene segnalato nel programma cashback di Alpacode.",
    kicker: "Programma «Segnala un amico»",
    h1: "Informativa privacy.",
    lede: "Quali dati raccogliamo quando segnali qualcuno o ci scrivi da un invito, perché e per quanto. Linguaggio semplice, niente sorprese.",
    updated: "Ultimo aggiornamento · 10.2026",
    sections: [
      {
        h: "Titolare del trattamento",
        body: '<p>Soluzioni Digitali Alpacode (di seguito “Alpacode”).<br>Sede operativa: Monza · Milano · IT.<br>P. IVA: 14463350968.<br>Email: <a href="mailto:info@alpacode.it">info@alpacode.it</a>.</p>',
      },
      {
        h: "Quali dati raccogliamo",
        body: "<ul><li><strong>Se generi un link o segnali qualcuno</strong>: nome e cognome, email, telefono (facoltativo) e il metodo con cui preferisci ricevere il cashback. I dati per l'accredito (IBAN, indirizzo PayPal) li chiediamo solo al momento del pagamento, mai nel modulo.</li><li><strong>Se segnali tu i contatti di un'altra persona</strong>: il suo nome e cognome, la sua email e/o il suo telefono, e le note che scegli di aggiungere.</li><li><strong>Se ci scrivi da un invito</strong>: nome e cognome, email, telefono (facoltativo), di cosa hai bisogno e il messaggio, insieme al codice dell'invito.</li></ul><p>Non usiamo cookie di profilazione né tracciamenti cross-site. Il link che generi viene salvato solo nel tuo browser (localStorage), per mostrartelo di nuovo se torni.</p>",
      },
      {
        h: "Perché li usiamo",
        body: "<ul><li>Gestire la segnalazione e verificarne la validità secondo le note e condizioni del programma.</li><li>Contattare la persona segnalata o che ci ha scritto da un invito, per la richiesta che ha fatto.</li><li>Erogare il cashback e tenere traccia degli accrediti per gli obblighi fiscali.</li></ul>",
      },
      {
        h: "Base giuridica",
        body: "<ul><li>Per chi segnala: esecuzione del regolamento del programma che accetti inviando il modulo (art. 6.1.b GDPR).</li><li>Per chi ci scrive da un invito: il consenso prestato nel modulo (art. 6.1.a GDPR).</li><li>Per la persona segnalata direttamente: il consenso che chi segnala dichiara di aver raccolto. Al primo contatto lo confermiamo con lei; se non è interessata, cancelliamo i suoi dati.</li><li>Obblighi di legge (art. 6.1.c GDPR) per la documentazione degli accrediti.</li></ul>",
      },
      {
        h: "Conservazione",
        body: "<p>I dati vengono conservati per il tempo necessario a gestire la segnalazione, l'eventuale rapporto con il nuovo cliente e l'erogazione del cashback, e comunque non oltre i termini previsti dalle norme civilistiche e fiscali applicabili. Le segnalazioni che non si concludono vengono cancellate quando il programma non ne ha più bisogno.</p>",
      },
      {
        h: "Chi li vede",
        body: "<p>Solo il team Alpacode. Per consegnare le email del programma usiamo <strong>Amazon Web Services (SES)</strong>, che agisce come fornitore del servizio. Non vendiamo né cediamo i dati a terzi per fini commerciali.</p>",
      },
      {
        h: "I tuoi diritti",
        body: '<p>In qualsiasi momento puoi esercitare i diritti riconosciuti dal GDPR (accesso, rettifica, cancellazione, limitazione, portabilità, opposizione) scrivendo a <a href="mailto:info@alpacode.it">info@alpacode.it</a>. Vale anche per la persona che è stata segnalata. Hai inoltre il diritto di proporre reclamo al Garante per la protezione dei dati personali.</p>',
      },
      {
        h: "Il resto",
        body: '<p>Per tutto ciò che non riguarda il programma vale la <a href="https://alpacode.it/privacy/">privacy policy di alpacode.it</a>. Questa informativa può essere aggiornata: la versione corrente è sempre quella pubblicata su questa pagina.</p>',
      },
    ],
    back: "Torna al programma",
  },
  en: {
    title: "Privacy notice · Refer-a-friend program — Alpacode",
    description: "How we handle the data of people who refer and people who are referred in Alpacode's cashback program.",
    kicker: "Refer-a-friend program",
    h1: "Privacy notice.",
    lede: "What data we collect when you refer someone or write to us from an invite, why, and for how long. Plain language, no surprises.",
    updated: "Last updated · 10.2026",
    sections: [
      {
        h: "Data controller",
        body: '<p>Soluzioni Digitali Alpacode (“Alpacode”).<br>Studio: Monza · Milan · IT.<br>VAT: 14463350968.<br>Email: <a href="mailto:info@alpacode.it">info@alpacode.it</a>.</p>',
      },
      {
        h: "What we collect",
        body: "<ul><li><strong>If you get a link or refer someone</strong>: full name, email, phone (optional) and how you'd like to receive the cashback. Payout details (IBAN, PayPal address) are only asked for at payout time, never in the form.</li><li><strong>If you send us another person's details</strong>: their full name, their email and/or phone, and any notes you choose to add.</li><li><strong>If you write to us from an invite</strong>: full name, email, phone (optional), what you need and your message, together with the invite code.</li></ul><p>No profiling cookies, no cross-site tracking. The link you generate is stored only in your browser (localStorage), to show it again when you come back.</p>",
      },
      {
        h: "Why we use it",
        body: "<ul><li>To manage the referral and check it against the program terms.</li><li>To contact the referred person, or whoever wrote to us from an invite, about their request.</li><li>To pay out the cashback and keep records of payouts for tax purposes.</li></ul>",
      },
      {
        h: "Legal basis",
        body: "<ul><li>For referrers: performance of the program rules you accept by sending the form (Art. 6.1.b GDPR).</li><li>For people writing from an invite: the consent given in the form (Art. 6.1.a GDPR).</li><li>For people referred directly: the consent the referrer declares they collected. We confirm it with them on first contact; if they're not interested, we delete their data.</li><li>Legal obligations (Art. 6.1.c GDPR) for payout records.</li></ul>",
      },
      {
        h: "Retention",
        body: "<p>Data is kept for the time needed to manage the referral, any relationship with the new client and the cashback payout, and in any case no longer than required by applicable civil and tax laws. Referrals that don't close are deleted once the program no longer needs them.</p>",
      },
      {
        h: "Who sees it",
        body: "<p>Only the Alpacode team. To deliver the program's emails we use <strong>Amazon Web Services (SES)</strong>, acting as a service provider. We don't sell or hand over data to third parties for marketing.</p>",
      },
      {
        h: "Your rights",
        body: '<p>At any time you can exercise your GDPR rights (access, rectification, erasure, restriction, portability, objection) by writing to <a href="mailto:info@alpacode.it">info@alpacode.it</a>. The same applies to the person who was referred. You also have the right to lodge a complaint with the Italian Data Protection Authority.</p>',
      },
      {
        h: "Everything else",
        body: '<p>For anything outside the program, the <a href="https://alpacode.it/en/privacy/">alpacode.it privacy policy</a> applies. This notice may be updated: the current version is always the one published on this page.</p>',
      },
    ],
    back: "Back to the program",
  },
};
