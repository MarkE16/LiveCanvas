// Lib
import { useEffect, createContext, useRef, useCallback, useMemo } from "react";

// Types
import { FC, PropsWithChildren } from "react";

const STORES = ["layers"];
const VERSION = 1; // Bump this up when the schema changes.

type GetOptions = {
	// The key to get data for. If not provided, all data is returned from the store.
	key?: string;

	// Whether to return the data as entries or not (key, value pairs)
	asEntries: boolean;
};

type IndexedUtils = {
	/**
	 * A function to get data from a store in the database.
	 * @param store - The store to get data from.
	 * @param key - The key to get data for. If not provided, all data is returned from the store.
	 * @returns A promise that resolves with the data from the store.
	 */
	get: <T>(store: string, options: GetOptions) => Promise<T>;

	/**
	 * A function to set data in a store in the database.
	 * @param store A function to set data in a store in the database.
	 * @param key A key to set the data for.
	 * @param value A value to set in the store.
	 * @returns A void promise that resolves when the data is set in the store.
	 */
	set: (store: string, key: string, value: unknown) => Promise<void>;
};

export const IndexedDBContext = createContext<IndexedUtils | null>(null);

export const IndexedDBProvider: FC<PropsWithChildren> = ({ children }) => {
	const database = useRef<IDBDatabase | null>(null);

	const get = useCallback(
		<T,>(
			store: string,
			options: GetOptions = { asEntries: false }
		): Promise<T> => {
			if (!database.current) {
				throw new Error("Database connection not established.");
			}

			return new Promise((resolve, reject) => {
				const transaction = (database.current as IDBDatabase).transaction(
					store,
					"readonly"
				);
				const objectStore = transaction.objectStore(store);

				let request: IDBRequest;

				if (options.key) {
					request = objectStore.get(options.key);
				} else {
					request = objectStore.getAll();
				}

				request.onsuccess = () => {
					if (options.asEntries) {
						resolve(Object.entries(request.result) as unknown as T);
					}

					resolve(request.result);
				};

				request.onerror = () => reject(request.error);
			});
		},
		[]
	);

	const set = useCallback((store: string, key: string, value: unknown) => {
		if (!database.current) {
			throw new Error("Database connection not established.");
		}

		return new Promise<void>((resolve, reject) => {
			const transaction = (database.current as IDBDatabase).transaction(
				store,
				"readwrite"
			);
			const objectStore = transaction.objectStore(store);

			const request = objectStore.put(value, key);

			request.onsuccess = () => resolve();

			request.onerror = () => reject(request.error);
		});
	}, []);

	useEffect(() => {
		if (database.current) {
			return;
		}

		const request = indexedDB.open("canvas", VERSION);

		request.onsuccess = () => {
			database.current = request.result;
		};

		request.onerror = () => {
			console.error(request.error);
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
	}, []);

	const value = useMemo(() => ({ get, set }), [get, set]);

	return (
		<IndexedDBContext.Provider value={value}>
			{children}
		</IndexedDBContext.Provider>
	);
};
