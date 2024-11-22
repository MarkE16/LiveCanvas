// Lib
import { useContext } from "react";
import { LayerReferenceContext } from "../../components/LayerReferenceProvider/LayerReferenceProvider";

/**
 * A custom hook that returns an array of references to the layers' associated HTML Canvas element.
 * The array is read from the LayerReferenceContext. The array should be properly ordered
 * to match the order of the layers in the Redux store.
 * @returns An array of references to the layers' associated HTML Canvas element
 */
const useLayerReferences = () => {
	return useContext(LayerReferenceContext);
};

export default useLayerReferences;
