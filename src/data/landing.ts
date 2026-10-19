/* ============================================================
   Landing — "/" (IT) and "/en/".
   The referrer's page: the printed flyer, section by section, plus
   what a flyer can't do — a real personal link, a share panel, a
   QR that carries the invite, answers to the obvious questions.

   House rules (alpacode-website/docs/landing-factory.md): direct,
   concrete, zero hype; no invented numbers. The only figure is the
   flyer's own ("fino a 100 €"); the friend-facing promises are the
   ones alpacode.it already makes (free first call, price agreed
   up front, no hidden costs, payments in instalments).
   ============================================================ */
import type { Lang } from "../i18n/types";
import type { IconName, NeedId } from "./shared";

export interface LandingCopy {
  meta: { title: string; description: string; ogImage: string; ogAlt: string };
  headerCta: string;
  hero: {
    kicker: string;
    /** Headline lines; the last line ends with `accent`, set in blue. */
    lines: string[];
    accent: string;
    lede: string;
    ledeStrong: string;
    sticker: { pre: string; amount: string; post: string; aria: string };
    /** "Il cashback … tramite {methods} …" — methods are set in bold blue. */
    payoutBefore: string;
    payoutMethods: string[];
    payoutJoin: { comma: string; or: string };
    payoutAfter: string;
    ctaPrimary: string;
    ctaSecondary: string;
    photoAlt: string;
  };
  ticker: string[];
  payout: { kicker: string; title: string; lede: string; chosen: string; choose: string };
  studio: {
    kicker: string;
    title: string;
    lede: string;
    points: string[];
    tabs: { link: string; linkBadge: string; direct: string };
    link: {
      title: string;
      intro: string;
      submit: string;
    };
    result: {
      title: string;
      welcomeBack: string;
      lede: string;
      codeLabel: string;
      linkLabel: string;
      copy: string;
      copied: string;
      shareLabel: string;
      whatsapp: string;
      telegram: string;
      email: string;
      more: string;
      messageLabel: string;
      message: string;
      emailSubject: string;
      qrTitle: string;
      qrBody: string;
      keep: string;
      reset: string;
    };
    preview: {
      label: string;
      you: string;
      placeholderName: string;
      cardTitle: string;
      cardTitleAnon: string;
      cardDesc: string;
      pending: string;
    };
    direct: {
      title: string;
      intro: string;
      yourLegend: string;
      friendLegend: string;
      friendName: string;
      friendNamePh: string;
      friendEmail: string;
      friendPhone: string;
      contactHint: string;
      needLegend: string;
      needs: { id: NeedId; label: string }[];
      note: string;
      notePh: string;
      friendConsent: string;
      submit: string;
      successTitle: string;
      successBody: string;
      successLink: string;
    };
  };
  qr: {
    title: string;
    body: string;
    hint: string;
    visit: string;
    personalTitle: string;
    personalBody: string;
    qrAlt: string;
    personalQrAlt: string;
  };
  why: { kicker: string; title: string; lede: string; items: { icon: IconName; t: string; d: string }[] };
  faq: { kicker: string; title: string; items: { q: string; a: string }[] };
  cross: { tag: string; title: string; body: string; cta: string };
  final: { kicker: string; line1: string; line2: string; sub: string; cta: string; alt: string; altSubject: string };
  sticky: string;
}

