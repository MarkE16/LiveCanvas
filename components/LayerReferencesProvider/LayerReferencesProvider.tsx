// Lib
import { createContext, useRef } from "react";

// Types
import { FC, PropsWithChildren } from "react";

const LayerReferencesContext = createContext<HTMLCanvasElement[]>([]);

const LayerReferencesProvider: FC<PropsWithChildren> = ({ children }) => {
	const layers = useRef<HTMLCanvasElement[]>([]);

	return (
		<LayerReferencesContext.Provider value={layers.current}>
			{children}
		</LayerReferencesContext.Provider>
	);
};

export { LayerReferencesContext, LayerReferencesProvider };
