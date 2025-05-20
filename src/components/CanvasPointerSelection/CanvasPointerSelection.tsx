// Lib
import { useRef, useEffect, useState } from "react";
import * as UTILS from "@/lib/utils";
import useLayerReferences from "@/state/hooks/useLayerReferences";
import useStoreSubscription from "@/state/hooks/useStoreSubscription";
import useStore from "@/state/hooks/useStore";
import { useShallow } from "zustand/react/shallow";
import clsx from "clsx";

// Types
import type { ReactNode, RefObject } from "react";
import type { Coordinates } from "@/types";

type CanvasPointerSelectionProps = {
	canvasSpaceReference: RefObject<HTMLDivElement | null>;
	isSelecting: RefObject<boolean>;
};

function CanvasPointerSelection({
	canvasSpaceReference,
	isSelecting
}: CanvasPointerSelectionProps): ReactNode {
	const { references } = useLayerReferences();
	const { focusElement, unfocusElement } = useStore(
		useShallow((state) => ({
			focusElement: state.focusElement,
			unfocusElement: state.unfocusElement
		}))
	);
	const isMovingElement = useStoreSubscription((state) => state.elementMoving);
	const rectRef = useRef<HTMLDivElement>(null);
	const startingPosition = useRef<Coordinates>({ x: 0, y: 0 });
	const [rect, setRect] = useState({ x: 0, y: 0, width: 0, height: 0 });

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
					focusElement((element) => element.id === node.id);
				} else {
					unfocusElement((element) => element.id === node.id);
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
			const overSpace =
				e.target === canvasSpace || canvasSpace.contains(e.target as Node);
			if (!overSpace) return;

			const { left, top } = canvasSpace.getBoundingClientRect();
			const x = e.clientX;
			const y = e.clientY;

			setRect({
				x: x - left,
				y: y - top,
				width: 0,
				height: 0
			});
			isSelecting.current = true;
			startingPosition.current = { x, y };
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (e.buttons !== 1 || isMovingElement.current || !isSelecting.current)
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
	}, [canvasSpaceReference, references, isSelecting, isMovingElement]);

	return (
		<div
			id="selection-rect"
			data-testid="selection-rect"
			ref={rectRef}
			style={{
				left: rect.x,
				top: rect.y,
				width: rect.width,
				height: rect.height
			}}
			className={clsx(
				"absolute pointer-events-none border-dashed border-[#d1836a] bg-[hsla(20,50%,60%,0.3)] z-100 rounded-md",
				{
					hidden: rect.width + rect.height === 0,
					block: rect.width + rect.height > 0
				}
			)}
		></div>
	);
}

export default CanvasPointerSelection;
