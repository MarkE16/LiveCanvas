// Lib
import { useRef, useEffect, useState, memo } from "react";
import useLayerReferences from "../../state/hooks/useLayerReferences";
import useWindowDimensions from "../../state/hooks/useWindowDimesions";
import useStore from "../../state/hooks/useStore";
import { useShallow } from "zustand/react/shallow";

// Redux Actions

// Components
import DrawingToolbar from "../DrawingToolbar/DrawingToolbar";
import Canvas from "../Canvas/Canvas";
import CanvasPointerMarker from "../CanvasPointerMarker/CanvasPointerMarker";
import CanvasPointerSelection from "../CanvasPointerSelection/CanvasPointerSelection";
import ShapeElement from "../ShapeElement/ShapeElement";

// Types
import type { FC } from "react";
import type { Coordinates } from "../../types";

// Styles
import "./CanvasPane.styles.css";

const MemoizedShapeElement = memo(ShapeElement);
const MemoizedCanvas = memo(Canvas);
const MemoizedDrawingToolbar = memo(DrawingToolbar);

const CanvasPane: FC = () => {
	const {
		mode,
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
	const canvasSpaceRef = useRef<HTMLDivElement>(null);
	const clientPosition = useRef<Coordinates>({ x: 0, y: 0 });
	const isSelecting = useRef<boolean>(false);
	const [shiftKey, setShiftKey] = useState<boolean>(false);
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

				const rect = canvasSpace.getBoundingClientRect();
				createElement("text", {
					x: e.clientX - rect.left,
					y: e.clientY - rect.top,
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
			}

			setIsGrabbing(isOnCanvas);
		}

		function handleMouseMove(e: MouseEvent) {
			if (e.buttons !== 1 || !canMove || !isGrabbing || !canvasSpace) return;

			const layer = getActiveLayer();

			const {
				left: lLeft,
				top: lTop,
				width: lWidth,
				height: lHeight
			} = layer.getBoundingClientRect();

			const {
				left: sLeft,
				width: sWidth,
				height: sHeight,
				top: sTop
			} = canvasSpace.getBoundingClientRect();

			let dx = e.clientX - clientPosition.current.x;
			let dy = e.clientY - clientPosition.current.y;

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

			// We grab the elements using the class name "element"
			// rather than the state variable so that this effect
			// doesn't depend on the state variable.
			const elementIds = Array.prototype.map.call(
				document.getElementsByClassName("element"),
				(element: Element) => element.id
			) as string[];

			changeElementProperties(
				(state) => {
					let { x, y } = state;

					if (isNaN(x)) {
						x = sLeft + sWidth / 2 - state.width / 2 - sLeft;
					}

					if (isNaN(y)) {
						y = sTop + sHeight / 2 - state.height / 2 - sTop;
					}

					return {
						...state,
						x: x + dx,
						y: y + dy
					};
				},
				...elementIds
			);

			clientPosition.current = { x: e.clientX, y: e.clientY };
		}

		function handleMouseUp() {
			// clientPosition.current = { x: 0, y: 0 };
			setIsGrabbing(false);
		}

		function handleKeyDown(e: KeyboardEvent) {
			setShiftKey(e.shiftKey);

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

				const focusedElements = Array.prototype.filter.call(
					document.getElementsByClassName("element"),
					(element: HTMLElement) =>
						element.getAttribute("data-focused") === "true"
				) as Element[];

				const focusedIds = focusedElements.map((element) => element.id);

				copyElement(...focusedIds);
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

			const elementIds = Array.prototype.map.call(
				document.getElementsByClassName("element"),
				(element: Element) => element.id
			) as string[];

			changeElementProperties(
				(state) => ({
					...state,
					x: state.x + changeInWidth,
					y: state.y + changeInHeight
				}),
				...elementIds
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
		shiftKey
	]);

	return (
		<div
			id="canvas-pane"
			data-testid="canvas-pane"
		>
			{(mode === "draw" || mode == "erase") && (
				<CanvasPointerMarker
					canvasSpaceReference={canvasSpaceRef}
					shiftKey={shiftKey}
				/>
			)}
			{(mode === "select" || mode === "shapes") && !isMoving && (
				<CanvasPointerSelection
					canvasSpaceReference={canvasSpaceRef}
					isSelecting={isSelecting}
				/>
			)}
			<MemoizedDrawingToolbar />

			{elements.map((element) => (
				<MemoizedShapeElement
					key={element.id}
					canvasSpaceReference={canvasSpaceRef}
					isSelecting={isSelecting}
					clientPosition={clientPosition}
					{...element}
				/>
			))}
			<div
				id="canvas-container"
				data-testid="canvas-container"
				ref={canvasSpaceRef}
				data-moving={canMove}
				data-grabbing={canMove && isGrabbing}
				data-mode={mode}
			>
				<MemoizedCanvas isGrabbing={isMoving} />
			</div>
		</div>
	);
};

export default CanvasPane;
