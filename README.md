# Alpacode · Segnala un amico

Landing del programma cashback di Alpacode: **«Conosci qualcuno a cui potrebbe
servire un sito web?»** — chi segnala un amico che diventa cliente riceve
**fino a 100 €** con bonifico, PayPal o buono acquisto.

È la versione web del volantino del programma, sezione per sezione, più quello
che un volantino non può fare: il **link unico** diventa un vero link
personale, condivisibile da WhatsApp in un tocco, con QR code e pagina di
invito che saluta l'amico per nome.

Stesso stack, stessi token e stesse regole di
[`alpacode-website`](https://github.com/FrancescoCorbosiero/alpacode-website)
(Astro 5 + TypeScript, CSS vanilla, GSAP + Lenis, Archivo Black + Manrope,
angoli vivi, il «blue strut»), seguendo il suo playbook
`docs/landing-factory.md` (Track B, landing su misura).

## Pagine

| URL | Cosa | Render |
| --- | --- | --- |
| `/` · `/en/` | La landing per chi segnala | statico |
| `/invito/<CODICE>` · `/en/invito/<CODICE>` | Dove atterra l'amico: «Mario ti ha consigliato Alpacode», prima call gratuita, modulo | on demand (il nome è nell'HTML e nell'anteprima WhatsApp) |
| `/privacy/` · `/en/privacy/` | Informativa privacy del programma | statico |
| `POST /api/referral` | L'unico endpoint | on demand |

## Dal volantino alla landing

Tutto ciò che c'è sul volantino è nella pagina:

- header con logo, «Siti web, e-commerce, software e formazione. Tutto il
  digitale, per il tuo business.» e il link ad alpacode.it;
- titolo, sottotitolo, il bollino **FINO A 100€ DI CASHBACK →** (con il
  contatore che sale a 100 e i tratti blu che «esplodono»), la riga sui
  metodi di erogazione, la foto con «Più persone nel mondo digitale. Insieme.»;
- **Scegli come riceverlo** (bonifico/SEPA, PayPal/wallet, buono/gift card —
  ora selezionabili, la scelta passa ai moduli);
- **Come funziona?** in 4 passi con numeri, icone e frecce;
- la banda scura con **QR code**, «oppure visita alpacode.it/», l'alpaca e la
  frase scritta a mano;
- footer con i tre valori (esperienza e affidabilità, un team al tuo fianco,
  la crescita dei clienti) e le **Note e condizioni**.

Cosa è stato ottimizzato:

- **Link unico reale.** Nome + email → codice personale (`MARIO-7K2QX`) e link
  `/invito/MARIO-7K2QX`. Anteprima live del messaggio come arriverà in chat,
  condivisione WhatsApp / Telegram / email / app native, copia, QR del link
  personale (anche nella banda QR). Il link resta salvato nel browser e si
  rigenera identico con la stessa email.
- **Due strade, come dice il passo 1**: condividere il link (consigliato:
  l'amico presta da sé il consenso privacy) oppure «Mandaci tu i contatti»,
  con la spunta esplicita «ho informato questa persona e mi ha dato il
  consenso».
- **Pagina dell'amico**: personalizzata col nome di chi invita, passo 2
  evidenziato «Sei qui», promesse già presenti su alpacode.it (prima call
  gratuita, prezzo deciso prima, niente costi nascosti, pagamenti
  rateizzabili), modulo breve con il codice allegato.
- **Regole che si applicano da sole**: il server riconosce una persona già
  segnalata (email o telefono) e lo scrive nell'oggetto della mail
  (`[GIÀ SEGNALATA]`); le richieste da invito arrivano con nome ed email di
  chi ha segnalato.
- **Copy**: corretto «Il cliente diventa tale» → «Diventa nostro cliente» e il
  refuso «Uno stesso persona»; la condizione n. 3 ora dice di chi è il primo
  acconto; aggiunte le condizioni n. 7–8 (consenso della persona segnalata,
  trattamento dati) e un'**informativa privacy del programma**.
- **FAQ** (con JSON-LD), sezione «Il tuo amico è in buone mani», card verso il
  programma partner, CTA finale, CTA sticky, IT + EN.

## Sviluppo

```sh
npm install
npm run dev            # http://localhost:4321
npm run check          # astro check (TypeScript)
npm run build          # dist/
npm start              # server di produzione: node ./dist/server/entry.mjs
```

Senza `AWS_REGION` l'API non invia email: le stampa nel log e risponde ok, e
il registro finisce in `./data/referrals.jsonl` — tutto il flusso si prova in
locale senza credenziali.

## Deploy

Come il sito principale: container Node dietro `caddy-docker-proxy`.

```sh
cp .env.example .env    # SITE_URL, SITE_DOMAIN, REFERRAL_SECRET, AWS_*
docker compose up -d --build
docker compose logs -f alpacode-voucher
```

- **`SITE_URL`** finisce nei canonical, nel QR e nei link d'invito: impostalo
  sul dominio reale *prima* della build (default `https://voucher.alpacode.it`).
- **`REFERRAL_SECRET`**: valore lungo e casuale (`openssl rand -hex 32`), da
  non cambiare più — i codici derivano da questo segreto.
- Il **registro** (`/app/data/referrals.jsonl`, volume `referral-data`) è un
  JSON per riga: si legge con `grep`, si salva con un backup del volume.

## Come funzionano i codici

`MARIO-7K2QX` = nome (ASCII, max 12 lettere) + 5 caratteri Crockford base32
di un HMAC-SHA256 dell'email con `REFERRAL_SECRET`. Stessa email → stesso
codice, senza database né account. Ogni email allo studio riporta il codice
nell'oggetto, quindi una ricerca nella casella ricostruisce tutta la storia
di una segnalazione.

## Dove si cambia cosa

| Cosa | File |
| --- | --- |
| Tutti i testi della landing (IT/EN) | `src/data/landing.ts` |
| Testi condivisi: header, metodi di pagamento, 4 passi, footer, moduli | `src/data/shared.ts` |
| Pagina invito | `src/data/invite.ts` |
| Note e condizioni | `src/data/terms.ts` |
| Informativa privacy del programma (**bozza da validare**) | `src/data/privacy.ts` |
| Dati aziendali (email, P. IVA, WhatsApp) | `src/data/business.ts` |
| Stili | `src/styles/landing.css`, `forms.css`, `invite.css` |
| Comportamento | `src/scripts/landing.ts`, `invite.ts`, `forms.ts` |
| API | `src/pages/api/referral.ts`, `src/lib/server/*` |

**Foto**: `tools/media/amici-laptop.jpg` è la foto del volantino, ingrandita
3× con super-risoluzione (EDSR) dal file a 1024 px. Se hai l'originale in alta
risoluzione, sostituiscilo e lancia `npm run media`.
**Anteprime social**: `tools/og/*.svg` → `npm run og` → `public/og-*.jpg`
(JPEG ~100 kB: WhatsApp scarta le immagini oltre ~300 kB).

## Da decidere prima del lancio

- Il **dominio** definitivo (`SITE_URL` / `SITE_DOMAIN`).
- Gli importi esatti: la pagina dice «fino a 100 €» e che l'importo viene
  confermato per iscritto alla verifica — se esistono fasce (es. sito vetrina
  vs e-commerce), vanno in `src/data/landing.ts` (FAQ) e nelle condizioni.
- Due regole aggiunte nelle FAQ, da confermare: «se una persona arriva da più
  parti vale la prima segnalazione valida» e «può partecipare chiunque, non
  serve essere già clienti».
- L'**informativa privacy** del programma è una bozza scritta sullo stile di
  quella di alpacode.it: falla rivedere a chi segue la parte legale.
