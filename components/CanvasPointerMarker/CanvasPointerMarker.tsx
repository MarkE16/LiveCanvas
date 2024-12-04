// Lib
import { useState, useEffect, useRef } from "react";
import { useAppSelector } from "../../state/hooks/reduxHooks";
import * as UTILS from "../../utils";
import useCanvasElements from "../../state/hooks/useCanvasElements";

// Types
import type { FC, RefObject } from "react";
import type { Coordinates } from "../../types";

type CanvasPointerMarker = {
	canvasSpaceReference: RefObject<HTMLDivElement>;
	isVisible: boolean;
};

const CanvasPointerMarker: FC<CanvasPointerMarker> = ({
	canvasSpaceReference,
	isVisible
}) => {
	const { elements, deleteElement } = useCanvasElements();
	const ref = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState<Coordinates>({ x: 0, y: 0 });
	const { mode, drawStrength, eraserStrength, scale } = useAppSelector(
		(state) => state.canvas,
		(prev, next) => Object.is(prev, next)
	);
	const ERASER_RADIUS = 7;
	const POINTER_SIZE =
		(mode === "draw" ? drawStrength : ERASER_RADIUS * eraserStrength) * scale;

	useEffect(() => {
		const canvasSpace = canvasSpaceReference.current;
		if (!canvasSpace) return;

		function computeCoordinates(e: MouseEvent) {
			if (!canvasSpace) return;

			const { x, y, left, top, width, height } =
				canvasSpace.getBoundingClientRect();
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

		canvasSpace.addEventListener("mousemove", computeCoordinates);

		return () => {
			canvasSpace.removeEventListener("mousemove", computeCoordinates);
		};
	}, [canvasSpaceReference, POINTER_SIZE]);

	useEffect(() => {
		const canvasSpace = canvasSpaceReference.current;

		if (!canvasSpace) return;

		const isIntersecting = (e: MouseEvent) => {
			const m = ref.current;

			if (!m) return;

			elements.forEach((element) => {
				const el = document.getElementById(element.id);

				if (!el) return;

				if (
					UTILS.isRectIntersecting(m, el) &&
					mode === "erase" &&
					e.buttons === 1
				) {
					deleteElement(element.id);
				}
			});
		};

		canvasSpace.addEventListener("mousemove", isIntersecting);

		return () => {
			canvasSpace.removeEventListener("mousemove", isIntersecting);
		};
	}, [elements, deleteElement, mode, canvasSpaceReference]);

	return (
		<div
			ref={ref}
			id="canvas-pointer-marker"
			style={{
				position: "absolute",
				// Remove pointer events so the pointer doesn't interfere with the canvas.
				pointerEvents: "none",
				borderRadius: mode === "draw" ? "50%" : "0%",
				backgroundColor: "black",
				left: -POINTER_SIZE,
				top: -POINTER_SIZE,
				display: isVisible ? "block" : "none",
				transform: `translate(${position.x}px, ${position.y}px)`,
				zIndex: 100,
				width: POINTER_SIZE,
				height: POINTER_SIZE
			}}
		/>
	);
};

export default CanvasPointerMarker;
