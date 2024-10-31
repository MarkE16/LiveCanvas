import React from "react";
import { PageContextProvider } from "./usePageContext";
import { Provider } from "react-redux";
import { IndexedDBProvider } from "../components/IndexedDBProvider/IndexedDBProvider";
import { createStore } from "../state/store";
import type { PageContext } from "./types";
import "./PageShell.css";

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
				<IndexedDBProvider>{children}</IndexedDBProvider>
			</PageContextProvider>
		</React.StrictMode>
	);
}
