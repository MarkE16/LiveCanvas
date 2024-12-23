// Lib
import { forwardRef, useState, useCallback } from "react";

// Types
import type { PropsWithChildren, CSSProperties } from "react";
import type { ResizePosition } from "../../types";

// Components
import ResizeHandle from "../ResizeHandle/ResizeHandle";

type ResizeGridProps = PropsWithChildren & {
	x: number;
	y: number;
	width: number;
	height: number;
	focused: boolean;
};

const ResizeGrid = forwardRef<HTMLDivElement, ResizeGridProps>(
	function ResizeGrid({ x, y, width, height, focused, children }, ref) {
		const [positionResizing, setPositionResizing] =
			useState<ResizePosition | null>(null);
		const OFFSET = 6;
		const resizeHandles = [];
		const styles: CSSProperties = {
			left: !isNaN(x) ? x : "auto",
			top: !isNaN(y) ? y : "auto",
			width: width,
			height: height,
			position: "absolute",
			outlineOffset: OFFSET,
			outline: focused ? "1px solid #d1836a" : "none",
			zIndex: 99
		};

		const onResizeStart = (pos?: ResizePosition) => {
			if (!pos) throw new Error("Cannot resize without a position.");
			setPositionResizing(pos);
		};

		// using useCallback as this function is used in an effect in the ResizeHandle component
		const onResizeEnd = useCallback(() => {
			setPositionResizing(null);
		}, []);

		// Create the resize handles.
		// Visually, the grid is divided into a 3x3 grid.
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				if (i === 1 && j === 1) continue;

				let placement: ResizePosition | undefined = undefined;

				switch (i) {
					case 0: {
						switch (j) {
							case 0:
								placement = "nw";
								break;
							case 1:
								placement = "n";
								break;
							case 2:
								placement = "ne";
								break;
						}
						break;
					}

					case 1: {
						switch (j) {
							case 0:
								placement = "w";
								break;
							case 2:
								placement = "e";
								break;
						}
						break;
					}

					case 2: {
						switch (j) {
							case 0:
								placement = "sw";
								break;
							case 1:
								placement = "s";
								break;
							case 2:
								placement = "se";
								break;
						}
						break;
					}
				}

				if (!placement) throw new Error("Invalid placement");

				resizeHandles.push(
					<ResizeHandle
						key={`${i}-${j}`}
						placement={placement}
						resizeOffset={OFFSET}
						onResizeStart={() => {
							onResizeStart(placement);
						}}
						onResizeEnd={onResizeEnd}
					/>
				);
			}
		}

		return (
			<div
				ref={ref}
				style={styles}
				data-resizing={positionResizing}
			>
				{focused && resizeHandles}
				{children}
			</div>
		);
	}
);

export default ResizeGrid;
