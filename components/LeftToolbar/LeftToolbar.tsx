// Lib
import { memo, useEffect, useCallback } from "react";
import * as UTILS from "../../utils";
import { useAppSelector, useAppDispatch } from "../../state/hooks/reduxHooks";
import { MODES } from "../../state/store";
import { Tooltip } from "@mui/material";

// Redux Actions
import { changeMode, setPosition } from "../../state/slices/canvasSlice";

// Types
import type { Mode } from "../../types";
import type { FC } from "react";

// Styles
import "./LeftToolbar.styles.css";
import useHistory from "../../state/hooks/useHistory";

type ToolbarButtonProps = {
	icon: string;
	name: Mode;
	shortcut: string;
};

const ToolbarButton = memo(
	function ToolbarButton({ icon, name, shortcut }: ToolbarButtonProps) {
		const mode = useAppSelector((state) => state.canvas.mode);
		const dispatch = useAppDispatch();
		const { undo, undoAction, redo, redoAction } = useHistory();

		const isActive = mode === name;
		const tooltip =
			UTILS.capitalize(name).replace("_", " ") + ` (${shortcut.toUpperCase()})`;

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
				<button
					className={`toolbar-option ${isActive ? "active" : ""}`}
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
			</Tooltip>
		);
	},
	(prev, next) => {
		return (
			prev.name === next.name &&
			prev.icon === next.icon &&
			prev.shortcut === next.shortcut
		);
	}
);

const LeftToolbar: FC = () => {
	const renderedModes = MODES.map((mode) => {
		return (
			<ToolbarButton
				key={mode.name}
				{...mode}
			/>
		);
	});
	const dispatch = useAppDispatch();

	return (
		<aside id="left-toolbar-container">
			<div>{renderedModes}</div>
			<div>
				{/* Temporary. This may be moved somewhere else, or not implemented at all. */}
				<Tooltip
					title="Reset Position"
					arrow
					placement="right"
				>
					<button
						className="toolbar-option"
						onClick={() => dispatch(setPosition({ x: 0, y: 0 }))}
					>
						<i className="fas fa-sync" />
					</button>
				</Tooltip>
			</div>
		</aside>
	);
};

export default LeftToolbar;
