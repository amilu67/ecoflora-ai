# Architettura e guida per sviluppatori

## Stack

JavaScript ES modules senza framework; HTML5; CSS3 responsive; Font Awesome tramite CDN; IndexedDB; Service Worker e manifest PWA. Non è presente alcun server applicativo proprietario né una piattaforma di autenticazione.

## Flussi

```text
Fotocamera live (getUserMedia → canvas → File) / fotocamera nativa (capture) / galleria
    └── js/camera.js → js/api.js: resizePhoto() — ricodifica JPEG
            └── POST Pl@ntNet: /v2/identify/all?api-key=...
                    └── lista candidati con score
                            └── conferma studente
                                ├── IndexedDB.history (miniatura e taxon)
                                └── scheda dettagliata
                                    ├── GBIF species/match
                                    ├── Wikipedia Action API
                                    └── impatti curati / contributi locali
```

```text
Ricerca nome ──> GET GBIF species/search ──> scheda ──> editor studente
                                                        └── IndexedDB.contributions
Esporta JSON <── IndexedDB.records + .history + .contributions
API key iniziale ──> js/config.js ──> IndexedDB.settings (eventuale override)
```

## Struttura dei moduli

| File | Responsabilità | Punto di estensione |
|---|---|---|
| `js/config.js` | Configurazione iniziale | Modificare opzioni pubbliche; non inserire credenziali nel codice |
| `js/data.js` | Nove schede curate | Aggiungere specie e nuove fonti |
| `js/camera.js` | Permessi, stream della camera, scatto da video, ripiego nativo | Nuove opzioni di acquisizione/accessibilità |
| `js/api.js` | Pl@ntNet, GBIF, MediaWiki, ricodifica foto | Nuove fonti botaniche o validazione della risposta |
| `js/db.js` | Promise IndexedDB | Indici, nuove object stores, migrazioni |
| `js/app.js` | Navigazione, ricerca, archivio, editor, export/import | Interfaccia e controlli didattici |
| `index.html` | Struttura semantica dell'app | Nuove sezioni o campi |
| `css/style.css` | Grafica e adattamento a schermi piccoli | Temi e accessibilità |
| `sw.js` | Memorizzazione locale dell'interfaccia | Caching e versionamento |

## Fotocamera e ciclo di vita

Il modulo `js/camera.js` gestisce `getUserMedia({video:{facingMode:{ideal:"environment"}}})`. Quando premi **Scatta foto** il frame video è disegnato su un canvas e convertito in un `File` JPEG tramite `toBlob()`. Il modulo passa il file a `selectPhoto()` in `js/app.js`; poi `js/api.js` ridimensiona/normalizza e `identifyPlant()` invia l’immagine **solo dopo il clic su Analizza**.

Con `close()` sono arrestate tutte le tracce hardware della camera (`MediaStreamTrack.stop()`) e il video è scollegato. La camera si chiude anche cambiando sezione o nascondendo la pagina. La richiesta asincrona è identificata da un contatore: se l’utente esce prima di concedere il permesso, lo stream acquisito in ritardo viene immediatamente interrotto.

Sono presenti due input distinti: `photo-input` **senza** `capture` (galleria) e `camera-input` **con** `capture="environment"` (ripiego fotocamera di sistema). L’attributo `capture` non è supportato uniformemente dai browser: per questo è presente il live preview.

## Database IndexedDB

Nome: `ecoflora-ai-v1` (nome di database conservato per non perdere dati precedenti), **schema versione 2**.

- `records` — chiave `scientific`; preferiti con nomi scientifici e metadati.
- `history` — chiave `id` autoIncrement; immagini miniatura, data e confidenza.
- `settings` — chiave `key`; contiene soltanto impostazioni come l'eventuale override della chiave API.
- `contributions` — chiave `scientific`; schede create o modificate dagli studenti, con riferimenti HTTPS per area.

Le schede iniziali rimangono dentro `js/data.js`. Le modifiche degli studenti hanno priorità nella visualizzazione, ma non sovrascrivono il file di base. Eliminando un contributo, riappare l'eventuale scheda originale.

## Aggiungere una specie iniziale

Copia l'oggetto di un'altra specie all'interno dell'array `SPECIES` di `js/data.js` e cambia almeno:

```js
{
  scientific: 'Genus species',
  common: 'Nome comune',
  family: 'Famiglia',
  kind: 'Erbacea',
  icon: 'fa-leaf',
  aliases: [],
  highlights: ['Dato da verificare'],
  impacts: {
    health: { title: 'Dati non disponibili', text: 'Da approfondire.', sources: [] },
    air: { title: 'Dati non disponibili', text: 'Da approfondire.', sources: [] },
    climate: { title: 'Dati non disponibili', text: 'Da approfondire.', sources: [] },
    biodiversity: { title: 'Dati non disponibili', text: 'Da approfondire.', sources: [] }
  }
}
```

Le quattro aree di impatto sono volutamente **qualitative**. L'assenza di fonte va dichiarata e non convertita in un numero, giudizio di rischio basso o livello di sicurezza.

## Come aggiungere una funzionalità

1. Definisci struttura e requisiti in `index.html`.
2. Scrivi la funzione isolata (API in `js/api.js`, persistenza in `js/db.js`, interazione in `js/app.js`).
3. Usa sempre `esc()` per il contenuto utente inserito in HTML e `safeUrl()` per gli URL remoti.
4. Verifica i diversi stati: online, offline, API fallita, archivio vuoto, ricerca senza risultati.
5. Aggiorna il nome `CACHE` in `sw.js` quando modifichi i file della PWA.
6. Aggiungi un test manuale a `docs/test-e-rilascio.md`.

## Proposte di sviluppo per la classe

- Filtro per specie endemiche e autoctone, usando una fonte territoriale ufficiale.
- Verifica dei sinonimi tassonomici e gestione dell'incertezza nell'identificazione.
- Confronto tra due specie *solo* rispetto a indicatori documentati e comparabili.
- Modulo di revisione docente con stati bozza / verificata e data della revisione.
- Import ed export in un formato standardizzato, con versione di schema e licenze.
- Controlli di accessibilità (navigazione tastiera, contrasto, testo alternativo) e internazionalizzazione.

**Privacy:** il browser invia immagini a Pl@ntNet e query tassonomiche ai fornitori esterni; la web app non gestisce utenti registrati, server propri, sincronizzazione automatica, geolocalizzazione o tracciamento pubblicitario.
