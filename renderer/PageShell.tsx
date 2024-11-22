import React from "react";
import { PageContextProvider } from "./usePageContext";
import { IndexedDBProvider } from "../components/IndexedDBProvider/IndexedDBProvider";
import type { PageContext } from "./types";
import "./PageShell.css";
import { LayerReferenceProvider } from "../components/LayerReferenceProvider/LayerReferenceProvider";

export { PageShell };

function PageShell({
	children,
	pageContext
}: {
	children: React.ReactNode;
	pageContext: PageContext;
}) {
	return (
		<React.StrictMode>
			<PageContextProvider pageContext={pageContext}>
				<IndexedDBProvider>
					<LayerReferenceProvider>{children}</LayerReferenceProvider>
				</IndexedDBProvider>
			</PageContextProvider>
		</React.StrictMode>
	);
}
