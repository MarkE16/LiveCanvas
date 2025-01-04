// Lib
import { useState, useEffect } from "react";
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
import AlphaSoftwareAgreementModal from "../AlphaSoftwareAgreementModal/AlphaSoftwareAgreementModal";

const Main: FC = () => {
	const [showAlphaModal, setShowAlphaModal] = useState<boolean>(false);
	const { get } = useIndexed();
	const setElements = useStore((store) => store.setElements);

	useEffect(() => {
		async function getElements() {
			const elements = (await get("elements", "items")) as CanvasElement[];
			setElements(elements);
		}

		getElements();
	}, [get, setElements]);

	return (
		<main
			id="main-content"
			data-testid="main-content"
		>
			<AlphaSoftwareAgreementModal
				open={showAlphaModal}
				onClose={() => {
					setShowAlphaModal(false);
					window.localStorage.setItem("agreed", "true");
				}}
			/>

			<LeftToolbar />

			<CanvasPane />

			{/* Right side pane */}
			<LayerPane />
		</main>
	);
};

export default Main;
