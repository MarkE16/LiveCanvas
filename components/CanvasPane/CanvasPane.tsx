// Lib
import { useAppDispatch, useAppSelector } from "../../state/hooks/reduxHooks";
import { useRef, useEffect, useState, memo } from "react";
import useLayerReferences from "../../state/hooks/useLayerReferences";
import useCanvasElements from "../../state/hooks/useCanvasElements";

// Redux Actions
import {
	changeX,
	changeY,
	increaseScale,
	decreaseScale
} from "../../state/slices/canvasSlice";

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
import useWindowDimensions from "../../state/hooks/useWindowDimesions";

const MemoizedShapeElement = memo(ShapeElement);

const CanvasPane: FC = () => {
	const mode = useAppSelector(
		(state) => state.canvas.mode,
		(prev, next) => prev === next
	);
	const dispatch = useAppDispatch();
	const canvasSpaceRef = useRef<HTMLDivElement>(null);
	const clientPosition = useRef<Coordinates>({ x: 0, y: 0 });
	const isSelecting = useRef<boolean>(false);
	const [shiftKey, setShiftKey] = useState<boolean>(false);
	const [isGrabbing, setIsGrabbing] = useState<boolean>(false);
	const { references } = useLayerReferences();
	const dimensions = useWindowDimensions();
	const {
		elements,
		changeElementProperties,
		copyElement,
		pasteElement,
		createElement
	} = useCanvasElements();
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
			if (e.buttons !== 1) return;

			clientPosition.current = { x: e.clientX, y: e.clientY };
			const isOnCanvas = isClickingOnSpace(e);
			setIsGrabbing(isOnCanvas);

			if (
				mode === "text" &&
				canvasSpace?.contains(e.target as Node) &&
				e.target !== canvasSpace
			) {
				const rect = canvasSpace.getBoundingClientRect();
				createElement("text", {
					x: e.clientX - rect.left,
					y: e.clientY - rect.top,
					width: 100,
					height: 30,
					focused: true,
					fontSize: 26,
					fontFamily: "Arial",
					fontContent: "Text"
				});
			}
		}

		function handleMouseMove(e: MouseEvent) {
			if (e.buttons !== 1 || !canMove || !isGrabbing || !canvasSpace) return;

			const layer = references.current[0];

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
			if (lLeft + dx <= -lWidth + sLeft + 20 || lLeft + dx >= sWidth) {
				dx = 0; // Set to 0 so that the layer doesn't move.
			}

			if (lTop + dy <= -lHeight + sTop + 20 || lTop + dx >= sHeight) {
				dy = 0; // Set to 0 so that the layer doesn't move.
			}

			// Apply the changes.
			dispatch(changeX(dx));
			dispatch(changeY(dy));

			// We grab the elements using the class name "element"
			// rather than the state variable so that this effect
			// doesn't depend on the state variable.
			const elementIds = Array.from(
				document.getElementsByClassName("element")
			).map((element) => element.id);

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
			clientPosition.current = { x: 0, y: 0 };
			setIsGrabbing(false);
		}

		function handleKeyDown(e: KeyboardEvent) {
			setShiftKey(e.shiftKey);

			if (e.key === "+") {
				e.preventDefault();
				dispatch(increaseScale());
			} else if (e.key === "_") {
				e.preventDefault();
				dispatch(decreaseScale());
			}

			if (e.type === "keyup") {
				return;
			}

			if (e.key === "c" && e.ctrlKey && !e.repeat) {
				// We're copying elements here

				const focusedIds = Array.from(
					document.getElementsByClassName("element")
				)
					.filter((element) => element.getAttribute("data-focused") === "true")
					.map((element) => element.id);

				copyElement(...focusedIds);
			} else if (e.key === "v" && e.ctrlKey && !e.repeat) {
				// We're pasting elements here
				pasteElement();
			}
		}

		function handleZoom(e: Event) {
			if (e instanceof WheelEvent) {
				if (!e.shiftKey) return;

				if (e.deltaY > 0) {
					dispatch(decreaseScale());
				} else {
					dispatch(increaseScale());
				}
				// Handle the click event
			} else if (e instanceof MouseEvent) {
				if (!isClickingOnSpace(e)) return;

				// Shift key means we are moving. We don't want to zoom in this case.
				if (e.buttons === 0 && !e.shiftKey) {
					// Left click
					if (mode === "zoom_in") {
						dispatch(increaseScale());
					} else if (mode === "zoom_out") {
						dispatch(decreaseScale());
					} else {
						return; // We don't want to zoom if the mode is not zoom
					}
				}
			}
		}

		function onWindowResize() {
			const { changeInWidth, changeInHeight } = dimensions.current;

			const elementIds = Array.from(
				document.getElementsByClassName("element")
			).map((element) => element.id);

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
		dispatch,
		mode,
		isGrabbing,
		canMove,
		references,
		changeElementProperties,
		dimensions,
		copyElement,
		pasteElement,
		createElement
	]);

	console.log(elements);

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
			<DrawingToolbar />

			{elements.map((element) => (
				<MemoizedShapeElement
					key={element.id}
					canvasSpaceReference={canvasSpaceRef}
					isSelecting={isSelecting}
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
				<Canvas isGrabbing={isMoving} />
			</div>
		</div>
	);
};

export default CanvasPane;
