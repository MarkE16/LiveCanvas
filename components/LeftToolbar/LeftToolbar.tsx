// Lib
import { MODES } from "../../state/store";
import { memo } from "react";
import useStore from "../../state/hooks/useStore";

// Types
import type { FC } from "react";

// Styles
import "./LeftToolbar.styles.css";

// Components
import ToolbarButton from "../ToolbarButton/ToolbarButton";

const MemoizedToolbarButton = memo(ToolbarButton);

const LeftToolbar: FC = () => {
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
};

export default LeftToolbar;
