// Lib
import { useEffect } from "react";
import useIndexed from "@state/hooks/useIndexed";
import useStore from "@state/hooks/useStore";

// Types
import type { ReactNode } from "react";
import type { CanvasElement } from "src/types";

// Styles
import "./Main.styles.css";

// Components
import CanvasPane from "@components/CanvasPane/CanvasPane";
import LeftToolbar from "@components/LeftToolbar/LeftToolbar";
import LayerPane from "@components/LayerPane/LayerPane";
import ReferenceWindow from "@components/ReferenceWindow/ReferenceWindow";

function Main(): ReactNode {
	const { get } = useIndexed();
	const setElements = useStore((store) => store.setElements);
	const refereceWindowEnabled = useStore(
		(store) => store.referenceWindowEnabled
	);

	useEffect(() => {
		async function getElements() {
			const elements = await get<Omit<CanvasElement, "focused">[]>(
				"elements",
				"items"
			);
			setElements(
				(elements ?? []).map((e) => ({
					...e,
					focused: false
				}))
			);
		}

		getElements();
	}, [get, setElements]);

	return (
		<main
			id="main-content"
			data-testid="main-content"
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