export const landing: Record<Lang, LandingCopy> = {
  it: {
    meta: {
      title: "Segnala un amico · Fino a 100 € di cashback — Alpacode",
      description:
        "Conosci qualcuno a cui serve un sito web o un e-commerce? Segnalalo ad Alpacode: se diventa nostro cliente ricevi fino a 100 € con bonifico, PayPal o buono acquisto.",
      ogImage: "/og-segnala.jpg",
      ogAlt: "Conosci qualcuno a cui potrebbe servire un sito web? Fino a 100 € di cashback — Alpacode",
    },
    headerCta: "Segnala ora",
    hero: {
      kicker: "Segnala un amico · Programma cashback",
      lines: ["Conosci qualcuno", "a cui potrebbe", "servire un"],
      accent: "sito web?",
      lede: "Segnala un amico, un collega o un conoscente che sta pensando di creare un sito web o un e-commerce.",
      ledeStrong: "Se diventa nostro cliente, ricevi",
      sticker: { pre: "Fino a", amount: "100€", post: "di cashback", aria: "Fino a 100 euro di cashback" },
      payoutBefore: "Il cashback fino a 100 € viene erogato tramite ",
      payoutMethods: ["bonifico", "PayPal", "buono acquisto"],
      payoutJoin: { comma: ", ", or: " o " },
      payoutAfter: ", non appena il nuovo cliente avrà completato l'acquisto del servizio.",
      ctaPrimary: "Genera il tuo link",
      ctaSecondary: "Come funziona",
      photoAlt:
        "Due amici sorridono davanti a un portatile. Sul coperchio è scritto: «Più persone nel mondo digitale. Insieme.»",
    },
    ticker: [
      "SEGNALA UN AMICO",
      "FINO A 100 € DI CASHBACK",
      "BONIFICO",
      "PAYPAL",
      "BUONO ACQUISTO",
      "SITI WEB",
      "E-COMMERCE",
      "PIÙ PERSONE NEL MONDO DIGITALE",
    ],
    payout: {
      kicker: "Il tuo premio",
      title: "Scegli come riceverlo.",
      lede: "Stesso premio, tre modi per incassarlo. Indica ora il tuo preferito: lo ritrovi già scelto nel modulo qui sotto.",
      chosen: "Scelto",
      choose: "Scegli",
    },
    studio: {
      kicker: "Il tuo link unico",
      title: "Segnala in un minuto.",
      lede: "Due strade, stesso premio. Condividi il tuo link personale e lascia che sia il tuo amico a scriverci, oppure mandaci tu i suoi contatti, se è d'accordo.",
      points: [
        "Il link è tuo per sempre: stessa email, stesso link.",
        "Il tuo amico ci scrive quando vuole, senza pressioni.",
        "Ti aggiorniamo via email a ogni passo.",
      ],
      tabs: { link: "Condividi il tuo link", linkBadge: "Consigliato", direct: "Mandaci tu i contatti" },
      link: {
        title: "Genera il tuo link personale",
        intro: "Ti basta un'email: è lì che ti scriviamo quando il tuo amico diventa cliente.",
        submit: "Genera il mio link",
      },
      result: {
        title: "Ecco il tuo link, {name}.",
        welcomeBack: "Bentornato, {name}: il tuo link è qui.",
        lede: "Mandalo a chi pensi possa servire un sito web o un e-commerce. Quando ci scrive da lì, la segnalazione è tua.",
        codeLabel: "Il tuo codice",
        linkLabel: "Il tuo link",
        copy: "Copia link",
        copied: "Copiato",
        shareLabel: "Condividi con",
        whatsapp: "WhatsApp",
        telegram: "Telegram",
        email: "Email",
        more: "Altre app",
        messageLabel: "Il messaggio (puoi modificarlo)",
        message:
          "Ciao! Se ti serve un sito web o un e-commerce, ti consiglio Alpacode: la prima call è gratuita e il prezzo lo sai prima di iniziare. Puoi scrivergli da qui: {link}",
        emailSubject: "Ti consiglio Alpacode per il tuo sito",
        qrTitle: "Oppure fallo inquadrare",
        qrBody: "Il tuo amico punta la fotocamera qui e si apre la pagina col tuo invito.",
        keep: "Il link resta sempre lo stesso: se lo perdi, rigeneralo con la stessa email.",
        reset: "Genera un altro link",
      },
      preview: {
        label: "Così arriva al tuo amico",
        you: "Tu",
        placeholderName: "Il tuo nome",
        cardTitle: "{name} ti ha consigliato Alpacode",
        cardTitleAnon: "Ti hanno consigliato Alpacode",
        cardDesc: "Siti web ed e-commerce · prima call gratuita",
        pending: "il tuo link",
      },
      direct: {
        title: "Mandaci tu i contatti",
        intro: "La contattiamo noi, dicendo che ci ha presentati tu. Fallo solo dopo averle chiesto il permesso.",
        yourLegend: "I tuoi dati",
        friendLegend: "La persona che segnali",
        friendName: "Nome e cognome",
        friendNamePh: "Luca Bianchi",
        friendEmail: "Email",
        friendPhone: "Telefono",
        contactHint: "Basta uno dei due: email o telefono.",
        needLegend: "Cosa le serve?",
        needs: [
          { id: "sito", label: "Un sito web" },
          { id: "ecommerce", label: "Un e-commerce" },
          { id: "altro", label: "Non lo sa ancora" },
        ],
        note: "Due righe sul progetto (facoltativo)",
        notePh: "Es. ha un ristorante e vorrebbe le prenotazioni online.",
        friendConsent: "Ho informato questa persona e mi ha dato il consenso a essere contattata da Alpacode.",
        submit: "Invia la segnalazione",
        successTitle: "Segnalazione ricevuta.",
        successBody:
          "Grazie, {name}! Contatteremo {friend} a nome tuo e ti aggiorneremo via email sull'esito.",
        successLink: "Questo è il tuo link personale, per le prossime segnalazioni:",
      },
    },
    qr: {
      title: "Scansiona il QR code",
      body: "per accedere al modulo di contatto e inviarci la tua segnalazione.",
      hint: "Sei al computer? Inquadralo col telefono e continua da lì, o mostralo a chi vuoi segnalare.",
      visit: "oppure visita",
      personalTitle: "Fai inquadrare il tuo QR",
      personalBody:
        "Questo QR contiene il tuo invito: chi lo inquadra arriva sulla pagina con il tuo nome, e la segnalazione resta tua.",
      qrAlt: "QR code che apre questa pagina",
      personalQrAlt: "QR code del tuo link di invito personale",
    },
    why: {
      kicker: "Perché consigliarci",
      title: "Il tuo amico è in buone mani.",
      lede: "Quando consigli qualcuno ci metti la faccia. Ecco cosa trova il tuo amico, dalla prima telefonata in poi.",
      items: [
        {
          icon: "chat",
          t: "Prima call gratuita",
          d: "Trenta minuti per capire cosa gli serve. Niente vendite, niente impegno.",
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
    faq: {
      kicker: "Domande frequenti",
      title: "Le domande giuste, le risposte dritte.",
      items: [
        {
          q: "Quanto ricevo, esattamente?",
          a: "Fino a 100 € per ogni persona che segnali e che diventa nostra cliente con un sito web o un e-commerce. L'importo dipende dal progetto che sceglie: te lo confermiamo per iscritto quando verifichiamo la segnalazione, prima dell'accredito.",
        },
        {
          q: "Quando arriva il cashback?",
          a: "Quando il nuovo cliente ha firmato il contratto e pagato regolarmente il primo acconto. A quel punto ti scriviamo, raccogliamo i dati per l'accredito e ti mandiamo il premio con il metodo che hai scelto: bonifico, PayPal o buono acquisto.",
        },
        {
          q: "Il mio amico deve sapere che l'ho segnalato?",
          a: "Sì. La strada più semplice è il tuo link: è lui a scriverci, quando vuole, e presta da solo il consenso privacy. Se preferisci mandarci tu i suoi contatti, fallo solo dopo avergli chiesto il permesso: lo contatteremo dicendo che ci ha presentati tu.",
        },
        {
          q: "Posso segnalare più persone?",
          a: "Sì: ogni persona diversa che diventa cliente vale il suo cashback. La stessa persona, però, si può segnalare una volta sola: se ci arriva da più parti, vale la prima segnalazione valida.",
        },
        {
          q: "Chi può partecipare?",
          a: "Chiunque conosca qualcuno a cui serve un sito web o un e-commerce: clienti, amici, colleghi. Ti basta un indirizzo email per ricevere il tuo link.",
        },
        {
          q: "E se la persona è già nostra cliente?",
          a: "Il cashback premia chi ci fa conoscere un nuovo cliente: se la persona lavora già con noi, la segnalazione non è valida.",
        },
        {
          q: "Il cashback si somma ad altre promozioni?",
          a: "No: non è cumulabile con altre promozioni o iniziative in corso, salvo diverse comunicazioni da parte nostra.",
        },
        {
          q: "Cosa fate con i dati che inserisco?",
          a: "Li usiamo solo per gestire la segnalazione e l'accredito del premio, come spiegato nell'informativa privacy del programma. Puoi chiederne la cancellazione in qualsiasi momento scrivendo a info@alpacode.it.",
        },
      ],
    },
    cross: {
      tag: "Lavori ogni giorno con dei clienti?",
      title: "Diventa partner Alpacode.",
      body: "Social media manager, commercialisti, agenti, fotografi: se i siti te li chiedono di continuo, c'è un programma pensato per te. Segnali, rivendi in white-label o scambi lead, con condizioni scritte.",
      cta: "Scopri il programma partner",
    },
    final: {
      kicker: "Ultima cosa",
      line1: "Un messaggio a un amico.",
      line2: "Fino a 100\u00a0€ per te.",
      sub: "Generi il tuo link in un minuto, lo mandi su WhatsApp e al resto pensiamo noi.",
      cta: "Genera il tuo link",
      alt: "Domande? Scrivici",
      altSubject: "Domanda sul programma Segnala un amico",
    },
    sticky: "Genera il tuo link",
  },

  en: {
    meta: {
      title: "Refer a friend · Up to €100 cashback — Alpacode",
      description:
        "Know someone who needs a website or an online store? Refer them to Alpacode: if they become our client you get up to €100 by bank transfer, PayPal or voucher.",
      ogImage: "/og-segnala-en.jpg",
      ogAlt: "Know someone who could use a website? Up to €100 cashback — Alpacode",
    },
    headerCta: "Refer now",
    hero: {
      kicker: "Refer a friend · Cashback program",
      lines: ["Know someone", "who could use", "a"],
      accent: "website?",
      lede: "Refer a friend, a colleague or someone you know who is thinking about building a website or an online store.",
      ledeStrong: "If they become our client, you get",
      sticker: { pre: "Up to", amount: "€100", post: "cashback", aria: "Up to 100 euros cashback" },
      payoutBefore: "The cashback of up to €100 is paid by ",
      payoutMethods: ["bank transfer", "PayPal", "voucher"],
      payoutJoin: { comma: ", ", or: " or " },
      payoutAfter: ", as soon as the new client has completed the purchase of the service.",
      ctaPrimary: "Get your link",
      ctaSecondary: "How it works",
      photoAlt:
        "Two friends smiling at a laptop. The lid reads: “Più persone nel mondo digitale. Insieme.” (More people in the digital world. Together.)",
    },
    ticker: [
      "REFER A FRIEND",
      "UP TO €100 CASHBACK",
      "BANK TRANSFER",
      "PAYPAL",
      "VOUCHER",
      "WEBSITES",
      "ONLINE STORES",
      "MORE PEOPLE IN THE DIGITAL WORLD",
    ],
    payout: {
      kicker: "Your reward",
      title: "Choose how you get it.",
      lede: "Same reward, three ways to cash it. Pick your favourite now: you'll find it already selected in the form below.",
      chosen: "Selected",
      choose: "Choose",
    },
    studio: {
      kicker: "Your personal link",
      title: "Refer in a minute.",
      lede: "Two ways, same reward. Share your personal link and let your friend reach out, or send us their contact details yourself, if they agree.",
      points: [
        "The link is yours for good: same email, same link.",
        "Your friend writes to us when they like, no pressure.",
        "We keep you posted by email at every step.",
      ],
      tabs: { link: "Share your link", linkBadge: "Recommended", direct: "Send us their details" },
      link: {
        title: "Get your personal link",
        intro: "All it takes is an email: that's where we write when your friend becomes a client.",
        submit: "Get my link",
      },
      result: {
        title: "Here's your link, {name}.",
        welcomeBack: "Welcome back, {name}: your link is right here.",
        lede: "Send it to anyone who might need a website or an online store. When they reach out through it, the referral is yours.",
        codeLabel: "Your code",
        linkLabel: "Your link",
        copy: "Copy link",
        copied: "Copied",
        shareLabel: "Share via",
        whatsapp: "WhatsApp",
        telegram: "Telegram",
        email: "Email",
        more: "More apps",
        messageLabel: "The message (you can edit it)",
        message:
          "Hi! If you need a website or an online store, I recommend Alpacode: the first call is free and you know the price before they start. You can reach them here: {link}",
        emailSubject: "I recommend Alpacode for your website",
        qrTitle: "Or let them scan it",
        qrBody: "Your friend points their camera here and lands on the page with your invite.",
        keep: "The link never changes: if you lose it, generate it again with the same email.",
        reset: "Get another link",
      },
      preview: {
        label: "What your friend receives",
        you: "You",
        placeholderName: "Your name",
        cardTitle: "{name} recommended Alpacode to you",
        cardTitleAnon: "Someone recommended Alpacode to you",
        cardDesc: "Websites and online stores · free first call",
        pending: "your link",
      },
      direct: {
        title: "Send us their details",
        intro: "We reach out to them, saying you introduced us. Only do this after asking their permission.",
        yourLegend: "Your details",
        friendLegend: "The person you're referring",
        friendName: "Full name",
        friendNamePh: "Luke White",
        friendEmail: "Email",
        friendPhone: "Phone",
        contactHint: "One of the two is enough: email or phone.",
        needLegend: "What do they need?",
        needs: [
          { id: "sito", label: "A website" },
          { id: "ecommerce", label: "An online store" },
          { id: "altro", label: "Not sure yet" },
        ],
        note: "A couple of lines about the project (optional)",
        notePh: "E.g. they run a restaurant and want online bookings.",
        friendConsent: "I have told this person and they agreed to be contacted by Alpacode.",
        submit: "Send the referral",
        successTitle: "Referral received.",
        successBody: "Thanks, {name}! We'll get in touch with {friend} on your behalf and update you by email.",
        successLink: "And this is your personal link, for your next referrals:",
      },
    },
    qr: {
      title: "Scan the QR code",
      body: "to open the contact form and send us your referral.",
      hint: "On a computer? Scan it with your phone and carry on from there, or show it to the person you're referring.",
      visit: "or visit",
      personalTitle: "Let them scan your QR",
      personalBody:
        "This QR carries your invite: whoever scans it lands on the page with your name, and the referral stays yours.",
      qrAlt: "QR code that opens this page",
      personalQrAlt: "QR code of your personal invite link",
    },
    why: {
      kicker: "Why recommend us",
      title: "Your friend is in good hands.",
      lede: "When you recommend someone, your name is on it. Here's what your friend gets, from the first call on.",
      items: [
        {
          icon: "chat",
          t: "Free first call",
          d: "Thirty minutes to understand what they need. No sales pitch, no commitment.",
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
    faq: {
      kicker: "FAQ",
      title: "Straight questions, straight answers.",
      items: [
        {
          q: "How much do I get, exactly?",
          a: "Up to €100 for every person you refer who becomes our client for a website or an online store. The amount depends on the project they choose: we confirm it in writing when we validate the referral, before paying out.",
        },
        {
          q: "When does the cashback arrive?",
          a: "Once the new client has signed the contract and duly paid the first deposit. Then we write to you, collect the payout details and send the reward with the method you chose: bank transfer, PayPal or voucher.",
        },
        {
          q: "Does my friend need to know I referred them?",
          a: "Yes. The easiest way is your link: they write to us when they like and give their own privacy consent. If you'd rather send us their details, do it only after asking: we'll contact them saying you introduced us.",
        },
        {
          q: "Can I refer more than one person?",
          a: "Yes: every different person who becomes a client earns its own cashback. The same person can only be referred once, though: if they reach us from more than one side, the first valid referral counts.",
        },
        {
          q: "Who can take part?",
          a: "Anyone who knows someone in need of a website or an online store: clients, friends, colleagues. An email address is all you need to get your link.",
        },
        {
          q: "What if the person is already our client?",
          a: "The cashback rewards introducing a new client: if the person already works with us, the referral isn't valid.",
        },
        {
          q: "Can it be combined with other promotions?",
          a: "No: it can't be combined with other promotions or initiatives in progress, unless we state otherwise.",
        },
        {
          q: "What do you do with the data I enter?",
          a: "We use it only to manage the referral and pay out the reward, as explained in the program privacy notice. You can ask us to delete it at any time by writing to info@alpacode.it.",
        },
      ],
    },
    cross: {
      tag: "Working with clients every day?",
      title: "Become an Alpacode partner.",
      body: "Social media managers, accountants, sales agents, photographers: if clients keep asking you for websites, there's a program built for you. Refer, resell white-label or swap leads, with terms in writing.",
      cta: "Discover the partner program",
    },
    final: {
      kicker: "One last thing",
      line1: "One message to a friend.",
      line2: "Up to €100 for you.",
      sub: "Get your link in a minute, send it on WhatsApp and we take it from there.",
      cta: "Get your link",
      alt: "Questions? Write to us",
      altSubject: "Question about the refer-a-friend program",
    },
    sticky: "Get your link",
  },
};
