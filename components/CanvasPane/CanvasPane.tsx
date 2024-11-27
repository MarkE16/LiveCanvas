// Lib
import { useAppDispatch, useAppSelector } from "../../state/hooks/reduxHooks";
import { useRef, useEffect, useState } from "react";

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

// Types
import type { FC } from "react";
import type { Coordinates } from "../../types";

// Styles
import "./CanvasPane.styles.css";

const CanvasPane: FC = () => {
	const mode = useAppSelector(
		(state) => state.canvas.mode,
		(prev, next) => prev === next
	);
	const dispatch = useAppDispatch();
	const canvasSpaceRef = useRef<HTMLDivElement>(null);
	const clientPosition = useRef<Coordinates>({ x: 0, y: 0 });
	const [shiftKey, setShiftKey] = useState<boolean>(false);
	const [isGrabbing, setIsGrabbing] = useState<boolean>(false);
	const canMove = mode === "move" || shiftKey;
	const isMoving = canMove && isGrabbing;

	// Effect is getting ugly... Might be a good idea to split
	// this into multiple effects.
	useEffect(() => {
		const canvasSpace = canvasSpaceRef.current;
		if (!canvasSpace) return;

		function handleMouseDown(e: MouseEvent) {
			if (e.button !== 0) return;

			clientPosition.current = { x: e.clientX, y: e.clientY };
			setIsGrabbing(true);
		}

		function handleMouseMove(e: MouseEvent) {
			if (e.buttons !== 1 || (mode !== "move" && !shiftKey) || !isGrabbing)
				return;

			const dx = e.clientX - clientPosition.current.x;
			const dy = e.clientY - clientPosition.current.y;

			// Update the canvas position in the Redux state
			dispatch(changeX(dx));
			dispatch(changeY(dy));

			clientPosition.current = { x: e.clientX, y: e.clientY };
		}

		function handleMouseUp() {
			clientPosition.current = { x: 0, y: 0 };
			setIsGrabbing(false);
		}

		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Shift") {
				setShiftKey(e.type === "keydown");
			}
			if (e.key === "+" && e.type === "keydown") {
				e.preventDefault();
				dispatch(increaseScale());
			} else if (e.key === "_" && e.type === "keydown") {
				e.preventDefault();
				dispatch(decreaseScale());
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

		canvasSpace.addEventListener("mousedown", handleMouseDown);
		canvasSpace.addEventListener("mousemove", handleMouseMove);
		canvasSpace.addEventListener("mouseup", handleMouseUp);
		canvasSpace.addEventListener("wheel", handleZoom);
		canvasSpace.addEventListener("click", handleZoom);

		// Handle the case where the user moves the mouse outside the canvas space.
		// We consider this to be the same as releasing the mouse inside the canvas space.
		canvasSpace.addEventListener("mouseleave", handleMouseUp);

		// Handle shift key press
		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyDown);

		return () => {
			canvasSpace.removeEventListener("mousedown", handleMouseDown);
			canvasSpace.removeEventListener("mousemove", handleMouseMove);
			canvasSpace.removeEventListener("mouseup", handleMouseUp);
			canvasSpace.removeEventListener("mouseleave", handleMouseUp);
			canvasSpace.removeEventListener("wheel", handleZoom);
			canvasSpace.removeEventListener("click", handleZoom);

			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyDown);
		};
	}, [dispatch, mode, isGrabbing, shiftKey]);

	return (
		<div id="canvas-pane">
			<CanvasPointerMarker
				isVisible={(mode === "draw" || mode === "erase") && !shiftKey}
				canvasSpaceReference={canvasSpaceRef.current}
			/>
			{mode === "select" && !isMoving ? (
				<CanvasPointerSelection canvasSpaceReference={canvasSpaceRef.current} />
			) : null}
			<DrawingToolbar />

			<div
				id="canvas-container"
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
