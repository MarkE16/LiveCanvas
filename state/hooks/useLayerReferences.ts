import { useContext } from "react";
import { LayerReferencesContext } from "../../components/LayerReferencesProvider/LayerReferencesProvider";

/**
 * A custom hook that returns an array consisting of HTMLCanvasElements that hold a reference
 * to their respective canvas layers.
 *
 * @returns An array consisting of HTMLCanvasElements that references the canvas layers.
 */
const useLayerReferences = () => {
	return useContext(LayerReferencesContext);
};

export default useLayerReferences;
