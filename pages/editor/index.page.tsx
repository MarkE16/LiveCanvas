"use client";

// Lib
import { useEffect } from "react";
import { navigateTo } from "../../lib/utils";

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

		function getFileID() {
			const urlParams = new URLSearchParams(window.location.search);
			const fileId = urlParams.get("f"); // Represents the file's ID.

			if (!fileId) {
				// Redirect to the dashboard page.
				navigateTo("/home");
			} else {
				// Get the file from IndexedDB.
				// ...
			}
		}

		// First, check if the storage is persisted.
		// Then, get the file ID from the URL.
		checkStoragePersistency().then(() => getFileID());
	}, []);

	return (
		<>
			<Navbar />

			<Main />
		</>
	);
}

export { Page };
