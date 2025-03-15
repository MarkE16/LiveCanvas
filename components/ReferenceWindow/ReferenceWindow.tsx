// Lib
import { useState, memo } from "react";
import { createPortal } from "react-dom";

// Styles
import "./ReferenceWindow.styles.css";

// Components
import ReferenceWindowHeader from "../ReferenceWindowHeader/ReferenceWindowHeader";
import ReferenceWindowContent from "../ReferenceWindowContent/ReferenceWindowContent";
import ReferenceWindowControls from "../ReferenceWindowControls/ReferenceWindowControls";

// Types
import type { CSSProperties, FC } from "react";
import { Coordinates } from "../../types";

const MemoizedReferenceWindowHeader = memo(ReferenceWindowHeader);
const MemoizedReferenceWindowContent = memo(ReferenceWindowContent);
const MemoizedReferenceWindowControls = memo(ReferenceWindowControls);

const ReferenceWindow: FC = () => {
	const [imageURL, setImageURL] = useState<string | undefined>(undefined);
	const [flipped, setFlipped] = useState<boolean>(false);
	const [rotationDegrees, setRotationDegrees] = useState<number>(0);

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
			<MemoizedReferenceWindowHeader setPosition={setPosition}>
				Reference Window
			</MemoizedReferenceWindowHeader>
			<MemoizedReferenceWindowContent
				imageURL={imageURL}
				flipped={flipped}
				rotationDegrees={rotationDegrees}
				setImageURL={setImageURL}
			/>
			<MemoizedReferenceWindowControls
				imageAvailable={Boolean(imageURL)}
				setImageURL={setImageURL}
				setFlipped={setFlipped}
				setRotationDegrees={setRotationDegrees}
			/>
		</div>
	);

	if (typeof document === "undefined") return null;

	return createPortal(jsx, document.body);
};

export default ReferenceWindow;
