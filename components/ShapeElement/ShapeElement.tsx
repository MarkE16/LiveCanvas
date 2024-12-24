// Lib
import { useAppSelector } from "../../state/hooks/reduxHooks";
import { useEffect, useRef } from "react";
import useCanvasElements from "../../state/hooks/useCanvasElements";

// Types
import type { Coordinates, ResizePosition, CanvasElement } from "../../types";
import type { FC, ReactElement, RefObject } from "react";

// Components
import ResizeGrid from "../ResizeGrid/ResizeGrid";

type ShapeElementProps = CanvasElement & {
	canvasSpaceReference: RefObject<HTMLDivElement>;
	isSelecting: RefObject<boolean>;
};

const ShapeElement: FC<ShapeElementProps> = ({
	canvasSpaceReference,
	shape,
	width,
	height,
	fill,
	border,
	focused,
	x,
	y,
	id,
	layerId,
	isSelecting
}) => {
	const layers = useAppSelector((state) => state.canvas.layers);
	const ref = useRef<HTMLDivElement>(null);
	const startPos = useRef<Coordinates>({ x: 0, y: 0 });
	const clientPosition = useRef<Coordinates>({ x: 0, y: 0 });
	const activeLayer = layers.find((layer) => layer.active);
	let sLeft = NaN,
		sTop = NaN,
		sWidth = NaN,
		sHeight = NaN,
		sX = NaN,
		sY = NaN;

	if (canvasSpaceReference.current) {
		const {
			left: l,
			top: t,
			width: w,
			height: h,
			x,
			y
		} = canvasSpaceReference.current.getBoundingClientRect();

		sLeft = l;
		sTop = t;
		sWidth = w;
		sHeight = h;
		sX = x;
		sY = y;
	}

	if (!activeLayer) {
		throw new Error("No active layer. This is a bug that should be fixed.");
	}

	let jsx: ReactElement;

	const {
		focusElement,
		unfocusElement,
		changeElementProperties,
		deleteElement,
		updateMovingState
	} = useCanvasElements();

	useEffect(() => {
		const element = ref.current;
		const canvasSpace = canvasSpaceReference.current;
		if (!element || !canvasSpace) return;

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

			if (e.key === "a" && e.ctrlKey) {
				focusElement(id);
			}
		}

		function handleMouseDown(e: MouseEvent) {
			e.stopPropagation();
			if (!canvasSpace) return;

			// If the user clicks outside the element, unfocus it.
			// However, if the user is holding the ctrl key, do not unfocus the element.
			// This is so that the user can select multiple elements.
			const insideElement = isInsideElement(e);

			if (!insideElement && !e.ctrlKey) {
				handleUnfocus();
				return;
			}

			if (insideElement) {
				focusElement(id);
			}

			startPos.current = { x: e.clientX, y: e.clientY };
			clientPosition.current = { x: e.clientX, y: e.clientY };
			updateMovingState(true);
		}

		function handleMouseMove(e: MouseEvent) {
			e.stopPropagation();
			if (
				e.buttons !== 1 ||
				!element ||
				!focused ||
				isSelecting.current ||
				!canvasSpace
			)
				return;

			const deltaX = e.clientX - clientPosition.current.x;
			const deltaY = e.clientY - clientPosition.current.y;

			const resizePos = element.getAttribute(
				"data-resizing"
			) as ResizePosition | null;

			const { left, top } = canvasSpace.getBoundingClientRect();
			if (resizePos !== null) {
				const pointerX = e.clientX - left;
				const pointerY = e.clientY - top;
				changeElementProperties((state) => {
					let newState = { ...state };
					const minSize = 18;

					// Calculate new dimensions and positions
					// Note: The `if` conditions are to prevent the element from being resized
					// when the cursor is past resizing limits. This is to that when the cursor
					// is back into resizing limits, the element can be resized again.
					// This is supposed to ensure that the element resize handle "follows"
					// the cursor even when the cursor is outside the element.
					switch (resizePos) {
						case "nw": {
							let newX =
								state.x +
								(state.width - Math.max(minSize, state.width - deltaX));
							let newY =
								state.y +
								(state.height - Math.max(minSize, state.height - deltaY));
							let newWidth = Math.max(minSize, state.width - deltaX);
							let newHeight = Math.max(minSize, state.height - deltaY);

							if (pointerX > newX + newWidth - minSize) {
								newWidth = minSize;
								newX = state.x + state.width - minSize;
							}

							if (pointerY > newY + newHeight - minSize) {
								newHeight = minSize;
								newY = state.y + state.height - minSize;
							}

							newState = {
								...state,
								width: newWidth,
								height: newHeight,
								x: newX,
								y: newY
							};
							break;
						}

						case "ne": {
							let newY =
								state.y +
								(state.height - Math.max(minSize, state.height - deltaY));
							let newHeight = Math.max(minSize, state.height - deltaY);
							let newWidth = Math.max(minSize, state.width + deltaX);

							if (pointerX < state.x + minSize) {
								newWidth = minSize;
							}

							if (pointerY > newY + newHeight - minSize) {
								newHeight = minSize;
								newY = state.y + state.height - minSize;
							}

							newState = {
								...state,
								width: newWidth,
								height: newHeight,
								y: newY
							};
							break;
						}

						case "sw": {
							let newX =
								state.x +
								(state.width - Math.max(minSize, state.width - deltaX));
							let newWidth = Math.max(minSize, state.width - deltaX);
							let newHeight = Math.max(minSize, state.height + deltaY);

							if (pointerX > newX + newWidth - minSize) {
								newWidth = minSize;
								newX = state.x + state.width - minSize;
							}

							if (pointerY < state.y + minSize) {
								newHeight = minSize;
							}

							newState = {
								...state,
								width: newWidth,
								height: newHeight,
								x: newX
							};
							break;
						}

						case "se": {
							let newWidth = Math.max(minSize, state.width + deltaX);
							let newHeight = Math.max(minSize, state.height + deltaY);

							if (pointerX < state.x + minSize) {
								newWidth = minSize;
							}

							if (pointerY < state.y + minSize) {
								newHeight = minSize;
							}

							newState = {
								...state,
								width: newWidth,
								height: newHeight
							};
							break;
						}

						case "n": {
							let newY =
								state.y +
								(state.height - Math.max(minSize, state.height - deltaY));
							let newHeight = Math.max(minSize, state.height - deltaY);

							if (pointerY > newY + newHeight - minSize) {
								newHeight = minSize;
								newY = state.y + state.height - minSize;
							}
							newState = {
								...state,
								height: newHeight,
								y: newY
							};
							break;
						}

						case "s": {
							let newHeight = Math.max(minSize, state.height + deltaY);

							if (pointerY < state.y + minSize) {
								newHeight = minSize;
							}
							newState = {
								...state,
								height: newHeight
							};
							break;
						}

						case "w": {
							let newX =
								state.x +
								(state.width - Math.max(minSize, state.width - deltaX));
							let newWidth = Math.max(minSize, state.width - deltaX);

							if (pointerX > state.x + newWidth - minSize) {
								newWidth = minSize;
								newX = state.x + state.width - minSize;
							}
							newState = {
								...state,
								width: newWidth,
								x: newX
							};
							break;
						}

						case "e": {
							let newWidth = Math.max(minSize, state.width + deltaX);

							if (pointerX < state.x + minSize) {
								newWidth = minSize;
							}
							newState = {
								...state,
								width: newWidth
							};
							break;
						}

						default:
							throw new Error(
								"Cannot properly resize element: Invalid resize position."
							);
					}

					return newState;
				}, id);
			} else {
				changeElementProperties((state) => {
					let { x, y } = state;
					// We subtract each coordinate by half of the width and height
					// to get the cursor to appear in the middle of the element
					if (isNaN(x)) {
						x = clientPosition.current.x - left - state.width / 2;
					}

					if (isNaN(y)) {
						y = clientPosition.current.y - top - state.height / 2;
					}

					return {
						...state,
						x: x + deltaX,
						y: y + deltaY
					};
				}, id);
			}

			clientPosition.current = { x: e.clientX, y: e.clientY };
		}

		function onMouseUp() {
			updateMovingState(false);
		}

		// Added to the document to allow the user to drag the element even when the mouse is outside the element.
		document.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("mouseup", onMouseUp);

		return () => {
			document.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("mouseup", onMouseUp);
		};
	}, [
		unfocusElement,
		id,
		focusElement,
		changeElementProperties,
		deleteElement,
		focused,
		isSelecting,
		canvasSpaceReference,
		updateMovingState
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
			zIndex={activeLayer.id === layerId ? layers.length + 1 : 1}
		>
			<svg
				className="element"
				width="100%"
				height="100%"
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
				data-focused={focused}
				data-canvas-space-left={sLeft}
				data-canvas-space-top={sTop}
				data-canvas-space-x={sX}
				data-canvas-space-y={sY}
				data-canvas-space-width={sWidth}
				data-canvas-space-height={sHeight}
			>
				{jsx}
			</svg>
		</ResizeGrid>
	);
};

export default ShapeElement;
