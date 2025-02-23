// Lib
import { createContext, useRef, useCallback, useMemo } from "react";

// Types
import { FC, ReactNode, RefObject } from "react";

type LayerReferencesUtils = {
	references: RefObject<HTMLCanvasElement[]>;
	add: (layer: HTMLCanvasElement, i?: number) => void;
	remove: (index: number) => HTMLCanvasElement;
	setActiveIndex: (index: number) => void;
	getActiveLayer: () => HTMLCanvasElement;
};

const LayerReferencesContext = createContext<LayerReferencesUtils | undefined>(
	undefined
);

const LayerReferencesProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const references = useRef<HTMLCanvasElement[]>([]);
	const activeIndex = useRef<number>(0);

	/**
	 * Set the active index.
	 * @param index The index to set as active.
	 */
	const setActiveIndex = useCallback((index: number) => {
		if (index < 0 || index >= references.current.length) {
			throw new Error("Index out of bounds.");
		}

		activeIndex.current = index;
	}, []);

	/**
	 * Get the layer reference that's active.
	 */
	const getActiveLayer = useCallback(() => {
		if (!references.current[activeIndex.current]) {
			throw new Error("No active layer found.");
		}
		return references.current[activeIndex.current];
	}, []);

	/**
	 * Add a layer reference.
	 * @param layer An HTMLCanvasElement.
	 * @param i The index to add the layer reference at.
	 * @returns void
	 */
	const add = useCallback((layer: HTMLCanvasElement, i?: number) => {
		if (i !== undefined) {
			references.current[i] = layer;
		} else {
			references.current.push(layer);
		}
	}, []);

	/**
	 *  Remove a layer reference.
	 * @param index The index of the layer reference to remove.
	 * @returns The removed layer reference.
	 */
	const remove = useCallback((index: number) => {
		const [removed] = references.current.splice(index, 1);

		if (!removed) {
			throw new Error("Index out of bounds.");
		}

		return removed;
	}, []);

	const value = useMemo(
		() => ({
			references,
			add,
			remove,
			setActiveIndex,
			getActiveLayer
		}),
		[references, add, remove, setActiveIndex, getActiveLayer]
	);

	return (
		<LayerReferencesContext.Provider value={value}>
			{children}
		</LayerReferencesContext.Provider>
	);
};

export { LayerReferencesContext, LayerReferencesProvider };
