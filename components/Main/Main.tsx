// Lib
import { useState } from "react";

// Types
import type { FC } from "react";

// Styles
import "./Main.styles.css";

// Components
import CanvasPane from "../CanvasPane/CanvasPane";
import LeftToolbar from "../LeftToolbar/LeftToolbar";
import LayerPane from "../LayerPane/LayerPane";
import AlphaSoftwareAgreementModal from "../AlphaSoftwareAgreementModal/AlphaSoftwareAgreementModal";

const Main: FC = () => {
	const [showAlphaModal, setShowAlphaModal] = useState<boolean>(false);

	return (
		<main id="main-content">
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
