// Lib
import { useState } from "react";
import { createPortal } from "react-dom";

// Styles
import "./ReferenceWindow.styles.css";

// Components
import ReferenceWindowHeader from "../ReferenceWindowHeader/ReferenceWindowHeader";
import ReferenceWindowContent from "../ReferenceWindowContent/ReferenceWindowContent";
import ReferenceWindowControls from "../ReferenceWindowControls/ReferenceWindowControls";

// Types
import type { CSSProperties, FC } from "react";
import { Coordinates, Dimensions } from "../../types";

const ReferenceWindow: FC = () => {
	const [imageURL, setImageURL] = useState<string | undefined>(undefined);
	const [position, setPosition] = useState<Coordinates>(() => {
		if (typeof window !== "undefined") {
			const { innerWidth, innerHeight } = window;

			return {
				x: innerWidth / 2,
				y: innerHeight / 2
			};
		}

		return {
			x: 0,
			y: 0
		};
	});

	const styles: CSSProperties = {
		left: `${position.x}px`,
		top: `${position.y}px`
	};

	const jsx = (
		<div
			id="reference-window"
			style={styles}
		>
			<ReferenceWindowHeader setPosition={setPosition}>
				Reference Window
			</ReferenceWindowHeader>
			<ReferenceWindowContent
				imageURL={imageURL}
				setImageURL={setImageURL}
			/>
			<ReferenceWindowControls setImageURL={setImageURL} />
		</div>
	);

	if (typeof document === "undefined") return null;

	return createPortal(jsx, document.body);
};

export default ReferenceWindow;
