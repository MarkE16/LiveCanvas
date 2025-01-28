// Lib
import { createContext, useRef } from "react";
import { initializeStore } from "../../state/store";

// Types
import type { FC, ReactNode } from "react";

type InitStore = ReturnType<typeof initializeStore>;

type StoreProviderProps = {
	store?: InitStore;
	children: ReactNode;
};

const StoreContext = createContext<InitStore | undefined>(undefined);

const StoreProvider: FC<StoreProviderProps> = ({ store, children }) => {
	const storeRef = useRef<InitStore>(null);

	if (!storeRef.current) {
		storeRef.current = store ?? initializeStore();
	}

	return (
		<StoreContext.Provider value={storeRef.current}>
			{children}
		</StoreContext.Provider>
	);
};

export { StoreContext, StoreProvider };
