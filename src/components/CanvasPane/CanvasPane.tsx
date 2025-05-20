// Lib
import { useRef, useEffect, useState, memo } from "react";
import useLayerReferences from "@/state/hooks/useLayerReferences";
import useWindowDimensions from "@/state/hooks/useWindowDimesions";
import useStore from "@/state/hooks/useStore";
import useStoreSubscription from "@/state/hooks/useStoreSubscription";
import { useShallow } from "zustand/react/shallow";

// Components
import DrawingToolbar from "@/components/DrawingToolbar/DrawingToolbar";
import Canvas from "@/components/Canvas/Canvas";
import CanvasPointerMarker from "@/components/CanvasPointerMarker/CanvasPointerMarker";
import CanvasPointerSelection from "@/components/CanvasPointerSelection/CanvasPointerSelection";
import CanvasInteractiveElement from "@/components/CanvasInteractiveElement/CanvasInteractiveElement";
import ScaleIndicator from "@/components/ScaleIndicator/ScaleIndicator";

// Types
import type { ReactNode } from "react";
import type { Coordinates } from "@/types";

// Using Tailwind for styles

const MemoizedCanvasInteractiveElement = memo(CanvasInteractiveElement);
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
		elements,
		changeElementProperties,
		copyElement,
		pasteElement,
		createElement
	} = useStore(
		useShallow((state) => ({
			mode: state.mode,
			scale: state.scale,
			changeX: state.changeX,
			changeY: state.changeY,
			increaseScale: state.increaseScale,
			decreaseScale: state.decreaseScale,
			elements: state.elements,
			changeElementProperties: state.changeElementProperties,
			copyElement: state.copyElement,
			pasteElement: state.pasteElement,
			createElement: state.createElement
		}))
	);
	const currentShape = useStoreSubscription((state) => state.shape);
	const currentColor = useStoreSubscription((state) => state.color);
	const canvasSpaceRef = useRef<HTMLDivElement>(null);
	const clientPosition = useRef<Coordinates>({ x: 0, y: 0 });
	const isSelecting = useRef<boolean>(false);
	const createdShapeId = useRef<string | null>(null);
	const [shiftKey, setShiftKey] = useState<boolean>(false);
	const [ctrlKey, setCtrlKey] = useState<boolean>(false);
	const [isGrabbing, setIsGrabbing] = useState<boolean>(false);
	const { getActiveLayer } = useLayerReferences();
	const dimensions = useWindowDimensions();

	const canMove = mode === "move" || shiftKey;
	const isMoving = canMove && isGrabbing;

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
			const isOnCanvas = isClickingOnSpace(e);

			if (!isOnCanvas) return;

			if (
				mode === "text" &&
				!shiftKey &&
				!document.activeElement?.classList.contains("element") &&
				!document.activeElement?.classList.contains("grid") &&
				!document.activeElement?.classList.contains("handle")
			) {
				const activeLayer = getActiveLayer();

				if (!activeLayer) throw new Error("No active layer found");

				createElement("text", {
					x: e.clientX,
					y: e.clientY,
					width: 100,
					height: 30,
					focused: true,
					text: {
						size: 25,
						family: "Times New Roman",
						content: "Text"
					},
					layerId: activeLayer.id
				});
				return;
			}

			if (mode === "shapes" && ctrlKey) {
				const activeLayer = getActiveLayer();

				const id = createElement(currentShape.current, {
					x: e.clientX,
					y: e.clientY,
					width: 18,
					height: 18,
					focused: false,
					layerId: activeLayer.id,
					fill: currentColor.current
				});
				createdShapeId.current = id;
			}

			setIsGrabbing(isOnCanvas);
		}

		function handleMouseMove(e: MouseEvent) {
			if (e.buttons !== 1 || !isGrabbing || !canvasSpace) return;

			const layer = getActiveLayer();

			let dx = e.clientX - clientPosition.current.x;
			let dy = e.clientY - clientPosition.current.y;

			const {
				left: sLeft,
				width: sWidth,
				height: sHeight,
				top: sTop
			} = canvasSpace.getBoundingClientRect();

			if (canMove && isGrabbing) {
				const {
					left: lLeft,
					top: lTop,
					width: lWidth,
					height: lHeight
				} = layer.getBoundingClientRect();

				// Check if the layer is outside the canvas space.
				// If it is, we don't want to move it.
				// Note: We add 20 so that we can still see the layer when it's almost outside the canvas space.
				if (lLeft + dx <= -lWidth + sLeft + 20 || lLeft + dx >= sWidth + 20) {
					dx = 0; // Set to 0 so that the layer doesn't move.
				}

				if (lTop + dy <= -lHeight + sTop + 20 || lTop + dy >= sHeight + 20) {
					dy = 0; // Set to 0 so that the layer doesn't move.
				}

				// Apply the changes.
				changeX(dx);
				changeY(dy);

				changeElementProperties(
					(state) => ({
						...state,
						x: state.x + dx,
						y: state.y + dy
					}),
					() => true // Update on each element
				);
			} else if (mode === "shapes") {
				// Required for shapes to have a minimum size.
				// It is also set in `ShapeElement` in the resizing
				// logic. If you change it here, make sure to change
				// it there as well.
				const MIN_SIZE = 18;
				const pointerX = e.clientX;
				const pointerY = e.clientY;

				changeElementProperties(
					(state) => {
						let newWidth = Math.max(MIN_SIZE, state.width + dx);
						let newHeight = Math.max(MIN_SIZE, state.height + dy);

						if (pointerX - MIN_SIZE < state.x) {
							newWidth = MIN_SIZE;
						}

						if (pointerY - MIN_SIZE < state.y) {
							newHeight = MIN_SIZE;
						}

						return {
							...state,
							width: newWidth,
							height: newHeight
						};
					},
					(element) => element.id === createdShapeId.current!
				);
			}
			clientPosition.current = { x: e.clientX, y: e.clientY };
		}

		function handleMouseUp() {
			// clientPosition.current = { x: 0, y: 0 };
			setIsGrabbing(false);

			if (mode === "shapes") {
				createdShapeId.current = null;

				const ev = new CustomEvent("imageupdate", {
					detail: {
						layer: getActiveLayer()
					}
				});

				document.dispatchEvent(ev);
			}
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

			if (e.key === "c" && e.ctrlKey && !e.repeat) {
				// We're copying elements here
				copyElement((element) => element.focused);
			} else if (e.key === "v" && e.ctrlKey && !e.repeat) {
				// We're pasting elements here
				pasteElement();
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

		function onWindowResize() {
			const { changeInWidth, changeInHeight } = dimensions.current;

			changeElementProperties(
				(state) => ({
					...state,
					x: state.x + changeInWidth,
					y: state.y + changeInHeight
				}),
				() => true // Update on all elements
			);
		}

		document.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
		document.addEventListener("wheel", handleZoom);
		document.addEventListener("click", handleZoom);

		// Handle shift key press
		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("keyup", handleKeyDown);

		window.addEventListener("resize", onWindowResize);
		return () => {
			document.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.removeEventListener("wheel", handleZoom);
			document.removeEventListener("click", handleZoom);

			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("keyup", handleKeyDown);
			window.removeEventListener("resize", onWindowResize);
		};
	}, [
		mode,
		isGrabbing,
		canMove,
		changeElementProperties,
		dimensions,
		copyElement,
		pasteElement,
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
			{(mode === "draw" || mode == "erase") && (
				<CanvasPointerMarker
					canvasSpaceReference={canvasSpaceRef}
					shiftKey={shiftKey}
				/>
			)}
			{(mode === "select" || (mode === "shapes" && !ctrlKey)) && !isMoving && (
				<CanvasPointerSelection
					canvasSpaceReference={canvasSpaceRef}
					isSelecting={isSelecting}
				/>
			)}
			<MemoizedDrawingToolbar />

			{elements.map((element) => (
				<MemoizedCanvasInteractiveElement
					key={element.id}
					canvasSpaceReference={canvasSpaceRef}
					isSelecting={isSelecting}
					isCreatingElement={createdShapeId.current !== null}
					clientPosition={clientPosition}
					{...element}
				/>
			))}
			<div
				className="flex justify-center relative items-center h-full w-full overflow-hidden data-[moving=true]:cursor-grab data-[grabbing=true]:cursor-grabbing data-[mode=selection]:cursor-default data-[mode=draw]:cursor-none data-[mode=erase]:cursor-none data-[mode=zoom_in]:cursor-zoom-in data-[mode=zoom_out]:cursor-zoom-out data-[mode=text]:cursor-text data-[mode=eye_drop]:cursor-crosshair"
				data-testid="canvas-container"
				ref={canvasSpaceRef}
				data-moving={canMove}
				data-grabbing={canMove && isGrabbing}
				data-mode={mode}
			>
				<MemoizedCanvas isGrabbing={isMoving} />
			</div>

			<MemoizedScaleIndicator scale={scale} />
		</div>
	);
}

export default CanvasPane;
