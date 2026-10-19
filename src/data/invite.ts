/* ============================================================
   Invite page — /invito/<CODE> (IT) and /en/invito/<CODE>.
   Where a shared link lands: the friend's side of the flyer's
   step 2 ("Il tuo amico si iscrive"). Rendered on demand so the
   referrer's first name is in the HTML and in the link preview
   WhatsApp shows ("Mario ti ha consigliato Alpacode").

   {name} is the referrer's first name, taken from the code. When
   the code is missing or anonymous the *Anon variants are used.
   ============================================================ */
import type { Lang } from "../i18n/types";
import type { IconName, NeedId } from "./shared";

export interface InviteCopy {
  meta: {
    title: string;
    titleAnon: string;
    description: string;
    ogImage: string;
    ogAlt: string;
  };
  headerCta: string;
  hero: {
    kicker: string;
    kickerAnon: string;
    lines: string[];
    linesAnon: string[];
    accent: string;
    lede: string;
    sticker: { pre: string; amount: string; post: string; aria: string };
    chips: string[];
    ctaPrimary: string;
    ctaSecondary: string;
    photoAlt: string;
  };
  ticker: string[];
  why: { kicker: string; title: string; lede: string; items: { icon: IconName; t: string; d: string }[] };
  form: {
    kicker: string;
    title: string;
    lede: string;
    invitedBy: string;
    invitedByAnon: string;
    phoneLabel: string;
    needLegend: string;
    needs: { id: NeedId; label: string }[];
    message: string;
    messagePh: string;
    consent: string;
    submit: string;
    successTitle: string;
    successBody: string;
    referTitle: string;
    referBody: string;
    referCta: string;
  };
  cross: { tag: string; title: string; body: string; cta: string };
  sticky: string;
}

