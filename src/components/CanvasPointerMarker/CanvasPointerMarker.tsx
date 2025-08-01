// Lib
import { useState, useEffect, useRef } from "react";
import useStore from "@/state/hooks/useStore";
import { useShallow } from "zustand/react/shallow";
import * as Utils from "@/lib/utils";

// Types
import type { ReactNode, RefObject } from "react";
import type { Coordinates } from "@/types";

type CanvasPointerMarker = {
	canvasSpaceReference: RefObject<HTMLDivElement | null>;
	shiftKey: boolean;
};

function CanvasPointerMarker({
	canvasSpaceReference,
	shiftKey
}: CanvasPointerMarker): ReactNode {
	const { mode, scale, strokeWidth, deleteElement } = useStore(
		useShallow((state) => ({
			mode: state.mode,
			scale: state.scale,
			strokeWidth: state.strokeWidth,
			deleteElement: state.deleteElement
		}))
	);
	const ref = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState<Coordinates>({ x: 0, y: 0 });
	const [isVisible, setIsVisible] = useState<boolean>(false);

	const POINTER_SIZE = strokeWidth * scale;

	useEffect(() => {
		const canvasSpace = canvasSpaceReference.current;
		if (!canvasSpace) return;

		const hoveringOverSpace = (e: MouseEvent) =>
			e.target === canvasSpace || canvasSpace.contains(e.target as Node);
		function computeCoordinates(e: MouseEvent) {
			if (!canvasSpace) return;

			if (hoveringOverSpace(e)) {
				setIsVisible(true);
			} else {
				setIsVisible(false);
			}

			const { left, top, width, height } = canvasSpace.getBoundingClientRect();
			let newX;
			let newY;

			const computedX = e.clientX - left + POINTER_SIZE / 2;
			const computedY = e.clientY - top + POINTER_SIZE / 2;

			if (computedX - POINTER_SIZE < 0) {
				// If the pointer is too far to the left, set the x to the left edge of the canvas.
				newX = POINTER_SIZE;
			} else if (computedX > width) {
				// If the pointer is too far to the right, set the x to the right edge of the canvas.
				newX = width;
			} else {
				// Otherwise, set the x to the pointer's position.
				newX = computedX;
			}

			if (computedY - POINTER_SIZE < 0) {
				// If the pointer is too far to the top, set the y to the top edge of the canvas.
				newY = POINTER_SIZE;
			} else if (computedY > height) {
				// If the pointer is too far to the bottom, set the y to the bottom edge of the canvas.
				newY = height;
			} else {
				// Otherwise, set the y to the pointer's position.
				newY = computedY;
			}

			setPosition({ x: newX, y: newY });
		}

		document.addEventListener("mousemove", computeCoordinates);

		return () => {
			document.removeEventListener("mousemove", computeCoordinates);
		};
	}, [canvasSpaceReference, POINTER_SIZE]);

	useEffect(() => {
		const canvasSpace = canvasSpaceReference.current;

		if (!canvasSpace) return;

		const isIntersecting = (e: MouseEvent) => {
			const m = ref.current;

			if (!m) return;

			const elements = document.getElementsByClassName("element");

			for (let i = 0; i < elements.length; i++) {
				const node = elements[i];
				if (
					Utils.isRectIntersecting(m, node) &&
					mode === "eraser" &&
					e.buttons === 1
				) {
					deleteElement((element) => element.id === node.id);
				}
			}
		};

		canvasSpace.addEventListener("mousemove", isIntersecting);

		return () => {
			canvasSpace.removeEventListener("mousemove", isIntersecting);
		};
	}, [deleteElement, mode, canvasSpaceReference]);

	return (
		<div
			ref={ref}
			id="canvas-pointer-marker"
			data-testid="canvas-pointer-marker"
			style={{
				// Remove pointer events so the pointer doesn't interfere with the canvas.
				borderRadius: "50%",
				left: -POINTER_SIZE,
				top: -POINTER_SIZE,
				display: isVisible && !shiftKey ? "block" : "none",
				transform: `translate(${position.x}px, ${position.y}px)`,
				zIndex: 100,
				width: POINTER_SIZE,
				height: POINTER_SIZE
			}}
		/>
	);
}

export default CanvasPointerMarker;
