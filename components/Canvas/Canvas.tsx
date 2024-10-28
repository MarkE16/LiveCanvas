// Lib
import { useRef, useCallback, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../state/hooks/reduxHooks";
import useIndexed from "../../state/hooks/useIndexed";

// Redux Actions
import { setLayers } from "../../state/slices/canvasSlice";

// Types
import type { FC } from "react";
import type { Coordinates } from "../../types";

// Styles
import "./Canvas.styles.css";

// Components
import CanvasLayer from "../CanvasLayer/CanvasLayer";
import SelectionCanvasLayer from "../SelectionCanvasLayer/SelectionCanvasLayer";
import { getAllEntries } from "../../state/idb";

const Canvas: FC = () => {
	const state = useAppSelector((state) => state.canvas);
	const dispatch = useAppDispatch();
	const { width, height, mode, layers } = state;

	const refsOfLayers = useRef<HTMLCanvasElement[]>(
		new Array<HTMLCanvasElement>(layers.length)
	);
	const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const { getDb } = useIndexed();
	const isSelecting = mode === "select" || mode === "shapes";

	/**
	 * Get the layer with the specified ID. If no ID is provided,
	 * the active layer is returned.
	 * @param id The ID of the layer to get.
	 * @returns The layer with the specified ID, or the active layer.
	 */
	const getLayer = useCallback((id?: string): HTMLCanvasElement | undefined => {
		if (id) {
			return refsOfLayers.current.find((ref) => ref.id === id);
		}

		return refsOfLayers.current.find((ref) => ref.classList.contains("active"));
	}, []);

	// TODO: Improve this implementation of updating the layers from the storage.
	useEffect(() => {
		async function updateLayers() {
			const entries = await getAllEntries("layers");

			updateLayerState(entries).then(() => updateLayerContents(entries));
		}

		function updateLayerState(entries) {
			return new Promise<void>((resolve) => {
				const newLayers = [];

				entries.forEach((entry, i) => {
					const [layerId, _] = entry;

					newLayers.push({
						name: `Layer ${i + 1}`,
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

				resolve();
			});
		}

		function updateLayerContents(entries) {
			entries.forEach((entry, i) => {
				const [_, blob] = entry;
				const canvas = refsOfLayers.current[i];

				if (!canvas) return;

				const ctx = canvas.getContext("2d");
				const img = new Image();

				img.onload = () => {
					ctx!.drawImage(img, 0, 0);
					URL.revokeObjectURL(img.src);
				};

				img.src = URL.createObjectURL(blob);
			});
		}

		updateLayers();
	}, [dispatch]);

	return (
		<>
			{/* NOTE: It may be better to refactor the layers as just canvas elements and not have a separate component.
			However, there may be benefits to having a separate component for each layer. Regardless, this should
			be considered for refactoring.
			*/}

			{isSelecting && (
				<SelectionCanvasLayer
					id="selection-canvas"
					width={width}
					height={height}
					getActiveLayer={getLayer}
					// xPosition={canvasPosition.x}
					// yPosition={canvasPosition.y}
				/>
			)}

			{/* The main canvas. */}
			{layers.toReversed().map((layer, i) => {
				return (
					<CanvasLayer
						key={layer.id}
						id={layer.id}
						width={width}
						ref={(element: HTMLCanvasElement) =>
							(refsOfLayers.current[i] = element)
						}
						height={height}
						active={layer.active}
						layerHidden={layer.hidden}
						layerRef={refsOfLayers.current[i]}
						layerIndex={layer.active ? layers.length + 1 : i + 1}
						// xPosition={canvasPosition.x}
						// yPosition={canvasPosition.y}
						// setCanvasPosition={setCanvasPosition}
					/>
				);
			})}

			<CanvasLayer
				id="background-canvas"
				ref={backgroundCanvasRef}
				width={width}
				height={height}
				active={false}
				layerIndex={0}
				layerRef={backgroundCanvasRef.current!}
				// setCanvasPosition={setCanvasPosition}
				// xPosition={canvasPosition.x}
				// yPosition={canvasPosition.y}
			/>
		</>
	);
};

export default Canvas;
