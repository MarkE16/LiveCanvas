// Lib
import {
	createContext,
	useMemo,
	useCallback,
	useState,
	useEffect,
	useRef
} from "react";
import { v4 as uuid } from "uuid";
import useLayerReferences from "../../state/hooks/useLayerReferences";
import useIndexed from "../../state/hooks/useIndexed";

// Types
import type { FC, PropsWithChildren, RefObject } from "react";
import type { Shape, CanvasElement } from "../../types";

type CanvasElementsUtils = {
	elements: CanvasElement[];
	focusElement: (...ids: string[]) => void;
	unfocusElement: (...ids: string[]) => void;
	createElement: (
		shape: Shape,
		properties?: Omit<Partial<CanvasElement>, "id">
	) => void;
	changeElementProperties: (
		callback: (el: CanvasElement) => CanvasElement,
		...ids: string[]
	) => void;
	deleteElement: (...ids: string[]) => void;
	movingElement: RefObject<boolean>;
	updateMovingState: (state: boolean) => void;
	copyElement: (...ids: string[]) => void;
	pasteElement: () => void;
};

const CanvasElementsContext = createContext<CanvasElementsUtils | undefined>(
	undefined
);

const CanvasElementsProvider: FC<PropsWithChildren> = ({ children }) => {
	const [elements, setElements] = useState<CanvasElement[]>([]);
	const movingElement = useRef<boolean>(false);
	const references = useLayerReferences();
	const copiedElements = useRef<CanvasElement[]>([]);
	const { get } = useIndexed();

	const updateMovingState = useCallback((state: boolean) => {
		movingElement.current = state;
	}, []);

	/**
	 * Marks an element as focused.
	 * @param id The id associated with an element.
	 * @returns void
	 */
	const focusElement = useCallback((...ids: string[]) => {
		setElements((prev) => {
			return prev.map((element) => {
				if (ids.includes(element.id)) {
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
	const unfocusElement = useCallback((...ids: string[]) => {
		setElements((prev) => {
			return prev.map((element) => {
				if (ids.includes(element.id)) {
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
		(shape: Shape, properties?: Omit<Partial<CanvasElement>, "id">) => {
			const activeLayer = references.find((ref) =>
				ref.classList.contains("active")
			);

			if (!activeLayer) {
				throw new Error("Cannot create element: No existing layer.");
			}

			// Used NaN to indicate that the x and y values are not set. They will be set later when the user moves the element.
			const element = {
				x: NaN,
				y: NaN,
				width: 100,
				height: 100,
				fill: "#000000",
				border: "#000000",
				focused: false,
				layerId: activeLayer.id,
				shape,
				...properties, // Override the default properties with the provided properties, if any.
				id: uuid() // Keep the id as the last property to ensure that it is not overridden.
			};

			setElements((prev) => [...prev, element as CanvasElement]);
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
		(callback: (el: CanvasElement) => CanvasElement, ...ids: string[]) => {
			setElements((prev) => {
				return prev.map((element) => {
					if (ids.includes(element.id)) {
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
	const deleteElement = useCallback((...ids: string[]) => {
		setElements((prev) => prev.filter((element) => !ids.includes(element.id)));
	}, []);

	/**
	 * A
	 */
	const copyElement = useCallback((...ids: string[]) => {
		copiedElements.current.length = 0; // Clear the copied elements.

		// Using the state from the previous state mainly to avoid having
		// to use the state variable in the callback function,
		// which would cause the function to depend on the state variable.
		setElements((prev) => {
			const elements = prev.filter((element) => ids.includes(element.id));
			copiedElements.current.push(...elements);
			return prev;
		});
	}, []);

	const pasteElement = useCallback(() => {
		copiedElements.current = copiedElements.current.map((element) => ({
			...element,
			x: element.x + 10,
			y: element.y + 10,
			id: uuid() // Generate a new id for the element.
		}));

		setElements((prev) => [...prev, ...copiedElements.current]);
	}, []);

	const value = useMemo(
		() => ({
			elements,
			focusElement,
			unfocusElement,
			createElement,
			changeElementProperties,
			deleteElement,
			movingElement,
			updateMovingState,
			copyElement,
			pasteElement
		}),
		[
			elements,
			focusElement,
			unfocusElement,
			createElement,
			changeElementProperties,
			deleteElement,
			updateMovingState,
			copyElement,
			pasteElement
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
