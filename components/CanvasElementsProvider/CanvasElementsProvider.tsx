// Lib
import { createContext, useMemo, useCallback, useState } from "react";
import { v4 as uuid } from "uuid";
import useLayerReferences from "../../state/hooks/useLayerReferences";

// Types
import { FC, PropsWithChildren } from "react";
import { Shape } from "../../types";

type Element = {
	x: number;
	y: number;
	width: number;
	height: number;
	shape: Shape;
	id: string;
	layerId: string;
	focused: boolean;
	// More properties later...
};

type CanvasElementsUtils = {
	elements: Element[];
	/**
	 * Marks an element as focused.
	 * @param id The id associated with an element.
	 * @returns void
	 */
	focusElement: (id: string) => void;

	/**
	 * Unmarks an element as focused.
	 * @param id The id associated with an element.
	 * @returns void
	 */
	unfocusElement: (id: string) => void;

	/**
	 * Creates an element for the canvas.
	 * @param shape The shape to create.
	 * @returns void
	 */
	createElement: (shape: Shape) => void;

	/**
	 *
	 * @param id The id associated with an element.
	 * @param callback - A function that accepts the element as an argument and returns a new element with the updated properties.
	 * @returns void
	 */
	changeElementProperties: (
		id: string,
		callback: (el: Element) => Element
	) => void;

	/**
	 *
	 * @param id The id associated with the element.
	 * @returns void
	 */
	deleteElement: (id: string) => void;
};

const CanvasElementsContext = createContext<CanvasElementsUtils | undefined>(
	undefined
);

const CanvasElementsProvider: FC<PropsWithChildren> = ({ children }) => {
	const [elements, setElements] = useState<Element[]>([]);
	const references = useLayerReferences();

	const focusElement = useCallback((id: string) => {
		setElements((prev) => {
			return prev.map((element) => {
				if (element.id === id) {
					return { ...element, focused: true };
				}
				return element;
			});
		});
	}, []);

	const unfocusElement = useCallback((id: string) => {
		setElements((prev) => {
			return prev.map((element) => {
				if (element.id === id) {
					return { ...element, focused: false };
				}
				return element;
			});
		});
	}, []);

	const createElement = useCallback(
		(shape: Shape) => {
			const activeLayer = references.find((ref) =>
				ref.classList.contains("active")
			);

			if (!activeLayer) {
				throw new Error("Cannot create element: No existing layer.");
			}

			const element: Element = {
				x: 0,
				y: 0,
				width: 100,
				height: 100,
				id: uuid(),
				focused: false,
				layerId: activeLayer.id,
				shape
			};

			setElements((prev) => [...prev, element]);
		},
		[references]
	);

	const changeElementProperties = useCallback(
		(id: string, callback: (el: Element) => Element) => {
			setElements((prev) => {
				return prev.map((element) => {
					if (element.id === id) {
						return callback(element);
					}
					return element;
				});
			});
		},
		[]
	);

	const deleteElement = useCallback((id: string) => {
		setElements((prev) => {
			return prev.filter((element) => element.id !== id);
		});
	}, []);

	const value = useMemo(
		() => ({
			elements: elements,
			focusElement,
			unfocusElement,
			createElement,
			changeElementProperties,
			deleteElement
		}),
		[
			focusElement,
			unfocusElement,
			createElement,
			elements,
			changeElementProperties,
			deleteElement
		]
	);

	return (
		<CanvasElementsContext.Provider value={value}>
			{children}
		</CanvasElementsContext.Provider>
	);
};

export { CanvasElementsContext, CanvasElementsProvider };
