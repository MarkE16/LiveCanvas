// Lib
import { useRef, useEffect, useState } from "react";
import * as UTILS from "../../utils";
import useLayerReferences from "../../state/hooks/useLayerReferences";
import useCanvasElements from "../../state/hooks/useCanvasElements";

// Types
import type { FC, RefObject } from "react";
import type { Coordinates } from "../../types";

type CanvasPointerSelectionProps = {
	isSelecting: boolean;
	setIsSelecting: (isSelecting: boolean) => void;
	canvasSpaceReference: RefObject<HTMLDivElement>;
};

const CanvasPointerSelection: FC<CanvasPointerSelectionProps> = ({
	isSelecting,
	setIsSelecting,
	canvasSpaceReference
}) => {
	const references = useLayerReferences();
	const rectRef = useRef<HTMLDivElement>(null);
	const startingPosition = useRef<Coordinates>({ x: 0, y: 0 });
	const endPosition = useRef<Coordinates>({ x: 0, y: 0 });
	const [rect, setRect] = useState(() => {
		if (!canvasSpaceReference.current)
			return { x: 0, y: 0, width: 0, height: 0 };

		const canvasSpace = canvasSpaceReference.current;

		const { left, top } = canvasSpace.getBoundingClientRect();

		return { x: left, y: top, width: 0, height: 0 };
	});
	const { focusElement, unfocusElement, elements } = useCanvasElements();

	useEffect(() => {
		const checkIntersections = (e: MouseEvent) => {
			if (!rectRef.current || e.buttons !== 1) return;

			const selectionRect = rectRef.current;

			elements.forEach((element) => {
				const node = document.getElementById(element.id);

				if (!node) return;

				if (UTILS.isRectIntersecting(selectionRect, node)) {
					focusElement(element.id);
				} else {
					unfocusElement(element.id);
				}
			});
		};

		document.addEventListener("mousemove", checkIntersections);

		return () => {
			document.removeEventListener("mousemove", checkIntersections);
		};
	}, [elements, focusElement, unfocusElement]);

	useEffect(() => {
		const canvasSpace = canvasSpaceReference.current;
		if (!canvasSpace) return;

		const handleMouseDown = (e: MouseEvent) => {
			setIsSelecting(true);
			const { left, top } = canvasSpace.getBoundingClientRect();
			const x = e.clientX;
			const y = e.clientY;

			setRect({
				x: x - left,
				y: y - top,
				width: 0,
				height: 0
			});
			startingPosition.current = { x, y };
			endPosition.current = { x: 0, y: 0 };
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (e.buttons !== 1) return;

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

			endPosition.current = { x: currentX, y: currentY };
		};

		const handleMouseUp = (e: MouseEvent) => {
			const x = e.clientX;
			const y = e.clientY;

			endPosition.current = { x, y };
			setIsSelecting(false);
		};

		const handleKeyboardDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setRect({ x: 0, y: 0, width: 0, height: 0 });
			} else if (e.key === "Delete" || e.key === "Backspace") {
				const currentLayer = references.find((ref) =>
					ref.classList.contains("active")
				);
				if (!currentLayer) throw new Error("No active layer found.");

				// Calculate the selection rectangle area as to the canvas space.
				const ctx = currentLayer.getContext("2d");

				if (!ctx) return;

				setRect(() => {
					const dpi = currentLayer.getAttribute("data-dpi");
					if (!dpi) {
						console.error("Can't determine DPI for deleting selection.");
						return { x: 0, y: 0, width: 0, height: 0 };
					}

					const { x: startX, y: startY } = startingPosition.current;
					const { x: startCanvasX, y: startCanvasY } =
						UTILS.getCanvasPointerPosition(
							startX,
							startY,
							currentLayer,
							Number(dpi)
						);
					const { x: endX, y: endY } = endPosition.current;
					const { x: endCanvasX, y: endCanvasY } =
						UTILS.getCanvasPointerPosition(
							endX,
							endY,
							currentLayer,
							Number(dpi)
						);

					ctx.clearRect(
						Math.min(startCanvasX, endCanvasX),
						Math.min(startCanvasY, endCanvasY),
						Math.abs(endCanvasX - startCanvasX),
						Math.abs(endCanvasY - startCanvasY)
					);
					return { x: 0, y: 0, width: 0, height: 0 };
				});
			}

			setIsSelecting(false);
		};

		const handleReset = () => {
			setRect({ x: 0, y: 0, width: 0, height: 0 });
		};

		document.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
		document.addEventListener("keydown", handleKeyboardDown);

		// Sometimes, when the window is resized, the selection rectangle will appear over the UI.
		// This is so that the selection rectangle is reset when the window is resized.
		window.addEventListener("resize", handleReset);

		return () => {
			document.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.removeEventListener("keydown", handleKeyboardDown);
			window.removeEventListener("resize", handleReset);
		};
	}, [canvasSpaceReference, references, setIsSelecting]);

	return (
		<div
			id="selection-rect"
			ref={rectRef}
			style={{
				display: rect.width + rect.height === 0 ? "none" : "block",
				position: "absolute",
				pointerEvents: "none",
				border: `1px ${isSelecting ? "dashed" : "solid"} #d1836a`,
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
