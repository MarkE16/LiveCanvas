// Lib
import ElementsStore from "@/state/stores/ElementsStore";
import LayersStore from "@/state/stores/LayersStore";
import { useEffect, useState } from "react";
import useStore from "@/state/hooks/useStore";
import useStoreEffect from "@/state/hooks/useStoreEffect";

// Types
import type { ReactNode } from "react";

// Components
import CanvasPane from "@/components/CanvasPane/CanvasPane";
import LeftToolbar from "@/components/LeftToolbar/LeftToolbar";
import LayerPane from "@/components/LayerPane/LayerPane";
import ReferenceWindow from "@/components/ReferenceWindow/ReferenceWindow";
import { redrawCanvas } from "@/lib/utils";

function Main(): ReactNode {
	const { setElements, setLayers } = useStore((store) => ({
		setElements: store.setElements,
		setLayers: store.setLayers
	}));
	const refereceWindowEnabled = useStore(
		(store) => store.referenceWindowEnabled
	);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		async function updateLayersAndElements() {
			const elements = await ElementsStore.getElements();
			const layers = await LayersStore.getLayers();

			// There must always be at least one layer.
			// If there are no layers, do not update,
			// and instead use the default layer state.
			if (layers.length > 0) {
				setLayers(
					layers
						.sort((a, b) => b[1].position - a[1].position)
						.map(([id, { name }], i) => ({
							name,
							id,
							active: i === 0,
							hidden: false
						}))
				);
			}
			setElements(elements.map(([, element]) => element));
			setLoading(false);
			redrawCanvas();
		}

		updateLayersAndElements();
	}, [setElements, setLayers]);

	// useStoreEffect(
	// 	(state) => ({ layers: state.layers, elements: state.elements }),
	// 	(current, previous) => {
	// 		const changeInLayerToggle =
	// 			current.layers.length === previous.layers.length &&
	// 			current.layers.some(
	// 				(layer, index) => layer.active !== previous.layers[index].active
	// 			);
	// 		const layerAdded = current.layers.length > previous.layers.length;

	// 		document.dispatchEvent(
	// 			new CustomEvent("canvas:redraw", {
	// 				detail: {
	// 					noChange: changeInLayerToggle || layerAdded
	// 				}
	// 			})
	// 		);
	// 	}
	// );

	return (
		<main
			id="main-content"
			data-testid="main-content"
			className="flex h-[calc(100vh-3rem)] bg-red-600"
		>
			<LeftToolbar />

			<CanvasPane loading={loading} />

			{/* Reference window */}
			{refereceWindowEnabled && <ReferenceWindow />}
			{/* Right side pane */}
			<LayerPane />
		</main>
	);
}

export default Main;
