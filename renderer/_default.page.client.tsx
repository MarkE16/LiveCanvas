export { render };

import { hydrateRoot } from "react-dom/client";
import { PageShell } from "./PageShell";
import { StoreProvider } from "../components/StoreContext/StoreContext";
import type { PageContextClient } from "./types";
import { initializeStore } from "../state/store";
import { SliceStores } from "../types";

declare global {
  interface Window {
    __PRELOADED_STATE__: Partial<SliceStores>;
  }
}

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
	// for how to pass the initial Zustand state from the server to the client.
	// For more information about how window.__PRELOADED_STATE__ is set, see _default.page.server.tsx
	const store = initializeStore(window.__PRELOADED_STATE__);

	// To be garbage collected
	// eslint-disable-next-line
	// @ts-ignore
	delete window.__PRELOADED_STATE__;

	// Since the initial Zustand state is passed from the server to the client,
	// we can remove the script tag that contains the initial Zustand state.
	// This way, the initial Zustand state is not visible in the DOM inspector.
	const script = document.getElementById("__preloaded_state__");
	if (script) {
		script.remove();
	}

	hydrateRoot(
		root,
		<PageShell pageContext={pageContext}>
			<StoreProvider store={store}>
        <Page {...pageProps} />
			</StoreProvider>
		</PageShell>
	);
}

// Note from developer: we shouldn't have to think about switching to
// client-side routing, so this should be commented out. However,
// if we do need to switch to client-side routing, we can uncomment this.
// So, keep this here.

/* To enable Client-side Routing:
export const clientRouting = true
// !! WARNING !! Before doing so, read https://vite-plugin-ssr.com/clientRouting */
