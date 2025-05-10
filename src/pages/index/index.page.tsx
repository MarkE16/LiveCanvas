"use client";

// Lib
import { useEffect } from "react";
import LayersStore from "@/state/stores/LayersStore";
import ElementsStore from "@/state/stores/ElementsStore";

// Components
import Navbar from "@/components/Navbar/Navbar";
import Main from "@/components/Main/Main";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";

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

		// Check if the database persists.
		checkStoragePersistency();

		LayersStore.openStore();
		ElementsStore.openStore();
	}, []);

	return (
		<ErrorBoundary>
			<Navbar />

			<Main />
		</ErrorBoundary>
	);
}

export { Page };
