// Lib
import { useContext } from "react";
import { CanvasElementsContext } from "../../components/CanvasElementsProvider/CanvasElementsProvider";

/**
 * A custom hook that returns an object containing properties of the canvas. Properties include:
 * - elements: An array of objects that consist of ShapeElements.
 * - focusElement: A function that takes an id and toggles the focused property of the element with the matching id.
 * - unfocusElement: A function that takes an id and sets the focused property of the element with the matching id to false.
 * @returns An object containing properties of the canvas.
 */
const useCanvasElements = () => {
	const context = useContext(CanvasElementsContext);

	if (context === undefined) {
		throw new Error(
			"useCanvasElements must be used within a CanvasElementsProvider"
		);
	}

	return context;
};

export default useCanvasElements;
