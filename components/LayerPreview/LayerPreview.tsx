// Lib
import { useState, useEffect, useRef } from "react";
import useLayerReferences from "../../state/hooks/useLayerReferences";
import * as UTILS from "../../utils";

// Styles
import "./LayerPreview.styles.css";

// Types
import type { FC } from "react";

type LayerPreviewProps = {
	id: string;
};

type ImageUpdateEvent = CustomEvent<{ layer: HTMLCanvasElement }>;

// This is so that TypeScript knows that this custom event exists globally.
declare global {
	interface DocumentEventMap {
		imageupdate: ImageUpdateEvent;
	}
}

const LayerPreview: FC<LayerPreviewProps> = ({ id }) => {
	const [url, setUrl] = useState<string | null>(null);
	const references = useLayerReferences();
	const imgRef = useRef<HTMLImageElement>(null);

	useEffect(() => {
		async function updateImage() {
			const layer = references.find((ref) => ref.id === id);

			if (!layer) {
				setUrl(null);
				return;
			}

			const elements = Array.from(document.getElementsByClassName("element"));

			// Use 0.5 quality for the preview to save space and make it faster on performance.
			const blob = await UTILS.generateCanvasImage(layer, elements, 0.5);

			setUrl(URL.createObjectURL(blob));
		}

		document.addEventListener("imageupdate", updateImage);

		return () => {
			document.removeEventListener("imageupdate", updateImage);
		};
	}, [id, references]);

	useEffect(() => {
		if (!imgRef.current) return;

		const ref = imgRef.current;

		function onLoad() {
			URL.revokeObjectURL(ref.src);
		}

		ref.addEventListener("load", onLoad);

		return () => {
			ref.removeEventListener("load", onLoad);
		};
	}, []);

	if (!url) {
		return <div className="layer-preview" />;
	}

	return (
		<img
			ref={imgRef}
			className="layer-preview"
			src={url}
			alt="Layer Preview"
		/>
	);
};

export default LayerPreview;
