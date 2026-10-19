/* ============================================================
   Shared copy — header, footer values, payout methods, the four
   steps, the campaign line, form labels and errors. Used by both
   the landing (/) and the invite page (/invito/<code>).

   Source of truth for the wording: the printed flyer "Conosci
   qualcuno a cui potrebbe servire un sito web?". Everything on the
   flyer is here, word for word where it worked and tightened where
   it didn't (noted inline).
   ============================================================ */
import type { Lang } from "../i18n/types";

export type IconName =
  | "bank"
  | "wallet"
  | "gift"
  | "link"
  | "user"
  | "check"
  | "euro"
  | "shield"
  | "team"
  | "heart"
  | "chat"
  | "tag"
  | "layers"
  | "split"
  | "whatsapp"
  | "telegram"
  | "mail"
  | "share"
  | "copy"
  | "qr"
  | "arrow";

export type PayoutId = "bonifico" | "paypal" | "buono";
export type NeedId = "sito" | "ecommerce" | "software" | "formazione" | "altro";

export interface PayoutOption {
  id: PayoutId;
  icon: IconName;
  title: string;
  body: string;
  /** Small print under the body (the flyer's "Alternativa al contante"). */
  note?: string;
  /** Short name, used in the forms and in emails. */
  short: string;
}

export interface Step {
  icon: IconName;
  t: string;
  d: string;
}

export interface SharedCopy {
  skip: string;
  header: {
    /** The flyer's three-line strapline next to the logo. */
    tagline: string[];
    siteLink: string;
    langLabel: string;
    langSwitch: string;
  };
  /** The handwritten campaign line (laptop lid + QR band on the flyer). */
  campaignLine: string[];
  payouts: PayoutOption[];
  steps: { kicker: string; title: string; lede: string; items: Step[]; here: string };
  footer: {
    values: { icon: IconName; text: string }[];
    termsTitle: string;
    rights: string;
    programPrivacy: string;
    sitePrivacy: string;
    cookie: string;
    siteTerms: string;
    backToSite: string;
  };
  forms: {
    name: string;
    namePh: string;
    email: string;
    emailPh: string;
    phone: string;
    phoneOptional: string;
    phonePh: string;
    payoutLegend: string;
    /** {privacy} and {terms} become links. */
    consent: string;
    privacyLink: string;
    termsLink: string;
    sending: string;
    required: string;
    errors: {
      generic: string;
      rate: string;
      validation: string;
      consent: string;
      contactNeeded: string;
      network: string;
    };
  };
  fab: { label: string; whatsapp: string; whatsappText: string; top: string };
}

