// Lib
import useLayerReferences from "../../state/hooks/useLayerReferences";
import * as UTILS from "../../utils";

// Types
import type { FC } from "react";
import type { CanvasElement } from "../../types";

const ExportCanvasButton: FC = () => {
	const references = useLayerReferences();

	const handleExport = async () => {
		const substituteCanvas = document.createElement("canvas");

		if (!references.length)
			throw new Error(
				"No layer references exist when attempting to export. This is a bug."
			);

		// Using the first layer as a reference for the canvas size.
		// Recall that all layers should have the same dimensions.
		// There should also *always* be at least one layer.
		const layer = references[0];
		const { width, height } = layer;

		substituteCanvas.width = width;
		substituteCanvas.height = height;

		const ctx = substituteCanvas.getContext("2d");

		if (!ctx)
			throw new Error(
				"Failed to get 2D context from canvas when attempting to export."
			);
		// let's give the canvas a white background, as by default it's transparent.
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, width, height);

		const promises = references.map((layer) => {
			return new Promise<void>((resolve) => {
				const img = new Image();
				const elements = Array.from(document.getElementsByClassName("element"))
					.map((element) => {
						const x = Number(element.getAttribute("data-x"));
						const y = Number(element.getAttribute("data-y"));
						const width = Number(element.getAttribute("data-width"));
						const height = Number(element.getAttribute("data-height"));
						const shape = element.getAttribute("data-shape");
						const fill = element.getAttribute("data-fill");
						const border = element.getAttribute("data-border");
						const layerId = element.getAttribute("data-layerid");
						const id = element.id;

						return {
							x,
							y,
							width,
							height,
							shape,
							fill,
							border,
							layerId,
							id
						} as CanvasElement;
					})
					.filter((element) => element.layerId === layer.id);

				layer.toBlob((blob) => {
					if (!blob) throw new Error("Failed to extract blob when exporting.");

					img.src = URL.createObjectURL(blob);
				});

				img.onload = () => {
					ctx.drawImage(img, 0, 0, width, height);
					URL.revokeObjectURL(img.src);

					// Draw the elements.
					for (let i = 0; i < elements.length; i++) {
						const element = elements[i];
						const { x: eX, y: eY, width: eWidth, height: eHeight } = element;

						// Calculate the x and y position of the element relative to the canvas.
						const { x, y } = UTILS.getCanvasPointerPosition(
							eX,
							eY,
							layer,
							Number(layer.getAttribute("data-dpi"))
						);

						// Setup the fill and border.
						ctx.fillStyle = element.fill;
						ctx.strokeStyle = element.border;

						// Draw the element.
						ctx.beginPath();
						switch (element.shape) {
							case "circle": {
								// We use `ellipse` instead of `arc` since
								// the shape can be resized to be an ellipse.
								ctx.ellipse(
									x + eWidth / 2,
									y + eHeight / 2,
									eWidth / 2,
									eHeight / 2,
									0,
									0,
									2 * Math.PI
								);
								ctx.fill(); // Fill the circle.
								ctx.stroke(); // Draw the border.

								break;
							}

							case "rectangle": {
								ctx.fillRect(x, y, eWidth, eHeight); // Fill the rectangle.
								ctx.strokeRect(x, y, eWidth, eHeight); // Draw the border.

								break;
							}

							case "triangle": {
								ctx.moveTo(x + eWidth / 2, y);
								ctx.lineTo(x + eWidth, y + eHeight);
								ctx.lineTo(x, y + eHeight);
								ctx.fill(); // Fill the triangle.
								ctx.stroke(); // Draw the border.

								break;
							}

							default:
								throw new Error(
									`Invalid shape ${element.shape} when exporting.`
								);
						}
					}

					// Finished drawing the elements for this layer. Move on to the next.
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
