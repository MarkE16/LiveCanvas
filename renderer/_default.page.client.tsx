export { render };

import { hydrateRoot } from "react-dom/client";
import { PageShell } from "./PageShell";
import { Provider } from "react-redux";
import { createStore } from "../state/store";
import type { PageContextClient } from "./types";
import type { RootState } from "../state/store";

// This render() hook only supports SSR, see https://vite-plugin-ssr.com/render-modes for how to modify render() to support SPA
async function render(pageContext: PageContextClient) {
	const { Page, pageProps } = pageContext;
	if (!Page)
		throw new Error(
			"Client-side render() hook expects pageContext.Page to be defined"
		);
	const root = document.getElementById("entry");
	if (!root) throw new Error("DOM element #entry not found");

	// See https://redux.js.org/usage/server-rendering#the-client-side
	// for how to pass the initial Redux state from the server to the client.
	// For more information about how window.__PRELOADED_STATE__ is set, see _default.page.server.tsx
	// eslint-disable-next-line
	// @ts-ignore
	const store = createStore(window.__PRELOADED_STATE__ as Partial<RootState>);

	// To be garbage collected
	// eslint-disable-next-line
	// @ts-ignore
	delete window.__PRELOADED_STATE__;

	const script = document.getElementById("__preloaded_state__");

	if (script) {
		script.remove();
	}

	hydrateRoot(
		root,
		<PageShell pageContext={pageContext}>
			<Provider store={store}>
				<Page {...pageProps} />
			</Provider>
		</PageShell>
	);
}

/* To enable Client-side Routing:
export const clientRouting = true
// !! WARNING !! Before doing so, read https://vite-plugin-ssr.com/clientRouting */
