// Lib
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { v4 as uuid } from "uuid";

// Types
import type { CanvasElement, Shape } from "../../types";

/**
 * A custom hook that returns an object containing properties of the canvas. Properties include:
 * - elements: An array of objects that consist of ShapeElements.
 * - focusElement: A function that takes an id and toggles the focused property of the element with the matching id.
 * - unfocusElement: A function that takes an id and sets the focused property of the element with the matching id to false.
 * @returns An object containing properties of the canvas.
 */
// const useCanvasElements = () => {
// 	const context = useContext(CanvasElementsContext);

// 	if (context === undefined) {
// 		throw new Error(
// 			"useCanvasElements must be used within a CanvasElementsProvider"
// 		);
// 	}

// 	return context;
// };

type CanvasElementsStore = {
	elements: CanvasElement[];
	elementMoving: boolean;
	focusElement: (...ids: string[]) => void;
	unfocusElement: (...ids: string[]) => void;
	createElement: (
		type: Shape | "text",
		properties?: Omit<Partial<CanvasElement>, "id">
	) => void;
	changeElementProperties: (
		callback: (el: CanvasElement) => CanvasElement,
		...ids: string[]
	) => void;
	deleteElement: (...ids: string[]) => void;
	updateMovingState: (state: boolean) => void;
	setElements: (elements: CanvasElement[]) => void;
};

const useCanvasElements = create<CanvasElementsStore>()(
	subscribeWithSelector((set) => {
		function focusElement(...ids: string[]) {
			set((state) => ({
				elements: state.elements.map((element) => {
					if (ids.includes(element.id)) {
						return { ...element, focused: true };
					}
					return element;
				})
			}));
		}

		function unfocusElement(...ids: string[]) {
			set((state) => ({
				elements: state.elements.map((element) => {
					if (ids.includes(element.id)) {
						return { ...element, focused: false };
					}
					return element;
				})
			}));
		}

		function createElement(
			type: Shape | "text",
			properties?: Omit<Partial<CanvasElement>, "id">
		) {
			if (
				type === "text" &&
				!(
					properties?.fontContent &&
					properties?.fontSize &&
					properties?.fontFamily
				)
			) {
				throw new Error(
					"Cannot create text element without additional text properties."
				);
			}

			if (!properties?.layerId) {
				throw new Error("Cannot create element: No existing layer.");
			}

			// Used NaN to indicate that the x and y values are not set. They will be set later when the user moves the element.
			const element = {
				x: NaN,
				y: NaN,
				width: 100,
				height: 100,
				fill: "#000000",
				stroke: "#000000",
				focused: false,
				type,
				...properties, // Override the default properties with the provided properties, if any.
				id: uuid() // Keep the id as the last property to ensure that it is not overridden.
			};

			set((state) => ({
				elements: [...state.elements, element as CanvasElement]
			}));
		}

		function changeElementProperties(
			callback: (el: CanvasElement) => CanvasElement,
			...ids: string[]
		) {
			set((state) => ({
				elements: state.elements.map((element) => {
					if (ids.includes(element.id)) {
						const { width, height, ...rest } = callback(element);

						if (width < 1 || height < 1) {
							console.error("Width and height must be at least 1.");
						}

						return {
							...rest,
							width: Math.max(1, width),
							height: Math.max(1, height)
						};
					}
					return element;
				})
			}));
		}

		function deleteElement(...ids: string[]) {
			set((state) => ({
				elements: state.elements.filter((element) => !ids.includes(element.id))
			}));
		}

		function updateMovingState(state: boolean) {
			set({ elementMoving: state });
		}

		function setElements(elements: CanvasElement[]) {
			set({ elements });
		}

		return {
			elements: [],
			elementMoving: false,
			focusElement,
			unfocusElement,
			createElement,
			changeElementProperties,
			deleteElement,
			updateMovingState,
			setElements
		};
	})
);

export default useCanvasElements;
