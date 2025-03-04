// Lib
import { useEffect, useRef } from "react";
import { parseColor } from "react-aria-components";
import { useShallow } from "zustand/react/shallow";
import useIndexed from "../../state/hooks/useIndexed";
import useStoreSubscription from "../../state/hooks/useStoreSubscription";
import useLayerReferences from "../../state/hooks/useLayerReferences";
import useStore from "../../state/hooks/useStore";
import * as Utils from "../../utils";
import clsx from "clsx";

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
	id: string;
};

const Canvas: FC<CanvasProps> = ({ isGrabbing }) => {
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
		position,
		changeMode,
		changeColor,
		setLayers
	} = useStore(
		useShallow((state) => ({
			mode: state.mode,
			width: state.width,
			height: state.height,
			layers: state.layers,
			dpi: state.dpi,
			eraserStrength: state.eraserStrength,
			drawStrength: state.drawStrength,
			color: state.color,
			scale: state.scale,
			position: state.position,
			changeMode: state.changeMode,
			changeColor: state.changeColor,
			setLayers: state.setLayers
		}))
	);

	const { references, add, getActiveLayer } = useLayerReferences();
	const { get, remove } = useIndexed();

	const isDrawing = useRef<boolean>(false);
	const isMovingElement = useStoreSubscription((state) => state.elementMoving);
	const currentPath2D = useRef<Path2D | null>(null);
	const currentPath = useRef<Coordinates[]>([]);

	const ERASER_RADIUS = 7;

	// Handler for when the mouse is pressed down on the canvas.
	// This should initiate the drawing process.
	const onMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
		isDrawing.current =
			(mode === "draw" || mode === "erase") && !isMovingElement.current;

		const activeLayer = e.currentTarget;

		if (!activeLayer) throw new Error("No active layer found. This is a bug.");

		const ctx = activeLayer.getContext("2d", {
			willReadFrequently: true
		});

		// Calculate the position of the mouse relative to the canvas.
		const { x, y } = Utils.getCanvasPosition(e.clientX, e.clientY, activeLayer);

		if (mode === "draw") {
			ctx?.beginPath();
			currentPath2D.current = new Path2D();
			currentPath2D.current.moveTo(x, y);
		} else if (mode === "eye_drop" && !isGrabbing) {
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
			changeColor(color.toString("hsla"));
			changeMode("select");
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
		const activeLayer = e.currentTarget;
		if (!activeLayer) throw new Error("No active layer found. This is a bug.");

		const ctx = activeLayer.getContext("2d");

		if (!ctx) throw new Error("Couldn't get the 2D context of the canvas.");

		// Calculate the position of the mouse relative to the canvas.
		const { x, y } = Utils.getCanvasPosition(e.clientX, e.clientY, activeLayer);

		switch (mode) {
			case "draw": {
				if (!currentPath2D.current) {
					console.error("Couldn't create a Path2D object.");
					return;
				}
				ctx.strokeStyle = color;
				ctx.lineWidth = drawStrength * dpi;
				ctx.lineCap = "round";
				ctx.lineJoin = "round";

				currentPath2D.current.lineTo(x, y);
				ctx.stroke(currentPath2D.current);

				currentPath.current.push({ x, y });

				break;
			}

			case "erase": {
				ctx.clearRect(
					x - ((ERASER_RADIUS * eraserStrength) / 2) * dpi,
					y - ((ERASER_RADIUS * eraserStrength) / 2) * dpi,
					ERASER_RADIUS * eraserStrength * dpi,
					ERASER_RADIUS * eraserStrength * dpi
				);
				break;
			}

			default: {
				break;
			}
		}
	};

	const onMouseUp = (e: MouseEvent) => {
		if (isGrabbing) return;
		isDrawing.current = false;

		// A custom event to notify that the image of the layer
		// displayed in the layer list needs to be updated.
		// This event should only really be listened for by the
		// LayerInfo component; however, other components may
		// listen for this event if they need to update the image,
		// if needed.

		// Only fire the imageupdate event if the
		// user actually drew/erased something.
		if (currentPath.current.length > 0) {
			const activeLayer = e.currentTarget;

			if (!activeLayer)
				throw new Error("No active layer found. This is a bug.");

			const imageUpdate = new CustomEvent("imageupdate", {
				detail: {
					layer: activeLayer
				}
			});

			document.dispatchEvent(imageUpdate);
		}

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
			const urlParams = new URLSearchParams(window.location.search);
			const fileId = urlParams.get("f");
			// The open query parameter is used to determine if the file
			// was created from opening a file from the local computer.
			const open = urlParams.get("open");

			if (!fileId) {
				// Simply do nothing. We want to redirect if there is no file.
				// This is handled in the Page component for the editor route.
				return;
			}

			const entries = await get<DBLayer[]>("layers", fileId);

			if (!entries) {
				// We're in a new file. We have one layer by default,
				// so we'll render the opened file with that layer.

				if (!open) {
					return;
				}

				const file = await get<File>("files", fileId);

				if (!file) {
					console.error(
						"Tried to get file from temporary storage, there was no file."
					);
				} else {
					const ref = getActiveLayer();
					const canvasWidth = Number(ref.style.width.replace("px", ""));
					const canvasHeight = Number(ref.style.height.replace("px", ""));
					const ctx = ref.getContext("2d");
					const img = new Image();

					img.width = canvasWidth;
					img.height = canvasHeight;

					img.onload = () => {
						ctx!.drawImage(img, 0, 0, canvasWidth, canvasHeight);
						URL.revokeObjectURL(img.src);

						// A custom event to notify that the image of the layer
						// displayed in the layer list needs to be updated.

						const ev = new CustomEvent("imageupdate", {
							detail: {
								layer: ref
							}
						});

						document.dispatchEvent(ev);
					};

					img.src = URL.createObjectURL(file);
					return;
				}
			}

			const newEntries = await updateLayerState(entries);
			updateLayerContents(newEntries);
		}

		function updateLayerState(entries: DBLayer[]) {
			return new Promise<DBLayer[]>((resolve) => {
				const newLayers: Layer[] = [];

				const sorted = entries.sort((a, b) => b.position - a.position); // Sort by position, where the highest position is the top layer.

				sorted.forEach((entry, i) => {
					const { name, id } = entry;

					newLayers.push({
						name: name,
						id: id,
						active: i === 0,
						hidden: false
					});
				});

				if (newLayers.length === 0) {
					return;
				}

				setLayers(newLayers);

				resolve(sorted);
			});
		}

		function updateLayerContents(entries: DBLayer[]) {
			entries.forEach((entry) => {
				const { position, image } = entry;
				const canvas = references.current[position];

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

				img.src = URL.createObjectURL(image);
			});
		}

		updateLayers();
	}, [setLayers, get, references, getActiveLayer, remove]);

	useEffect(() => {
		const refs = references.current;
		for (const canvas of refs) {
			const ctx = canvas.getContext("2d");

			if (!ctx) return;

			ctx.scale(dpi, dpi);
		}

		return () => {
			for (const canvas of refs) {
				const ctx = canvas.getContext("2d");

				if (!ctx) return;

				ctx.scale(1 / dpi, 1 / dpi);
			}
		};
	}, [dpi, references]);

	const transform = `translate(${position.x}px, ${position.y}px) scale(${scale})`;

	return (
		<>
			{/* The main canvas. */}
			{layers.map((layer, i) => {
				const cn = clsx("canvas", {
					active: layer.active,
					hidden: layer.hidden && layers.length > 1
				});

				return (
					<canvas
						key={layer.id}
						data-testid="canvas-layer"
						className={cn}
						style={{
							width: `${width}px`,
							height: `${height}px`,
							transform
						}}
						ref={(element) => {
							if (element !== null) {
								add(element, i);
							}
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
						data-scale={scale}
						data-dpi={dpi}
					/>
				);
			})}
		</>
	);
};

export default Canvas;
