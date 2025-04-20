// Lib
import { useRef } from "react";

// Components
import Tooltip from "../Tooltip/Tooltip";

// Icons
import Pin from "../icons/Pin/Pin";
import Flip from "../icons/Flip/Flip";
import Rotate from "../icons/Rotate/Rotate";
import ZoomOut from "../icons/ZoomOut/ZoomOut";
import ZoomIn from "../icons/ZoomIn/ZoomIn";

// Types
import type { Dispatch, FC, SetStateAction } from "react";

type ReferenceWindowControlsProps = {
	scale: number;
	pinned: boolean;
	setScale: Dispatch<SetStateAction<number>>;
	imageAvailable: boolean;
	setImageURL: Dispatch<SetStateAction<string | undefined>>;
	setFlipped: Dispatch<SetStateAction<boolean>>;
	setPinned: Dispatch<SetStateAction<boolean>>;
	setRotationDegrees: Dispatch<SetStateAction<number>>;
};

const ReferenceWindowControls: FC<ReferenceWindowControlsProps> = ({
	scale,
	pinned,
	setScale,
	imageAvailable,
	setImageURL,
	setFlipped,
	setPinned,
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

			if (!file) return;

			if (!file.type.match(/\*?.(png|jpg|jpeg)/)) {
				alert("Invalid file type.");
				return;
			}

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

	const onPin = () => {
		setPinned((pinned) => !pinned);
	};

	const updateScale = (_for: "increase" | "decrease") => {
		setScale((prev) => {
			if (_for === "increase") {
				return Math.min(prev + 10, 100);
			}
			return Math.max(prev - 10, 1);
		});
	};

	return (
		<section
			id="reference-window-controls"
			data-testid="reference-window-controls"
		>
			<input
				disabled={!imageAvailable}
				type="range"
				min="1"
				max="100"
				step="1"
				value={scale}
				onChange={(e) => setScale(+e.target.value)}
				data-testid="scale-slider"
			/>
			<section id="reference-window-controls-button-group">
				<aside>
					<Tooltip
						text="Zoom In"
						position="bottom"
						arrow={false}
					>
						<button
							disabled={!imageAvailable || scale === 100}
							className="reference-window-controls-button"
							onClick={() => updateScale("increase")}
							data-testid="zoom-in"
						>
							<ZoomIn />
						</button>
					</Tooltip>
					<Tooltip
						text="Zoom Out"
						position="bottom"
						arrow={false}
					>
						<button
							disabled={!imageAvailable || scale === 1}
							className="reference-window-controls-button"
							onClick={() => updateScale("decrease")}
							data-testid="zoom-out"
						>
							<ZoomOut />
						</button>
					</Tooltip>
					<Tooltip
						text={pinned ? "Unpin" : "Pin"}
						position="bottom"
						arrow={false}
					>
						<button
							onClick={onPin}
							className="reference-window-controls-button"
							data-testid="pin"
						>
							<Pin />
						</button>
					</Tooltip>
					<Tooltip
						text="Flip Horizontally"
						position="bottom"
						arrow={false}
					>
						<button
							disabled={!imageAvailable}
							className="reference-window-controls-button"
							onClick={onFlip}
							data-testid="flip"
						>
							<Flip />
						</button>
					</Tooltip>
					<Tooltip
						text="Rotate 90 Degrees"
						position="bottom"
						arrow={false}
					>
						<button
							disabled={!imageAvailable}
							className="reference-window-controls-button"
							onClick={onRotate}
							data-testid="rotate"
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
				data-testid="ref-window-file-input"
				style={{ display: "none" }}
			/>
		</section>
	);
};

export default ReferenceWindowControls;
