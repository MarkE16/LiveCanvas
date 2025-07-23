import { RefObject, useEffect } from "react";
import useStore from "./useStore";
import useThrottle from "./useThrottle";

function useCanvasRedrawListener(
	canvasRef: RefObject<HTMLCanvasElement | null>
): void {
	const drawCanvas = useStore((state) => state.drawCanvas);

	const handleCanvasRedraw = useThrottle(() => {
		const canvas = canvasRef.current;
		if (canvas) {
			// requestAnimationFrame(() => {
				drawCanvas(canvas);
			// });
		}
	}, 10);

	useEffect(() => {
		document.addEventListener("canvas:redraw", handleCanvasRedraw);

		return () =>
			document.removeEventListener("canvas:redraw", handleCanvasRedraw);
	}, [handleCanvasRedraw]);
}

export default useCanvasRedrawListener;
