// Lib
import { useState, useEffect } from "react";

// Styles
import "./LayerPreview.styles.css";

// Types
import type { FC } from "react";
import type { ImageUpdateEvent } from "../../types";
import useStore from "../../state/hooks/useStore";

type LayerPreviewProps = {
	id: string;
};

const LayerPreview: FC<LayerPreviewProps> = ({ id }) => {
	const prepareForExport = useStore((state) => state.prepareForExport);
	const [url, setUrl] = useState<string | null>(null);

	useEffect(() => {
		async function updateImage(event: ImageUpdateEvent) {
			const layer = event.detail.layer;

			// Layer that updated is not the one we are looking for.
			if (layer.id !== id) return;

			// Use 0.2 quality for the preview to save space and make it faster on performance.
			const blob = await prepareForExport([layer], 0.2);

			setUrl(URL.createObjectURL(blob));
		}

		document.addEventListener("imageupdate", updateImage);

		return () => {
			document.removeEventListener("imageupdate", updateImage);
		};
	}, [id, prepareForExport]);

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
