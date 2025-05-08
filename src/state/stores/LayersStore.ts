import { Layer } from "src/types";
import BaseStore from "./BaseStore";

type LayerProperties = Pick<Layer, "name" | "id"> & {
  image: Blob;
  position: number;
}

type LayerStoreEntries = [string, LayerProperties][];

export default class LayersStore extends BaseStore {
	protected static override storeName: string = "layers";
	protected static override version: number = 1;

	protected static override onUpgrade(db: IDBDatabase): void {
		if (!db.objectStoreNames.contains("layers")) {
			db.createObjectStore("layers", { keyPath: "id" });
		}
	}

	/**
	* Add layers to the store. Note that layers with existing ids
	* will be overridden.
	* @param layers Layers to add to the store.
	* @returns Promise of void
	*/
	public static async add(layers: LayerProperties[]) {
		const store = await this.getStore("readwrite");

		return new Promise<void>((resolve, reject) => {
			for (const [idx, layer] of layers.entries()) {
				const req = store.put(layer);

				req.onsuccess = () => {
					if (idx === layers.length - 1) {
						resolve();
					}
				};
				req.onerror = () => reject(req.error);
			}
		});
	}

	/**
	* Get a layer or all entries in the store.
	* @param id Optionally get a specific layer with the associated id.
	* @returns A singular layer if an id is given or undefined if not found,
	* or all entries in the store if an id is not provided
	*/
	public static async get(id?: string) {
		const store = await this.getStore();

		return new Promise<LayerProperties | undefined | LayerStoreEntries>((resolve, reject) => {
			if (id) {
				const req = store.get(id);

				req.onsuccess = () => resolve(req.result as LayerProperties | undefined);
				req.onerror = () => reject(req.error);
			} else {
				const entries: LayerStoreEntries = [];
				const cur = store.openCursor();

				cur.onsuccess = () => {
					const cursor = cur.result;

					if (cursor) {
						entries.push([
							cursor.key,
							cursor.value
						] as LayerStoreEntries[number]);
					} else {
						resolve(entries);
					}
				};

				cur.onerror = () => reject(cur.result);
			}
		});
	}
}
