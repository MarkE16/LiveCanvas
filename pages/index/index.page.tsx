"use client";

// Lib
import { useEffect, memo } from "react";
import useStore from "../../state/hooks/useStore";

// Components
import Navbar from "../../components/Navbar/Navbar";
import Main from "../../components/Main/Main";
import ReferenceWindow from "../../components/ReferenceWindow/ReferenceWindow";

// The <head> tags
// eslint-disable-next-line
export const documentProps = {
	title: "IdeaDrawn", // <title>
	desc: "A drawing canvas editor on the browser" // <meta name="description">
};

const MemoizedNavbar = memo(Navbar);
const MemoizedMain = memo(Main);

function Page() {
	const referenceWindowEnabled = useStore(
		(state) => state.referenceWindowEnabled
	);
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
			<MemoizedNavbar />

			<MemoizedMain />

			{referenceWindowEnabled && <ReferenceWindow />}
		</>
	);
}

export { Page };
