// Lib
import { useRef, useEffect, useState } from "react";
import * as UTILS from "../../utils";
import useLayerReferences from "../../state/hooks/useLayerReferences";

// Types
import type { FC } from "react";

type CanvasPointerSelectionProps = {
	canvasSpaceReference: HTMLDivElement | null;
};

const CanvasPointerSelection: FC<CanvasPointerSelectionProps> = ({
	canvasSpaceReference
}) => {
	const references = useLayerReferences();
	const startingPosition = useRef({ x: 0, y: 0 });
	const endPosition = useRef({ x: 0, y: 0 });
	const [rect, setRect] = useState({ x: 0, y: 0, width: 0, height: 0 });

	useEffect(() => {
		const canvasSpace = canvasSpaceReference;
		if (!canvasSpace) return;

		const handleMouseDown = (e: MouseEvent) => {
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
		};

		const handleMouseUp = (e: MouseEvent) => {
			const x = e.clientX;
			const y = e.clientY;

			endPosition.current = { x, y };
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

				setRect((prev) => {
					const { x: startX, y: startY } = startingPosition.current;
					const { x: startCanvasX, y: startCanvasY } =
						UTILS.getCanvasPointerPosition(startX, startY, currentLayer);
					const { x: endX, y: endY } = endPosition.current;
					const { x: endCanvasX, y: endCanvasY } =
						UTILS.getCanvasPointerPosition(endX, endY, currentLayer);
					const scale = currentLayer.getAttribute("data-scale");

					if (!scale) {
						console.error("Can't determine scale for deleting selection.");
						return { x: 0, y: 0, width: 0, height: 0 };
					}

					const { width, height } = prev;
					let deletionX = startCanvasX;
					let deletionY = startCanvasY;

					if (endCanvasX <= startCanvasX) {
						deletionX = startCanvasX - width / Number(scale);
					}

					if (endCanvasY <= startCanvasY) {
						deletionY = startCanvasY - height / Number(scale);
					}

					ctx.clearRect(
						deletionX,
						deletionY,
						width / Number(scale),
						height / Number(scale)
					);
					return { x: 0, y: 0, width: 0, height: 0 };
				});
			}
		};

		canvasSpace.addEventListener("mousedown", handleMouseDown);
		canvasSpace.addEventListener("mousemove", handleMouseMove);
		canvasSpace.addEventListener("mouseup", handleMouseUp);
		document.addEventListener("keydown", handleKeyboardDown);

		return () => {
			canvasSpace.removeEventListener("mousedown", handleMouseDown);
			canvasSpace.removeEventListener("mousemove", handleMouseMove);
			canvasSpace.removeEventListener("mouseup", handleMouseUp);
			document.removeEventListener("keydown", handleKeyboardDown);
		};
	}, [canvasSpaceReference, references]);

	return (
		<div
			id="selection-rect"
			style={{
				display: rect.width + rect.height === 0 ? "none" : "block",
				position: "absolute",
				border: "1px solid #d1836a",
				pointerEvents: "none",
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
