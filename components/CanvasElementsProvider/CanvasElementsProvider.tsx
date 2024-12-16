// Lib
import {
	createContext,
	useMemo,
	useCallback,
	useState,
	useEffect
} from "react";
import { v4 as uuid } from "uuid";
import useLayerReferences from "../../state/hooks/useLayerReferences";
import useIndexed from "../../state/hooks/useIndexed";

// Types
import type { FC, PropsWithChildren } from "react";
import type { Shape, CanvasElement } from "../../types";

type CanvasElementsUtils = {
	elements: CanvasElement[];
	focusElement: (id: string) => void;
	unfocusElement: (id: string) => void;
	createElement: (shape: Shape) => void;
	changeElementProperties: (
		id: string,
		callback: (el: CanvasElement) => CanvasElement
	) => void;
	deleteElement: (id: string) => void;
};

const CanvasElementsContext = createContext<CanvasElementsUtils | undefined>(
	undefined
);

const CanvasElementsProvider: FC<PropsWithChildren> = ({ children }) => {
	const [elements, setElements] = useState<CanvasElement[]>([]);
	const references = useLayerReferences();
	const { get } = useIndexed();

	/**
	 * Marks an element as focused.
	 * @param id The id associated with an element.
	 * @returns void
	 */
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

	/**
	 * Unmarks an element as focused.
	 * @param id The id associated with an element.
	 * @returns void
	 */
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

	/**
	 * Creates an element for the canvas.
	 * @param shape The shape to create.
	 * @returns void
	 */
	const createElement = useCallback(
		(shape: Shape) => {
			const activeLayer = references.find((ref) =>
				ref.classList.contains("active")
			);

			if (!activeLayer) {
				throw new Error("Cannot create element: No existing layer.");
			}

			// Used NaN to indicate that the x and y values are not set. They will be set later when the user moves the element.
			const element: CanvasElement = {
				x: NaN,
				y: NaN,
				width: 100,
				height: 100,
				id: uuid(),
				fill: "#000000",
				border: "#000000",
				focused: false,
				layerId: activeLayer.id,
				shape
			};

			setElements((prev) => [...prev, element]);
		},
		[references]
	);

	/**
	 * Changes the properties of an element. Properties include:
	 * x, y, width, height, shape, id, layerId, focused
	 *
	 * @param id The id associated with an element.
	 * @param callback - A function that accepts the element as an argument and returns a new element with the updated properties.
	 * @returns void
	 */
	const changeElementProperties = useCallback(
		(id: string, callback: (el: CanvasElement) => CanvasElement) => {
			setElements((prev) => {
				return prev.map((element) => {
					if (element.id === id) {
						// Ensure that the width and height are at least 1.
						const { width, height, ...rest } = callback(element);

						if (width < 1 || height < 1) {
							console.error(
								"Element width and height must be greater than or equal 1."
							);
						}

						return {
							...rest,
							width: Math.max(width, 1),
							height: Math.max(height, 1)
						};
					}
					return element;
				});
			});
		},
		[]
	);

	/**
	 * Deletes an element from the canvas.
	 * @param id The id associated with the element.
	 * @returns void
	 */
	const deleteElement = useCallback((id: string) => {
		setElements((prev) => prev.filter((element) => element.id !== id));
	}, []);

	const value = useMemo(
		() => ({
			elements,
			focusElement,
			unfocusElement,
			createElement,
			changeElementProperties,
			deleteElement
		}),
		[
			elements,
			focusElement,
			unfocusElement,
			createElement,
			changeElementProperties,
			deleteElement
		]
	);

	useEffect(() => {
		async function getElements() {
			const elements = (await get("elements", "items")) as CanvasElement[];

			if (elements) {
				setElements(elements);
			}
		}

		getElements();
	}, [get]);

	return (
		<CanvasElementsContext.Provider value={value}>
			{children}
		</CanvasElementsContext.Provider>
	);
};

export { CanvasElementsContext, CanvasElementsProvider };
