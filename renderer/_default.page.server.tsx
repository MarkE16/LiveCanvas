export { render };
// See https://vite-plugin-ssr.com/data-fetching
export const passToClient = ["pageProps", "urlPathname"];

import ReactDOMServer from "react-dom/server";
import { PageShell } from "./PageShell";
import { escapeInject, dangerouslySkipEscape } from "vite-plugin-ssr/server";
import logo from "../assets/icons/IdeaDrawnNewLogo.png";
import { Provider } from "react-redux";
import { createStore } from "../state/store";
import type { PageContextServer } from "./types";

async function render(pageContext: PageContextServer) {
	const { Page, pageProps } = pageContext;
	// This render() hook only supports SSR, see https://vite-plugin-ssr.com/render-modes for how to modify render() to support SPA
	if (!Page)
		throw new Error("My render() hook expects pageContext.Page to be defined");

	const store = createStore();
	const pageHtml = ReactDOMServer.renderToString(
		<PageShell pageContext={pageContext}>
			<Provider store={store}>
				<Page {...pageProps} />
			</Provider>
		</PageShell>
	);

	const preloadedState = store.getState();

	// See https://vite-plugin-ssr.com/head
	const { documentProps } = pageContext.exports;
	const title = (documentProps && documentProps.title) || "Live Canvas";
	const desc =
		(documentProps && documentProps.description) ||
		"App using Vite + vite-plugin-ssr";

	const jsonState = JSON.stringify(preloadedState).replace(/</g, "\\u003c");

	// we use the dangerouslySkipEscape() so that the JSON is not escaped
	// due to escapeInject, which is supposed to help prevent XSS attacks
	const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" href="${logo}" />
        <link href=
"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
              rel="stylesheet"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="${desc}" />
        <title>${title}</title>
      </head>
      <body>
        <div id="entry">${dangerouslySkipEscape(pageHtml)}</div>
        <script id="__preloaded_state__">
          window.__PRELOADED_STATE__ = ${dangerouslySkipEscape(jsonState)}
        </script>
      </body>
    </html>`;

	return {
		documentHtml,
		pageContext: {
			// We can add some `pageContext` here, which is useful if we want to do page redirection https://vite-plugin-ssr.com/page-redirection
		}
	};
}
