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
	const { references, remove } = useLayerReferences();
	const { set } = useIndexed();

	const saveCanvas = useCallback(async () => {
		if (!references.current.length)
			throw new Error(
				"Cannot export canvas: no references found. This is a bug."
			);
		const elements = Array.from(document.getElementsByClassName("element"));
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

		const allUnfocused = elements.map<Omit<CanvasElement, "focused">>(
			(element) => {
				const x = Number(element.getAttribute("data-x"));
				const y = Number(element.getAttribute("data-y"));
				const width = Number(element.getAttribute("data-width"));
				const height = Number(element.getAttribute("data-height"));
				const type = element.getAttribute("data-type");
				const fill = element.getAttribute("data-fill") ?? "#000000";
				const stroke = element.getAttribute("data-stroke") ?? "#000000";
				const layerId = element.getAttribute("data-layerid");
				const fontSize = element.getAttribute("data-fontsize") ?? undefined;
				const fontFamily = element.getAttribute("data-fontfamily") ?? undefined;
				const fontContent =
					element.getAttribute("data-fontcontent") ?? undefined;

				const id = element.id;

				if (!layerId) {
					throw new Error(
						`No layerId found for element with id: ${id}. This is a bug.`
					);
				}

				return {
					type: type as CanvasElement["type"],
					fontSize: Number(fontSize),
					fontFamily,
					fontContent,
					x,
					y,
					width,
					height,
					fill,
					stroke,
					layerId,
					id
				};
			}
		);

		await set("elements", "items", allUnfocused);

		// Update the UI to indicate that the canvas has been saved
		setSaved(true);
		clearTimeout(timeout.current);
		timeout.current = setTimeout(() => {
			setSaved(false);
		}, 1000);
	}, [references, set, remove]);

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
