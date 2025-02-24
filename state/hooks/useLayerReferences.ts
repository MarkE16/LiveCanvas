import { useContext } from "react";
import { LayerReferencesContext } from "../../components/LayerReferencesProvider/LayerReferencesProvider";

/**
 * A custom hook that returns an array consisting of HTMLCanvasElements that hold a reference
 * to their respective canvas layers.
 *
 * @returns An array consisting of HTMLCanvasElements that references the canvas layers.
 */
const useLayerReferences = () => {
	const context = useContext(LayerReferencesContext);

	if (context === undefined) {
		throw new Error(
			"useLayerReferences must be used within a LayerReferencesProvider"
		);
	}

	return context;
};

export default useLayerReferences;
