// Lib
import { useAppDispatch, useAppSelector } from "../../state/hooks/reduxHooks";
import { useRef, useEffect, useState } from "react";

import { changeX, changeY, setPosition } from "../../state/slices/canvasSlice";

// Components
import DrawingToolbar from "../DrawingToolbar/DrawingToolbar";
import Canvas from "../Canvas/Canvas";

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
	const shiftKey = useRef<boolean>(false);
	const canvasSpaceRef = useRef<HTMLDivElement>(null);
	const clientPosition = useRef<Coordinates>({ x: 0, y: 0 });
	const [isGrabbing, setIsGrabbing] = useState<boolean>(false);
	const canMove = mode === "move" || shiftKey.current;

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
			if (
				e.buttons !== 1 ||
				(mode !== "move" && !shiftKey.current) ||
				!isGrabbing
			)
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
				shiftKey.current = true;
			}
		}

		function handleKeyUp(e: KeyboardEvent) {
			if (e.key === "Shift") {
				shiftKey.current = false;
			}
		}

		canvasSpace.addEventListener("mousedown", handleMouseDown);
		canvasSpace.addEventListener("mousemove", handleMouseMove);
		canvasSpace.addEventListener("mouseup", handleMouseUp);

		// Handle the case where the user moves the mouse outside the canvas space.
		// We consider this to be the same as releasing the mouse inside the canvas space.
		canvasSpace.addEventListener("mouseleave", handleMouseUp);

		// Handle shift key press
		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		return () => {
			canvasSpace.removeEventListener("mousedown", handleMouseDown);
			canvasSpace.removeEventListener("mousemove", handleMouseMove);
			canvasSpace.removeEventListener("mouseup", handleMouseUp);
			canvasSpace.removeEventListener("mouseleave", handleMouseUp);

			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, [dispatch, mode, isGrabbing]);

	const resetPosition = () => dispatch(setPosition({ x: 0, y: 0 }));

	return (
		<div id="canvas-pane">
			<DrawingToolbar />

			<div
				id="canvas-container"
				ref={canvasSpaceRef}
				data-moving={canMove}
				data-grabbing={canMove && isGrabbing}
			>
				<Canvas />
			</div>

			<button
				style={{ position: "absolute", bottom: 10, left: 10 }}
				onClick={resetPosition}
			>
				Reset Position
			</button>
		</div>
	);
};

export default CanvasPane;
