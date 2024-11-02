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
	const isMoving = useRef<boolean>(false);
	const canvasSpaceRef = useRef<HTMLDivElement>(null);
	const clientPosition = useRef<Coordinates>({ x: 0, y: 0 });
	const [isGrabbing, setIsGrabbing] = useState<boolean>(false);

	useEffect(() => {
		const canvasSpace = canvasSpaceRef.current;
		if (!canvasSpace || mode !== "move") return;

		function handleMouseDown(e: MouseEvent) {
			clientPosition.current = { x: e.clientX, y: e.clientY };
			isMoving.current = true;
			setIsGrabbing(true);
		}

		function handleMouseMove(e: MouseEvent) {
			if (e.buttons !== 1 || !isMoving.current) return;

			const dx = e.clientX - clientPosition.current.x;
			const dy = e.clientY - clientPosition.current.y;

			// Update the canvas position in the Redux state
			dispatch(changeX(dx));
			dispatch(changeY(dy));

			clientPosition.current = { x: e.clientX, y: e.clientY };
		}

		function handleMouseUp() {
			clientPosition.current = { x: 0, y: 0 };
			isMoving.current = false;
			setIsGrabbing(false);
		}

		canvasSpace.addEventListener("mousedown", handleMouseDown);
		canvasSpace.addEventListener("mousemove", handleMouseMove);
		canvasSpace.addEventListener("mouseup", handleMouseUp);

		// Handle the case where the user moves the mouse outside the canvas space.
		// We consider this to be the same as releasing the mouse inside the canvas space.
		canvasSpace.addEventListener("mouseleave", handleMouseUp);

		return () => {
			canvasSpace.removeEventListener("mousedown", handleMouseDown);
			canvasSpace.removeEventListener("mousemove", handleMouseMove);
			canvasSpace.removeEventListener("mouseup", handleMouseUp);
			canvasSpace.removeEventListener("mouseleave", handleMouseUp);
		};
	}, [dispatch, mode]);

	const resetPosition = () => dispatch(setPosition({ x: 0, y: 0 }));

	const ResetPositionButton = () => (
		<button
			style={{ position: "absolute", bottom: 10, left: 10 }}
			onClick={resetPosition}
		>
			Reset Position
		</button>
	);

	return (
		<div id="canvas-pane">
			<DrawingToolbar />

			<div
				id="canvas-container"
				ref={canvasSpaceRef}
				data-moving={mode === "move"}
				data-grabbing={isGrabbing}
			>
				<Canvas />
			</div>

			<ResetPositionButton />
		</div>
	);
};

export default CanvasPane;
