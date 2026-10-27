# Pubblicazione su GitHub Pages — EcoFlora AI 1.3

## Prima di caricare

- Questo archivio **non contiene chiavi API**. Non inserire una chiave in `js/config.js`, nei file HTML, nel README, nelle screenshot o nei commit Git.
- Se avevi già condiviso una vecchia chiave, **revocala e generane una nuova su Pl@ntNet**. Pubblicare il progetto nuovo non elimina la chiave dagli ZIP o dai commit precedenti.
- Scarica ed estrai lo ZIP. I file da caricare si trovano **nella radice** dell'archivio (`index.html` accanto a `README.md`).

## Caricamento su GitHub senza riga di comando

1. Vai su <https://github.com/new> e crea un repository, per esempio `ecoflora-ai`, con visibilità pubblica.
2. Apri il repository e scegli **Add file > Upload files**. Carica **il contenuto estratto** dallo ZIP, mantenendo le cartelle `js`, `css`, `assets` e `docs` (non caricare solo il file ZIP!).
3. Conferma le modifiche (commit).
4. Entra in **Settings > Pages**. In **Build and deployment**, seleziona **Deploy from a branch**.
5. Seleziona la branch `main` e la cartella **/(root)**, quindi salva.
6. Dopo la pubblicazione, visita un indirizzo simile a `https://nomeutente.github.io/ecoflora-ai/`.
7. Sul tuo smartphone autorizza la fotocamera quando richiesto: GitHub Pages serve i file in HTTPS.

Le impostazioni di Pages possono variare leggermente nel tempo. Guida ufficiale: <https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site>.

## Ogni studente: configura la sua chiave Pl@ntNet

1. Vai su <https://my.plantnet.org/>; crea una chiave API personale seguendo il portale.
2. Nelle impostazioni abilita **Expose my API key** (richieste CORS dal browser).
3. Sotto **Authorized domains** aggiungi l'**origine** del sito (per l'URL di esempio: `https://nomeutente.github.io`), non il percorso `/ecoflora-ai/`. Se usi un dominio personalizzato, autorizza quello effettivo.
4. Entra nell'app: **Impostazioni API > La tua chiave API Pl@ntNet > Salva chiave locale > Verifica connessione**.
5. Passa a **Riconosci una pianta**, scatta o carica una foto e premi **Analizza**. Le API funzionano solo online.
6. Per rimuovere la chiave dal dispositivo scegli **Rimuovi chiave salvata**.

### Se non funziona

- **Riconoscimento disattivato**: devi prima salvare una chiave personale.
- **CORS / rete**: controlla le impostazioni Pl@ntNet, incluso `https://` nell'origine autorizzata. La pagina di test dell'API non sostituisce un riconoscimento completo.
- **Fotocamera live**: apri l'app in HTTPS, consenti il permesso e prova un browser aggiornato. In alternativa usa galleria o fotocamera di sistema.
- **Aggiornamenti non visibili**: ricarica la pagina; l'app usa una cache Service Worker versionata.
- **Chiave già salvata in un browser usato per la vecchia versione**: apri **Impostazioni API > Rimuovi chiave salvata**; cancella i dati del sito se preferisci azzerare tutto.

## Nota su sicurezza e dati

Questa app è **statica**: non c'è un server per proteggere le chiavi. IndexedDB evita che la chiave personale venga distribuita con GitHub, **ma non la cifra**. Non usare chiavi amministrative condivise. L'archivio JSON esportato dall'app non contiene chiavi. Non usare foto che ritraggono persone o dati sensibili.

## Aggiornare il progetto

Modifica i file del repository e carica un nuovo commit. Se cambi CSS o JS e un dispositivo mostra ancora la versione precedente, incrementa la costante `CACHE` in `sw.js` e ricarica. Il banner del README è in `assets/banner-site.png`.
