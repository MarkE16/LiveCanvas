// Lib
import { MODES } from "@/state/store";
import { memo } from "react";
import useStore from "@/state/hooks/useStore";

// Types
import type { ReactNode } from "react";

// Styles
import "./LeftToolbar.styles.css";

// Components
import ToolbarButton from "@/components/ToolbarButton/ToolbarButton";

const MemoizedToolbarButton = memo(ToolbarButton);

function LeftToolbar(): ReactNode {
	const currentMode = useStore((state) => state.mode);
	const renderedModes = MODES.map((mode) => {
		return (
			<MemoizedToolbarButton
				key={mode.name}
				active={currentMode === mode.name}
				{...mode}
			/>
		);
	});

	return (
		<aside
			data-testid="left-toolbar-container"
			id="left-toolbar-container"
		>
			{renderedModes}
		</aside>
	);
}

export default LeftToolbar;
