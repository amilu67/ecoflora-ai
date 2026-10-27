# API, chiavi e sicurezza

## Endpoint e richieste

### Pl@ntNet (identificazione fotografica)

- Endpoint: `POST https://my-api.plantnet.org/v2/identify/all?api-key=...&lang=it&nb-results=5`.
- Contenuto: `multipart/form-data`, campo file `images` (una fotografia JPEG ridimensionata dal browser).
- Risposta: `results[]` con `species.scientificNameWithoutAuthor`, `species.commonNames` e `score` in [0,1].
- Fonti ufficiali: <https://my.plantnet.org/doc/api/identify>, <https://my.plantnet.org/doc/getting-started/introduction>.
- Limiti: l'identificazione non è certezza tassonomica; immagini migliori possono aumentare l'affidabilità. Il contratto gratuito prevede in genere massimo 500 riconoscimenti/giorno **per account** (verifica le condizioni vigenti).

### GBIF

- Ricerca: `GET https://api.gbif.org/v1/species/search?q=...&kingdom=Plantae&rank=SPECIES&limit=24`.
- Nome tassonomico: `GET https://api.gbif.org/v1/species/match?name=...&kingdom=Plantae`.
- Riferimento: <https://techdocs.gbif.org/en/openapi/v1/species>.

### Wikipedia / MediaWiki

- `GET https://it.wikipedia.org/w/api.php?action=query&generator=search&...&format=json&origin=*`.
- L'origine `*` abilita le richieste cross-origin pubbliche secondo MediaWiki. Testi e miniature conservano licenze e diritti degli autori.
- Riferimento: <https://www.mediawiki.org/wiki/API:Cross-site_requests>.

## Chiave personale dell'utente (versione per GitHub)

Questo progetto NON contiene alcuna chiave API predefinita. Il valore di `plantnetApiKey` in `js/config.js` è intenzionalmente vuoto. Ogni studente può creare una propria chiave Pl@ntNet e inserirla in **Impostazioni API**; la chiave viene salvata nell'archivio IndexedDB del **proprio browser** e non viene inserita nel codice né negli archivi esportati in JSON.

### Istruzioni per ogni utente

1. Apri <https://my.plantnet.org/> e registrati/accedi.
2. Crea una chiave API personale, attenendoti alle condizioni del servizio.
3. Dalla pagina delle impostazioni della chiave, abilita **Expose my API key** (CORS) solo per l'uso dal browser.
4. In **Authorized domains**, inserisci l'origine esatta della pagina, ad esempio `https://nomeutente.github.io` per GitHub Pages (oppure l'origine personalizzata usata realmente). HTTP e HTTPS sono origini diverse.
5. Torna all'app, apri **Impostazioni API**, incolla la chiave, premi **Salva chiave locale**, poi **Verifica connessione**.
6. Se vuoi smettere di utilizzarla su questo dispositivo, scegli **Rimuovi chiave salvata**. Puoi anche eliminare i dati del sito dalle impostazioni del browser.

**Limite di sicurezza importante:** IndexedDB è un archivio locale, **non** una cassaforte crittografica. La chiave è accessibile nel proprio browser e transita nelle richieste inviate all'API. La web app statica non può mantenerla segreta verso il browser che la utilizza. Non inserire una chiave amministrativa o condivisa in un sito pubblico. Per credenziali riservate a un amministratore occorre un backend/proxy con rate limiting.

**Se la chiave originale è stata mostrata in una chat, distribuita in uno ZIP o pubblicata in un repository**, revocala/rigenerala dal tuo account prima di riutilizzare il progetto. Modificare `config.js` non revoca il vecchio valore e non lo elimina dalla cronologia Git.

## Rischi e mitigazioni implementate

- **Iniezione HTML:** contenuti e nomi remoti inseriti nelle schede vengono codificati con `esc()`; URL esterni visualizzati solo se HTTPS (`safeUrl()`).
- **Caricamento fotografie:** resize e conversione JPEG nel browser; le miniature della cronologia sono piccole, ma rimangono in IndexedDB finché non vengono cancellate.
- **Esportazione dati:** archivio JSON non include l'API key e richiede un'azione esplicita dello studente.
- **Importazione JSON:** schema/limite dimensioni convalidati; fonti HTTPS obbligatorie per contributi compilati; i dati restano comunque **non revisionati**.
- **Servizi esterni:** URL di endpoint fissi, nessuna autorizzazione remota per modificare il codice JS, timeout/gestione errori per GBIF e MediaWiki.
- **Offline:** le API non sono accessibili offline. Risorse CDN (Font Awesome e font web) potrebbero non essere disponibili prima della cache del browser.
- **Dati personali:** non sono raccolti automaticamente nomi, email, geolocalizzazione e identificativi degli studenti. Evitare fotografie che includano persone e proprietà riconoscibili.

## Licenze e attribuzione

Pl@ntNet è citato nell'app e nei documenti. Esamina <https://my.plantnet.org/terms_of_use> e le condizioni sul riconoscimento e l'uso educativo. GBIF e Wikipedia prevedono licenze e obblighi di attribuzione propri; le immagini estratte da Wikipedia possono richiedere il nome dell'autore e la licenza esatta. Il codice originario di EcoFlora AI è rilasciato in MIT, ma questa licenza non cambia quelle dei contenuti esterni.

## Privacy della ripresa fotografica (versione 1.2)

La ripresa live usa `navigator.mediaDevices.getUserMedia()` in un contesto sicuro (HTTPS o localhost) e dopo il consenso del browser. Non è trasmesso alcuno streaming a Pl@ntNet. Quando lo studente preme **Scatta foto**, un frame viene convertito in JPEG nel browser; solo il successivo clic esplicito su **Analizza** invia il file via POST al servizio. `js/camera.js` interrompe le tracce della fotocamera alla chiusura, quando si cambia vista e quando la pagina diventa nascosta. Il ripiego HTML `capture=environment` richiede un browser/dispositivo compatibile e non garantisce lo stesso comportamento ovunque.
