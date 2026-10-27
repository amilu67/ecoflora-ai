# Guida per studenti — EcoFlora AI

## Obiettivo

Osservare una pianta, identificarla in modo ragionato e costruire una scheda sul suo rapporto con le persone e con l'ambiente, distinguendo **evidenza scientifica**, **ipotesi** e **assenza di dati**.

## Attività 1 — Cerca una specie

1. Apri **Esplora specie**. Scegli una delle nove schede di esempio oppure digita un nome comune o scientifico e premi **Cerca online**.
2. Apri la scheda. Osserva la classificazione GBIF e il testo Wikipedia, se disponibile.
3. Controlla se le quattro aree (salute, aria, clima, biodiversità) riportano dati verificati o lacune.
4. Segna il nome scientifico e confrontalo con almeno una fonte botanica esterna. Il nome comune non sempre identifica una specie univoca.

## Attività 2 — Riconosci una fotografia

**Prima del riconoscimento:** crea una chiave personale sul sito <https://my.plantnet.org/>. Nelle impostazioni della chiave abilita l'uso da browser (CORS) e autorizza l'origine del sito della scuola o di GitHub Pages. Apri **Impostazioni API** nell'app, incolla la tua chiave, premi **Salva chiave locale** e poi **Verifica connessione**. Il repository GitHub non contiene chiavi di nessuno.

1. Fotografa **una sola pianta**, preferendo dettagli nitidi. Non includere persone o informazioni personali.
2. Apri **Riconosci una pianta** e premi **Apri fotocamera**. Concedi il permesso, inquadra la pianta e premi **Scatta foto**. Puoi usare **Cambia fotocamera** per passare da posteriore ad anteriore e **Chiudi** per spegnerla.
3. Se la fotocamera live non si avvia, prova **Fotocamera di sistema** (quando compare) oppure **Carica dalla galleria**. Per la camera live è necessario aprire il sito con HTTPS o localhost.
4. Controlla la foto nell’anteprima e premi **Analizza**. L’immagine viene caricata su Pl@ntNet solo a questo punto.
5. Il modello restituisce specie candidate e punteggi di confidenza, non certezze assolute. Controlla una o più alternative e confronta le caratteristiche botaniche.
6. Premi **Apri scheda** sulla candidata scelta: l'identificazione viene memorizzata nella tua cronologia del browser.
7. Se la richiesta non funziona, verifica la tua chiave, le quote e l'autorizzazione CORS. Chiedi aiuto al docente senza condividere pubblicamente la chiave. Puoi rimuoverla in **Impostazioni API > Rimuovi chiave salvata**.

## Attività 3 — Migliora una scheda

1. Da una scheda, premi **Migliora scheda**, oppure apri **Laboratorio studenti**.
2. Seleziona il nome scientifico. Per una specie nuova inserisci anche nome comune, famiglia e tipologia.
3. Compila una o più aree di analisi. Evita numeri arbitrari: ad esempio, non attribuire un tasso di cattura CO₂ senza misurazioni, specifiche metodologiche e unità.
4. Inserisci **una fonte HTTPS per ciascuna area compilata**. Preferisci enti di ricerca, istituzioni, pubblicazioni scientifiche e banche dati botaniche.
5. Premi **Salva contributo**. La tua modifica resta in IndexedDB e viene etichettata **da verificare**.
6. Se vuoi consegnarla al docente, premi **Esporta dati JSON**. La chiave Pl@ntNet non sarà inclusa nel file.

## Attività 4 — Lavora in gruppo

- Uno studente verifica il nome scientifico e la classificazione.
- Uno studente esamina i possibili effetti sanitari, distinguendo polline, contatto e ingestione.
- Uno studente documenta benefici e criticità ecologiche nella zona di studio.
- Il gruppo consegna un file JSON e una breve motivazione delle fonti scelte.
- Il docente confronta le fonti e decide se il contenuto sia idoneo a essere inserito nel catalogo iniziale `js/data.js`.

## Criteri di valutazione suggeriti

| Dimensione | Cosa cercare |
|---|---|
| Corretta identificazione | Confronto delle caratteristiche e incertezza dichiarata |
| Qualità delle fonti | Autore/istituzione identificabile, pubblicazione pertinente |
| Rilevanza sanitaria | Rischi descritti con condizioni e limiti, senza prescrizioni cliniche |
| Rigore ambientale | Nessun punteggio o quantità senza dati e metodo |
| Tracciabilità | Link coerente per ogni affermazione significativa |
| Trasparenza | Dati mancanti esplicitati e mai spacciati per «rischio zero» |

## Domande per approfondire

- Un punteggio AI del 90% equivale a una probabilità clinicamente affidabile? Perché no?
- Perché la stessa specie può avere impatti diversi in città, in un bosco e in un giardino scolastico?
- Perché una specie può essere favorevole per alcune funzioni ecologiche e problematica per altre?
- Come cambia un'analisi quando è presente una fonte solida rispetto a una descrizione generica?

## Sicurezza

L'app non può stabilire se una pianta sia commestibile o sicura. Non assaggiare, ingerire, bruciare o manipolare piante sconosciute per completare gli esercizi. Per problemi di salute rivolgersi a professionisti qualificati.
