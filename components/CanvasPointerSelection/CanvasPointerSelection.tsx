// Lib
import { useRef, useEffect, useState } from "react";
import * as UTILS from "../../utils";
import useLayerReferences from "../../state/hooks/useLayerReferences";

// Types
import type { FC, RefObject } from "react";
import type { Coordinates } from "../../types";

type CanvasPointerSelectionProps = {
	canvasSpaceReference: RefObject<HTMLDivElement>;
};

const CanvasPointerSelection: FC<CanvasPointerSelectionProps> = ({
	canvasSpaceReference
}) => {
	const references = useLayerReferences();
	const [isSelecting, setIsSelecting] = useState<boolean>(false);
	const startingPosition = useRef<Coordinates>({ x: 0, y: 0 });
	const endPosition = useRef<Coordinates>({ x: 0, y: 0 });
	const [rect, setRect] = useState(() => {
		if (!canvasSpaceReference.current)
			return { x: 0, y: 0, width: 0, height: 0 };

		const canvasSpace = canvasSpaceReference.current;

		const { left, top } = canvasSpace.getBoundingClientRect();

		console.log(left, top);

		return { x: left, y: top, width: 0, height: 0 };
	});

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

					let deletionX = startCanvasX;
					let deletionY = startCanvasY;
					const deletionWidth = Math.abs(endCanvasX - startCanvasX);
					const deletionHeight = Math.abs(endCanvasY - startCanvasY);

					if (endCanvasX <= startCanvasX) {
						deletionX = endCanvasX;
					}

					if (endCanvasY <= startCanvasY) {
						deletionY = endCanvasY;
					}

					ctx.clearRect(deletionX, deletionY, deletionWidth, deletionHeight);
					return { x: 0, y: 0, width: 0, height: 0 };
				});
			}

			setIsSelecting(false);
		};

		const handleReset = () => {
			setRect({ x: 0, y: 0, width: 0, height: 0 });
		};

		canvasSpace.addEventListener("mousedown", handleMouseDown);
		canvasSpace.addEventListener("mousemove", handleMouseMove);
		canvasSpace.addEventListener("mouseup", handleMouseUp);
		document.addEventListener("keydown", handleKeyboardDown);

		// Sometimes, when the window is resized, the selection rectangle will appear over the UI.
		// This is so that the selection rectangle is reset when the window is resized.
		window.addEventListener("resize", handleReset);

		return () => {
			canvasSpace.removeEventListener("mousedown", handleMouseDown);
			canvasSpace.removeEventListener("mousemove", handleMouseMove);
			canvasSpace.removeEventListener("mouseup", handleMouseUp);
			document.removeEventListener("keydown", handleKeyboardDown);
			window.removeEventListener("resize", handleReset);
		};
	}, [canvasSpaceReference, references]);

	return (
		<div
			id="selection-rect"
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
