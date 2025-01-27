// Lib
import { useState, useRef, useEffect, useCallback } from "react";
import useIndexed from "../../state/hooks/useIndexed";
import useLayerReferences from "../../state/hooks/useLayerReferences";
import useStoreSubscription from "../../state/hooks/useStoreSubscription";

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
	const elements = useStoreSubscription((state) => state.elements);
	const { references, remove } = useLayerReferences();
	const { set } = useIndexed();

	const saveCanvas = useCallback(async () => {
		if (!references.current.length)
			throw new Error(
				"Cannot export canvas: no references found. This is a bug."
			);
		// const elements = Array.from(document.getElementsByClassName("element"));
		references.current.forEach((canvas, index) => {
			if (canvas === null) {
				remove(index);
				return;
			}
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

		const allUnfocused = elements.current.map<Omit<CanvasElement, "focused">>(
			(element) => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { focused, ...rest } = element;

				return rest;
			}
		);

		await set("elements", "items", allUnfocused);

		// Update the UI to indicate that the canvas has been saved
		setSaved(true);
		clearTimeout(timeout.current);
		timeout.current = setTimeout(() => {
			setSaved(false);
		}, 1000);
	}, [references, set, remove, elements]);

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
