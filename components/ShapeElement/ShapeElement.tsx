// Lib
import { useEffect, useRef } from "react";
import useCanvasElements from "../../state/hooks/useCanvasElements";
import useLayerReferences from "../../state/hooks/useLayerReferences";

// Types
import type { Shape, Coordinates } from "../../types";
import type { FC, CSSProperties, ReactElement } from "react";

type ShapeElementProps = {
	shape: Shape;
	x: number;
	y: number;
	focused: boolean;
	isSelecting: boolean;
	width?: number;
	height?: number;
	layerId: string;
	id: string;
};

const ShapeElement: FC<ShapeElementProps> = ({
	shape,
	width,
	height,
	focused,
	isSelecting,
	x,
	y,
	id,
	layerId
}) => {
	const references = useLayerReferences();
	const isResizing = useRef<boolean>(false);
	const resizeEnd = useRef<ReturnType<typeof setTimeout> | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const ref = useRef<SVGSVGElement>(null);
	const clientPosition = useRef<Coordinates>({ x: 0, y: 0 });
	const activeLayer = references.find((reference) => reference.id === layerId);
	let jsx: ReactElement;

	const {
		focusElement,
		unfocusElement,
		changeElementProperties,
		deleteElement,
		elements
	} = useCanvasElements();
	const interactable = elements.every((element) => !element.focused);
	width = width || 100;
	height = height || 100;

	const styles: CSSProperties = {
		position: "relative",
		outline: "none",
		width: "100%",
		zIndex: activeLayer?.style.zIndex,
		height: "100%"
	};

	useEffect(() => {
		const element = ref.current;
		const container = containerRef.current;
		if (!element || !container) return;

		const handleFocus = () => focusElement(id);
		const handleUnfocus = () => unfocusElement(id);

		const isInsideElement = (e: MouseEvent) =>
			e.target === element || element.contains(e.target as Node);

		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") {
				handleUnfocus();
			}
		}

		function handleMouseDown(e: MouseEvent) {
			if (!isInsideElement(e)) return;
			clientPosition.current = { x: e.clientX, y: e.clientY };
		}

		function handleMouseMove(e: MouseEvent) {
			e.stopPropagation();
			if (
				e.buttons !== 1 ||
				!element ||
				!focused ||
				isSelecting ||
				isResizing.current
			)
				return;

			const deltaX = e.clientX - clientPosition.current.x;
			const deltaY = e.clientY - clientPosition.current.y;

			changeElementProperties(id, (state) => ({
				...state,
				x: state.x + deltaX,
				y: state.y + deltaY
			}));

			clientPosition.current = { x: e.clientX, y: e.clientY };
		}

		function handleDelete(e: KeyboardEvent) {
			if ((e.key === "Delete" || e.key === "Backspace") && focused) {
				deleteElement(id);
			}
		}

		function onResize() {
			if (resizeEnd.current) {
				clearTimeout(resizeEnd.current);
			}

			resizeEnd.current = setTimeout(() => {
				isResizing.current = false;
			}, 100);

			isResizing.current = true;
		}

		// Added to the document to allow the user to drag the element even when the mouse is outside the element.
		document.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("mousemove", handleMouseMove);
		element.addEventListener("keydown", handleKeyDown);
		element.addEventListener("focusin", handleFocus);
		element.addEventListener("focusout", handleUnfocus);

		window.addEventListener("keydown", handleDelete);
		container.addEventListener("resize", onResize);

		return () => {
			document.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("mousemove", handleMouseMove);
			element.removeEventListener("keydown", handleKeyDown);
			element.removeEventListener("focusin", handleFocus);
			element.removeEventListener("focusout", handleUnfocus);
			window.removeEventListener("keydown", handleDelete);
			container.removeEventListener("resize", onResize);
		};
	}, [
		unfocusElement,
		id,
		focusElement,
		changeElementProperties,
		deleteElement,
		focused,
		isSelecting
	]);

	if (shape === "triangle") {
		jsx = (
			<svg
				ref={ref}
				tabIndex={0} // Allows the element to be focused.
				style={styles}
				width={width}
				height={height}
				viewBox="0 0 100 100"
				// Makes the shape responsive as in allowing it to be stretched.
				// If you want to maintain the aspect ratio, simply remove this prop.
				preserveAspectRatio="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<polygon points="50,0 100,100 0,100" />
			</svg>
		);
	} else {
		jsx = (
			<svg
				ref={ref}
				tabIndex={0}
				style={styles}
				width={width}
				height={height}
				viewBox="0 0 100 100"
				preserveAspectRatio="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				{shape === "circle" ? (
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
				)}
			</svg>
		);
	}

	return (
		<div
			ref={containerRef}
			style={{
				left: x,
				top: y,
				position: "absolute",
				outlineOffset: "5px",
				outline: focused ? "1px solid #d1836a" : "none",
				pointerEvents: focused || interactable ? "auto" : "none",
				zIndex: 100,
				resize: "both",
				overflow: "auto",
				scrollbarWidth: "none"
			}}
			id={id}
		>
			{jsx}
		</div>
	);
};

export default ShapeElement;
