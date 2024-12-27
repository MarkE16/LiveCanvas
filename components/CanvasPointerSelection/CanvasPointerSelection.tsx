// Lib
import { useRef, useEffect, useState } from "react";
import * as UTILS from "../../utils";
import useLayerReferences from "../../state/hooks/useLayerReferences";
import useCanvasElements from "../../state/hooks/useCanvasElements";

// Types
import type { FC, MutableRefObject, RefObject } from "react";
import type { Coordinates } from "../../types";

type CanvasPointerSelectionProps = {
	canvasSpaceReference: RefObject<HTMLDivElement>;
	isSelecting: MutableRefObject<boolean>;
};

const CanvasPointerSelection: FC<CanvasPointerSelectionProps> = ({
	canvasSpaceReference,
	isSelecting
}) => {
	const references = useLayerReferences();
	const rectRef = useRef<HTMLDivElement>(null);
	const startingPosition = useRef<Coordinates>({ x: 0, y: 0 });
	const [rect, setRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
	const { focusElement, unfocusElement, movingElement } = useCanvasElements();

	useEffect(() => {
		const checkIntersections = (e: MouseEvent) => {
			if (!rectRef.current || e.buttons !== 1 || !isSelecting.current) return;

			const selectionRect = rectRef.current;

			const elements = document.getElementsByClassName("element");
			// const activeLayer = references.find((ref) =>
			// 	ref.classList.contains("active")
			// );

			// if (!activeLayer)
			// 	throw new Error("No active layer found. This is a bug.");

			for (let i = 0; i < elements.length; i++) {
				const node = elements[i];

				if (
					UTILS.isRectIntersecting(selectionRect, node)
					// && activeLayer.id === node.getAttribute("data-layerid")
				) {
					focusElement(node.id);
				} else {
					unfocusElement(node.id);
				}
			}
		};

		document.addEventListener("mousemove", checkIntersections);

		return () => {
			document.removeEventListener("mousemove", checkIntersections);
		};
	}, [focusElement, unfocusElement, isSelecting]);

	useEffect(() => {
		const canvasSpace = canvasSpaceReference.current;
		if (!canvasSpace) return;

		const handleMouseDown = (e: MouseEvent) => {
			const { left, top } = canvasSpace.getBoundingClientRect();
			const x = e.clientX;
			const y = e.clientY;

			console.log(e.target);

			setRect({
				x: x - left,
				y: y - top,
				width: 0,
				height: 0
			});
			isSelecting.current =
				e.target === canvasSpace || canvasSpace.contains(e.target as Node);
			startingPosition.current = { x, y };
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (e.buttons !== 1 || movingElement.current || !isSelecting.current)
				return;

			const { left, top } = canvasSpace.getBoundingClientRect();
			const { x, y } = startingPosition.current;
			const currentX = e.clientX;
			const currentY = e.clientY;

			setRect({
				x: Math.min(x, currentX) - left,
				y: Math.min(y, currentY) - top,
				width: Math.abs(x - currentX),
				height: Math.abs(y - currentY)
			});
		};

		const handleMouseUp = () => {
			setRect({ x: 0, y: 0, width: 0, height: 0 });
			isSelecting.current = false;
		};

		// const handleKeyboardDown = (e: KeyboardEvent) => {
		// 	if (e.key === "Escape") {
		// 		setRect({ x: 0, y: 0, width: 0, height: 0 });
		// 	} else if (e.key === "Delete" || e.key === "Backspace") {
		// 		const currentLayer = references.find((ref) =>
		// 			ref.classList.contains("active")
		// 		);
		// 		if (!currentLayer) throw new Error("No active layer found.");

		// 		// Calculate the selection rectangle area as to the canvas space.
		// 		const ctx = currentLayer.getContext("2d");

		// 		if (!ctx) return;

		// 		setRect(() => {
		// 			const dpi = currentLayer.getAttribute("data-dpi");
		// 			if (!dpi) {
		// 				console.error("Can't determine DPI for deleting selection.");
		// 				return { x: 0, y: 0, width: 0, height: 0 };
		// 			}

		// 			const { x: startX, y: startY } = startingPosition.current;
		// 			const { x: startCanvasX, y: startCanvasY } =
		// 				UTILS.getCanvasPointerPosition(
		// 					startX,
		// 					startY,
		// 					currentLayer,
		// 					Number(dpi)
		// 				);
		// 			const { x: endX, y: endY } = endPosition.current;
		// 			const { x: endCanvasX, y: endCanvasY } =
		// 				UTILS.getCanvasPointerPosition(
		// 					endX,
		// 					endY,
		// 					currentLayer,
		// 					Number(dpi)
		// 				);

		// 			ctx.clearRect(
		// 				Math.min(startCanvasX, endCanvasX),
		// 				Math.min(startCanvasY, endCanvasY),
		// 				Math.abs(endCanvasX - startCanvasX),
		// 				Math.abs(endCanvasY - startCanvasY)
		// 			);
		// 			return { x: 0, y: 0, width: 0, height: 0 };
		// 		});
		// 	}

		// 	setIsSelecting(false);
		// };

		// const handleReset = () => {
		// 	setRect({ x: 0, y: 0, width: 0, height: 0 });
		// };

		document.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
		// document.addEventListener("keydown", handleKeyboardDown);

		// Sometimes, when the window is resized, the selection rectangle will appear over the UI.
		// This is so that the selection rectangle is reset when the window is resized.
		// window.addEventListener("resize", handleReset);

		return () => {
			document.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			// document.removeEventListener("keydown", handleKeyboardDown);
			// window.removeEventListener("resize", handleReset);
		};
	}, [canvasSpaceReference, references, movingElement, isSelecting]);

	return (
		<div
			id="selection-rect"
			data-testid="selection-rect"
			ref={rectRef}
			style={{
				display: rect.width + rect.height === 0 ? "none" : "block",
				position: "absolute",
				pointerEvents: "none",
				border: `1px dashed #d1836a`,
				backgroundColor: "hsla(20, 50%, 60%, 0.3)",
				zIndex: 100,
				left: rect.x,
				top: rect.y,
				width: rect.width,
				height: rect.height
			}}
		></div>
	);
};

export default CanvasPointerSelection;
