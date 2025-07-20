import { RefObject, useEffect } from "react";
import useStore from "./useStore";
import { CanvasRedrawEvent } from "@/types";

function useCanvasRedrawListener(
	canvasRef: RefObject<HTMLCanvasElement | null>
): void {
	const drawCanvas = useStore((state) => state.drawCanvas);
	useEffect(() => {
		function redrawCanvas() {
			const canvas = canvasRef.current;
			if (canvas) {
				drawCanvas(canvas);
			}
		}

		document.addEventListener("canvas:redraw", redrawCanvas);

		return () => document.removeEventListener("canvas:redraw", redrawCanvas);
	}, []);
}

export default useCanvasRedrawListener;
