// Lib
import useLayerReferences from "../../state/hooks/useLayerReferences";
import * as UTILS from "../../utils";

// Types
import type { FC } from "react";

const ExportCanvasButton: FC = () => {
	const { references } = useLayerReferences();

	const handleExport = async () => {
		const elements = Array.from(document.getElementsByClassName("element"));
		const blob = await UTILS.generateCanvasImage(references.current, elements);

		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = "canvas.png";
		a.click();

		URL.revokeObjectURL(url);
	};

	return <button onClick={handleExport}>Export Canvas</button>;
};

export default ExportCanvasButton;
