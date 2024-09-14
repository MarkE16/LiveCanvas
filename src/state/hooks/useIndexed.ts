// Lib
import { useRef } from "react"

const STORES = ["layers"];

const useIndexed = () => {
  const database = useRef<IDBDatabase | null>(null);

  const getDb = () => {
    return new Promise((resolve, reject) => {
      if (database.current) {
        resolve(database.current);
      }

      const request = indexedDB.open("canvas", 1);

      request.onsuccess = () => {
        database.current = request.result;
        resolve(database.current);
      };

      request.onerror = () => {
        reject(request.error);
      };

      request.onupgradeneeded = () => {
        const db = request.result;

        for (const store of STORES) {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store);
          }
        }

        database.current = db;
      };
    });
  };

  return {
    getDb,
  };
}

export default useIndexed;