export default abstract class BaseStore {
	protected static storeName: string;
	protected static version: number;
	protected static db: Promise<IDBDatabase> | null = null;

	protected static open() {
		if (this.db) {
			return this.db;
		}

		this.db = new Promise((resolve, reject) => {
			const request = indexedDB.open(this.storeName, this.version);

			request.onsuccess = () => {
				resolve(request.result);
			};

			request.onerror = () => {
				console.error(request.error);
				reject(request.error);
			};

			request.onupgradeneeded = () => {
				this.onUpgrade(request.result);
			};
		});
	}

	//eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected static onUpgrade(db: IDBDatabase) {
		// To be overrided.
	}
	
	protected static async getStore(
	  mode: IDBTransactionMode = 'readonly'
	) {
    const db = await this.db;
    if (!db) { throw new Error("DB does not exist yet."); }
    
    return db.transaction(this.storeName, mode).objectStore(this.storeName);
	}
}
