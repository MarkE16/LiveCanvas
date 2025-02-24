import type { PropsWithChildren, ReactNode } from "react";
import type {
	RenderOptions,
	RenderResult,
	RenderHookResult,
	RenderHookOptions
} from "@testing-library/react";
import type { SliceStores } from "../types";
import type { Store } from "../state/store";
import { render, renderHook } from "@testing-library/react";
import { IndexedDBProvider } from "../components/IndexedDBProvider/IndexedDBProvider";
import { StoreProvider } from "../components/StoreContext/StoreContext";

import { initializeStore } from "../state/store";
import { LayerReferencesProvider } from "../components/LayerReferencesProvider/LayerReferencesProvider";

type ExtendedRenderOptions = Omit<RenderOptions, "queries"> & {
	preloadedState?: Partial<SliceStores>;
	store?: Store;
};

type ExtendedRenderHookOptions<P> = Omit<RenderHookOptions<P>, "wrapper"> & {
	preloadedState?: Partial<SliceStores>;
	store?: Store;
};

/**
 * Renders a React component with a Zustand store and other providers. This function
 * should only be used for testing purposes.
 * @param ui A React component to render.
 * @param obj An object containing optional preloadedState, store, and other render options.
 * @returns Render options returned by React Testing Library.
 */
export function renderWithProviders(
	ui: ReactNode,
	{
		preloadedState = {},
		store = initializeStore(preloadedState),
		...renderOptions
	}: ExtendedRenderOptions = {}
): RenderResult {
	const Wrapper = ({ children }: PropsWithChildren) => (
		<IndexedDBProvider>
			<LayerReferencesProvider>
				<StoreProvider store={store}>{children}</StoreProvider>
			</LayerReferencesProvider>
		</IndexedDBProvider>
	);

	return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Renders a React hook with a Zustand store and other providers. This function should only be used for testing purposes.
 * @param hook A React hook. This should commonly be a custom hook.
 * @param obj An object containing optional preloadedState, store, and other render options.
 * @returns Render options returned by React Testing Library.
 */
export function renderHookWithProviders<Result, Props>(
	hook: (props: Props) => Result,
	{
		preloadedState = {},
		store = initializeStore(preloadedState),
		...renderOptions
	}: ExtendedRenderHookOptions<Props> = {}
): RenderHookResult<Result, Props> {
	const Wrapper = ({ children }: PropsWithChildren) => (
		<IndexedDBProvider>
			<LayerReferencesProvider>
				<StoreProvider store={store}>{children}</StoreProvider>
			</LayerReferencesProvider>
		</IndexedDBProvider>
	);

	return renderHook(hook, { wrapper: Wrapper, ...renderOptions });
}
