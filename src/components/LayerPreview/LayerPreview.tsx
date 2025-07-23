// Lib
import { useEffect, useRef } from "react";
import useStore from "@/state/hooks/useStore";

// Types
import type { ReactNode } from "react";
import type { ImageUpdateEvent } from "@/types";

type LayerPreviewProps = Readonly<{
	id: string;
}>;

const PREVIEW_WIDTH = 36; // Width of the preview canvas

function LayerPreview({ id }: LayerPreviewProps): ReactNode {
	const drawCanvas = useStore((state) => state.drawCanvas);
	const previewRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		async function updateImage(event: ImageUpdateEvent) {
			const layerId = event.detail.layerId;

			// Layer that updated is not the one we are looking for.
			if (layerId !== id) return;

			const canvas = previewRef.current;
			if (!canvas) return;

			drawCanvas(canvas, layerId);
		}

		document.addEventListener("imageupdate", updateImage);

		return () => {
			document.removeEventListener("imageupdate", updateImage);
		};
	}, [id, drawCanvas]);

	return (
		<canvas
			ref={previewRef}
			className="h-full bg-white ml-1"
			width={PREVIEW_WIDTH}
			height={PREVIEW_WIDTH}
			style={{ width: `${PREVIEW_WIDTH}px`, height: `${PREVIEW_WIDTH}px` }}
			// Using data-testid for testing purposes
			data-testid={`preview-${id}`}
		/>
	);
}

export default LayerPreview;
