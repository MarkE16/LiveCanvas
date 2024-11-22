// Lib
import { createContext, useRef } from "react";

// Types
import { FC, PropsWithChildren } from "react";

const LayerReferenceContext = createContext<HTMLCanvasElement[]>([]);

const LayerReferenceProvider: FC<PropsWithChildren> = ({ children }) => {
	const layers = useRef<HTMLCanvasElement[]>([]);

	return (
		<LayerReferenceContext.Provider value={layers.current}>
			{children}
		</LayerReferenceContext.Provider>
	);
};

export { LayerReferenceContext, LayerReferenceProvider };
