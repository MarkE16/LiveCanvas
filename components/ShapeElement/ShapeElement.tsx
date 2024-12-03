// Lib
import { useEffect, useRef } from "react";
import useCanvasElements from "../../state/hooks/useCanvasElements";

// Types
import type { Shape, Coordinates } from "../../types";
import type { FC, CSSProperties } from "react";

type ShapeElementProps = {
	shape: Shape;
	x: number;
	y: number;
	focused: boolean;
	width?: number;
	height?: number;
	id: string;
};

const ShapeElement: FC<ShapeElementProps> = ({
	shape,
	width,
	height,
	focused,
	x,
	y,
	id
}) => {
	const ref = useRef<SVGSVGElement>(null);
	const clientPosition = useRef<Coordinates>({ x: 0, y: 0 });

	const { focusElement, unfocusElement, changeElementProperties } =
		useCanvasElements();
	width = width || 100;
	height = height || 100;

	const styles: CSSProperties = {
		position: "absolute",
		left: `${x}px`,
		top: `${y}px`,
		outline: focused ? "2px solid #d1836a" : "none",
		outlineOffset: "5px",
		zIndex: 1,
		cursor: "pointer"
	};

	useEffect(() => {
		const element = ref.current;
		if (!element) return;
		const handleFocus = () => focusElement(id);
		const handleUnfocus = () => unfocusElement(id);

		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") {
				handleUnfocus();
			}
		}

		function handleMouseDown(e: MouseEvent) {
			clientPosition.current = { x: e.clientX, y: e.clientY };
		}

		function handleMouseMove(e: MouseEvent) {
			if (e.buttons !== 1 || !element) return;

			const deltaX = e.clientX - clientPosition.current.x;
			const deltaY = e.clientY - clientPosition.current.y;

			changeElementProperties(id, (state) => ({
				...state,
				x: state.x + deltaX,
				y: state.y + deltaY
			}));

			clientPosition.current = { x: e.clientX, y: e.clientY };
		}

		element.addEventListener("mousedown", handleMouseDown);
		element.addEventListener("mousemove", handleMouseMove);
		element.addEventListener("keydown", handleKeyDown);
		element.addEventListener("focusin", handleFocus);
		element.addEventListener("focusout", handleUnfocus);

		return () => {
			element.removeEventListener("mousedown", handleMouseDown);
			element.removeEventListener("mousemove", handleMouseMove);
			element.removeEventListener("keydown", handleKeyDown);
			element.removeEventListener("focusin", handleFocus);
			element.removeEventListener("focusout", handleUnfocus);
		};
	}, [unfocusElement, id, focusElement, changeElementProperties]);

	if (shape === "triangle") {
		const triangle = (
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

		return triangle;
	}

	return (
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
};

export default ShapeElement;
