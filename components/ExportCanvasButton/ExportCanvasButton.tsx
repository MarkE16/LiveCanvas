// Lib
import { useAppSelector } from "../../state/hooks/reduxHooks";
import useIndexed from "../../state/hooks/useIndexed";

// Types
import type { FC } from "react";

const ExportCanvasButton: FC = () => {
	const { width, height } = useAppSelector(
		(state) => state.canvas,
		(prev, next) => prev.width === next.width && prev.height === next.height
	);
	const { get } = useIndexed();

	const handleExport = async () => {
		const substituteCanvas = document.createElement("canvas");

		// Set the canvas size (assuming all layers have the same dimensions)
		substituteCanvas.width = width; // Set to your canvas width
		substituteCanvas.height = height; // Set to your canvas height

		const ctx = substituteCanvas.getContext("2d");

		// Before drawing the images,
		// let's give the canvas a white background, as by default it's transparent.
		ctx!.fillStyle = "white";
		ctx!.fillRect(0, 0, width, height);

		const layers = await get<[string, Blob][]>("layers");

		const promises = layers.reverse().map((layer) => {
			return new Promise<void>((resolve) => {
				const [, blob] = layer;

				const img = new Image();
				img.src = URL.createObjectURL(blob);

				img.onload = () => {
					ctx!.drawImage(img, 0, 0, width, height);

					URL.revokeObjectURL(img.src);
					resolve();
				};
			});
		});

		Promise.all(promises).then(() => {
			const image = substituteCanvas.toDataURL("image/jpeg", 1.0);
			const a = document.createElement("a");

			a.href = image;
			a.download = "canvas.jpg";
			a.click();
		});
	};

	return (
		<button onClick={handleExport}>
			<span>Export Canvas</span>
		</button>
	);
};

export default ExportCanvasButton;
