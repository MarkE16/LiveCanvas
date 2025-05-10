// Lib
import { useCallback, useEffect } from "react";
import useStore from "@/state/hooks/useStore";
import { useShallow } from "zustand/react/shallow";
import * as UTILS from "@/lib/utils";
import clsx from "clsx";

// Types
import type { Mode, ToolbarMode } from "@/types";
import type { ReactNode } from "react";

// Components
import Select from "@/components/icons/Select/Select";
import Pen from "@/components/icons/Pen/Pen";
import Eraser from "@/components/icons/Eraser/Eraser";
import Shapes from "@/components/icons/Shapes/Shapes";
import EyeDropper from "@/components/icons/EyeDropper/EyeDropper";
import ZoomIn from "@/components/icons/ZoomIn/ZoomIn";
import ZoomOut from "@/components/icons/ZoomOut/ZoomOut";
import Move from "@/components/icons/Move/Move";
import Undo from "@/components/icons/Undo/Undo";
import Redo from "@/components/icons/Redo/Redo";
import Text from "@/components/icons/Text/Text";
import Tooltip from "@/components/Tooltip/Tooltip";

type ToolbarButtonProps = Readonly<
	ToolbarMode & {
		active: boolean;
	}
>;

const ICONS: Record<Mode, ReactNode> = {
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

function ToolbarButton({
	name,
	shortcut,
	active
}: ToolbarButtonProps): ReactNode {
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
			text={tooltip}
			position="right"
		>
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
		</Tooltip>
	);
}

export default ToolbarButton;
