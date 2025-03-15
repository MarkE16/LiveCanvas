// Lib
import { useRef } from "react";

// Components
import { Tooltip } from "@mui/material";

// Types
import type { Dispatch, FC, SetStateAction } from "react";
import Pin from "../icons/Pin/Pin";
import Flip from "../icons/Flip/Flip";
import Rotate from "../icons/Rotate/Rotate";
import ZoomOut from "../icons/ZoomOut/ZoomOut";
import ZoomIn from "../icons/ZoomIn/ZoomIn";

type ReferenceWindowControlsProps = {
	imageAvailable: boolean;
	setImageURL: Dispatch<SetStateAction<string | undefined>>;
	setFlipped: Dispatch<SetStateAction<boolean>>;
	setRotationDegrees: Dispatch<SetStateAction<number>>;
};

const ReferenceWindowControls: FC<ReferenceWindowControlsProps> = ({
	imageAvailable,
	setImageURL,
	setFlipped,
	setRotationDegrees
}) => {
	const fileInput = useRef<HTMLInputElement>(null);

	const onReplaceImage = () => {
		if (fileInput.current) {
			fileInput.current.click();
		}
	};

	const onFileChange = () => {
		if (fileInput.current) {
			const file = fileInput.current.files?.[0];
			if (file) {
				setImageURL(URL.createObjectURL(file));
			}
		}
	};

	const onFlip = () => {
		setFlipped((flipped) => !flipped);
	};

	const onRotate = () => {
		setRotationDegrees((degrees) => (degrees + 90) % 360);
	};

	return (
		<div id="reference-window-controls">
			<input
				disabled={!imageAvailable}
				type="range"
				min="0"
				max="100"
				step="1"
			/>
			<section id="reference-window-controls-button-group">
				<aside>
					<Tooltip title="Zoom In">
						<button
							disabled={!imageAvailable}
							className="reference-window-controls-button"
						>
							<ZoomIn />
						</button>
					</Tooltip>
					<Tooltip title="Zoom Out">
						<button
							disabled={!imageAvailable}
							className="reference-window-controls-button"
						>
							<ZoomOut />
						</button>
					</Tooltip>
					<Tooltip title="Pin">
						<button
							disabled={!imageAvailable}
							className="reference-window-controls-button"
						>
							<Pin />
						</button>
					</Tooltip>
					<Tooltip title="Flip Horizontally">
						<button
							disabled={!imageAvailable}
							className="reference-window-controls-button"
							onClick={onFlip}
						>
							<Flip />
						</button>
					</Tooltip>
					<Tooltip title="Rotate 90 Degrees">
						<button
							disabled={!imageAvailable}
							className="reference-window-controls-button"
							onClick={onRotate}
						>
							<Rotate />
						</button>
					</Tooltip>
				</aside>
				<aside>
					<button onClick={onReplaceImage}>Replace Image</button>
				</aside>
			</section>

			<input
				ref={fileInput}
				type="file"
				accept="image/*"
				onChange={onFileChange}
				style={{ display: "none" }}
			/>
		</div>
	);
};

export default ReferenceWindowControls;
