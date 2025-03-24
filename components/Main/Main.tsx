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

			{/* Right side pane */}
			<LayerPane />
		</main>
	);
};

export default Main;
