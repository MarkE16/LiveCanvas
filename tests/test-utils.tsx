import type { PropsWithChildren, ReactNode } from "react";
import type { RenderOptions, RenderResult } from "@testing-library/react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { IndexedDBProvider } from "../components/IndexedDBProvider/IndexedDBProvider";
import { CanvasElementsProvider } from "../components/CanvasElementsProvider/CanvasElementsProvider";

//!! See https://redux.js.org/usage/writing-tests#setting-up-a-reusable-test-render-function
//!! for more information on how to set up a Redux store for testing.

import type { AppStore, RootState } from "../state/store";
import { createStore } from "../state/store";
import { LayerReferencesProvider } from "../components/LayerReferencesProvider/LayerReferencesProvider";

type ExtendedRenderOptions = Omit<RenderOptions, "queries"> & {
	preloadedState?: Partial<RootState>;
	store?: AppStore;
};

/**
 * Renders a React component with the Redux store and other providers. This function
 * should only be used for testing purposes.
 * @param ui A React component to render.
 * @param obj An object container optional preloadedState, store, and other render options.
 * @returns Render options returned by React Testing Library.
 */
export function renderWithProviders(
	ui: ReactNode,
	{
		preloadedState = {},
		store = createStore(preloadedState),
		...renderOptions
	}: ExtendedRenderOptions = {}
): RenderResult {
	const Wrapper = ({ children }: PropsWithChildren) => (
		<IndexedDBProvider>
			<LayerReferencesProvider>
				<CanvasElementsProvider>
					<Provider store={store}>{children}</Provider>
				</CanvasElementsProvider>
			</LayerReferencesProvider>
		</IndexedDBProvider>
	);

	return render(ui, { wrapper: Wrapper, ...renderOptions });
}
