// Lib
import { useRef, useEffect } from "react";

// Types
import type { Dimensions } from "../../types";

type DimensionProperties = Dimensions & {
	changeInWidth: number;
	changeInHeight: number;
};

const useWindowDimensions = () => {
	const dimensions = useRef<DimensionProperties>({
		width: 0,
		height: 0,
		changeInWidth: 0,
		changeInHeight: 0
	});

	useEffect(() => {
		function handleResize() {
			dimensions.current = {
				width: window.innerWidth,
				height: window.innerHeight,
				changeInWidth: window.innerWidth - dimensions.current.width,
				changeInHeight: window.innerHeight - dimensions.current.height
			};
		}

		window.addEventListener("resize", handleResize);

		handleResize(); // Initial call to set the dimensions.

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return dimensions;
};

export default useWindowDimensions;
