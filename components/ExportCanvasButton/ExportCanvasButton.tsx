// Lib
import useLayerReferences from "../../state/hooks/useLayerReferences";
import * as UTILS from "../../utils";

// Types
import type { FC } from "react";
import type { CanvasElement } from "../../types";

type ExportedElement = CanvasElement & {
	spaceLeft: number;
	spaceTop: number;
	spaceWidth: number;
	spaceHeight: number;
};

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
		// Using this instead of the width and height in the state
		// so that the component does not need to depend on the values.
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
						// There may be a better solution to grabbing the canvas space's bounding rect
						// properties from an external component that is not rendered in the CanvasPane component.
						// However, this is a temporary solution.
						const spaceLeft = Number(
							element.getAttribute("data-canvas-space-left")
						);
						const spaceTop = Number(
							element.getAttribute("data-canvas-space-top")
						);
						const spaceWidth = Number(
							element.getAttribute("data-canvas-space-width")
						);
						const spaceHeight = Number(
							element.getAttribute("data-canvas-space-height")
						);
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
							spaceLeft,
							spaceTop,
							spaceWidth,
							spaceHeight,
							id
						} as unknown as ExportedElement;
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
						let { x: eX, y: eY } = element;
						const { width: eWidth, height: eHeight } = element;

						// Note: `spaceLeft` and `spaceTop` are the left and top properties of the canvas space.
						// (See CanvasPane.tsx where the reference is defined). In order for the elements
						// to be dragged by the mouse properly, we need to account for the canvas space's left and top
						// of the bounding rect in the element's coordinates.
						// However, when exporting to the canvas, these values do not matter (and screws up the calculation)
						// for the x and y coordinates related to the canvas.
						// Therefore, we add the left and top values here to remove them from the calculation.

						// If the x or y values are NaN, we set them to the center of the canvas space.
						if (isNaN(eX)) {
							eX =
								element.spaceLeft +
								element.spaceWidth / 2 -
								eWidth / 2 -
								element.spaceLeft;
						}

						if (isNaN(eY)) {
							eY =
								element.spaceTop +
								element.spaceHeight / 2 -
								eHeight / 2 -
								element.spaceTop;
						}

						const { x: startX, y: startY } = UTILS.getCanvasPosition(
							eX + element.spaceLeft,
							eY + element.spaceTop,
							layer,
							0,
							false
						);
						const { x: endX, y: endY } = UTILS.getCanvasPosition(
							eX + eWidth + element.spaceLeft,
							eY + eHeight + element.spaceTop,
							layer,
							0,
							false
						);

						// Dimensions relative to the canvas.
						// The eWidth and eHeight are the width and height of the DOM,
						// which are different from the canvas.
						const width = endX - startX;
						const height = endY - startY;

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
									startX + width / 2,
									startY + height / 2,
									width / 2,
									height / 2,
									0,
									0,
									2 * Math.PI
								);
								ctx.fill(); // Fill the circle.
								ctx.stroke(); // Draw the border.

								break;
							}

							case "rectangle": {
								ctx.fillRect(startX, startY, width, height); // Fill the rectangle.
								ctx.strokeRect(startX, startY, width, height); // Draw the border.

								break;
							}

							case "triangle": {
								ctx.moveTo(startX + width / 2, startY);
								ctx.lineTo(startX + width, startY + height);
								ctx.lineTo(startX, startY + height);
								ctx.fill(); // Fill the triangle.
								ctx.stroke(); // Draw the border.

								break;
							}

							default: {
								ctx.closePath();
								throw new Error(
									`Invalid shape ${element.shape} when exporting.`
								);
							}
						}
					}
					ctx.closePath();

					// Finished drawing the elements for this layer. Move on to the next.
					resolve();
				};
			});
		});

		// Everything rendered successfully! Create the download.
		Promise.all(promises).then(() => {
			const image = substituteCanvas.toDataURL("image/jpeg", 1.0);
			const a = document.createElement("a");

			a.href = image;
			a.download = "canvas.jpg";
			a.click();
		});
	};

	return <button onClick={handleExport}>Export Canvas</button>;
};

export default ExportCanvasButton;
