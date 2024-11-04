// Lib
import { useEffect } from "react";
import { MODES } from "../../state/store";
import { useAppDispatch } from "../../state/hooks/reduxHooks";

// Redux Actions
import {
	changeMode,
	increaseScale,
	decreaseScale
} from "../../state/slices/canvasSlice";
import { undo, redo } from "../../state/slices/historySlice";

// Components
import Navbar from "../../components/Navbar/Navbar";
import Main from "../../components/Main/Main";

// The <head> tags
// eslint-disable-next-line
export const documentProps = {
	title: "IdeaDrawn", // <title>
	desc: "A drawing canvas editor on the browser" // <meta name="description">
};

function Page() {
	const dispatch = useAppDispatch();

	// Add keyboard listeners for each mode.
	// TODO: Move this effect somewhere else (ideally in the ToolbarButton component) to
	// clean up this component.
	useEffect(() => {
		function listenToKeyboard(e: KeyboardEvent) {
			let shortcut = "";

			if (e.ctrlKey) shortcut += "ctrl + ";
			if (e.shiftKey) shortcut += "shift + ";
			if (e.altKey) shortcut += "alt + ";

			shortcut += e.key.toLowerCase();

			const mode = MODES.find((m) => m.shortcut === shortcut);

			if (mode) {
				e.preventDefault();
				if (mode.name === "undo") {
					dispatch(undo());
				} else if (mode.name === "redo") {
					dispatch(redo());
				} else {
					dispatch(changeMode(mode.name));
				}
			}
		}

		function listenToZoom(e: Event) {
			if (e instanceof WheelEvent) {
				if (!e.shiftKey) return;

				if (e.deltaY > 0) {
					dispatch(increaseScale());
				} else {
					dispatch(decreaseScale());
				}

				// On click.
			} else {
				// ...
			}
		}

		document.addEventListener("keydown", listenToKeyboard);
		document.addEventListener("wheel", listenToZoom);
		return () => {
			document.removeEventListener("keydown", listenToKeyboard);
			document.removeEventListener("wheel", listenToZoom);
		};
	}, [dispatch]);

	useEffect(() => {
		async function checkStoragePersistency() {
			if (!navigator.storage || !navigator.storage.persist) return;

			const isPersisted = await navigator.storage.persisted();

			if (!isPersisted) {
				const isPersisting = await navigator.storage.persist();

				if (isPersisting) {
					console.log("Storage is now persisted.");
				} else {
					console.error("Storage was not persisted.");
				}
			} else {
				console.log("Storage is already persisted.");
			}
		}

		// Check if the database persists.
		checkStoragePersistency();
	}, []);

	return (
		<>
			<Navbar />

			<Main />
		</>
	);
}

export { Page };
