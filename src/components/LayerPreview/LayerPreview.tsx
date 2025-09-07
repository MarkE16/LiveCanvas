// Lib
import { useRef } from "react";
import useCanvasRedrawListener from "@/state/hooks/useCanvasRedrawListener";

// Types
import type { ReactNode } from "react";

type LayerPreviewProps = Readonly<{
	id: string;
}>;

const PREVIEW_WIDTH = 36; // Width of the preview canvas
const DEBOUNCE_REDRAW = true;

function LayerPreview({ id }: LayerPreviewProps): ReactNode {
	const previewRef = useRef<HTMLCanvasElement>(null);

	// useCanvasRedrawListener(previewRef, id, DEBOUNCE_REDRAW);

	return (
		<canvas
			ref={previewRef}
			className="h-full bg-white ml-1"
			width={PREVIEW_WIDTH}
			height={PREVIEW_WIDTH}
			style={{ width: PREVIEW_WIDTH, height: PREVIEW_WIDTH }}
			// Using data-testid for testing purposes
			data-testid={`preview-${id}`}
		/>
	);
}

export default LayerPreview;
