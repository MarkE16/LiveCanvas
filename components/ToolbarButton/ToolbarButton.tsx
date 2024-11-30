// Lib
import { useCallback, useEffect } from "react";
import { Tooltip } from "@mui/material";
import { useAppDispatch } from "../../state/hooks/reduxHooks";
import * as UTILS from "../../utils";
import useHistory from "../../state/hooks/useHistory";

// Redux Actions
import { changeMode } from "../../state/slices/canvasSlice";

// Types
import type { Mode } from "../../types";
import type { FC } from "react";

type ToolbarButtonProps = {
	icon: string;
	name: Mode;
	shortcut: string;
	active: boolean;
};

const ToolbarButton: FC<ToolbarButtonProps> = ({
	icon,
	name,
	shortcut,
	active
}) => {
	const dispatch = useAppDispatch();
	const { undo, undoAction, redo, redoAction } = useHistory();
	const tooltip =
		UTILS.capitalize(name, {
			titleCase: true,
			delimiter: "_"
		}).replace("_", " ") + ` (${shortcut.toUpperCase()})`;

	const performAction = useCallback(() => {
		if (name === "undo") {
			undoAction();
		} else if (name === "redo") {
			redoAction();
		} else {
			dispatch(changeMode(name));
		}
	}, [dispatch, undoAction, redoAction, name]);

	useEffect(() => {
		function handleShortcut(e: KeyboardEvent) {
			let chosenShortcut = "";

			if (e.ctrlKey) chosenShortcut += "ctrl +";
			if (e.shiftKey) chosenShortcut += "shift +";
			if (e.altKey) chosenShortcut += "alt +";

			// Handle the special case of "+" and "_" for zooming in and out
			if (e.key === "+" || e.key === "_") {
				chosenShortcut = e.key.toLowerCase();
			} else {
				chosenShortcut += e.key.toLowerCase();
			}

			if (chosenShortcut === shortcut) {
				performAction();
			}
		}

		window.addEventListener("keydown", handleShortcut);

		return () => {
			window.removeEventListener("keydown", handleShortcut);
		};
	}, [performAction, shortcut, dispatch]);

	return (
		<Tooltip
			title={tooltip}
			arrow
			placement="right"
		>
			<span>
				<button
					className={`toolbar-option ${active ? "active" : ""}`}
					data-modename={name}
					data-iconname={icon}
					data-shortcut={shortcut}
					data-testid={name}
					onClick={performAction}
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
			</span>
		</Tooltip>
	);
};

export default ToolbarButton;
