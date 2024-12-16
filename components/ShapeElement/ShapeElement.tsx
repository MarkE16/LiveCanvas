// Lib
import { useAppSelector } from "../../state/hooks/reduxHooks";
import { useEffect, useRef } from "react";
import useCanvasElements from "../../state/hooks/useCanvasElements";

// Types
import type { Coordinates, ResizePosition, CanvasElement } from "../../types";
import type { FC, CSSProperties, ReactElement, RefObject } from "react";

// Components
import ResizeGrid from "../ResizeGrid/ResizeGrid";

type ShapeElementProps = CanvasElement & {
	canvasSpaceReference: RefObject<HTMLDivElement>;
	isSelecting: boolean;
};

const ShapeElement: FC<ShapeElementProps> = ({
	canvasSpaceReference,
	shape,
	width,
	height,
	fill,
	border,
	focused,
	isSelecting,
	x,
	y,
	id,
	layerId
}) => {
	const layers = useAppSelector((state) => state.canvas.layers);
	const ref = useRef<HTMLDivElement>(null);
	const startPos = useRef<Coordinates>({ x: 0, y: 0 });
	const clientPosition = useRef<Coordinates>({ x: 0, y: 0 });
	const activeLayer = layers.find((layer) => layer.active);

	if (!activeLayer) {
		throw new Error("No active layer. This is a bug that should be fixed.");
	}

	let jsx: ReactElement;

	const {
		focusElement,
		unfocusElement,
		changeElementProperties,
		deleteElement
	} = useCanvasElements();
	width = width || 100;
	height = height || 100;

	const styles: CSSProperties = {
		position: "absolute",
		outline: "none",
		zIndex: activeLayer.id === layerId ? layers.length + 1 : 0
	};

	useEffect(() => {
		const element = ref.current;
		const canvasSpace = canvasSpaceReference.current;
		if (!element || !canvasSpace) return;

		const handleFocus = () => focusElement(id);
		const handleUnfocus = () => unfocusElement(id);

		const isInsideElement = (e: MouseEvent) =>
			e.target === element || element.contains(e.target as Node);

		function handleKeyDown(e: KeyboardEvent) {
			// Handle Focus
			if (e.key === "Escape") {
				handleUnfocus();
			}

			// Handle Delete
			if ((e.key === "Delete" || e.key === "Backspace") && focused) {
				deleteElement(id);
			}
		}

		function handleMouseDown(e: MouseEvent) {
			if (!canvasSpace) return;

			if (!isInsideElement(e)) {
				handleUnfocus();
				return;
			}

			const { left, top } = canvasSpace.getBoundingClientRect();
			const startX = e.clientX - left;
			const startY = e.clientY - top;

			startPos.current = { x: startX, y: startY };
			clientPosition.current = { x: e.clientX, y: e.clientY };
		}

		function handleMouseMove(e: MouseEvent) {
			e.stopPropagation();
			if (
				e.buttons !== 1 ||
				!element ||
				!focused ||
				isSelecting ||
				!canvasSpace
			)
				return;

			const deltaX = e.clientX - clientPosition.current.x;
			const deltaY = e.clientY - clientPosition.current.y;

			const resizePos = element.getAttribute(
				"data-resizing"
			) as ResizePosition | null;

			if (resizePos !== null) {
				changeElementProperties(id, (state) => {
					switch (resizePos) {
						case "nw":
						case "ne":
						case "sw":
						case "se":
							return {
								...state,
								width: Math.abs(e.clientX - startPos.current.x),
								height: Math.abs(e.clientY - startPos.current.y),
								x: Math.min(startPos.current.x, e.clientX),
								y: Math.min(startPos.current.y, e.clientY)
							};

						case "n":
						case "s":
							return {
								...state,
								height: Math.abs(e.clientY - startPos.current.y),
								y: Math.min(startPos.current.y, e.clientY)
							};

						case "w":
						case "e":
							return {
								...state,
								width: Math.abs(e.clientX - startPos.current.x),
								x: Math.min(startPos.current.x, e.clientX)
							};

						default:
							throw new Error(
								"Cannot properly resize element: Invalid resize position."
							);
					}
				});
			} else {
				changeElementProperties(id, (state) => {
					let { x, y } = state;
					const { left, top } = canvasSpace.getBoundingClientRect();

					if (isNaN(x)) {
						x = e.clientX - left;
					}

					if (isNaN(y)) {
						y = e.clientY - top;
					}

					return {
						...state,
						x: x + deltaX,
						y: y + deltaY
					};
				});
			}

			clientPosition.current = { x: e.clientX, y: e.clientY };
		}

		// Added to the document to allow the user to drag the element even when the mouse is outside the element.
		document.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("keydown", handleKeyDown);
		element.addEventListener("mousedown", handleFocus);

		return () => {
			document.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("keydown", handleKeyDown);
			element.removeEventListener("mousedown", handleFocus);
		};
	}, [
		unfocusElement,
		id,
		focusElement,
		changeElementProperties,
		deleteElement,
		focused,
		isSelecting,
		canvasSpaceReference
	]);

	if (shape === "triangle") {
		jsx = <polygon points="50,0 100,100 0,100" />;
	} else {
		jsx =
			shape === "circle" ? (
				<circle
					cx="50"
					cy="50"
					r="50"
				/>
			) : (
				<rect
					x="0"
					y="0"
					width="100"
					height="100"
				/>
			);
	}

	return (
		<ResizeGrid
			ref={ref}
			x={x}
			y={y}
			width={width}
			height={height}
			focused={focused}
		>
			<svg
				className="element"
				width={width}
				height={height}
				style={styles}
				id={id}
				fill={fill}
				stroke={border}
				// Below is so that the size of the SVG element is the same as the size of the ResizeGrid.
				preserveAspectRatio="none"
				viewBox="0 0 100 100"
				data-x={x}
				data-y={y}
				data-shape={shape}
				data-layerid={layerId}
				data-width={width}
				data-height={height}
				data-fill={fill}
				data-border={border}
			>
				{jsx}
			</svg>
		</ResizeGrid>
	);
};

export default ShapeElement;