export const shared: Record<Lang, SharedCopy> = {
  it: {
    skip: "Vai al contenuto",
    header: {
      tagline: ["Siti web, e-commerce,", "software e formazione.", "Tutto il digitale, per il tuo business."],
      siteLink: "alpacode.it",
      langLabel: "Lingua",
      langSwitch: "EN",
    },
    campaignLine: ["Più persone", "nel mondo digitale.", "Insieme."],
    payouts: [
      {
        id: "bonifico",
        icon: "bank",
        title: "Bonifico bancario / SEPA",
        body: "Il modo più classico, semplice e sicuro.",
        short: "Bonifico",
      },
      {
        id: "paypal",
        icon: "wallet",
        title: "PayPal / Wallet digitale",
        body: "Ricevi il tuo cashback in modo rapido e digitale.",
        short: "PayPal",
      },
      {
        id: "buono",
        icon: "gift",
        title: "Buono acquisto / Gift card",
        body: "Scegli il premio che preferisci tra i nostri partner.",
        note: "Alternativa al contante",
        short: "Buono acquisto",
      },
    ],
    steps: {
      kicker: "In quattro passi",
      title: "Come funziona?",
      lede: "Tu fai una cosa sola: ci presenti una persona. Al resto pensiamo noi, e ti teniamo aggiornato.",
      items: [
        {
          icon: "link",
          t: "Invia il tuo link unico",
          d: "Puoi condividere il tuo link di invito o farci avere i contatti della persona interessata.",
        },
        {
          icon: "user",
          t: "Il tuo amico si iscrive",
          d: "Compila il form sul nostro sito in autonomia, inserendo i propri dati e prestando il consenso privacy.",
        },
        {
          icon: "check",
          // Flyer: "Il cliente diventa tale" — said plainly.
          t: "Diventa nostro cliente",
          d: "Quando il nuovo cliente completa l'acquisto, verifichiamo la validità della segnalazione.",
        },
        {
          icon: "euro",
          t: "Ricevi il tuo cashback",
          d: "Ti accreditiamo il premio scelto, fino a 100 €, con le modalità che preferisci.",
        },
      ],
      here: "Sei qui",
    },
    footer: {
      values: [
        { icon: "shield", text: "Esperienza e affidabilità" },
        { icon: "team", text: "Un team sempre al tuo fianco" },
        { icon: "heart", text: "La crescita dei nostri clienti è la nostra priorità" },
      ],
      termsTitle: "Note e condizioni",
      rights: "Soluzioni Digitali Alpacode · P. IVA 14463350968",
      programPrivacy: "Privacy del programma",
      sitePrivacy: "Privacy policy",
      cookie: "Cookie",
      siteTerms: "Termini",
      backToSite: "Vai su alpacode.it",
    },
    forms: {
      name: "Nome e cognome",
      namePh: "Mario Rossi",
      email: "Email",
      emailPh: "nome@email.it",
      phone: "Telefono",
      phoneOptional: "Telefono (facoltativo)",
      phonePh: "+39 …",
      payoutLegend: "Come vuoi ricevere il cashback?",
      consent: "Ho letto l'{privacy} e accetto le {terms} del programma.",
      privacyLink: "informativa privacy",
      termsLink: "note e condizioni",
      sending: "Un attimo…",
      required: "obbligatorio",
      errors: {
        generic: "Qualcosa è andato storto: riprova tra poco o scrivici a {email}.",
        rate: "Troppe richieste di fila: riprova tra qualche minuto.",
        validation: "Controlla i campi evidenziati: manca qualcosa.",
        consent: "Per continuare serve la spunta sull'informativa e sulle condizioni.",
        contactNeeded: "Inserisci almeno un'email o un telefono della persona che segnali.",
        network: "Connessione assente: controlla la rete e riprova.",
      },
    },
    fab: {
      label: "Azioni rapide",
      whatsapp: "Domande? Scrivici su WhatsApp",
      whatsappText: "Ciao Alpacode! Ho una domanda sul programma «Segnala un amico».",
      top: "Torna su",
    },
  },

  en: {
    skip: "Skip to content",
    header: {
      tagline: ["Websites, online stores,", "software and training.", "Everything digital, for your business."],
      siteLink: "alpacode.it",
      langLabel: "Language",
      langSwitch: "IT",
    },
    campaignLine: ["More people", "in the digital world.", "Together."],
    payouts: [
      {
        id: "bonifico",
        icon: "bank",
        title: "Bank transfer / SEPA",
        body: "The classic way: simple and secure.",
        short: "Bank transfer",
      },
      {
        id: "paypal",
        icon: "wallet",
        title: "PayPal / Digital wallet",
        body: "Get your cashback quickly, fully digital.",
        short: "PayPal",
      },
      {
        id: "buono",
        icon: "gift",
        title: "Voucher / Gift card",
        body: "Pick the reward you like from our partners.",
        note: "An alternative to cash",
        short: "Voucher",
      },
    ],
    steps: {
      kicker: "Four steps",
      title: "How does it work?",
      lede: "You do one thing: introduce someone. We handle the rest, and keep you posted.",
      items: [
        {
          icon: "link",
          t: "Send your personal link",
          d: "Share your invite link, or send us the contact details of the person who's interested.",
        },
        {
          icon: "user",
          t: "Your friend signs up",
          d: "They fill in the form on our site on their own, with their details and their privacy consent.",
        },
        {
          icon: "check",
          t: "They become a client",
          d: "When the new client completes the purchase, we check that the referral is valid.",
        },
        {
          icon: "euro",
          t: "You get your cashback",
          d: "We send you the reward you picked, up to €100, the way you prefer.",
        },
      ],
      here: "You are here",
    },
    footer: {
      values: [
        { icon: "shield", text: "Experience and reliability" },
        { icon: "team", text: "A team always by your side" },
        { icon: "heart", text: "Our clients' growth is our priority" },
      ],
      termsTitle: "Terms and conditions",
      rights: "Soluzioni Digitali Alpacode · VAT IT14463350968",
      programPrivacy: "Program privacy notice",
      sitePrivacy: "Privacy policy",
      cookie: "Cookies",
      siteTerms: "Terms",
      backToSite: "Go to alpacode.it",
    },
    forms: {
      name: "Full name",
      namePh: "Jane Doe",
      email: "Email",
      emailPh: "name@email.com",
      phone: "Phone",
      phoneOptional: "Phone (optional)",
      phonePh: "+39 …",
      payoutLegend: "How would you like your cashback?",
      consent: "I have read the {privacy} and accept the program {terms}.",
      privacyLink: "privacy notice",
      termsLink: "terms and conditions",
      sending: "One moment…",
      required: "required",
      errors: {
        generic: "Something went wrong: try again shortly or email us at {email}.",
        rate: "Too many requests in a row: try again in a few minutes.",
        validation: "Check the highlighted fields: something's missing.",
        consent: "To continue, please tick the privacy and terms box.",
        contactNeeded: "Add at least an email or a phone number for the person you're referring.",
        network: "You seem to be offline: check your connection and try again.",
      },
    },
    fab: {
      label: "Quick actions",
      whatsapp: "Questions? Message us on WhatsApp",
      whatsappText: "Hi Alpacode! I have a question about the refer-a-friend program.",
      top: "Back to top",
    },
  },
};
