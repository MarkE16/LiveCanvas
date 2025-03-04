// Lib
import { useEffect, createContext, useRef, useCallback, useMemo } from "react";

// Types
import type { FC, PropsWithChildren } from "react";

const STORES = ["layers", "elements", "files"];
const VERSION = 1; // Bump this up when the schema changes.

type IndexedUtils = {
	/**
	 * Get data from the database.
	 * @param store The store to get data from.
	 * @param key An optional key to get the data under.
	 * @returns A promise that resolves with the data.
	 */
	get: <T>(store: string, key?: string) => Promise<T | undefined>;

	/**
	 * Set data in the database.
	 * @param store The store to set data in.
	 * @param key The key to set the data under.
	 * @param value The value to set.
	 * @returns A promise that resolves when the data is set.
	 */
	set: (store: string, key: string, value: unknown) => Promise<void>;

	/**
	 * Remove data from the database.
	 * @param store The store to remove data from.
	 * @param key The key to remove the data under.
	 * @returns A promise that resolves when the data is removed.
	 */
	remove: (store: string, key: string) => Promise<void>;
};

export const IndexedDBContext = createContext<IndexedUtils | null>(null);

export const IndexedDBProvider: FC<PropsWithChildren> = ({ children }) => {
	const database = useRef<IDBDatabase | null>(null);
	const dbOpenPromise = useRef<Promise<IDBDatabase> | null>(null);

	const openDatabase = useCallback(() => {
		if (dbOpenPromise.current) {
			return dbOpenPromise.current;
		}

		dbOpenPromise.current = new Promise((resolve, reject) => {
			const request = indexedDB.open("canvas", VERSION);

			request.onsuccess = () => {
				database.current = request.result;
				resolve(request.result);
			};

			request.onerror = () => {
				console.error(request.error);
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

		return dbOpenPromise.current;
	}, []);

	const get = useCallback(
		async <T,>(store: string, key?: string): Promise<T | undefined> => {
			const db = database.current ?? (await openDatabase());

			return new Promise((resolve, reject) => {
				const transaction = db.transaction(store, "readonly");
				const objectStore = transaction.objectStore(store);

				if (key) {
					const request = objectStore.get(key);

					request.onsuccess = () => {
						resolve(request.result);
					};

					request.onerror = () => {
						reject(request.error);
					};
				} else {
					const entries: [string, unknown][] = [];
					const request = objectStore.openCursor();

					request.onsuccess = () => {
						const cursor = request.result;
						if (cursor) {
							entries.push([cursor.key, cursor.value] as [string, unknown]);
							cursor.continue();
						} else {
							resolve(entries as T);
						}
					};
				}
			});
		},
		[openDatabase]
	);

	const set = useCallback(
		async (store: string, key: string, value: unknown) => {
			const db = database.current ?? (await openDatabase());

			return new Promise<void>((resolve, reject) => {
				const transaction = db.transaction(store, "readwrite");
				const objectStore = transaction.objectStore(store);

				const request = objectStore.put(value, key);

				request.onsuccess = () => resolve();
				request.onerror = () => reject(request.error);
			});
		},
		[openDatabase]
	);

	const remove = useCallback(
		async (store: string, key: string) => {
			const db = database.current ?? (await openDatabase());

			return new Promise<void>((resolve, reject) => {
				const transaction = db.transaction(store, "readwrite");
				const objectStore = transaction.objectStore(store);

				const request = objectStore.delete(key);

				request.onsuccess = () => resolve();
				request.onerror = () => reject(request.error);
			});
		},
		[openDatabase]
	);

	useEffect(() => {
		// Check if the browser supports IndexedDB.

		if (!indexedDB) {
			console.error(
				"Your browser doesn't support a stable version of IndexedDB. You will not be able to save your work."
			);
		}
		openDatabase();
	}, [openDatabase]);

	const value = useMemo(() => ({ get, set, remove }), [get, set, remove]);

	return (
		<IndexedDBContext.Provider value={value}>
			{children}
		</IndexedDBContext.Provider>
	);
};
