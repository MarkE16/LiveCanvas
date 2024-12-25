// Lib
import { useAppSelector, useAppDispatch } from "../../state/hooks/reduxHooks";
// import useHistory from "../../state/hooks/useHistory";
import { useRef, forwardRef } from "react";
import * as UTILS from "../../utils";
import { parseColor } from "react-aria-components";
import useCanvasElements from "../../state/hooks/useCanvasElements";

import { changeColor, changeMode } from "../../state/slices/canvasSlice";
// Types
import type {
	HTMLAttributes,
	MouseEventHandler,
	Ref,
	RefAttributes,
	MouseEvent
} from "react";
import type { Coordinates } from "../../types";

type CanvasLayerProps = HTMLAttributes<HTMLCanvasElement> &
	RefAttributes<HTMLCanvasElement> & {
		name: string;
		width: number;
		height: number;
		active?: boolean;
		layerHidden?: boolean;
		layerRef: HTMLCanvasElement | undefined;
		layerIndex?: number; // z-index essentially.
		isGrabbing: boolean;
	};

const CanvasLayer = forwardRef<HTMLCanvasElement, CanvasLayerProps>(
	function CanvasLayer(
		{
			name,
			width,
			height,
			active = false,
			layerHidden = false,
			layerRef,
			layerIndex,
			isGrabbing,
			...rest
		},
		ref: Ref<HTMLCanvasElement>
	) {
		const {
			mode,
			scale,
			color,
			drawStrength,
			eraserStrength,
			dpi,
			position: { x: xPosition, y: yPosition }
		} = useAppSelector((state) => state.canvas);
		const { movingElement } = useCanvasElements();
		const dispatch = useAppDispatch();
		// const history = useHistory();

		const drawStartingPoint = useRef<Coordinates>({ x: 0, y: 0 });
		const isDrawing = useRef<boolean>(false);
		const currentPath2D = useRef<Path2D | null>(null);
		const currentPath = useRef<Coordinates[]>([]);

		const ERASER_RADIUS = 7;

		// Handler for when the mouse is pressed down on the canvas.
		// This should initiate the drawing process.
		const onMouseDown: MouseEventHandler<HTMLCanvasElement> = (
			e: MouseEvent<HTMLCanvasElement>
		) => {
			e.preventDefault();
			isDrawing.current = mode !== "select" && !movingElement.current;

			const ctx = layerRef!.getContext("2d");

			// Calculate the position of the mouse relative to the canvas.
			const { x, y } = UTILS.getCanvasPosition(
				e.clientX,
				e.clientY,
				layerRef!,
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

			// Save the starting point of the drawing.
			drawStartingPoint.current = { x, y };

			if (mode === "draw" || mode === "erase") {
				// Save the current path.
				currentPath.current.push({ x, y });
			}
		};

		// Handler for when the mouse is moved on the canvas.
		// This should handle a majority of the drawing process.
		const onMouseMove: MouseEventHandler<HTMLCanvasElement> = (
			e: MouseEvent<HTMLCanvasElement>
		) => {
			// If the left mouse button is not pressed, then we should not draw.
			// If the layer is hidden, we should not draw.
			// If the user is grabbing the canvas (for moving), we should not draw.
			if (e.buttons !== 1 || layerHidden || !isDrawing.current || isGrabbing) {
				return;
			}

			const ctx = layerRef!.getContext("2d");

			// Calculate the position of the mouse relative to the canvas.
			const { x, y } = UTILS.getCanvasPosition(
				e.clientX,
				e.clientY,
				layerRef!,
				dpi
			);

			switch (mode) {
				case "draw": {
					if (!currentPath2D.current) {
						console.error("Couldn't create a Path2D object.");
						return;
					}
					ctx!.strokeStyle = color;
					ctx!.lineWidth = drawStrength;
					ctx!.lineCap = "round";
					ctx!.lineJoin = "round";

					currentPath2D.current.lineTo(x, y);
					ctx!.stroke(currentPath2D.current);

					currentPath.current.push({ x, y });

					break;
				}

				case "erase": {
					ctx!.clearRect(
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
			const imageUpdate = new CustomEvent("imageupdate", {
				detail: {
					layer: layerRef
				}
			});

			document.dispatchEvent(imageUpdate);
		};

		const onMouseEnter: MouseEventHandler<HTMLCanvasElement> = (
			e: MouseEvent<HTMLCanvasElement>
		) => {
			if (e.buttons === 1) {
				onMouseDown(e);
			}
		};

		const onMouseLeave = () => {
			isDrawing.current = false;
		};

		// Update the resolution of the canvas when the DPI changes.
		// Note: This will need to be refactored later when we allow for
		// the changing of the DPI.
		// useEffect(() => {
		// 	if (!layerRef) return;
		// 	const layerCtx = layerRef.getContext("2d");

		// 	if (!layerCtx) return;

		// 	const { width, height } = layerRef.getBoundingClientRect();
		// 	layerRef.width = width * dpi;
		// 	layerRef.height = height * dpi;

		// 	layerCtx.scale(dpi, dpi);

		// 	return () => {
		// 		layerCtx.scale(1 / dpi, 1 / dpi);
		// 	};
		// }, [dpi, layerRef]);

		const deboundedMouseMove = UTILS.debounce(onMouseMove, 5);

		return (
			<canvas
				ref={ref}
				// Temporary
				width={width * dpi}
				height={height * dpi}
				className={`canvas${active ? " active" : ""}${layerHidden ? " hidden" : ""}`}
				style={{
					// These are the width and height of the canvas element visually.
					width: `${width}px`,
					height: `${height}px`,
					transform: `translate(
        ${xPosition}px,
        ${yPosition}px
        ) scale(${scale})`,
					zIndex: !layerHidden ? layerIndex : -2 // Layers from the top of the list are drawn first.
				}}
				onMouseDown={onMouseDown}
				onMouseMove={deboundedMouseMove}
				onMouseUp={onMouseUp}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
				data-name={name}
				data-layer-index={layerIndex}
				data-scale={scale}
				data-dpi={dpi}
				{...rest}
			/>
		);
	}
);

export default CanvasLayer;
