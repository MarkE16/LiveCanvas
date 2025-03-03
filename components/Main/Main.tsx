// Lib
import { useEffect } from "react";
import useIndexed from "../../state/hooks/useIndexed";
import useStore from "../../state/hooks/useStore";

// Types
import type { FC } from "react";
import type { CanvasElement } from "../../types";

// Styles
import "./Main.styles.css";

// Components
import CanvasPane from "../CanvasPane/CanvasPane";
import LeftToolbar from "../LeftToolbar/LeftToolbar";
import LayerPane from "../LayerPane/LayerPane";

const Main: FC = () => {
	const { get } = useIndexed();
	const setElements = useStore((store) => store.setElements);

	useEffect(() => {
		async function getElements() {
			const urlParams = new URLSearchParams(window.location.search);
			const fileId = urlParams.get("f");

			if (!fileId) {
				// Do nothing.
				return;
			}

			const elements = await get<CanvasElement[]>("elements", fileId);
			setElements(elements ?? []);
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

			{/* Right side pane */}
			<LayerPane />
		</main>
	);
};

export default Main;
