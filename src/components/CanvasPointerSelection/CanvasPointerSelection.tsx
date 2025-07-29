// Lib
import { useRef, useEffect, useState } from "react";
import useStoreSubscription from "@/state/hooks/useStoreSubscription";
import useStore from "@/state/hooks/useStore";
import { useShallow } from "zustand/react/shallow";

// Types
import type { ReactNode, RefObject } from "react";
import type { Coordinates } from "@/types";

type CanvasPointerSelectionProps = {
	canvasSpaceReference: RefObject<HTMLDivElement | null>;
};

function CanvasPointerSelection({
	canvasSpaceReference
}: CanvasPointerSelectionProps): ReactNode {
	const startingPosition = useRef<Coordinates>({ x: 0, y: 0 });
	const { selection, updateSelectionRect } = useStore(
		useShallow((state) => ({
			selection: state.selection,
			updateSelectionRect: state.updateSelectionRect
		}))
	);
	const currentMode = useStoreSubscription((state) => state.mode);
	const isSelecting = useRef<boolean>(false);

	useEffect(() => {
		const canvasSpace = canvasSpaceReference.current;
		if (!canvasSpace) return;

		const handleMouseDown = (e: MouseEvent) => {
			const overSpace =
				e.target === canvasSpace || canvasSpace.contains(e.target as Node);
			if (!overSpace || currentMode.current !== "select") return;

			const { left, top } = canvasSpace.getBoundingClientRect();
			const x = e.clientX;
			const y = e.clientY;

			updateSelectionRect({
				x: x - left,
				y: y - top,
				width: 0,
				height: 0
			});
			isSelecting.current = true;
			startingPosition.current = { x, y };
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (e.buttons !== 1 || !isSelecting.current) return;

			const { left, top } = canvasSpace.getBoundingClientRect();
			const { x, y } = startingPosition.current;
			const currentX = e.clientX;
			const currentY = e.clientY;

			updateSelectionRect({
				x: Math.min(x, currentX) - left,
				y: Math.min(y, currentY) - top,
				width: Math.abs(x - currentX),
				height: Math.abs(y - currentY)
			});
		};

		const handleKeyboardDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				updateSelectionRect(null);
				isSelecting.current = false;
			}
		};

		const handleMouseUp = () => {
			isSelecting.current = false;
		};

		document.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
		document.addEventListener("keydown", handleKeyboardDown);

		return () => {
			document.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.removeEventListener("keydown", handleKeyboardDown);
		};
	}, [canvasSpaceReference, updateSelectionRect]);

	return (
		<svg
			id="selection-rect"
			data-testid="selection-rect"
			style={{
				left: selection?.x,
				top: selection?.y,
				width: selection?.width,
				height: selection?.height,
				display: !selection ? "none" : "block"
			}}
			className="absolute pointer-events-none z-[100] rounded"
			preserveAspectRatio="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect
				id="MarchingAnts"
				fill="none"
				width="100%"
				height="100%"
				stroke="#d1836a"
				strokeWidth="1"
			/>
		</svg>
	);
}

export default CanvasPointerSelection;
