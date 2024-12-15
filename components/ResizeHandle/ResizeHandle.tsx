// Lib
import { useEffect } from "react";

// Types
import type { FC, CSSProperties, MouseEvent } from "react";
import type { ResizePosition } from "../../types";

type ResizeHandleProps = {
	placement: ResizePosition;
	resizeOffset: number;
	onResizeStart?: () => void;
	onResizeEnd?: () => void;
};

const ResizeHandle: FC<ResizeHandleProps> = ({
	placement,
	resizeOffset,
	onResizeStart,
	onResizeEnd
}) => {
	const WIDTH = 10;
	const HEIGHT = 10;

	const styles: CSSProperties = {
		position: "absolute",
		background: "white",
		border: "1px solid black",
		zIndex: 101,
		width: `${WIDTH}px`,
		height: `${HEIGHT}px`,
		outline: "none",
		cursor: `${placement}-resize`
	};

	const HALF_WIDTH = WIDTH / 2;
	const HALF_HEIGHT = HEIGHT / 2;
	switch (placement) {
		case "nw": {
			styles.left = -HALF_WIDTH - resizeOffset + "px";
			styles.top = -HALF_HEIGHT - resizeOffset + "px";
			break;
		}
		case "n": {
			styles.left = "50%";
			styles.transform = "translateX(-50%)";
			styles.top = -HALF_HEIGHT - resizeOffset + "px";
			break;
		}

		case "ne": {
			styles.right = -HALF_WIDTH - resizeOffset + "px";
			styles.top = -HALF_HEIGHT - resizeOffset + "px";
			break;
		}

		case "w": {
			styles.left = -HALF_WIDTH - resizeOffset + "px";
			styles.top = "50%";
			styles.transform = "translateY(-50%)";
			break;
		}

		case "e": {
			styles.right = -HALF_WIDTH - resizeOffset + "px";
			styles.top = "50%";
			styles.transform = "translateY(-50%)";
			break;
		}

		case "sw": {
			styles.left = -HALF_WIDTH - resizeOffset + "px";
			styles.bottom = -HALF_HEIGHT - resizeOffset + "px";
			break;
		}

		case "s": {
			styles.left = "50%";
			styles.transform = "translateX(-50%)";
			styles.bottom = -HALF_HEIGHT - resizeOffset + "px";
			break;
		}

		case "se": {
			styles.right = -HALF_WIDTH - resizeOffset + "px";
			styles.bottom = -HALF_HEIGHT - resizeOffset + "px";
			break;
		}

		default: {
			break;
		}
	}

	const onMouseDown = (e: MouseEvent) => {
		e.stopPropagation(); //This is solely to prevent the selection grid to not fire the `focusout` event when attempting to resize.

		onResizeStart && onResizeStart();
	};

	// We add this event listener to the document to ensure that the resize ends even if the user releases the mouse outside the resize handle.
	useEffect(() => {
		const onMouseUp = () => {
			onResizeEnd && onResizeEnd();
		};

		document.addEventListener("mouseup", onMouseUp);

		return () => {
			document.removeEventListener("mouseup", onMouseUp);
		};
	}, [onResizeEnd]);

	return (
		<svg
			width="100%"
			height="100%"
			style={styles}
			onMouseDown={onMouseDown}
		>
			<rect
				x={0}
				y={0}
				width={10}
				height={10}
				fill="#d1836a"
			/>
		</svg>
	);
};

export default ResizeHandle;
