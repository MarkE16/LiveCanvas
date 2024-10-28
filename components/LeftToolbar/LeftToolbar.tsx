// Lib
import { useCallback, memo } from "react";
import * as UTILS from "../../utils";
import { useAppSelector, useAppDispatch } from "../../state/hooks/reduxHooks";
import { MODES } from "../../state/store";
import { Tooltip } from "@mui/material";

// Redux Actions
import { changeMode } from "../../state/slices/canvasSlice";

// Types
import type { Mode } from "../../types";
import type { FC, MouseEvent, MouseEventHandler } from "react";

// Styles
import "./LeftToolbar.styles.css";
import useHistory from "../../state/hooks/useHistory";

type ToolbarButtonProps = {
	icon: string;
	name: Mode;
	shortcut: string;
};

const ToolbarButton: FC<ToolbarButtonProps> = ({ icon, name, shortcut }) => {
	const mode = useAppSelector((state) => state.canvas.mode);
	const dispatch = useAppDispatch();
	const { undo, undoAction, redo, redoAction } = useHistory();

	const isActive = mode === name;

	const onClick: MouseEventHandler<HTMLButtonElement> = (e: MouseEvent) => {
		// e.preventDefault();
		e.stopPropagation();

		if (name === "undo") {
			undoAction();
		} else if (name === "redo") {
			redoAction();
		} else {
			dispatch(changeMode(name));
		}
	};

	const tooltip =
		UTILS.capitalize(name).replace("_", " ") + ` (${shortcut.toUpperCase()})`;

	return (
		<Tooltip
			title={tooltip}
			arrow
			placement="right"
		>
			<button
				className={`toolbar-option ${isActive ? "active" : ""}`}
				onClick={onClick}
				disabled={
					name === "undo"
						? !undo.length
						: name === "redo"
							? !redo.length
							: false
				}
			>
				<i className={`fa ${icon}`} />
			</button>
		</Tooltip>
	);
};

const LeftToolbar: FC = () => {
	const renderedModes = MODES.map((m) => {
		const Button = memo(ToolbarButton, (prev, next) => prev.name === next.name);

		return (
			<Button
				key={m.name}
				{...m}
			/>
		);
	});

	return <aside id="left-toolbar-container">{renderedModes}</aside>;
};

export default LeftToolbar;
