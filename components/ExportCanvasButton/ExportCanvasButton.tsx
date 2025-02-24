// Lib
import { useRef } from "react";
import useLayerReferences from "../../state/hooks/useLayerReferences";
import * as UTILS from "../../utils";

// Types
import type { FC } from "react";

const ExportCanvasButton: FC = () => {
	const { references } = useLayerReferences();
	const downloadRef = useRef<HTMLAnchorElement | null>(null);

	const handleExport = async () => {
		if (!downloadRef.current) throw new Error("Download ref not found");

		const elements = document.getElementsByClassName("element");
		const blob = await UTILS.generateCanvasImage(
			references.current, 
			elements,
			1,
			true
		);

		const url = URL.createObjectURL(blob);

		const a = downloadRef.current;
		a.href = url;
		a.download = "canvas.png";
		a.click();

		URL.revokeObjectURL(url);
	};

	return (
		<>
			<button
				onClick={handleExport}
				data-testid="export-button"
			>
				Export Canvas
			</button>
			<a
				ref={downloadRef}
				href="#"
				download="canvas.png"
				data-testid="export-link"
				style={{ display: "none" }}
			>
				Export Link
			</a>
		</>
	);
};

export default ExportCanvasButton;