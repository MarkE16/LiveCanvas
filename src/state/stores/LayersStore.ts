import { Layer } from "@/types";
import BaseStore from "./BaseStore";

/**
 * A class for interacting with the Layers store of IndexedDB.
 */
export default class LayersStore extends BaseStore {
	protected static override storeName: string = "layers";

	/**
	 * Add layers to the store. Note that layers with existing ids
	 * will be overridden.
	 * @param layers Layers to add to the store.
	 * @returns Promise of void
	 */
	public static addLayers(layers: Layer[]) {
		return this.add(layers);
	}

	/**
	 * Get a layer.
	 * @param id The associated id.
	 * @returns A singular layer or undefined if not found
	 */
	public static getLayer(id: string) {
		return this.get<Layer>(id);
	}

	/**
	 * Get all entries in this store.
	 * @returns The entries
	 */
	public static getLayers() {
		return this.get<Layer>();
	}

	/**
	 * Remove layers from the store.
	 * @param ids An array of ids of layers to delete.
	 */
	public static removeLayer(ids: string[]) {
		return this.remove(ids);
	}

	/**
	 * Clear the store.
	 */
	public static clearStore() {
		return this.remove();
	}

	/**
	 * Open a connection to the Layers store.
	 */
	public static openStore() {
		this.open();
	}

	/**
	 * Close the connection to the Layers store.
	 */
	public static closeStore() {
		this.close();
	}
}
