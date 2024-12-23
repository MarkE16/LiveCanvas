// Lib
import { useCallback, useEffect } from "react";
import { useAppDispatch } from "../../state/hooks/reduxHooks";
import * as UTILS from "../../utils";
import useHistory from "../../state/hooks/useHistory";

// Redux Actions
import { changeMode } from "../../state/slices/canvasSlice";

// Types
import type { Mode, ToolbarMode } from "../../types";
import type { FC, ReactElement } from "react";

// Components
import { Tooltip } from "@mui/material";
import Select from "../icons/Select/Select";
import Pen from "../icons/Pen/Pen";
import Eraser from "../icons/Eraser/Eraser";
import Shapes from "../icons/Shapes/Shapes";
import EyeDropper from "../icons/EyeDropper/EyeDropper";
import ZoomIn from "../icons/ZoomIn/ZoomIn";
import ZoomOut from "../icons/ZoomOut/ZoomOut";
import Move from "../icons/Move/Move";
import Undo from "../icons/Undo/Undo";
import Redo from "../icons/Redo/Redo";

type ToolbarButtonProps = ToolbarMode & {
	active: boolean;
};

const ICONS: Record<Mode, ReactElement> = {
	select: <Select />,
	draw: <Pen />,
	erase: <Eraser />,
	shapes: <Shapes />,
	eye_drop: <EyeDropper />,
	zoom_in: <ZoomIn />,
	zoom_out: <ZoomOut />,
	move: <Move />,
	undo: <Undo />,
	redo: <Redo />
};

const ToolbarButton: FC<ToolbarButtonProps> = ({ name, shortcut, active }) => {
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
					{ICONS[name]}
				</button>
			</span>
		</Tooltip>
	);
};

export default ToolbarButton;
