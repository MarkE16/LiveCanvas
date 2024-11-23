// Lib
import { useState, useEffect } from "react";
import { useAppSelector } from "../../state/hooks/reduxHooks";

// Types
import type { FC } from "react";
import type { Coordinates } from "../../types";

type CanvasPointerMarker = {
	canvasSpaceReference: HTMLCanvasElement | null;
};

//
const CanvasPointerMarker: FC<CanvasPointerMarker> = ({
	canvasSpaceReference
}) => {
	const [position, setPosition] = useState<Coordinates>({ x: 0, y: 0 });
	const { mode, drawStrength, eraserStrength } = useAppSelector(
		(state) => state.canvas,
		(prev, next) => Object.is(prev, next)
	);
	const ERASER_RADIUS = 7;

	const POINTER_SIZE =
		mode === "draw" ? drawStrength : ERASER_RADIUS * eraserStrength;

	useEffect(() => {
		function onMouseMove(e: MouseEvent) {
			if (!canvasSpaceReference) return;

			const { x, y, left, top, width, height } =
				canvasSpaceReference.getBoundingClientRect();
			let newX;
			let newY;

			const computedX = e.clientX - left + POINTER_SIZE / 2;
			const computedY = e.clientY - top + POINTER_SIZE / 2;

			if (computedX - POINTER_SIZE < 0) {
				// If the pointer is too far to the left, set the x to the left edge of the canvas.
				newX = x - left + POINTER_SIZE;
			} else if (computedX > width) {
				// If the pointer is too far to the right, set the x to the right edge of the canvas.
				newX = width;
			} else {
				// Otherwise, set the x to the pointer's position.
				newX = computedX;
			}

			if (computedY - POINTER_SIZE < 0) {
				// If the pointer is too far to the top, set the y to the top edge of the canvas.
				newY = y - top + POINTER_SIZE;
			} else if (computedY > height) {
				// If the pointer is too far to the bottom, set the y to the bottom edge of the canvas.
				newY = height;
			} else {
				// Otherwise, set the y to the pointer's position.
				newY = computedY;
			}

			setPosition({ x: newX, y: newY });
		}

		window.addEventListener("mousemove", onMouseMove);

		return () => {
			window.removeEventListener("mousemove", onMouseMove);
		};
	}, [canvasSpaceReference, POINTER_SIZE]);

	return (
		<div
			style={{
				position: "absolute",
				// Remove pointer events so the pointer doesn't interfere with the canvas.
				pointerEvents: "none",
				borderRadius: mode === "draw" ? "50%" : "0%",
				backgroundColor: "rgba(0, 0, 0, 0.3)",
				left: -POINTER_SIZE,
				top: -POINTER_SIZE,
				transform: `translate(${position.x}px, ${position.y}px)`,
				zIndex: 100,
				width: POINTER_SIZE,
				height: POINTER_SIZE
			}}
		/>
	);
};

export default CanvasPointerMarker;
