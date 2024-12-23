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
	let left = NaN,
		top = NaN;

	if (canvasSpaceReference.current) {
		const { left: l, top: t } =
			canvasSpaceReference.current.getBoundingClientRect();

		left = l;
		top = t;
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

	const styles: CSSProperties = {
		position: "absolute",
		outline: "none",
		cursor: isSelecting.current ? "default" : "move",
		zIndex: activeLayer.id === layerId ? layers.length + 1 : 0
	};

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
				if (e.ctrlKey) {
					if (focused) {
						unfocusElement(id);
						return;
					}
				}

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

			if (resizePos !== null) {
				changeElementProperties((state) => {
					switch (resizePos) {
						case "nw":
							return {
								...state,
								width: state.width - deltaX,
								height: state.height - deltaY,
								x: state.x + deltaX,
								y: state.y + deltaY
							};
						case "ne":
							return {
								...state,
								width: state.width + deltaX,
								height: state.height - deltaY,
								y: state.y + deltaY
							};
						case "sw":
							return {
								...state,
								width: state.width - deltaX,
								height: state.height + deltaY,
								x: state.x + deltaX
							};
						case "se":
							return {
								...state,
								width: state.width + deltaX,
								height: state.height + deltaY
							};

						case "n":
							return {
								...state,
								height: state.height - deltaY,
								y: state.y + deltaY
							};
						case "s":
							return {
								...state,
								height: state.height + deltaY
							};

						case "w":
							return {
								...state,
								width: state.width - deltaX,
								x: state.x + deltaX
							};
						case "e":
							return {
								...state,
								width: state.width + deltaX
							};

						default:
							throw new Error(
								"Cannot properly resize element: Invalid resize position."
							);
					}
				}, id);
			} else {
				changeElementProperties((state) => {
					let { x, y } = state;
					const { left, top } = canvasSpace.getBoundingClientRect();

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

		function onWindowResize(e: Event) {
			// Move the element along with the window when the window is resized.

			const element = ref.current;

			if (!element || !canvasSpace) return;

			const { x, y } = element.getBoundingClientRect();

			const { left, top } = canvasSpace.getBoundingClientRect();

			const deltaX = x - left;
			const deltaY = y - top;

			changeElementProperties((state) => {
				return {
					...state,
					x: state.x + deltaX,
					y: state.y + deltaY
				};
			}, id);
		}

		// Added to the document to allow the user to drag the element even when the mouse is outside the element.
		document.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("mouseup", onMouseUp);
		window.addEventListener("resize", onWindowResize);

		return () => {
			document.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("mouseup", onMouseUp);
			window.removeEventListener("resize", onWindowResize);
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
		>
			<svg
				className="element"
				width="100%"
				height="100%"
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
				data-focused={focused}
				data-canvas-space-left={left}
				data-canvas-space-top={top}
			>
				{jsx}
			</svg>
		</ResizeGrid>
	);
};

export default ShapeElement;
