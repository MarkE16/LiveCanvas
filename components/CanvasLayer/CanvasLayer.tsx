// Lib
import { useAppSelector, useAppDispatch } from "../../state/hooks/reduxHooks";
// import useHistory from "../../state/hooks/useHistory";
import { useRef, forwardRef } from "react";
import * as UTILS from "../../utils";
import { parseColor } from "react-aria-components";

// Types
import type {
	HTMLAttributes,
	MouseEventHandler,
	Ref,
	RefAttributes,
	MouseEvent
} from "react";
import type { Coordinates } from "../../types";
import { changeColor, changeMode } from "../../state/slices/canvasSlice";

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
		const dispatch = useAppDispatch();
		// const history = useHistory();

		const drawStartingPoint = useRef<Coordinates>({ x: 0, y: 0 });
		const isDrawing = useRef<boolean>(false);
		const currentPath = useRef<Coordinates[]>([]);

		const ERASER_RADIUS = 7;

		// Handler for when the mouse is pressed down on the canvas.
		// This should initiate the drawing process.
		const onMouseDown: MouseEventHandler<HTMLCanvasElement> = (
			e: MouseEvent<HTMLCanvasElement>
		) => {
			e.preventDefault();
			isDrawing.current = !isGrabbing && mode !== "select" && mode !== "move";

			const ctx = layerRef!.getContext("2d");

			// Calculate the position of the mouse relative to the canvas.
			const { x, y } = UTILS.getCanvasPointerPosition(
				e.clientX,
				e.clientY,
				layerRef!,
				dpi
			);

			if (mode === "draw") {
				ctx!.beginPath();
				ctx!.moveTo(x, y);
			} else if (mode === "eye_drop" && !isGrabbing) {
				// How do I get the pixel accurately while accounting for the dpi scale?
				const pixel = ctx!.getImageData(x, y, 1, 1).data;

				const colorStr = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3]})`;
				let color;

				console.log(x, y);

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
				dispatch(changeColor(color.toFormat("hsla").toString()));
				dispatch(changeMode("select")); // Change the mode to select after the color is picked.
			}

			// Save the starting point of the drawing.
			drawStartingPoint.current = { x, y };

			if (mode === "draw" || mode === "erase") {
				// Save the current path.
				currentPath.current.push({ x, y });
			}

			console.log(currentPath.current);
		};

		// Handler for when the mouse is moved on the canvas.
		// This should handle a majority of the drawing process.
		const onMouseMove: MouseEventHandler<HTMLCanvasElement> = (
			e: MouseEvent<HTMLCanvasElement>
		) => {
			// If the left mouse button is not pressed, then we should not draw.
			// If the layer is hidden, we should not draw.
			// If the user is grabbing the canvas (for moving), we should not draw.
			if (e.buttons !== 1 || layerHidden || !isDrawing.current) {
				return;
			}

			const ctx = layerRef!.getContext("2d");

			// Calculate the position of the mouse relative to the canvas.
			const { x, y } = UTILS.getCanvasPointerPosition(
				e.clientX,
				e.clientY,
				layerRef!,
				dpi
			);

			switch (mode) {
				case "draw": {
					ctx!.strokeStyle = color;
					ctx!.lineWidth = drawStrength;
					ctx!.lineCap = "round";
					ctx!.lineJoin = "round";

					ctx!.lineTo(x, y);
					ctx!.stroke();

					currentPath.current.push({ x, y });

					// emitLayerState(); // Not necessary to emit every time the mouse moves (at the moment)
					break;
				}

				case "erase": {
					ctx!.clearRect(
						x - (ERASER_RADIUS * eraserStrength) / 2,
						y - (ERASER_RADIUS * eraserStrength) / 2,
						ERASER_RADIUS * eraserStrength,
						ERASER_RADIUS * eraserStrength
					);
					// emitLayerState(); // Not necessary to emit every time the mouse moves (at the moment)
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

			const ctx = layerRef!.getContext("2d");

			if (mode === "draw" || mode === "erase") {
				ctx!.closePath();

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

		//   useEffect(() => {
		//     if (!layerRef) return;

		//     const layerCtx = layerRef.getContext('2d');
		//     if (!layerCtx) return;

		//     const subCanvas = document.createElement('canvas');
		//     subCanvas.width = layerRef.width;
		//     subCanvas.height = layerRef.height;

		//     const subCtx = subCanvas.getContext('2d');
		//     if (!subCtx) return;

		//     // Copy the existing content from the main canvas to the temporary canvas
		//     subCtx.drawImage(layerRef, 0, 0);

		//     // Draw the history of the layer on the temporary canvas
		//     history.undo.forEach(action => {
		//       const { mode, path, layerId, color, drawStrength } = action;
		//       if (layerId !== layerRef.id) return;

		//       // Draw the path
		//       subCtx.beginPath();
		//       subCtx.strokeStyle = color;
		//       subCtx.lineWidth = drawStrength;
		//       subCtx.lineCap = 'round';
		//       subCtx.lineJoin = 'round';

		//       path.forEach(({ x, y }, index) => {
		//         if (index === 0) {
		//           subCtx.moveTo(x, y);
		//         } else {
		//           subCtx.lineTo(x, y);
		//         }
		//       });
		//       subCtx.stroke();
		//     });

		//     subCtx.closePath();
		//     // Draw the temporary canvas back onto the main canvas

		//     layerCtx.clearRect(0, 0, layerRef.width, layerRef.height);
		//     layerCtx.drawImage(subCanvas, 0, 0);
		// }, [history.undo, history.redo, layerRef]);

		return (
			<canvas
				ref={ref}
				// These are the width and height via how many pixels the canvas has available to draw on.
				width={width}
				height={height}
				className={`canvas ${active ? "active" : ""} ${layerHidden ? "hidden" : ""}`}
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
				onMouseMove={onMouseMove}
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
