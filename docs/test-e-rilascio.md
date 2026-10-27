# Piano di test e rilascio

## Preparazione

1. Avvia un server statico locale (esempio: `python3 -m http.server 8080`).
2. Apri `http://localhost:8080` con Chrome/Edge/Firefox recenti.
3. Apri anche la console del browser (F12), per individuare eventuali errori JavaScript.
4. Effettua i test da desktop e da smartphone/tablet, se possibile.

## Checklist funzionale

- [ ] Il catalogo mostra le 9 schede iniziali.
- [ ] La ricerca interna filtra i nomi comuni, scientifici e le famiglie.
- [ ] Il pulsante **Cerca online** chiama GBIF e mostra le specie se Internet è disponibile.
- [ ] La scheda aperta recupera classificazione GBIF e, quando reperibile, riassunto e foto da Wikipedia.
- [ ] La scheda mostra i riferimenti per i contenuti specialistici e una nota di cautela.
- [ ] Preferiti: salva e rimuovi; il dato rimane dopo ricarica pagina.
- [ ] Impostazioni: al primo avvio il campo chiave è vuoto. Si può salvare una chiave personale in IndexedDB, usarla dopo ricarica e rimuoverla con l'apposito pulsante.
- [ ] Test connessione: mostra errore comprensibile se CORS/chiave/rete non funzionano.
- [ ] Da HTTPS/localhost: premi **Apri fotocamera**, accetta il permesso, verifica l’anteprima video e premi **Scatta foto**: la camera si spegne e compare la foto senza richieste Pl@ntNet immediate.
- [ ] Premi **Cambia fotocamera** (se il dispositivo dispone di una seconda camera), poi **Chiudi**: la spia della camera deve spegnersi; riprova dopo il permesso negato.
- [ ] Verifica su telefono i pulsanti **Carica dalla galleria** e **Fotocamera di sistema** (quest’ultimo appare in caso di indisponibilità della ripresa live); il comportamento nativo dipende dal browser.
- [ ] Apri la fotocamera e passa a **Esplora specie** o cambia scheda del browser: la ripresa deve arrestarsi. Rientrando può essere riaperta.
- [ ] Da un indirizzo HTTP non attendibile diverso da localhost, la camera live deve mostrare spiegazione HTTPS senza bloccare caricamento galleria.
- [ ] Carica una foto PNG/JPEG: si vede l'anteprima; formato ottimizzato; riconoscimento ritorna candidati **solo se Pl@ntNet consente l'origine e la quota non è esaurita**.
- [ ] Il risultato scelto compare nella cronologia e conserva la miniatura dopo refresh.
- [ ] Laboratorio: carica una specie esistente, modifica un campo, assegna una fonte HTTPS e salva.
- [ ] Per una voce con testo ma senza fonte, il salvataggio viene rifiutato.
- [ ] La scheda modificata mostra chiaramente **contributo non validato**.
- [ ] Esporta JSON: il file contiene `contributions`, `records` e `history`, ma **mai** `plantnetApiKey` o `api-key`.
- [ ] Importa JSON: le schede importate sono disponibili dopo il refresh.
- [ ] Elimina contributo: la scheda iniziale riappare se era presente nel catalogo.
- [ ] Modalità offline: l'interfaccia si apre dopo il primo caricamento, ma API online non funzionano.
- [ ] Stampa una scheda con **Stampa / PDF**.
- [ ] Verifica tastiera, focus e resa schermo 360px / 768px / 1440px.

## Gestione degli errori

- CORS non autorizzato: app deve spiegare di registrare l'origine nella console Pl@ntNet.
- Chiave errata: deve apparire un errore HTTP, senza mostrare la chiave nei messaggi.
- Quota esaurita: risposta HTTP 429 non deve bloccare l'interfaccia.
- Offline: catalogo locale e archivi locali dovrebbero restare consultabili; i contenuti Wikipedia/GBIF remoti non sono garantiti.
- Nome non trovato: niente valutazioni ambientali inventate.
- JSON malevolo/malformato: importazione rifiutata, nessuna esecuzione di codice.

## Prima di distribuire agli studenti

- [ ] Richiedi e annota l'autorizzazione al trattamento di eventuali fotografie prevista dall'istituto.
- [ ] Non usare immagini con volti o dati personali riconoscibili.
- [ ] Chiedi agli studenti di creare chiavi personali e autorizzare l'origine HTTPS della scuola nella dashboard Pl@ntNet; controlla quote, uso educativo e costi eventuali.
- [ ] Consegna agli studenti anche il README e tutte le pagine in `docs/`.
- [ ] Verifica che nessuna chiave sia presente nei file pubblici; **non committare mai una chiave**, nemmeno in README o screenshot. Se una chiave è stata pubblicata in precedenza, revocala/rigenerala: rimuoverla dai file nuovi non la rimuove dalla cronologia Git.
- [ ] Aggiorna il nome della cache in `sw.js` a ogni nuovo rilascio.
- [ ] Consiglia di esportare periodicamente i dati: la cancellazione dei dati del browser elimina IndexedDB.

## Test automatizzati della distribuzione

Questo pacchetto non include dipendenze Node per l'esecuzione. Per controlli statici è sufficiente un runtime Node installato **solo sul computer dello sviluppatore**:

```bash
node --check js/app.js
node --check js/camera.js
node --check js/api.js
node --check js/data.js
node --check js/db.js
node --check js/config.js
```

Questo non aggiunge Node.js al funzionamento della web app.
