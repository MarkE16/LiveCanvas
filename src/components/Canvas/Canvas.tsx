// Lib
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { parseColor } from "react-aria-components";
import { useShallow } from "zustand/react/shallow";
import useStoreSubscription from "@/state/hooks/useStoreSubscription";
import useStore from "@/state/hooks/useStore";
import * as Utils from "@/lib/utils";

// Types
import type { MouseEvent as ReactMouseEvent } from "react";
import { type Coordinates, CanvasElementPath } from "@/types";
import useThrottle from "@/state/hooks/useThrottle";
import useCanvasRedrawListener from "@/state/hooks/useCanvasRedrawListener";

// Styles using Tailwind

type CanvasProps = {
	isGrabbing: boolean;
};

const THROTTLE_DELAY_MS = 10; // milliseconds

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(function Canvas(
	{ isGrabbing },
	ref
) {
	const {
		mode,
		background,
		shape,
		width,
		height,
		dpi,
		scale,
		position,
		changeMode,
		changeColor,
		createElement,
		getActiveLayer,
		pushHistory
	} = useStore(
		useShallow((state) => ({
			mode: state.mode,
			background: state.background,
			shape: state.shape,
			width: state.width,
			height: state.height,
			dpi: state.dpi,
			scale: state.scale,
			position: state.position,
			changeMode: state.changeMode,
			changeColor: state.changeColor,
			createElement: state.createElement,
			getActiveLayer: state.getActiveLayer,
			pushHistory: state.pushHistory
		}))
	);
	const color = useStoreSubscription((state) => state.color);
	const strokeWidth = useStoreSubscription((state) => state.strokeWidth);
	const shapeMode = useStoreSubscription((state) => state.shapeMode);
	const opacity = useStoreSubscription((state) => state.opacity);

	const isDrawing = useRef<boolean>(false);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const currentPath2D = useRef<Path2D>(null);
	const currentPath = useRef<CanvasElementPath[]>([]);
	const initialPosition = useRef<Coordinates>({
		x: 0,
		y: 0
	});

	// Handler for when the mouse is pressed down on the canvas.
	// This should initiate the drawing process.
	const onMouseDown = (e: ReactMouseEvent<HTMLCanvasElement>) => {
		// isDrawing.current =
		// 	(mode === "draw" || mode === "erase") && !isMovingElement.current;

		const canvas = e.currentTarget;

		if (!canvas) throw new Error("No active layer found. This is a bug.");

		const ctx = canvas.getContext("2d", {
			willReadFrequently: true
		});

		if (!ctx) {
			throw new Error("Couldn't get the 2D context of the canvas.");
		}

		ctx.globalAlpha = opacity.current;

		// Calculate the position of the mouse relative to the canvas.
		const { x, y } = Utils.getCanvasPosition(e.clientX, e.clientY, canvas);

		if (!isDrawing.current) {
			initialPosition.current = { x, y };
		}
		const activeLayer = getActiveLayer();
		isDrawing.current = !activeLayer.hidden;

		if (mode === "brush" || mode === "eraser") {
			currentPath2D.current = new Path2D();
			currentPath2D.current.moveTo(x, y);
			// Save the current path.
			currentPath.current.push({ x, y, startingPoint: true });
		} else if (mode === "eye_drop" && !isGrabbing) {
			// `.getImageData()` retreives the x and y coordinates of the pixel
			// differently if the canvas is scaled. So, we need to multiply the
			// x and y coordinates by the DPI to get the correct pixel.
			const pixel = ctx.getImageData(
				Math.floor(x * dpi),
				Math.floor(y * dpi),
				1,
				1
			).data;

			const colorStr = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
			let color;

			if (colorStr === "rgb(0, 0, 0)") {
				// If the color is transparent, we want to assume
				// that the user wanted to select the background color
				// which visually is white. For the color to be
				// transparent is correct, but from a UX perspective,
				// it's not what the user would expect. So,
				// we'll set the color to white.
				color = parseColor("rgb(255, 255, 255)");
			} else {
				color = parseColor(colorStr);
			}

			changeColor(color.toString("hex"));
			changeMode("move");
		}
	};

	const onMouseMove = useThrottle((e: MouseEvent) => {
		// If the left mouse button is not pressed, then we should not draw.
		// If the layer is hidden, we should not draw.
		// If the user is grabbing the canvas (for moving), we should not draw.
		const activeLayer = canvasRef.current;
		if (!activeLayer) {
			throw new Error("Canvas Ref is not set. This is a bug.");
		}

		const onCanvas =
			e.target === activeLayer || activeLayer.contains(e.target as Node);

		if (e.buttons !== 1 || !isDrawing.current || isGrabbing) {
			return;
		}
		if (mode === "shapes") {
			currentPath2D.current = new Path2D();
			document.dispatchEvent(new CustomEvent("canvas:redraw"));
		}
		const ctx = activeLayer.getContext("2d");

		if (!ctx) throw new Error("Couldn't get the 2D context of the canvas.");

		// Calculate the position of the mouse relative to the canvas.
		let { x, y } = Utils.getCanvasPosition(e.clientX, e.clientY, activeLayer);

		ctx.globalCompositeOperation =
			mode === "eraser" ? "destination-out" : "source-over";
		ctx.fillStyle = color.current;
		ctx.strokeStyle = color.current;
		ctx.lineWidth = strokeWidth.current * dpi;
		const currentShapeMode = shapeMode.current;

		if (!currentPath2D.current) {
			currentPath2D.current = new Path2D();
		}

		switch (mode) {
			case "brush":
			case "eraser": {
				if (!onCanvas) return;
				ctx.strokeStyle = color.current;
				ctx.lineWidth = strokeWidth.current * dpi;
				ctx.lineCap = "round";
				ctx.lineJoin = "round";

				currentPath2D.current.lineTo(x, y);
				ctx.stroke(currentPath2D.current);

				currentPath.current.push({ x, y, startingPoint: false });
				break;
			}

			case "shapes": {
				if (shape === "circle") {
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
				} else if (shape === "rectangle") {
					const width = x - initialPosition.current.x;
					const height = y - initialPosition.current.y;
					currentPath2D.current.rect(
						initialPosition.current.x,
						initialPosition.current.y,
						width,
						height
					);
				} else if (shape === "triangle") {
					const width = x - initialPosition.current.x;
					const height = y - initialPosition.current.y;
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
				}

				currentPath2D.current.closePath();
				if (currentShapeMode === "fill") {
					ctx.fill(currentPath2D.current);
				} else {
					ctx.stroke(currentPath2D.current);
				}
				break;
			}

			default: {
				break;
			}
		}
	}, THROTTLE_DELAY_MS);

	// Handler for when the mouse is moved on the canvas.
	// This should handle a majority of the drawing process.

	const onMouseUp = (e: ReactMouseEvent<HTMLCanvasElement>) => {
		if (isGrabbing) return;
		isDrawing.current = false;

		const activeLayer = getActiveLayer();
		const canvas = e.currentTarget;

		const ctx = canvas.getContext("2d");

		if (!ctx) throw new Error("Couldn't get the 2D context of the canvas.");

		const { x, y } = Utils.getCanvasPosition(e.clientX, e.clientY, canvas);
		const { x: initX, y: initY } = initialPosition.current;

		let elementType;
		let elementPayload;
		if (mode === "shapes") {
			elementType = shape;
			elementPayload = {
				x: Math.min(x, initX),
				y: Math.min(y, initY),
				width: Math.abs(x - initX),
				height: Math.abs(y - initY),
				color: color.current,
				layerId: activeLayer.id,
				inverted: y < initY
			};
		} else if (mode === "brush" || mode === "eraser") {
			elementType = mode;
			elementPayload = {
				color: color.current,
				path: currentPath.current
			};
		} else {
			throw new Error(`Unsupported mode: ${mode}`);
		}

		const properties = createElement(elementType, elementPayload);

		initialPosition.current = { x: 0, y: 0 };

		pushHistory({
			type: "add_element",
			properties
		});
		currentPath.current = [];
	};

	const onMouseEnter = (e: ReactMouseEvent<HTMLCanvasElement>) => {
		if (e.buttons === 1) {
			onMouseDown(e);
		}
	};

	useImperativeHandle(ref, () => canvasRef.current!, []);

	useCanvasRedrawListener(canvasRef);

	useEffect(() => {
		document.addEventListener("mousemove", onMouseMove);
		return () => document.removeEventListener("mousemove", onMouseMove);
	}, [onMouseMove]);

	const transform = `translate(${position.x}px, ${position.y}px) scale(${scale})`;

	return (
		<canvas
			data-testid="canvas-layer"
			className="absolute cursor-inherit z-0"
			style={{
				backgroundColor: background,
				width: `${width}px`,
				height: `${height}px`,
				transform
			}}
			ref={canvasRef}
			width={width * dpi}
			height={height * dpi}
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			onMouseEnter={onMouseEnter}
			data-scale={scale}
			data-dpi={dpi}
		/>
	);
});

export default Canvas;
