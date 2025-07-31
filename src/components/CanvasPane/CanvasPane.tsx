// Lib
import { useRef, useEffect, useState, memo } from "react";
import useStore from "@/state/hooks/useStore";
import useStoreSubscription from "@/state/hooks/useStoreSubscription";
import { useShallow } from "zustand/react/shallow";

// Components
import DrawingToolbar from "@/components/DrawingToolbar/DrawingToolbar";
import Canvas from "@/components/Canvas/Canvas";
import CanvasPointerMarker from "@/components/CanvasPointerMarker/CanvasPointerMarker";
import ScaleIndicator from "@/components/ScaleIndicator/ScaleIndicator";

// Types
import type { ReactNode } from "react";
import type { Coordinates } from "@/types";

const MemoizedCanvas = memo(Canvas);
const MemoizedDrawingToolbar = memo(DrawingToolbar);
const MemoizedScaleIndicator = memo(ScaleIndicator);

function CanvasPane(): ReactNode {
	const {
		mode,
		scale,
		changeX,
		changeY,
		increaseScale,
		decreaseScale,
		changeElementProperties,
		createElement,
		getActiveLayer,
		pushHistory
	} = useStore(
		useShallow((state) => ({
			mode: state.mode,
			scale: state.scale,
			changeX: state.changeX,
			changeY: state.changeY,
			increaseScale: state.increaseScale,
			decreaseScale: state.decreaseScale,
			changeElementProperties: state.changeElementProperties,
			createElement: state.createElement,
			getActiveLayer: state.getActiveLayer,
			pushHistory: state.pushHistory
		}))
	);
	const currentShape = useStoreSubscription((state) => state.shape);
	const currentColor = useStoreSubscription((state) => state.color);
	const canvasSpaceRef = useRef<HTMLDivElement>(null);
	const clientPosition = useRef<Coordinates>({ x: 0, y: 0 });
	const startMovePosition = useRef<Coordinates>({ x: 0, y: 0 });
	const [shiftKey, setShiftKey] = useState<boolean>(false);
	const [ctrlKey, setCtrlKey] = useState<boolean>(false);
	const [isGrabbing, setIsGrabbing] = useState<boolean>(false);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const isPanning = mode === "pan";
	const isMoving = mode === "move";

	// Effect is getting ugly... Might be a good idea to split
	// this into multiple effects.
	useEffect(() => {
		const canvasSpace = canvasSpaceRef.current;
		if (!canvasSpace) return;

		const isClickingOnSpace = (e: MouseEvent) =>
			e.target === canvasSpace || canvasSpace.contains(e.target as Node);

		function handleMouseDown(e: MouseEvent) {
			if (e.buttons !== 1 || !canvasSpace) return;

			clientPosition.current = { x: e.clientX, y: e.clientY };
			startMovePosition.current = { x: e.clientX, y: e.clientY };
			const isOnCanvas = isClickingOnSpace(e);

			if (!isOnCanvas) return;

			if (
				mode === "text" &&
				!shiftKey &&
				!document.activeElement?.classList.contains("element") &&
				!document.activeElement?.classList.contains("grid") &&
				!document.activeElement?.classList.contains("handle")
			) {
				const layer = getActiveLayer();

				if (!layer) throw new Error("No active layer found");

				createElement("text", {
					x: e.clientX,
					y: e.clientY,
					width: 100,
					height: 30,
					text: {
						size: 25,
						family: "Times New Roman",
						content: "Text"
					},
					layerId: layer.id
				});
				return;
			}
			setIsGrabbing(isOnCanvas);
		}

		function handleMouseMove(e: MouseEvent) {
			if (e.buttons !== 1 || !isGrabbing || !canvasSpace) return;

			const canvas = canvasRef.current;
			const layer = getActiveLayer();
			if (!canvas || layer.hidden) return;

			let dx = e.clientX - clientPosition.current.x;
			let dy = e.clientY - clientPosition.current.y;

			const {
				left: sLeft,
				width: sWidth,
				height: sHeight,
				top: sTop
			} = canvasSpace.getBoundingClientRect();

			if (isPanning && isGrabbing) {
				const {
					left: cLeft,
					top: cTop,
					width: cWidth,
					height: cHeight
				} = canvas.getBoundingClientRect();

				// Check if the layer is outside the canvas space.
				// If it is, we don't want to move it.
				// Note: We add 20 so that we can still see the layer when it's almost outside the canvas space.
				if (cLeft + dx <= -cWidth + sLeft + 20 || cLeft + dx >= sWidth + 20) {
					dx = 0; // Set to 0 so that the layer doesn't move.
				}

				if (cTop + dy <= -cHeight + sTop + 20 || cTop + dy >= sHeight + 20) {
					dy = 0; // Set to 0 so that the layer doesn't move.
				}

				// Apply the changes.
				changeX(dx);
				changeY(dy);
			} else if (isMoving) {
				// Move the shapes for the current layer.

				changeElementProperties(
					(state) => {
						if (state.type === "brush" || state.type === "eraser") {
							return {
								...state,
								path: state.path.map((point) => ({
									...point,
									x: point.x + dx,
									y: point.y + dy
								}))
							};
						} else {
							return {
								...state,
								x: state.x + dx,
								y: state.y + dy
							};
						}
					},
					(element) => element.layerId === layer.id
				);
			}
			clientPosition.current = { x: e.clientX, y: e.clientY };
		}

		function handleMouseUp(e: MouseEvent) {
			if (isMoving && isClickingOnSpace(e)) {
				const dx = e.clientX - startMovePosition.current.x; // total change in x
				const dy = e.clientY - startMovePosition.current.y; // total change in y

				const layer = getActiveLayer();

				pushHistory({
					type: "move_element",
					properties: {
						layerId: layer.id,
						dx,
						dy
					}
				});
			}
			setIsGrabbing(false);
		}

		function handleKeyDown(e: KeyboardEvent) {
			setShiftKey(e.shiftKey);
			setCtrlKey(e.ctrlKey);

			if (e.key === "+") {
				e.preventDefault();
				increaseScale();
			} else if (e.key === "_") {
				e.preventDefault();
				decreaseScale();
			}

			if (e.type === "keyup") {
				return;
			}
		}

		function handleZoom(e: Event) {
			if (!canvasSpace) return;

			if (e instanceof WheelEvent) {
				if (!e.shiftKey) return;

				if (e.deltaY > 0) {
					decreaseScale();
				} else {
					increaseScale();
				}
				// Handle the click event
			} else if (e instanceof MouseEvent) {
				if (!isClickingOnSpace(e)) return;

				// Shift key means we are moving. We don't want to zoom in this case.
				if (e.buttons === 0 && !e.shiftKey) {
					// Left click
					if (mode === "zoom_in") {
						increaseScale();
					} else if (mode === "zoom_out") {
						decreaseScale();
					} else {
						return; // We don't want to zoom if the mode is not zoom
					}
				}
			}
		}

		document.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
		document.addEventListener("wheel", handleZoom);
		document.addEventListener("click", handleZoom);

		// Handle shift key press
		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("keyup", handleKeyDown);

		return () => {
			document.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.removeEventListener("wheel", handleZoom);
			document.removeEventListener("click", handleZoom);

			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("keyup", handleKeyDown);
		};
	}, [
		mode,
		isMoving,
		isPanning,
		isGrabbing,
		changeElementProperties,
		createElement,
		increaseScale,
		decreaseScale,
		changeX,
		changeY,
		getActiveLayer,
		shiftKey,
		ctrlKey,
		currentShape,
		currentColor
	]);

	return (
		<div
			className="flex relative justify-center items-center flex-[3] w-full overflow-hidden [&:not(:hover)>#canvas-pointer-marker]:opacity-0 [&:not(:hover)>#canvas-pointer-marker]:transition-opacity [&:not(:hover)>#canvas-pointer-marker]:duration-200 [&:hover>#canvas-pointer-marker]:absolute [&:hover>#canvas-pointer-marker]:border-[3px] [&:hover>#canvas-pointer-marker]:border-black [&:hover>#canvas-pointer-marker]:outline [&:hover>#canvas-pointer-marker]:outline-[1px] [&:hover>#canvas-pointer-marker]:outline-white [&:hover>#canvas-pointer-marker]:outline-offset-[-3px] [&:hover>#canvas-pointer-marker]:pointer-events-none"
			data-testid="canvas-pane"
		>
			{(mode === "brush" || mode == "eraser") && (
				<CanvasPointerMarker
					canvasSpaceReference={canvasSpaceRef}
					shiftKey={shiftKey}
				/>
			)}
			{/* <CanvasPointerSelection
				canvasSpaceReference={canvasSpaceRef}
			/> */}
			<MemoizedDrawingToolbar />

			<div
				className="flex justify-center relative items-center h-full w-full overflow-hidden data-[mode=move]:cursor-grab data-[mode=pan]:cursor-grab data-[mode=selection]:cursor-default data-[mode=draw]:cursor-none data-[mode=erase]:cursor-none data-[mode=zoom_in]:cursor-zoom-in data-[mode=zoom_out]:cursor-zoom-out data-[mode=text]:cursor-text data-[mode=eye_drop]:cursor-crosshair"
				data-testid="canvas-container"
				ref={canvasSpaceRef}
				data-moving={isPanning || isMoving}
				data-mode={mode}
			>
				<MemoizedCanvas
					isGrabbing={isMoving || isPanning}
					ref={canvasRef}
				/>
			</div>

			<MemoizedScaleIndicator scale={scale} />
		</div>
	);
}

export default CanvasPane;
