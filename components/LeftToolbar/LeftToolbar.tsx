// Lib
import { useAppSelector } from "../../state/hooks/reduxHooks";
import { MODES } from "../../state/store";
import { memo } from "react";

// Types
import type { FC } from "react";

// Styles
import "./LeftToolbar.styles.css";

// Components
import ToolbarButton from "../ToolbarButton/ToolbarButton";

const MemoizedToolbarButton = memo(ToolbarButton);

const LeftToolbar: FC = () => {
	const currentMode = useAppSelector((state) => state.canvas.mode);
	const renderedModes = MODES.map((mode) => (
		<MemoizedToolbarButton
			key={mode.name}
			active={currentMode === mode.name}
			{...mode}
		/>
	));

	return (
		<aside
			data-testid="left-toolbar-container"
			id="left-toolbar-container"
		>
			{renderedModes}
		</aside>
	);
};

export default LeftToolbar;
