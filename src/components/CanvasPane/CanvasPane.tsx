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
import { redrawCanvas } from "@/lib/utils";

const MemoizedCanvas = memo(Canvas);
const MemoizedDrawingToolbar = memo(DrawingToolbar);
const MemoizedScaleIndicator = memo(ScaleIndicator);

type CanvasPaneProps = Readonly<{
	loading?: boolean;
}>;

function CanvasPane({ loading }: CanvasPaneProps): ReactNode {
	const {
		mode,
		scale,
		changeX,
		changeY,
		changeElementProperties,
		createElement,
		getActiveLayer,
		performZoom,
		pushHistory
	} = useStore(
		useShallow((state) => ({
			mode: state.mode,
			scale: state.scale,
			changeX: state.changeX,
			changeY: state.changeY,
			changeElementProperties: state.changeElementProperties,
			createElement: state.createElement,
			getActiveLayer: state.getActiveLayer,
			performZoom: state.performZoom,
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
		const canvasSpace = canvasRef.current;
		if (!canvasSpace) return;

		const isClickingOnSpace = (e: MouseEvent) =>
			e.target === canvasSpace || canvasSpace.contains(e.target as Node);

		function handleMouseDown(e: MouseEvent) {
			if (e.buttons !== 1) return;

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
			if (e.buttons !== 1 || !isGrabbing) return;

			const canvas = canvasRef.current;
			const layer = getActiveLayer();
			if (!canvas || layer.hidden) return;

			let dx = e.clientX - clientPosition.current.x;
			let dy = e.clientY - clientPosition.current.y;

			if (isPanning && isGrabbing) {
				// TODO: Have to revisit the calculation to know how the canvas is considered off screen.
				// As a temporary solution, a button in the left toolbar pane is added to reset the canvas view.
				// const { left, top } = isCanvasOffscreen(canvas, dx, dy);

				// if (left) dx = 0;
				// if (top) dy = 0;

				// Apply the changes.
				changeX(dx);
				changeY(dy);
				redrawCanvas();
			} else if (isMoving) {
				// Move the shapes for the current layer.

				// divide the dx and dy by the scale to get the correct
				// 'mouse feel' like movement.
				dx /= scale;
				dy /= scale;

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
				redrawCanvas();
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
		}

		function handleZoom(e: Event) {
			if (!canvasSpace) return;

			if (e instanceof WheelEvent) {
				console.log(e.deltaY);
				performZoom(e.clientX, e.clientY, e.deltaY / 10);
				// Handle the click event
			} else if (e instanceof MouseEvent) {
				if (!isClickingOnSpace(e)) return;

				// Shift key means we are moving. We don't want to zoom in this case.
				if (
					e.buttons === 0 &&
					!e.shiftKey &&
					(mode === "zoom_in" || mode === "zoom_out")
				) {
					// Left click
					let factor = 25;
					if (mode === "zoom_in") factor *= -1;
					performZoom(e.clientX, e.clientY, factor);
				}
			}

			redrawCanvas();
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
		changeX,
		changeY,
		getActiveLayer,
		shiftKey,
		ctrlKey,
		currentShape,
		currentColor,
		pushHistory,
		performZoom,
		scale
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
			<MemoizedDrawingToolbar />

			<MemoizedCanvas
				isGrabbing={isMoving || isPanning}
				ref={canvasRef}
			/>

			{!loading ? (
				<MemoizedScaleIndicator scale={scale} />
			) : (
				<div className="absolute bottom-2 left-2 p-1.5 bg-slate-600 rounded">
					Loading...
				</div>
			)}
		</div>
	);
}

export default CanvasPane;
