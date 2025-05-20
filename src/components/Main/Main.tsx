// Lib
import { useEffect } from "react";
import useStore from "@/state/hooks/useStore";

// Types
import type { ReactNode } from "react";

// Components
import CanvasPane from "@/components/CanvasPane/CanvasPane";
import LeftToolbar from "@/components/LeftToolbar/LeftToolbar";
import LayerPane from "@/components/LayerPane/LayerPane";
import ReferenceWindow from "@/components/ReferenceWindow/ReferenceWindow";
import ElementsStore from "@/state/stores/ElementsStore";

function Main(): ReactNode {
	const setElements = useStore((store) => store.setElements);
	const refereceWindowEnabled = useStore(
		(store) => store.referenceWindowEnabled
	);

	useEffect(() => {
		async function getElements() {
			const elements = await ElementsStore.getElements();
			setElements(
				elements.map(([, element]) => ({
					...element,
					focused: false
				}))
			);
		}

		getElements();
	}, [setElements]);

	return (
		<main
			id="main-content"
			data-testid="main-content"
			className="flex h-[calc(100vh-3rem)]"
		>
			<LeftToolbar />

			<CanvasPane />

			{/* Reference window */}
			{refereceWindowEnabled && <ReferenceWindow />}
			{/* Right side pane */}
			<LayerPane />
		</main>
	);
}

export default Main;
