import { useEffect, createContext, useRef, useCallback, useMemo } from "react";
import { FC, PropsWithChildren } from "react";

const STORES = ["layers"];
const VERSION = 1; // Bump this up when the schema changes.

type GetOptions = {
	key?: string;
	asEntries: boolean;
};

type IndexedUtils = {
	/**
	 * Get data from the database.
	 * @param store The store to get data from.
	 * @param options Options for the get operation.
	 * @returns A promise that resolves with the data.
	 */
	get: <T>(store: string, options: GetOptions) => Promise<T>;

	/**
	 * Set data in the database.
	 * @param store The store to set data in.
	 * @param key The key to set the data under.
	 * @param value The value to set.
	 * @returns A promise that resolves when the data is set.
	 */
	set: (store: string, key: string, value: unknown) => Promise<void>;
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
		async <T,>(
			store: string,
			options: GetOptions = { asEntries: false }
		): Promise<T> => {
			const db = database.current ?? (await openDatabase());

			return new Promise((resolve, reject) => {
				const transaction = db.transaction(store, "readonly");
				const objectStore = transaction.objectStore(store);

				let request: IDBRequest;

				if (options.key) {
					request = objectStore.get(options.key);
				} else {
					request = objectStore.getAll();
				}

				request.onsuccess = () => {
					if (options.asEntries) {
						resolve(Object.entries(request.result) as T);
					} else {
						resolve(request.result);
					}
				};

				request.onerror = () => reject(request.error);
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

	useEffect(() => {
		// Check if the browser supports IndexedDB.

		if (!window.indexedDB) {
			console.error(
				"Your browser doesn't support a stable version of IndexedDB. You will not be able to save your work."
			);
			return;
		}

		openDatabase();
	}, [openDatabase]);

	const value = useMemo(() => ({ get, set }), [get, set]);

	return (
		<IndexedDBContext.Provider value={value}>
			{children}
		</IndexedDBContext.Provider>
	);
};
