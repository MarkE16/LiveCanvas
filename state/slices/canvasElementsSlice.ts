import type { StateCreator } from "zustand";
import { v4 as uuid } from "uuid";
import type {
	CanvasElement,
	Shape,
	CanvasElementsStore,
	CanvasStore,
	HistoryStore
} from "../../types";

export const createCanvasElementsSlice: StateCreator<
	CanvasElementsStore & CanvasStore & HistoryStore,
	[],
	[],
	CanvasElementsStore
> = (set, get) => {
	function focusElement(...ids: string[]) {
		const elements = get().elements;
		const idsSet = new Set(ids);
		const newElements = elements.map((element) => {
			if (idsSet.has(element.id)) {
				return { ...element, focused: true };
			}
			return element;
		});
		set({ elements: newElements });
	}

	function unfocusElement(...ids: string[]) {
		const elements = get().elements;
		const idsSet = new Set(ids);
		const newElements = elements.map((element) => {
			if (idsSet.has(element.id)) {
				return { ...element, focused: false };
			}
			return element;
		});
		set({ elements: newElements });
	}

	function createElement(
		type: Shape | "text",
		properties?: Omit<Partial<CanvasElement>, "id">
	) {
		if (type === "text" && !properties?.text) {
			throw new Error(
				"Cannot create text element without additional text properties."
			);
		}

		if (!properties?.layerId) {
			throw new Error("Cannot create element: No existing layer.");
		}

		const id = uuid();

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
			id // Keep the id as the last property to ensure that it is not overridden.
		};

		set((state) => ({
			elements: [...state.elements, element as CanvasElement]
		}));

		return id;
	}

	function changeElementProperties(
		callback: (el: CanvasElement) => CanvasElement,
		...ids: string[]
	) {
		const elements = get().elements;
		const idsSet = new Set(ids);
		const newElements = elements.map((element) => {
			if (idsSet.has(element.id)) {
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
		});
		set({
			elements: newElements
		});
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

	function copyElement(...ids: string[]) {
		const elements = get().elements;
		const idsSet = new Set(ids);
		const copiedElements = elements.filter((element) => idsSet.has(element.id));
		set({ copiedElements });
	}

	function pasteElement() {
		const { elements, copiedElements } = get();
		const newElements = copiedElements.map((element) => {
			return {
				...element,
				id: uuid(),
				x: element.x + 10,
				y: element.y + 10
			};
		});
		set({
			copiedElements: newElements,
			elements: [...elements, ...newElements]
		});
	}

	return {
		elements: [],
		copiedElements: [],
		elementMoving: false,
		focusElement,
		unfocusElement,
		createElement,
		changeElementProperties,
		deleteElement,
		updateMovingState,
		setElements,
		copyElement,
		pasteElement
	};
};
