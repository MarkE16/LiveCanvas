// Lib
import { useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../../state/hooks/reduxHooks";
import useIndexed from "../../state/hooks/useIndexed";
import useLayerReferences from "../../state/hooks/useLayerReferences";
import useCanvasElements from "../../state/hooks/useCanvasElements";
import { parseColor } from "react-aria-components";
import * as utils from "../../utils";

// Redux Actions
import {
	setLayers,
	changeMode,
	changeColor
} from "../../state/slices/canvasSlice";

// Types
import type { FC, MouseEvent } from "react";
import type { Layer, Coordinates } from "../../types";

// Styles
import "./Canvas.styles.css";

type CanvasProps = {
	isGrabbing: boolean;
};

type DBLayer = {
	image: Blob;
	name: string;
	position: number;
};

const Canvas: FC<CanvasProps> = ({ isGrabbing }) => {
	const state = useAppSelector((state) => state.canvas);
	const dispatch = useAppDispatch();
	const {
		mode,
		width,
		height,
		layers,
		dpi,
		eraserStrength,
		drawStrength,
		color,
		scale,
		position
	} = state;

	const { movingElement } = useCanvasElements();
	const references = useLayerReferences();
	const { get } = useIndexed();

	const isDrawing = useRef<boolean>(false);
	const currentPath2D = useRef<Path2D | null>(null);
	const currentPath = useRef<Coordinates[]>([]);

	const ERASER_RADIUS = 7;

	// Handler for when the mouse is pressed down on the canvas.
	// This should initiate the drawing process.
	const onMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
		e.preventDefault();
		isDrawing.current = mode !== "select" && !movingElement.current;

		const activeLayer = references.find((ref) =>
			ref.classList.contains("active")
		);

		if (!activeLayer) throw new Error("No active layer found. This is a bug.");

		const ctx = activeLayer.getContext("2d", {
			willReadFrequently: true
		});

		// Calculate the position of the mouse relative to the canvas.
		const { x, y } = utils.getCanvasPosition(
			e.clientX,
			e.clientY,
			activeLayer,
			dpi
		);

		if (mode === "draw") {
			currentPath2D.current = new Path2D();
			currentPath2D.current.moveTo(x, y);
		} else if (mode === "eye_drop" && !isGrabbing && !movingElement.current) {
			// `.getImageData()` retreives the x and y coordinates of the pixel
			// differently if the canvas is scaled. So, we need to multiply the
			// x and y coordinates by the DPI to get the correct pixel.
			const pixel = ctx!.getImageData(
				Math.floor(x * dpi),
				Math.floor(y * dpi),
				1,
				1
			).data;

			const colorStr = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3]})`;
			let color;

			if (colorStr === "rgba(0, 0, 0, 0)") {
				// If the color is transparent, we want to assume
				// that the user wanted to select the background color
				// which visually is white. For the color to be
				// transparent is correct, but from a UX perspective,
				// it's not what the user would expect. So,
				// we'll set the color to white.
				color = parseColor("rgba(255, 255, 255, 255)");
			} else {
				color = parseColor(colorStr);
			}

			// The color picker only supports HSLA, so we need to convert the color to HSLA.
			dispatch(changeColor(color.toString("hsla")));
			dispatch(changeMode("select")); // Change the mode to select after the color is picked.
		}

		if (mode === "draw" || mode === "erase") {
			// Save the current path.
			currentPath.current.push({ x, y });
		}
	};

	// Handler for when the mouse is moved on the canvas.
	// This should handle a majority of the drawing process.
	const onMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
		// If the left mouse button is not pressed, then we should not draw.
		// If the layer is hidden, we should not draw.
		// If the user is grabbing the canvas (for moving), we should not draw.

		if (e.buttons !== 1 || !isDrawing.current || isGrabbing) {
			return;
		}
		const activeLayer = references.find((ref) =>
			ref.classList.contains("active")
		);
		if (!activeLayer) throw new Error("No active layer found. This is a bug.");

		const ctx = activeLayer.getContext("2d");

		if (!ctx) throw new Error("Couldn't get the 2D context of the canvas.");

		// Calculate the position of the mouse relative to the canvas.
		const { x, y } = utils.getCanvasPosition(
			e.clientX,
			e.clientY,
			activeLayer,
			dpi
		);

		switch (mode) {
			case "draw": {
				if (!currentPath2D.current) {
					console.error("Couldn't create a Path2D object.");
					return;
				}
				ctx.strokeStyle = color;
				ctx.lineWidth = drawStrength;
				ctx.lineCap = "round";
				ctx.lineJoin = "round";

				currentPath2D.current.lineTo(x, y);
				ctx.stroke(currentPath2D.current);

				currentPath.current.push({ x, y });

				break;
			}

			case "erase": {
				ctx.clearRect(
					x - (ERASER_RADIUS * eraserStrength) / 2,
					y - (ERASER_RADIUS * eraserStrength) / 2,
					ERASER_RADIUS * eraserStrength,
					ERASER_RADIUS * eraserStrength
				);
				break;
			}

			default: {
				break;
			}
		}
	};

	const onMouseUp = () => {
		if (isGrabbing) return;
		isDrawing.current = false;

		if (mode === "draw" || mode === "erase") {
			// Save the action to the history.
			// history.addHistory({
			// 	mode: mode as "draw" | "erase" | "shapes",
			// 	path: currentPath.current,
			// 	layerId: layerRef!.id,
			// 	color,
			// 	drawStrength
			// });

			// Clear the current path.
			currentPath.current = [];
		}

		// A custom event to notify that the image of the layer
		// displayed in the layer list needs to be updated.
		// This event should only really be listened for by the
		// LayerInfo component; however, other components may
		// listen for this event if they need to update the image,
		// if needed.

		const activeLayer = references.find((ref) =>
			ref.classList.contains("active")
		);

		if (!activeLayer) throw new Error("No active layer found. This is a bug.");
		const imageUpdate = new CustomEvent("imageupdate", {
			detail: {
				layer: activeLayer
			}
		});

		document.dispatchEvent(imageUpdate);
	};

	const onMouseEnter = (e: MouseEvent<HTMLCanvasElement>) => {
		if (e.buttons === 1) {
			onMouseDown(e);
		}
	};

	const onMouseLeave = () => {
		isDrawing.current = false;
	};

	// TODO: Improve this implementation of updating the layers from the storage.
	useEffect(() => {
		async function updateLayers() {
			const entries = await get<[string, DBLayer][]>("layers");

			const newEntries = await updateLayerState(entries);
			updateLayerContents(newEntries);
		}

		function updateLayerState(entries: [string, DBLayer][]) {
			return new Promise<[string, DBLayer][]>((resolve) => {
				const newLayers: Layer[] = [];

				const sorted = entries.sort((a, b) => b[1].position - a[1].position); // Sort by position, where the highest position is the top layer.

				sorted.forEach((entry, i) => {
					const [layerId, layer] = entry;

					newLayers.push({
						name: layer.name,
						id: layerId,
						active: i === 0,
						hidden: false
					});
				});

				if (newLayers.length === 0) {
					return;
				}

				dispatch(setLayers(newLayers));

				resolve(sorted);
			});
		}

		function updateLayerContents(entries: [string, DBLayer][]) {
			entries.forEach((entry) => {
				const [, layer] = entry;
				const canvas = references[layer.position];

				if (!canvas) return;

				const ctx = canvas.getContext("2d");
				const img = new Image();

				img.onload = () => {
					ctx!.drawImage(img, 0, 0);
					URL.revokeObjectURL(img.src);

					// A custom event to notify that the image of the layer
					// displayed in the layer list needs to be updated.
					const ev = new CustomEvent("imageupdate", {
						detail: {
							layer: canvas
						}
					});

					document.dispatchEvent(ev);
				};

				img.src = URL.createObjectURL(layer.image);
			});
		}

		updateLayers();
	}, [dispatch, get, references]);

	const transform = `translate(${position.x}px, ${position.y}px) scale(${scale})`;

	return (
		<>
			{/* The main canvas. */}
			{layers
				.slice()
				.reverse()
				.map((layer, i) => (
					<canvas
						key={layer.id}
						data-testid="canvas-layer"
						className={`canvas${layer.active ? " active" : ""}${
							layer.hidden ? " hidden" : ""
						}`}
						style={{
							width: `${width}px`,
							height: `${height}px`,
							transform
						}}
						ref={(element: HTMLCanvasElement) => {
							references[i] = element;
						}}
						id={layer.id}
						width={width * dpi}
						height={height * dpi}
						onMouseDown={onMouseDown}
						onMouseMove={onMouseMove}
						onMouseUp={onMouseUp}
						onMouseEnter={onMouseEnter}
						onMouseLeave={onMouseLeave}
						data-name={layer.name}
						data-layer-index={layer.active ? layers.length : layers.length - i}
						data-scale={scale}
						data-dpi={dpi}
					/>
				))}
		</>
	);
};

export default Canvas;
