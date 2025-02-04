// Lib
import { GrowthBookProvider as GBProvider } from "@growthbook/growthbook-react";
import { useEffect, useMemo } from "react";

// Types
import type { FC, ReactNode } from "react";
import type { GrowthBook } from "@growthbook/growthbook-react";

type GrowthBookProviderProps = {
	children: ReactNode;
	instance: GrowthBook;
};

const GrowthBookProvider: FC<GrowthBookProviderProps> = ({
	children,
	instance,
}) => {
	const gb = useMemo(() => instance, [instance]);
	
	return <GBProvider growthbook={gb}>{children}</GBProvider>;
};

export default GrowthBookProvider;
