/**
 * EcoFlora AI - configurazione pubblica e senza credenziali.
 * Ogni utente imposta la propria chiave Pl@ntNet da "Impostazioni API".
 * La chiave viene salvata esclusivamente nel suo IndexedDB locale e
 * non compare nei file pubblicati o negli archivi JSON esportati.
 * NOTA: l'inserimento in una web app client-side NON nasconde la chiave
 * al browser dell'utente o alle richieste di rete del suo dispositivo.
 */
export const DEFAULT_CONFIG = Object.freeze({
  plantnetApiKey: '',
  plantnetProject: 'all',
  language: 'it'
});
