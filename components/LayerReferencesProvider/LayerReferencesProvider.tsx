// Lib
import { createContext, useRef, useCallback, useMemo } from "react";

// Types
import { FC, ReactNode, RefObject } from "react";

type LayerReferencesUtils = {
	references: RefObject<HTMLCanvasElement[]>;
	add: (layer: HTMLCanvasElement, index?: number) => void;
	remove: (index: number) => HTMLCanvasElement;
};

const LayerReferencesContext = createContext<LayerReferencesUtils | undefined>(
	undefined
);

const LayerReferencesProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const references = useRef<HTMLCanvasElement[]>([]);

	/**
	 * Add a layer reference.
	 * @param layer An HTMLCanvasElement.
	 * @param index An optional index to add the reference to. Note that this
	 * will override any existing value located at the specified index.
	 * @returns void
	 */
	const add = useCallback((layer: HTMLCanvasElement, index?: number) => {
		if (index !== undefined) {
			references.current[index] = layer;
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
		if (index < 0 || index >= references.current.length) {
			throw new Error("Index out of bounds.");
		}
		const [removed] = references.current.splice(index, 1);
    return removed;
	}, []);

	const value = useMemo(
		() => ({
			references,
			add,
			remove
		}),
		[references, add, remove]
	);

	return (
		<LayerReferencesContext.Provider value={value}>
			{children}
		</LayerReferencesContext.Provider>
	);
};

export { LayerReferencesContext, LayerReferencesProvider };
