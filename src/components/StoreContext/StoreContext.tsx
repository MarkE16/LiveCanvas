// Lib
import { createContext, useRef } from "react";
import { initializeStore } from "@/state/store";

// Types
import type { ReactNode } from "react";

type InitStore = ReturnType<typeof initializeStore>;

type StoreProviderProps = Readonly<{
	store?: InitStore;
	children: ReactNode;
}>;

const StoreContext = createContext<InitStore | undefined>(undefined);

function StoreProvider({ store, children }: StoreProviderProps): ReactNode {
	const storeRef = useRef<InitStore>(null);

	if (!storeRef.current) {
		storeRef.current = store ?? initializeStore();
	}

	return (
		<StoreContext.Provider value={storeRef.current}>
			{children}
		</StoreContext.Provider>
	);
}

export { StoreContext, StoreProvider };
