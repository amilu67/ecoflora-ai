const DB_NAME = 'ecoflora-ai-v1';
const DB_VERSION = 2;
let connection;

export function getDb() {
  if (connection) return connection;
  connection = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('IndexedDB non disponibile'));
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('records')) db.createObjectStore('records', { keyPath: 'scientific' });
      if (!db.objectStoreNames.contains('history')) db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' });
      if (!db.objectStoreNames.contains('contributions')) db.createObjectStore('contributions', { keyPath: 'scientific' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return connection;
}

async function operation(store, mode, fn) {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const request = fn(tx.objectStore(store));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.onabort = () => reject(tx.error || new Error('Operazione IndexedDB annullata'));
  });
}
export const dbGet = (store, key) => operation(store, 'readonly', s => s.get(key));
export const dbAll = store => operation(store, 'readonly', s => s.getAll());
export const dbPut = (store, item) => operation(store, 'readwrite', s => s.put(item));
export const dbDelete = (store, key) => operation(store, 'readwrite', s => s.delete(key));
export const dbClear = store => operation(store, 'readwrite', s => s.clear());
