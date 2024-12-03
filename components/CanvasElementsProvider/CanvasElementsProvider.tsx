// Lib
import { createContext, useMemo, useCallback, useState } from "react";
import { v4 as uuid } from "uuid";

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
	focused: boolean;
	// More properties later...
};

type CanvasElementsUtils = {
	elements: Element[];
	focusElement: (id: string) => void;
	unfocusElement: (id: string) => void;
	createElement: (shape: Shape) => void;
	changeElementProperties: (
		id: string,
		callback: (el: Element) => Element
	) => void;
};

const CanvasElementsContext = createContext<CanvasElementsUtils | undefined>(
	undefined
);

const CanvasElementsProvider: FC<PropsWithChildren> = ({ children }) => {
	const [elements, setElements] = useState<Element[]>([]);

	const focusElement = useCallback((id: string) => {
		setElements((prev) => {
			return prev.map((element) => {
				if (element.id === id || element.focused) {
					return { ...element, focused: !element.focused };
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

	const createElement = useCallback((shape: Shape) => {
		const element: Element = {
			x: 0,
			y: 0,
			width: 100,
			height: 100,
			id: uuid(),
			focused: false,
			shape
		};

		setElements((prev) => [...prev, element]);
	}, []);

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

	const value = useMemo(
		() => ({
			elements: elements,
			focusElement,
			unfocusElement,
			createElement,
			changeElementProperties
		}),
		[
			focusElement,
			unfocusElement,
			createElement,
			elements,
			changeElementProperties
		]
	);

	return (
		<CanvasElementsContext.Provider value={value}>
			{children}
		</CanvasElementsContext.Provider>
	);
};

export { CanvasElementsContext, CanvasElementsProvider };
