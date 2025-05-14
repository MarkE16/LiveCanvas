import React from "react";
import { PageContextProvider } from "./usePageContext";
import type { PageContext } from "./types";
import "./PageShell.css";
import { LayerReferencesProvider } from "../components/LayerReferencesProvider/LayerReferencesProvider";

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
				<LayerReferencesProvider>{children}</LayerReferencesProvider>
			</PageContextProvider>
		</React.StrictMode>
	);
}
