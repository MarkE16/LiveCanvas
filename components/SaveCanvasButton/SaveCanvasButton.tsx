// Lib
import { useState, useRef, useEffect, useCallback } from "react";
import useIndexed from "../../state/hooks/useIndexed";
import useLayerReferences from "../../state/hooks/useLayerReferences";

// Types
import type { FC } from "react";
import { Tooltip } from "@mui/material";

const SaveCanvasButton: FC = () => {
	const [upToDate, setUpToDate] = useState<boolean>(true);
	const [saved, setSaved] = useState<boolean>(false);
	const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const layerReferences = useLayerReferences();
	const { set } = useIndexed();

	const saveCanvas = useCallback(() => {
		setUpToDate(false);
		layerReferences.forEach((canvas, index) => {
			if (!canvas) return;

			canvas.toBlob(async (blob) => {
				if (!blob) {
					throw new Error(
						`Failed to save canvas with id: ${canvas.id} and name: ${canvas.getAttribute("data-name")}.`
					);
				}

				await set("layers", canvas.id, {
					name: canvas.getAttribute("data-name"),
					image: blob,
					position: index
				});
			});
		});

		// Update the UI to indicate that the canvas has been saved
		setSaved(true);
		clearTimeout(timeout.current);
		timeout.current = setTimeout(() => {
			setSaved(false);
			setUpToDate(true);
		}, 1000);
	}, [layerReferences, set]);

	useEffect(() => {
		function handleKeyboardSave(e: KeyboardEvent) {
			if (e.key === "s" && e.ctrlKey) {
				e.preventDefault(); // Prevent the browser from opening the save dialog.
				saveCanvas();
			}
		}

		window.addEventListener("keydown", handleKeyboardSave);

		return () => {
			window.removeEventListener("keydown", handleKeyboardSave);
		};
	}, [saveCanvas]);

	return (
		<>
			<Tooltip
				placement="bottom"
				title={upToDate ? "Canvas Up to date" : "Saving"}
			>
				<button>
					{upToDate ? (
						<i className="fas fa-check"></i>
					) : (
						<i className="fas fa-cloud-upload-alt"></i>
					)}
				</button>
			</Tooltip>
			<Tooltip
				placement="bottom"
				title={saved ? "Saved!" : "Save Canvas (CTRL + S)"}
			>
				<button
					id="save-btn"
					onClick={saveCanvas}
				>
					<i className={`fas fa-${saved ? "check" : "save"}`}></i>
				</button>
			</Tooltip>
		</>
	);
};

export default SaveCanvasButton;
