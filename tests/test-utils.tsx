import type { PropsWithChildren, ReactNode } from "react";
import type { RenderOptions } from "@testing-library/react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { IndexedDBProvider } from "../components/IndexedDBProvider/IndexedDBProvider";
import { LayerReferenceProvider } from "../components/LayerReferenceProvider/LayerReferenceProvider";

//!! See https://redux.js.org/usage/writing-tests#setting-up-a-reusable-test-render-function
//!! for more information on how to set up a Redux store for testing.

import type { AppStore, RootState } from "../state/store";
import { createStore } from "../state/store";

type ExtendedRenderOptions = Omit<RenderOptions, "queries"> & {
	preloadedState?: Partial<RootState>;
	store?: AppStore;
};

export function renderWithProviders(
	ui: ReactNode,
	{
		preloadedState = {},
		store = createStore(preloadedState),
		...renderOptions
	}: ExtendedRenderOptions = {}
) {
	const Wrapper = ({ children }: PropsWithChildren) => (
		<IndexedDBProvider>
			<LayerReferenceProvider>
				<Provider store={store}>{children}</Provider>
			</LayerReferenceProvider>
		</IndexedDBProvider>
	);

	return {
		...render(ui, { wrapper: Wrapper, ...renderOptions }),
		store
	};
}
