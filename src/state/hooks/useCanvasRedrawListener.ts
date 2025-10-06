import { RefObject, useCallback, useEffect } from "react";
import useStore from "./useStore";
import useThrottle from "./useThrottle";
import useDebounceCallback from "./useDebounceCallback";
import { CanvasRedrawEvent } from "@/types";

const DEBOUNCE_TIME_MS = 500;

/**
 * Attach a listener to the document that listens for a custom "canvas:redraw" event.
 * When the event is triggered, it redraws the canvas using the provided drawCanvas function.
 * The listener is throttled to prevent excessive redraws.
 * @param canvasRef A reference to an HTMLCanvasElement.
 * @param layerId An optional layer ID to specify which layer to redraw.
 * @param debounce A boolean indicating whether to debounce the redraw calls.
 * This is useful so that the canvas will not be redrawn until the event stops
 * being triggered for a certain amount of time. (E.g., won't update until there
 * is no update for half a second)
 */
function useCanvasRedrawListener(
	canvasRef: RefObject<HTMLCanvasElement | null>,
	layerId?: string,
	debounce: boolean = false,
	exporting: boolean = false
): void {
	const drawCanvas = useStore((state) => state.drawCanvas);

	const draw = useCallback(
		(canvas: HTMLCanvasElement, layerId?: string) => {
			drawCanvas(canvas, { layerId, export: exporting });
			// requestAnimationFrame(() => {
			// 	draw(canvas, layerId);
			// });
		},
		[drawCanvas, exporting]
	);

	const handleCanvasRedraw = useThrottle((e: CanvasRedrawEvent) => {
		const noChange = e.detail?.noChange;
		// If no change occurred and a layerId is provided, we do not need to redraw the canvas
		// since due to the fact that nothing changed, the individual layer
		// does not need to be redrawn.
		// This is useful, for example, when switching layer positions,
		// the entire canvas may need to be redrawn, but the layer itself
		// does not need to be redrawn if no changes were made to it.
		if (noChange && layerId) {
			return;
		}

		const canvas = canvasRef.current;
		if (canvas) {
			draw(canvas, layerId);
		}
	}, 10);

	const handleCanvasRedrawDebounced = useDebounceCallback(
		handleCanvasRedraw,
		DEBOUNCE_TIME_MS
	);

	useEffect(() => {
		if (debounce) {
			document.addEventListener("canvas:redraw", handleCanvasRedrawDebounced);
			return () =>
				document.removeEventListener(
					"canvas:redraw",
					handleCanvasRedrawDebounced
				);
		}

		function onResize() {
			// TODO: When resizing, drawing the canvas should not keep the canvas 'centered'. It should stay in place.
			// This needs to be revisited later.
			const e = new CustomEvent("canvas:redraw", {
				detail: { noChange: true }
			});
			handleCanvasRedraw(e);
		}

		document.addEventListener("canvas:redraw", handleCanvasRedraw);
		window.addEventListener("resize", onResize);

		return () => {
			document.removeEventListener("canvas:redraw", handleCanvasRedraw);
			window.removeEventListener("resize", onResize);
		};
	}, [handleCanvasRedraw, debounce, handleCanvasRedrawDebounced]);
}

export default useCanvasRedrawListener;
