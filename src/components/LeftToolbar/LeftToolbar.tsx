// Lib
import { MODES } from "@/state/store";
import { memo } from "react";
import useStore from "@/state/hooks/useStore";
import { useShallow } from "zustand/react/shallow";
import cn from "@/lib/tailwind-utils";

// Types
import type { ReactNode } from "react";

// Components
import ToolbarButton from "@/components/ToolbarButton/ToolbarButton";

// Icons
import Rotate from "../icons/Rotate/Rotate";
import Tooltip from "../Tooltip/Tooltip";
import { redrawCanvas } from "@/lib/utils";

const MemoizedToolbarButton = memo(ToolbarButton);

function LeftToolbar(): ReactNode {
	const { currentMode, setPosition, setZoom } = useStore(
		useShallow((state) => ({
			currentMode: state.mode,
			setPosition: state.setPosition,
			setZoom: state.setZoom
		}))
	);
	const renderedModes = MODES.map((mode) => {
		return (
			<MemoizedToolbarButton
				key={mode.name}
				active={currentMode === mode.name}
				{...mode}
			/>
		);
	});

	function resetCanvasView() {
		setPosition({ x: 0, y: 0 });
		setZoom(1);
		redrawCanvas();
	}

	return (
		<aside
			data-testid="left-toolbar-container"
			id="left-toolbar-container"
			className="flex flex-col w-[50px] h-full overflow-auto bg-[#242424] border border-[#383737] justify-between"
		>
			<div>{renderedModes}</div>

			{/*
			TODO: This button is a temporary fallback for resetting the canvas for when it goes off screen. The better solution
  		is to prevent the canvas from going off screen, but the math is currently unknown for how to do that at the moment. This
   	is a temporary solution.
    */}
			<Tooltip
				text="Reset Canvas View"
				position="right"
			>
				<button
					className={cn(
						"p-[0.2em] text-2xl w-full text-center cursor-pointer transition-colors duration-100",
						"inline-flex justify-center"
					)}
					onClick={resetCanvasView}
				>
					<Rotate />
				</button>
			</Tooltip>
		</aside>
	);
}

export default LeftToolbar;