export const invite: Record<Lang, InviteCopy> = {
  it: {
    meta: {
      title: "{name} ti ha consigliato Alpacode · Siti web ed e-commerce",
      titleAnon: "Ti hanno consigliato Alpacode · Siti web ed e-commerce",
      description:
        "Siti web, e-commerce, software e formazione. Prima call gratuita, prezzo deciso prima, niente costi nascosti. Raccontaci il tuo progetto.",
      ogImage: "/og-invito.jpg",
      ogAlt: "Ti hanno consigliato Alpacode — siti web ed e-commerce, prima call gratuita",
    },
    headerCta: "Parliamone",
    hero: {
      kicker: "Un invito da parte di {name}",
      kickerAnon: "Un invito per te",
      lines: ["{name} ti ha", "consigliato"],
      linesAnon: ["Qualcuno ti ha", "consigliato"],
      accent: "Alpacode.",
      lede: "Realizziamo siti web ed e-commerce per privati e imprese in Italia. Raccontaci cosa ti serve: ti richiamiamo noi per una prima call gratuita, senza impegno.",
      sticker: { pre: "Prima call", amount: "0€", post: "senza impegno", aria: "Prima call gratuita, senza impegno" },
      chips: ["Prezzo deciso prima", "Niente costi nascosti", "Pagamenti rateizzabili"],
      ctaPrimary: "Raccontaci il tuo progetto",
      ctaSecondary: "Chi siamo",
      photoAlt:
        "Due amici sorridono davanti a un portatile. Sul coperchio è scritto: «Più persone nel mondo digitale. Insieme.»",
    },
    ticker: [
      "SITI WEB",
      "E-COMMERCE",
      "SOFTWARE",
      "FORMAZIONE",
      "PRIMA CALL GRATUITA",
      "PREZZO DECISO PRIMA",
      "NIENTE COSTI NASCOSTI",
      "PAGAMENTI RATEIZZABILI",
    ],
    why: {
      kicker: "Perché Alpacode",
      title: "Cosa ti aspetta.",
      lede: "Chi ti ha mandato qui ci ha già visti lavorare. Ecco come funziona, dalla prima telefonata in poi.",
      items: [
        {
          icon: "chat",
          t: "Prima call gratuita",
          d: "Trenta minuti per capire cosa ti serve. Niente vendite, niente impegno.",
        },
        {
          icon: "tag",
          t: "Prezzo deciso prima",
          d: "Scope, tempi e prezzo nero su bianco, prima di firmare qualsiasi cosa. Niente costi nascosti.",
        },
        {
          icon: "layers",
          t: "Tutto il digitale, un solo team",
          d: "Siti web, e-commerce, software e formazione. Un unico interlocutore, che resta anche dopo il lancio.",
        },
        {
          icon: "split",
          t: "Pagamenti rateizzabili",
          d: "Il costo si può dividere in rate, concordate prima di partire.",
        },
      ],
    },
    form: {
      kicker: "Il tuo progetto",
      title: "Raccontaci cosa ti serve.",
      lede: "Due righe bastano. Ti ricontattiamo per fissare la call gratuita e capire insieme come procedere.",
      invitedBy: "Su invito di {name} · codice {code}",
      invitedByAnon: "Richiesta diretta",
      phoneLabel: "Telefono (consigliato, per richiamarti)",
      needLegend: "Cosa ti serve?",
      needs: [
        { id: "sito", label: "Un sito web" },
        { id: "ecommerce", label: "Un e-commerce" },
        { id: "software", label: "Software o gestionale" },
        { id: "formazione", label: "Formazione" },
        { id: "altro", label: "Non lo so ancora" },
      ],
      message: "Il tuo progetto in due righe (facoltativo)",
      messagePh: "Es. ho un negozio e vorrei vendere anche online.",
      consent: "Ho letto l'{privacy} e acconsento a essere ricontattato/a da Alpacode.",
      submit: "Invia la richiesta",
      successTitle: "Richiesta inviata.",
      successBody: "Grazie, {name}! Ti ricontattiamo presto per fissare la prima call, gratuita e senza impegno.",
      referTitle: "Anche tu conosci qualcuno?",
      referBody: "Se a un tuo amico serve un sito web o un e-commerce, segnalacelo: se diventa cliente ricevi fino a 100 €.",
      referCta: "Scopri come funziona",
    },
    cross: {
      tag: "Anche tu puoi segnalare",
      title: "Fino a 100 € per ogni amico che diventa cliente.",
      body: "Il programma è aperto a tutti: generi il tuo link personale, lo condividi e ricevi il cashback con bonifico, PayPal o buono acquisto.",
      cta: "Genera il tuo link",
    },
    sticky: "Raccontaci il tuo progetto",
  },

  en: {
    meta: {
      title: "{name} recommended Alpacode to you · Websites and online stores",
      titleAnon: "Alpacode was recommended to you · Websites and online stores",
      description:
        "Websites, online stores, software and training. Free first call, price agreed up front, no hidden costs. Tell us about your project.",
      ogImage: "/og-invito-en.jpg",
      ogAlt: "Alpacode was recommended to you — websites and online stores, free first call",
    },
    headerCta: "Let's talk",
    hero: {
      kicker: "An invitation from {name}",
      kickerAnon: "An invitation for you",
      lines: ["{name}", "recommended"],
      linesAnon: ["Someone", "recommended"],
      accent: "Alpacode.",
      lede: "We build websites and online stores for individuals and businesses across Italy. Tell us what you need: we'll call you back for a free first call, no commitment.",
      sticker: { pre: "First call", amount: "€0", post: "no commitment", aria: "Free first call, no commitment" },
      chips: ["Price agreed up front", "No hidden costs", "Pay in instalments"],
      ctaPrimary: "Tell us about your project",
      ctaSecondary: "About us",
      photoAlt:
        "Two friends smiling at a laptop. The lid reads: “Più persone nel mondo digitale. Insieme.” (More people in the digital world. Together.)",
    },
    ticker: [
      "WEBSITES",
      "ONLINE STORES",
      "SOFTWARE",
      "TRAINING",
      "FREE FIRST CALL",
      "PRICE AGREED UP FRONT",
      "NO HIDDEN COSTS",
      "PAY IN INSTALMENTS",
    ],
    why: {
      kicker: "Why Alpacode",
      title: "What to expect.",
      lede: "Whoever sent you here has seen us at work. This is how it goes, from the first call on.",
      items: [
        {
          icon: "chat",
          t: "Free first call",
          d: "Thirty minutes to understand what you need. No sales pitch, no commitment.",
        },
        {
          icon: "tag",
          t: "Price agreed up front",
          d: "Scope, timing and price in writing before signing anything. No hidden costs.",
        },
        {
          icon: "layers",
          t: "Everything digital, one team",
          d: "Websites, online stores, software and training. One point of contact who stays after launch.",
        },
        {
          icon: "split",
          t: "Pay in instalments",
          d: "The cost can be split into instalments, agreed before we start.",
        },
      ],
    },
    form: {
      kicker: "Your project",
      title: "Tell us what you need.",
      lede: "A couple of lines will do. We'll get back to you to book the free call and work out the next steps together.",
      invitedBy: "Invited by {name} · code {code}",
      invitedByAnon: "Direct request",
      phoneLabel: "Phone (recommended, so we can call you back)",
      needLegend: "What do you need?",
      needs: [
        { id: "sito", label: "A website" },
        { id: "ecommerce", label: "An online store" },
        { id: "software", label: "Software or a management tool" },
        { id: "formazione", label: "Training" },
        { id: "altro", label: "Not sure yet" },
      ],
      message: "Your project in a couple of lines (optional)",
      messagePh: "E.g. I have a shop and I'd like to sell online too.",
      consent: "I have read the {privacy} and agree to be contacted by Alpacode.",
      submit: "Send request",
      successTitle: "Request sent.",
      successBody: "Thanks, {name}! We'll get back to you soon to book your first call, free and with no commitment.",
      referTitle: "Know someone too?",
      referBody: "If a friend of yours needs a website or an online store, refer them: if they become a client you get up to €100.",
      referCta: "See how it works",
    },
    cross: {
      tag: "You can refer too",
      title: "Up to €100 for every friend who becomes a client.",
      body: "The program is open to everyone: get your personal link, share it and receive the cashback by bank transfer, PayPal or voucher.",
      cta: "Get your link",
    },
    sticky: "Tell us about your project",
  },
};
