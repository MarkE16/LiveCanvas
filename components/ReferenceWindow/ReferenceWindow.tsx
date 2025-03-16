// Lib
import { useState, memo, useRef } from "react";
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
	// 50 is considered 1x. In the controls, the scale is divided by 50 to get the actual scale.
	// Therefore, 50 / 50 is 1.
	const [scale, setScale] = useState<number>(50);
	const windowRef = useRef<HTMLDivElement>(null);

	const [position, setPosition] = useState<Coordinates>(() => {
		if (typeof window !== "undefined") {
			const { innerWidth, innerHeight } = window;

			const windowRefCurrent = windowRef.current;

			if (windowRefCurrent) {
				const { offsetWidth, offsetHeight } = windowRefCurrent;

				return {
					x: (innerWidth - offsetWidth) / 2,
					y: (innerHeight - offsetHeight) / 2
				};
			}

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
			ref={windowRef}
			style={styles}
		>
			<MemoizedReferenceWindowHeader setPosition={setPosition}>
				Reference Window
			</MemoizedReferenceWindowHeader>
			<MemoizedReferenceWindowContent
				imageURL={imageURL}
				flipped={flipped}
				scale={scale}
				rotationDegrees={rotationDegrees}
				setImageURL={setImageURL}
			/>
			<MemoizedReferenceWindowControls
				scale={scale}
				setScale={setScale}
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
