// Lib
import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../state/hooks/reduxHooks";
import useIndexed from "../../state/hooks/useIndexed";
import useLayerReferences from "../../state/hooks/useLayerReferences";

// Redux Actions
import { setLayers } from "../../state/slices/canvasSlice";

// Types
import type { FC } from "react";
import type { Layer } from "../../types";

// Styles
import "./Canvas.styles.css";

// Components
import CanvasLayer from "../CanvasLayer/CanvasLayer";

type CanvasProps = {
	isGrabbing: boolean;
};

type DBLayer = {
	image: Blob;
	name: string;
	position: number;
};

const Canvas: FC<CanvasProps> = ({ isGrabbing }) => {
	const state = useAppSelector((state) => state.canvas);
	const dispatch = useAppDispatch();
	const { width, height, layers } = state;

	const refsOfLayers = useLayerReferences();
	const { get } = useIndexed();

	// TODO: Improve this implementation of updating the layers from the storage.
	useEffect(() => {
		async function updateLayers() {
			const entries = await get<[string, DBLayer][]>("layers");

			const newEntries = await updateLayerState(entries);
			updateLayerContents(newEntries);
		}

		function updateLayerState(entries: [string, DBLayer][]) {
			return new Promise<[string, DBLayer][]>((resolve) => {
				const newLayers: Layer[] = [];

				const sorted = entries.sort((a, b) => b[1].position - a[1].position); // Sort by position, where the highest position is the top layer.

				sorted.forEach((entry, i) => {
					const [layerId, layer] = entry;

					newLayers.push({
						name: layer.name,
						id: layerId,
						active: i === 0,
						hidden: false
					});
				});

				if (newLayers.length === 0) {
					return;
				}

				dispatch(setLayers(newLayers));

				resolve(sorted);
			});
		}

		function updateLayerContents(entries: [string, DBLayer][]) {
			entries.forEach((entry) => {
				const [, layer] = entry;
				const canvas = refsOfLayers[layer.position];

				if (!canvas) return;

				const ctx = canvas.getContext("2d");
				const img = new Image();

				img.onload = () => {
					ctx!.drawImage(img, 0, 0);
					URL.revokeObjectURL(img.src);
				};

				img.src = URL.createObjectURL(layer.image);
			});
		}

		updateLayers();
	}, [dispatch, get, refsOfLayers]);

	return (
		<>
			{/* NOTE: It may be better to refactor the layers as just canvas elements and not have a separate component.
			However, there may be benefits to having a separate component for each layer. Regardless, this should
			be considered for refactoring.
			*/}

			{/* The main canvas. */}
			{layers
				.slice()
				.reverse()
				.map((layer, i) => (
					<CanvasLayer
						key={layer.id}
						data-testid="canvas-layer"
						id={layer.id}
						width={width}
						ref={(element: HTMLCanvasElement) => (refsOfLayers[i] = element)}
						name={layer.name}
						height={height}
						active={layer.active}
						layerHidden={layer.hidden}
						layerRef={refsOfLayers[i]}
						layerIndex={layer.active ? layers.length : layers.length - i}
						isGrabbing={isGrabbing}
					/>
				))}

			{/*eslint-disable-next-line*/}
			{/*@ts-ignore */}
			<CanvasLayer
				id="background-canvas"
				width={width}
				name="Background"
				height={height}
				active={false}
				layerIndex={layers.length === 1 ? 0 : 1}
				isGrabbing={isGrabbing}
			/>
		</>
	);
};

export default Canvas;
