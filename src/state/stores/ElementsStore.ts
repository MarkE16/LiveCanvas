import BaseStore from "./BaseStore";
import { CanvasElement } from "src/types";

type Element = Omit<CanvasElement, "focused">;

/**
 * A class for interacting with the Elements store of IndexedDB.
 */
export default class ElementsStore extends BaseStore {
	protected static override storeName: string = "elements";

	/**
	 * Add elements to the store. Note that elements with existing ids will
	 * be overridden.
	 * @param elements Elements to add to the store.
	 * @returns
	 */
	public static addElements(elements: Element[]) {
		return this.add(elements);
	}

	/**
	 * Get an element.
	 * @param id The associated id.
	 * @returns A singular element or undefined if not found
	 */
	public static getElement(id: string) {
		return this.get<Element>(id);
	}

	/**
	 * Get all entries in this store.
	 * @returns The entries
	 */
	public static getElements() {
		return this.get<Element>();
	}

	/**
	 * Remove elements from the store.
	 * @param ids An array of ids of elements to delete.
	 */
	public static removeElement(ids: string[]) {
		return this.remove(ids);
	}

	/**
	 * Clear the store.
	 */
	public static clearStore() {
		return this.remove();
	}

	/**
	 * Open a connection to the Elements Store.
	 */
	public static openStore() {
		this.open();
	}
}
