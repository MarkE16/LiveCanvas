// Lib
import { useRef, useEffect } from "react";
import { useAppSelector } from "../../state/hooks/reduxHooks";
import useLayerReferences from "../../state/hooks/useLayerReferences";
import * as UTILS from "../../utils";

// Types
import type { FC, MouseEventHandler, MouseEvent, HTMLAttributes } from "react";
import type { Coordinates } from "../../types";

type InteractiveCanvasLayerProps = HTMLAttributes<HTMLCanvasElement> & {
	width: number;
	height: number;
};

// Note: In favor of having the ability to draw shapes and text on the canvas space, this component may be deprecated
// and so will be removed in the future.
const InteractiveCanvasLayer: FC<InteractiveCanvasLayerProps> = ({
	width,
	height,
	...rest
}) => {
	const { scale, mode, shape, color, dpi } = useAppSelector(
		(state) => state.canvas
	);
	const { x: xPosition, y: yPosition } = useAppSelector(
		(state) => state.canvas.position
	);
	const isSelecting = useRef<boolean>(false);
	const selectionRef = useRef<HTMLCanvasElement>(null);
	const selectionStartingPoint = useRef<Coordinates>({ x: 0, y: 0 });
	const references = useLayerReferences();

	const onMouseDown: MouseEventHandler<HTMLCanvasElement> = (
		e: MouseEvent<HTMLCanvasElement>
	) => {
		isSelecting.current = true;

		const { x, y } = UTILS.getCanvasPointerPosition(
			e.clientX,
			e.clientY,
			selectionRef.current!,
			dpi
		);

		const ctx = selectionRef.current!.getContext("2d");

		ctx!.clearRect(
			0,
			0,
			selectionRef.current!.width,
			selectionRef.current!.height
		);

		selectionStartingPoint.current = { x, y };
	};

	const onMouseMove: MouseEventHandler<HTMLCanvasElement> = (
		e: MouseEvent<HTMLCanvasElement>
	) => {
		if (!isSelecting.current && e.buttons !== 1) {
			return;
		}

		const ctx = selectionRef.current!.getContext("2d");

		const { x, y } = UTILS.getCanvasPointerPosition(
			e.clientX,
			e.clientY,
			selectionRef.current!,
			dpi
		);
		const { x: startX, y: startY } = selectionStartingPoint.current;

		const rectWidth = x - startX;
		const rectHeight = y - startY;

		ctx!.clearRect(
			0,
			0,
			selectionRef.current!.width,
			selectionRef.current!.height
		);

		if (mode === "shapes") {
			ctx!.lineWidth = 2;
			ctx!.fillStyle = color;
			ctx!.strokeStyle = color;
			switch (shape) {
				case "rectangle": {
					if (e.shiftKey) {
						// Make all the sides equal.
						const side = Math.min(rectWidth, rectHeight);
						ctx!.fillRect(startX, startY, side, side);
						ctx!.strokeRect(startX, startY, side, side);
					} else {
						ctx!.fillRect(startX, startY, rectWidth, rectHeight);
						ctx!.strokeRect(startX, startY, rectWidth, rectHeight);
					}
					break;
				}

				case "circle": {
					// Recall: x^2 + y^2 = r^2

					const radius = Math.sqrt(rectWidth ** 2 + rectHeight ** 2);

					ctx!.arc(startX, startY, radius, 0, 2 * Math.PI);
					ctx!.stroke();
					break;
				}

				case "triangle": {
					ctx!.beginPath();

					if (e.shiftKey) {
						// Equilateral triangle
						const side = Math.min(rectWidth, rectHeight);
						ctx!.moveTo(startX, startY);
						ctx!.lineTo(startX + side, startY);
						ctx!.lineTo(startX + side / 2, startY + side);
						ctx!.lineTo(startX, startY);
					} else {
						ctx!.moveTo(startX + rectWidth / 2, startY);
						ctx!.lineTo(startX, startY + rectHeight);
						ctx!.lineTo(startX + rectWidth, startY + rectHeight);
						ctx!.lineTo(startX + rectWidth / 2, startY);
					}

					ctx!.stroke();
					break;
				}
			}
		}
	};

	const onMouseUp: MouseEventHandler<HTMLCanvasElement> = () => {
		isSelecting.current = false;

		const activeLayer = references.find((ref) =>
			ref.classList.contains("active")
		);

		if (!activeLayer) {
			const err = "`InteractiveCanvasLayer`: No active layer found to select.";
			console.error(err);
			alert(err);
			return;
		}

		const mainCtx = activeLayer.getContext("2d");
		const selectCtx = selectionRef.current!.getContext("2d");

		if (mode === "shapes") {
			mainCtx!.drawImage(selectionRef.current!, 0, 0);
			selectCtx!.clearRect(
				0,
				0,
				selectionRef.current!.width,
				selectionRef.current!.height
			);
		}
	};

	// Also need to apply the changes of the DPI to the interactive canvas layer.
	useEffect(() => {
		if (!selectionRef.current) return;
		const ctx = selectionRef.current.getContext("2d");

		if (!ctx) return;

		const { width, height } = selectionRef.current.getBoundingClientRect();

		selectionRef.current.width = width * dpi;
		selectionRef.current.height = height * dpi;

		ctx.scale(dpi, dpi);

		return () => {
			ctx.scale(1 / dpi, 1 / dpi);
		};
	}, [dpi]);

	return (
		<canvas
			ref={selectionRef}
			className="canvas selection"
			style={{
				width: `${width}px`,
				height: `${height}px`,
				transform: `translate(
        ${xPosition}px,
        ${yPosition}px
        ) scale(${scale})`
			}}
			onMouseDown={onMouseDown}
			onMouseMove={onMouseMove}
			onMouseUp={onMouseUp}
			{...rest}
		/>
	);
};

export default InteractiveCanvasLayer;
