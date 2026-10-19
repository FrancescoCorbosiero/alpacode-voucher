/* ============================================================
   Note e condizioni — the flyer's six terms, kept in substance
   and order, with three fixes:
   - typo "Uno stesso persona" -> "Una stessa persona" (n. 4);
   - n. 3 now says whose payment releases the cashback;
   - n. 7 and n. 8 are new: a form that collects someone else's
     contact details needs the privacy basis spelled out.
   Rendered in the footer of every page and linked from the forms
   as #condizioni.
   ============================================================ */
import type { Lang } from "../i18n/types";

export const terms: Record<Lang, string[]> = {
  it: [
    "Il cashback fino a 100 € è riconosciuto esclusivamente per segnalazioni che si concludono con un nuovo cliente che sottoscrive un contratto per la realizzazione di un sito web o di un e-commerce con Alpacode.",
    "La segnalazione deve contenere dati corretti e completi del contatto (nome, cognome, email e/o telefono).",
    "Il cashback verrà accreditato solo dopo la conferma dell'acquisizione del cliente e il regolare pagamento, da parte sua, del primo acconto o anticipo.",
    "Una stessa persona non può essere segnalata più di una volta.",
    "Il cashback non è cumulabile con altre promozioni o iniziative in corso, salvo diverse comunicazioni da parte di Alpacode.",
    "Alpacode si riserva il diritto di verificare la validità delle segnalazioni e di escludere quelle ritenute non conformi ai presenti termini.",
    "Chi segnala i contatti di un'altra persona dichiara di averla informata e di avere il suo consenso a essere contattata da Alpacode.",
    "I dati raccolti sono trattati da Soluzioni Digitali Alpacode solo per gestire il programma e l'erogazione del cashback, come descritto nell'informativa privacy del programma.",
  ],
  en: [
    "The cashback of up to €100 applies only to referrals that end with a new client signing a contract with Alpacode for a website or an online store.",
    "A referral must contain correct and complete contact details (first name, last name, email and/or phone).",
    "The cashback is credited only after the client's acquisition is confirmed and the client has duly paid the first deposit or advance.",
    "The same person cannot be referred more than once.",
    "The cashback cannot be combined with other promotions or initiatives in progress, unless Alpacode states otherwise.",
    "Alpacode reserves the right to check the validity of referrals and to exclude those that do not comply with these terms.",
    "Whoever shares another person's contact details declares they have informed that person and have their consent to be contacted by Alpacode.",
    "The data collected is processed by Soluzioni Digitali Alpacode only to run the program and pay out the cashback, as described in the program privacy notice.",
  ],
};
