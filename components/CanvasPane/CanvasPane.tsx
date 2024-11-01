// Lib
import { useAppDispatch, useAppSelector } from "../../state/hooks/reduxHooks";
import { useRef, useEffect, useState } from "react";

import { setPosition } from "../../state/slices/canvasSlice";

// Components
import DrawingToolbar from "../DrawingToolbar/DrawingToolbar";
import Canvas from "../Canvas/Canvas";

// Types
import type { FC } from "react";
import type { Coordinates } from "../../types";

// Styles
import "./CanvasPane.styles.css";

const CanvasPane: FC = () => {
	const { position } = useAppSelector(
		(state) => state.canvas,
		(prev, next) => Object.is(prev.position, next.position)
	);
	const mode = useAppSelector(
		(state) => state.canvas.mode,
		(prev, next) => prev === next
	);
	const dispatch = useAppDispatch();
	const canvasSpaceRef = useRef<HTMLDivElement>(null);
	const clientPosition = useRef<Coordinates>({ x: 0, y: 0 });
	const [isGrabbing, setIsGrabbing] = useState<boolean>(false);

	useEffect(() => {
		const canvasSpace = canvasSpaceRef.current;
		if (!canvasSpace || mode !== "move") return;

		function handleMouseDown(e: MouseEvent) {
			clientPosition.current = { x: e.clientX, y: e.clientY };
			setIsGrabbing(true);
		}

		function handleMouseMove(e: MouseEvent) {
			if (e.buttons !== 1) return;

			const dx = e.clientX - clientPosition.current.x;
			const dy = e.clientY - clientPosition.current.y;

			// Update the canvas position in the Redux state
			dispatch(setPosition({ x: position.x + dx, y: position.y + dy }));

			clientPosition.current = { x: e.clientX, y: e.clientY };
		}

		function handleMouseUp() {
			clientPosition.current = { x: 0, y: 0 };
			setIsGrabbing(false);
		}

		canvasSpace.addEventListener("mousedown", handleMouseDown);
		canvasSpace.addEventListener("mousemove", handleMouseMove);
		canvasSpace.addEventListener("mouseup", handleMouseUp);

		return () => {
			canvasSpace.removeEventListener("mousedown", handleMouseDown);
			canvasSpace.removeEventListener("mousemove", handleMouseMove);
			canvasSpace.removeEventListener("mouseup", handleMouseUp);
		};
	}, [dispatch, position.x, position.y, mode]);

	return (
		<div
			id="canvas-pane"
			ref={canvasSpaceRef}
			data-moving={mode === "move"}
			data-grabbing={isGrabbing}
		>
			<DrawingToolbar />
			<div id="canvas-container">
				<Canvas />
			</div>
		</div>
	);
};

export default CanvasPane;
