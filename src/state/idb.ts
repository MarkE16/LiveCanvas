let indexedDB: IDBDatabase | null = null;
let imageData: IDBObjectStore | null = null;

const VERSION = 6;

export const getIndexedDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (indexedDB) {
      resolve(indexedDB);
    }

    const conn = window.indexedDB.open("canvas", VERSION);

    if (!conn) {
      return;
    }

    conn.onsuccess = (e: Event) => {
      const target = e.target as IDBOpenDBRequest;

      indexedDB = target.result;

      resolve(indexedDB);
    }

    conn.onerror = (e: Event) => {
      const target = e.target as IDBOpenDBRequest;

      reject(target.error);
    }

    conn.onupgradeneeded = (e: Event) => {
      const db = (e.target as IDBOpenDBRequest).result;

      if (!db) {
        return;
      }

      if (!db.objectStoreNames.contains("layers")) {
        db.createObjectStore("layers");
      }
    }
  });
}

export const closeIndexedDB = () => {
  return new Promise<void>((resolve) => {
    if (indexedDB) {
      indexedDB.close();
      indexedDB = null;
    }

    resolve();
  });
}

export const getAllEntries = (storeName: string) => {
  return new Promise<any[]>((resolve, reject) => {
    getIndexedDB().then(db => {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);

      const entries: any[] = [];

      store.openCursor().onsuccess = (e) => {
        const cursor = (e.target as IDBRequest).result;

        if (cursor) {
          entries.push([cursor.key, cursor.value]);
          cursor.continue();
        } else {
          resolve(entries);
        }
      }

      tx.onerror = () => reject(tx.error);
    });
  });
}