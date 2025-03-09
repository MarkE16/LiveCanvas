// Lib
import { useCallback, useEffect } from "react";
import useStore from "../../state/hooks/useStore";
import { useShallow } from "zustand/react/shallow";
import * as UTILS from "../../lib/utils";

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
import Text from "../icons/Text/Text";
import clsx from "clsx";

type ToolbarButtonProps = ToolbarMode & {
	active: boolean;
};

const ICONS: Record<Mode, ReactElement> = {
	select: <Select />,
	draw: <Pen />,
	erase: <Eraser />,
	shapes: <Shapes />,
	text: <Text />,
	eye_drop: <EyeDropper />,
	zoom_in: <ZoomIn />,
	zoom_out: <ZoomOut />,
	move: <Move />,
	undo: <Undo />,
	redo: <Redo />
};

const ToolbarButton: FC<ToolbarButtonProps> = ({ name, shortcut, active }) => {
	const { changeMode, undoStack, redoStack, undo, redo } = useStore(
		useShallow((state) => ({
			changeMode: state.changeMode,
			undoStack: state.undoStack,
			redoStack: state.redoStack,
			undo: state.undo,
			redo: state.redo
		}))
	);
	const tooltip =
		UTILS.capitalize(name, {
			titleCase: true,
			delimiter: "_"
		}).replace("_", " ") + ` (${shortcut.toUpperCase()})`;
	const cn = clsx("toolbar-option", { active });

	const performAction = useCallback(() => {
		if (name === "undo") {
			undo();
		} else if (name === "redo") {
			redo();
		} else {
			changeMode(name);
		}
	}, [undo, redo, name, changeMode]);

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
	}, [performAction, shortcut]);

	return (
		<Tooltip
			title={tooltip}
			arrow
			placement="right"
		>
			<span>
				<button
					className={cn}
					data-modename={name}
					data-shortcut={shortcut}
					data-testid={`tool-${name}`}
					onClick={performAction}
					disabled={
						name === "undo"
							? !undoStack.length
							: name === "redo"
								? !redoStack.length
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
