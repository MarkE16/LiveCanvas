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
import InteractiveCanvasLayer from "../InteractiveCanvasLayer/InteractiveCanvasLayer";

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
	const { width, height, mode, layers } = state;

	const refsOfLayers = useLayerReferences();
	const { get } = useIndexed();
	const isSelecting = mode === "shapes";

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

				sorted.forEach((entry) => {
					const [layerId, layer] = entry;

					newLayers.push({
						name: layer.name,
						id: layerId,
						active: false,
						hidden: false
					});
				});

				if (newLayers.length === 0) {
					return;
				}

				newLayers[0].active = true;
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

			{isSelecting && (
				<InteractiveCanvasLayer
					id="interactive_canvas"
					width={width}
					height={height}
				/>
			)}

			{/* The main canvas. */}
			{layers
				.slice()
				.reverse()
				.map((layer, i) => {
					return (
						<CanvasLayer
							key={layer.id}
							id={layer.id}
							width={width}
							ref={(element: HTMLCanvasElement) => (refsOfLayers[i] = element)}
							name={layer.name}
							height={height}
							active={layer.active}
							layerHidden={layer.hidden}
							layerRef={refsOfLayers[i]}
							layerIndex={layer.active ? layers.length : layers.length - i - 1}
							isGrabbing={isGrabbing}
						/>
					);
				})}

			{/*eslint-disable-next-line*/}
			{/*@ts-ignore */}
			<CanvasLayer
				id="background-canvas"
				width={width}
				name="Background"
				height={height}
				active={false}
				layerIndex={0}
				isGrabbing={isGrabbing}
			/>
		</>
	);
};

export default Canvas;
