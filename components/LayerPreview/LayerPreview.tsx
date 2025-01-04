// Lib
import { useState, useEffect } from "react";
import * as Utils from "../../utils";

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

	useEffect(() => {
		async function updateImage(event: ImageUpdateEvent) {
			const layer = event.detail.layer;

			// Layer that updated is not the one we are looking for.
			if (layer.id !== id) return;

			const elements = Array.from(document.getElementsByClassName("element"));

			// Use 0.3 quality for the preview to save space and make it faster on performance.
			const blob = await Utils.generateCanvasImage(layer, elements, 0.3);

			setUrl(URL.createObjectURL(blob));
		}

		document.addEventListener("imageupdate", updateImage);

		return () => {
			document.removeEventListener("imageupdate", updateImage);
		};
	}, [id]);

	const onImageLoad = () => {
		if (url) {
			URL.revokeObjectURL(url);
		}
	};

	if (!url) {
		return (
			<div
				className="layer-preview"
				data-testid={`preview-${id}`}
			/>
		);
	}

	return (
		<img
			onLoad={onImageLoad}
			className="layer-preview"
			data-testid={`preview-${id}`}
			src={url}
			alt="Layer Preview"
		/>
	);
};

export default LayerPreview;
