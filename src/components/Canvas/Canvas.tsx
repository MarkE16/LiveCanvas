// Lib
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { parseColor } from "react-aria-components";
import { useShallow } from "zustand/react/shallow";
import useStoreSubscription from "@/state/hooks/useStoreSubscription";
import useStore from "@/state/hooks/useStore";

// Types
import type { MouseEvent as ReactMouseEvent } from "react";
import { type Coordinates, CanvasElementPath } from "@/types";
import useThrottle from "@/state/hooks/useThrottle";
import useCanvasRedrawListener from "@/state/hooks/useCanvasRedrawListener";
import useCanvasRef from "@/state/hooks/useCanvasRef";
import { redrawCanvas } from "@/lib/utils";

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
		shape,
		width,
		height,
		dpi,
		changeMode,
		changeColor,
		createElement,
		getActiveLayer,
		pushHistory,
		getPointerPosition,
		centerCanvas
	} = useStore(
		useShallow((state) => ({
			mode: state.mode,
			shape: state.shape,
			width: state.width,
			height: state.height,
			dpi: state.dpi,
			position: state.position,
			changeMode: state.changeMode,
			changeColor: state.changeColor,
			createElement: state.createElement,
			getActiveLayer: state.getActiveLayer,
			pushHistory: state.pushHistory,
			getPointerPosition: state.getPointerPosition,
			drawCanvas: state.drawCanvas,
			centerCanvas: state.centerCanvas
		}))
	);
	const { setRef } = useCanvasRef();
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

		// Clip the drawing to the bounds of the canvas
		ctx.save();
		ctx.translate(canvas.width / 2 - width / 2, canvas.height / 2 - height / 2);
		ctx.rect(0, 0, width, height);
		ctx.clip();
		ctx.translate(
			-canvas.width / 2 + width / 2,
			-canvas.height / 2 + height / 2
		);

		// Calculate the position of the mouse relative to the canvas.
		const { x, y } = getPointerPosition(canvas, e.clientX, e.clientY);
		const floorX = Math.floor(x);
		const floorY = Math.floor(y);

		if (!isDrawing.current) {
			initialPosition.current = { x: floorX, y: floorY };
		}
		const activeLayer = getActiveLayer();
		isDrawing.current = !activeLayer.hidden;

		if (mode === "brush" || mode === "eraser") {
			currentPath2D.current = new Path2D();
			currentPath2D.current.moveTo(floorX, floorY);
			// Save the current path.
			currentPath.current.push({ x: floorX, y: floorY, startingPoint: true });
		} else if (mode === "eye_drop" && !isGrabbing) {
			// `.getImageData()` retreives the x and y coordinates of the pixel
			// differently if the canvas is scaled. So, we need to multiply the
			// x and y coordinates by the DPI to get the correct pixel.
			const pixel = ctx.getImageData(floorX * dpi, floorY * dpi, 1, 1).data;

			const colorStr = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;

			changeColor(parseColor(colorStr).toString("hex"));
			changeMode("move");
		}
	};

	const onMouseMove = useThrottle((e: MouseEvent) => {
		// If the left mouse button is not pressed, then we should not draw.
		// If the layer is hidden, we should not draw.
		// If the user is grabbing the canvas (for moving), we should not draw.
		const canvas = canvasRef.current;
		if (!canvas) {
			throw new Error("Canvas Ref is not set. This is a bug.");
		}

		const onCanvas = e.target === canvas || canvas.contains(e.target as Node);

		if (e.buttons !== 1 || !isDrawing.current || isGrabbing) {
			return;
		}
		if (mode === "shapes" || !currentPath2D.current) {
			currentPath2D.current = new Path2D();
		}
		const ctx = canvas.getContext("2d");

		if (!ctx) throw new Error("Couldn't get the 2D context of the canvas.");

		// Calculate the position of the mouse relative to the canvas.
		const { x, y } = getPointerPosition(canvas, e.clientX, e.clientY);
		const floorX = Math.floor(x);
		const floorY = Math.floor(y);

		ctx.globalCompositeOperation =
			mode === "eraser" ? "destination-out" : "source-over";
		ctx.fillStyle = color.current;
		ctx.strokeStyle = color.current;
		// ctx.globalAlpha = mode === "eraser" ? 0 : opacity.current;
		ctx.lineWidth = strokeWidth.current * dpi;
		const currentShapeMode = shapeMode.current;

		switch (mode) {
			case "brush":
			case "eraser": {
				if (!onCanvas) return;
				ctx.lineWidth = strokeWidth.current * dpi;
				ctx.lineCap = "round";
				ctx.lineJoin = "round";

				currentPath2D.current.lineTo(floorX, floorY);
				ctx.stroke(currentPath2D.current);

				currentPath.current.push({
					x: floorX,
					y: floorY,
					startingPoint: false
				});
				// drawCanvas(activeLayer);
				break;
			}

			case "shapes": {
				redrawCanvas();
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

		ctx.restore();

		const { x, y } = getPointerPosition(canvas, e.clientX, e.clientY);
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
		redrawCanvas();
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
		setRef(canvasRef.current);
		return () => document.removeEventListener("mousemove", onMouseMove);
	}, [onMouseMove, setRef]);

	// Initially center the canvas.
	useEffect(() => {
		const ref = canvasRef.current;
		if (!ref) return;

		centerCanvas(ref);
	}, [centerCanvas]);

	return (
		<canvas
			data-testid="canvas-layer"
			id="canvas"
			data-mode={mode}
			data-canvas-width={width} // CSS pixels
			data-canvas-height={height} // CSS pixels
			className="absolute w-full h-full cursor-inherit z-0 data-[mode=move]:cursor-grab data-[mode=pan]:cursor-grab data-[mode=selection]:cursor-default data-[mode=draw]:cursor-none data-[mode=erase]:cursor-none data-[mode=zoom_in]:cursor-zoom-in data-[mode=zoom_out]:cursor-zoom-out data-[mode=text]:cursor-text data-[mode=eye_drop]:cursor-crosshair"
			ref={canvasRef}
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			onMouseEnter={onMouseEnter}
		/>
	);
});

export default Canvas;
