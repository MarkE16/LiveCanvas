// Lib
import { useState, useRef, useEffect, useCallback } from "react";
import useIndexed from "../../state/hooks/useIndexed";
import useLayerReferences from "../../state/hooks/useLayerReferences";

// Types
import type { FC } from "react";
import type { CanvasElement } from "../../types";

// Icons
import FloppyDisk from "../icons/FloppyDisk/FloppyDisk";

// Components
import { Tooltip } from "@mui/material";

const SaveCanvasButton: FC = () => {
	const [saved, setSaved] = useState<boolean>(false);
	const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const references = useLayerReferences();
	const { set } = useIndexed();

	const saveCanvas = useCallback(async () => {
    if (!references.length) throw new Error("Cannot export canvas: no references found. This is a bug.");
		const elements = Array.from(document.getElementsByClassName("element"));
		references.forEach((canvas, index) => {
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

		const allUnfocused = elements.map((element) => {
			const x = Number(element.getAttribute("data-x"));
			const y = Number(element.getAttribute("data-y"));
			const width = Number(element.getAttribute("data-width"));
			const height = Number(element.getAttribute("data-height"));
			const shape = element.getAttribute("data-shape");
			const fill = element.getAttribute("data-fill");
			const border = element.getAttribute("data-border");
			const layerId = element.getAttribute("data-layerid");
			const id = element.id;

			return {
				x,
				y,
				width,
				height,
				shape,
				fill,
				border,
				layerId,
				id
			} as CanvasElement;
		});

		await set("elements", "items", allUnfocused);

		// Update the UI to indicate that the canvas has been saved
		setSaved(true);
		clearTimeout(timeout.current);
		timeout.current = setTimeout(() => {
			setSaved(false);
		}, 1000);
	}, [references, set]);

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
		<Tooltip
			placement="bottom"
			title={saved ? "Saved!" : "Save Canvas (CTRL + S)"}
		>
			<button
				id="save-btn"
				onClick={saveCanvas}
			>
				<FloppyDisk checkmark={saved} />
			</button>
		</Tooltip>
	);
};

export default SaveCanvasButton;
