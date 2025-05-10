// Lib
import { useCallback, useState, forwardRef } from "react";
import clsx from "clsx";

// Types
import type { CSSProperties, ReactNode } from "react";
import type { ResizePosition } from "@/types";

// Components
import ResizeHandle from "@/components/ResizeHandle/ResizeHandle";

// Styles
import "./ResizeGrid.styles.css";

type ResizeGridProps = Readonly<{
	children: ReactNode;
	x: number;
	y: number;
	width: number;
	height: number;
	focused: boolean;
	zIndex?: number;
	elementId: string;
}>;

const ResizeGrid = forwardRef<HTMLDivElement, ResizeGridProps>(
	function ResizeGrid(
		{ x, y, width, height, focused, zIndex, elementId, children },
		ref
	) {
		const [resizing, setResizing] = useState<ResizePosition | null>(null);
		const OFFSET = 6;
		const resizeHandles = [];
		const styles: CSSProperties = {
			left: !isNaN(x) ? x : "auto",
			top: !isNaN(y) ? y : "auto",
			width: width,
			height: height,
			outlineOffset: OFFSET,
			zIndex: zIndex ?? 99
		};
		const cn = clsx("grid", { focused });

		const onResizeStart = (pos?: ResizePosition) => {
			if (!pos) throw new Error("Cannot resize without a position.");
			setResizing(pos);
		};

		// using useCallback as this function is used in an effect in the ResizeHandle component
		const onResizeEnd = useCallback(() => {
			setResizing(null);
		}, [setResizing]);

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
						elementId={elementId}
						onResizeEnd={onResizeEnd}
					/>
				);
			}
		}

		return (
			<div
				ref={ref}
				tabIndex={0}
				className={cn}
				data-testid="resize-grid"
				data-resizing={resizing}
				style={styles}
			>
				{focused && resizeHandles}
				{children}
			</div>
		);
	}
);

export default ResizeGrid;
