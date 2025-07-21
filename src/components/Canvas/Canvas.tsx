// Lib
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { parseColor } from "react-aria-components";
import { useShallow } from "zustand/react/shallow";
import useStoreSubscription from "@/state/hooks/useStoreSubscription";
import useLayerReferences from "@/state/hooks/useLayerReferences";
import useStore from "@/state/hooks/useStore";
import * as Utils from "@/lib/utils";
import clsx from "clsx";
import LayersStore from "@/state/stores/LayersStore";

// Types
import type { ReactNode, MouseEvent } from "react";
import type { Layer, Coordinates } from "@/types";
import useThrottle from "@/state/hooks/useThrottle";
import useCanvasRedrawListener from "@/state/hooks/useCanvasRedrawListener";

// Styles using Tailwind

type CanvasProps = {
	isGrabbing: boolean;
};

type DBLayer = {
	image: Blob;
	name: string;
	position: number;
	id: string;
};

const THROTTLE_DELAY_MS = 10; // milliseconds

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(function Canvas(
	{ isGrabbing },
	ref
) {
	const {
		mode,
		shape,
		width,
		height,
		dpi,
		scale,
		position,
		changeMode,
		changeColor,
		setLayers,
		createElement,
		getActiveLayer
	} = useStore(
		useShallow((state) => ({
			mode: state.mode,
			shape: state.shape,
			width: state.width,
			height: state.height,
			dpi: state.dpi,
			scale: state.scale,
			position: state.position,
			changeMode: state.changeMode,
			changeColor: state.changeColor,
			setLayers: state.setLayers,
			createElement: state.createElement,
			getActiveLayer: state.getActiveLayer
		}))
	);
	const color = useStoreSubscription((state) => state.color);
	const drawStrength = useStoreSubscription((state) => state.drawStrength);
	const eraserStrength = useStoreSubscription((state) => state.eraserStrength);

	const { references } = useLayerReferences();

	const isDrawing = useRef<boolean>(false);
	const isMovingElement = useStoreSubscription((state) => state.elementMoving);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const currentPath2D = useRef<Path2D | null>(null);
	const currentPath = useRef<Coordinates[]>([]);
	const initialPosition = useRef<Coordinates>({
		x: 0,
		y: 0
	});

	const ERASER_RADIUS = 7;

	// Handler for when the mouse is pressed down on the canvas.
	// This should initiate the drawing process.
	const onMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
		// isDrawing.current =
		// 	(mode === "draw" || mode === "erase") && !isMovingElement.current;
		isDrawing.current = true;

		const canvas = e.currentTarget;

		if (!canvas) throw new Error("No active layer found. This is a bug.");

		const ctx = canvas.getContext("2d", {
			willReadFrequently: true
		});

		// Calculate the position of the mouse relative to the canvas.
		const { x, y } = Utils.getCanvasPosition(e.clientX, e.clientY, canvas);

		initialPosition.current = { x, y };

		if (mode === "brush" || mode === "shapes" || mode === "eraser") {
			ctx?.beginPath();
			currentPath2D.current = new Path2D();
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
			changeMode("move");
		}

		if (mode === "brush" || mode === "eraser") {
			// Save the current path.
			currentPath.current.push({ x, y });
		}
	};

	// Handler for when the mouse is moved on the canvas.
	// This should handle a majority of the drawing process.

	const onMouseUp = (e: MouseEvent<HTMLCanvasElement>) => {
		if (isGrabbing) return;
		isDrawing.current = false;

		const activeLayer = getActiveLayer();
		const canvas = e.currentTarget;

		const { x, y } = Utils.getCanvasPosition(e.clientX, e.clientY, canvas);
		const { x: initX, y: initY } = initialPosition.current;

		if (mode === "shapes") {
			createElement(shape, {
				x: Math.min(x, initX),
				y: Math.min(y, initY),
				width: Math.abs(x - initX),
				height: Math.abs(y - initY),
				fill: color.current,
				layerId: activeLayer.id
			});
		} else if (mode === "brush" || mode === "eraser") {
			createElement(mode, {
				fill: color.current,
				layerId: activeLayer.id,
				path: currentPath.current
			});
		}

		document.dispatchEvent(new CustomEvent("canvas:redraw"));
		initialPosition.current = { x: 0, y: 0 };

		// A custom event to notify that the image of the layer
		// displayed in the layer list needs to be updated.
		// This event should only really be listened for by the
		// LayerInfo component; however, other components may
		// listen for this event if they need to update the image,
		// if needed.

		// Only fire the imageupdate event if the
		// user actually drew/erased something.
		const imageUpdate = new CustomEvent("imageupdate", {
			detail: {
				layerId: activeLayer.id
			}
		});

		document.dispatchEvent(imageUpdate);
		if (currentPath.current.length > 0) {
		}

		if (mode === "brush" || mode === "eraser") {
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

	const onMouseMove = useThrottle((e: MouseEvent<HTMLCanvasElement>) => {
		// If the left mouse button is not pressed, then we should not draw.
		// If the layer is hidden, we should not draw.
		// If the user is grabbing the canvas (for moving), we should not draw.

		if (e.buttons !== 1 || !isDrawing.current || isGrabbing) {
			return;
		}
		const activeLayer = e.currentTarget;
		const ctx = activeLayer.getContext("2d");

		if (!ctx) throw new Error("Couldn't get the 2D context of the canvas.");

		document.dispatchEvent(new CustomEvent("canvas:redraw"));

		// Calculate the position of the mouse relative to the canvas.
		const { x, y } = Utils.getCanvasPosition(e.clientX, e.clientY, activeLayer);

		switch (mode) {
			case "brush":
			case "eraser": {
				if (!currentPath2D.current) {
					console.error("Couldn't create a Path2D object.");
					return;
				}
				ctx.strokeStyle = color.current;
				ctx.lineWidth = drawStrength.current * dpi;
				ctx.lineCap = "round";
				ctx.lineJoin = "round";
				ctx.globalCompositeOperation =
					mode === "eraser" ? "destination-out" : "source-over";

				currentPath2D.current.lineTo(x, y);
				ctx.stroke(currentPath2D.current);

				currentPath.current.push({ x, y });
				break;
			}

			case "shapes": {
				if (shape === "circle") {
					if (!currentPath2D.current) {
						console.error("Couldn't create a Path2D object.");
						return;
					}

					currentPath2D.current = new Path2D();

					const width = x - initialPosition.current.x;
					const height = y - initialPosition.current.y;

					currentPath2D.current.ellipse(
						Math.min(
							x + Math.abs(width) / 2,
							initialPosition.current.x + Math.abs(width) / 2
						),
						Math.min(
							y + Math.abs(height) / 2,
							initialPosition.current.y + Math.abs(height) / 2
						),
						Math.abs(width) / 2,
						Math.abs(height) / 2,
						0,
						0,
						Math.PI * 2
					);
					ctx.fillStyle = color.current;
					ctx.fill(currentPath2D.current);
				} else if (shape === "rectangle") {
					if (!currentPath2D.current) {
						console.error("Couldn't create a Path2D object.");
						return;
					}

					currentPath2D.current = new Path2D();

					const width = x - initialPosition.current.x;
					const height = y - initialPosition.current.y;
					currentPath2D.current.rect(
						initialPosition.current.x,
						initialPosition.current.y,
						width,
						height
					);
					ctx.fillStyle = color.current;
					ctx.fill(currentPath2D.current);
				} else if (shape === "triangle") {
					if (!currentPath2D.current) {
						console.error("Couldn't create a Path2D object.");
						return;
					}

					currentPath2D.current = new Path2D();

					const width = x - initialPosition.current.x;
					const height = y - initialPosition.current.y;
					//     ctx!.moveTo(startX + rectWidth / 2, startY);
					// ctx!.lineTo(startX, startY + rectHeight);
					// ctx!.lineTo(startX + rectWidth, startY + rectHeight);
					// ctx!.lineTo(startX + rectWidth / 2, startY);
					currentPath2D.current.moveTo(
						initialPosition.current.x + width / 2,
						initialPosition.current.y
					);
					currentPath2D.current.lineTo(
						initialPosition.current.x,
						initialPosition.current.y + height
					);
					currentPath2D.current.lineTo(
						initialPosition.current.x + width,
						initialPosition.current.y + height
					);
					currentPath2D.current.closePath();
					ctx.rotate(
						Math.atan2(
							y - initialPosition.current.y,
							x - initialPosition.current.x
						)
					);
					ctx.fillStyle = color.current;
					ctx.fill(currentPath2D.current);
				}
				break;
			}

			default: {
				break;
			}
		}
	}, THROTTLE_DELAY_MS);

	useImperativeHandle(ref, () => canvasRef.current!, []);

	useCanvasRedrawListener(canvasRef);

	// TODO: Improve this implementation of updating the layers from the storage.
	useEffect(() => {
		async function updateLayers() {
			const entries = await LayersStore.getLayers();

			if (!entries) {
				return;
			}

			await updateLayerState(entries);
			// updateLayerContents(newEntries);
			document.dispatchEvent(new CustomEvent("canvas:redraw"));
		}

		function updateLayerState(entries: [string, DBLayer][]) {
			return new Promise<[string, DBLayer][]>((resolve) => {
				const newLayers: Layer[] = [];

				const sorted = entries.sort((a, b) => a[1].position - b[1].position); // Sort by position, where the highest position is the top layer.

				sorted.forEach((entry, i) => {
					const [id, { name }] = entry;

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

		function updateLayerContents(entries: [string, DBLayer][]) {
			entries.forEach((entry) => {
				const [, { position, image }] = entry;
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
	}, [setLayers, references]);

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
		<canvas
			data-testid="canvas-layer"
			className={clsx("absolute bg-white cursor-inherit z-0")}
			style={{
				width: `${width}px`,
				height: `${height}px`,
				transform
			}}
			ref={canvasRef}
			width={width * dpi}
			height={height * dpi}
			onMouseDown={onMouseDown}
			onMouseMove={onMouseMove}
			onMouseUp={onMouseUp}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			data-scale={scale}
			data-dpi={dpi}
		/>
	);
});

export default Canvas;
