// Lib
import { useRef, useEffect } from "react";

// Components
import DrawingToolbar from "../DrawingToolbar/DrawingToolbar";
import Canvas from "../Canvas/Canvas";

// Types
import type { FC } from "react";

// Styles
import "./CanvasPane.styles.css";

const CanvasPane: FC = () => {
	const canvasSpaceRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const canvasSpace = canvasSpaceRef.current;
		if (!canvasSpace) return;

		// TODO: Implement the canvas moving logic here, so that the user can move the canvas around
		// by clicking and dragging on the canvas space. This will allows users to not be limited to
		// moving the canvas around by directly clicking and dragging on the canvas itself.

		// This may involve having to adjust the Redux state to include the canvas position.

		function handleMouseDown(e: MouseEvent) {
			// ...
		}

		function handleMouseMove(e: MouseEvent) {
			// ...
		}

		function handleMouseUp(e: MouseEvent) {
			// ...
		}

		canvasSpace.addEventListener("mousedown", handleMouseDown);
		canvasSpace.addEventListener("mousemove", handleMouseMove);
		canvasSpace.addEventListener("mouseup", handleMouseUp);

		return () => {
			canvasSpace.removeEventListener("mousedown", handleMouseDown);
			canvasSpace.removeEventListener("mousemove", handleMouseMove);
			canvasSpace.removeEventListener("mouseup", handleMouseUp);
		};
	}, []);

	return (
		<div
			id="canvas-pane"
			ref={canvasSpaceRef}
		>
			<DrawingToolbar />
			<div id="canvas-container">
				<Canvas />
			</div>
		</div>
	);
};

export default CanvasPane;
