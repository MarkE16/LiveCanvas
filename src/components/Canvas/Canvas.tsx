// Lib
import { useRef, useState, useCallback, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../state/hooks/reduxHooks';

// Types
import type { FC } from 'react';
import type { Coordinates } from './Canvas.types';

// Styles
import './Canvas.styles.css';

// Components
import CanvasLayer from '../CanvasLayer/CanvasLayer';
import SelectionCanvasLayer from '../SelectionCanvasLayer/SelectionCanvasLayer';
import { getAllEntries, getIndexedDB } from '../../state/idb';

const Canvas: FC = () => {
  const state = useAppSelector(state => state.canvas);
  const dispatch = useAppDispatch();
  const { 
    width,
    height,
    mode,
    layers,
  } = state;

  const refsOfLayers = useRef<HTMLCanvasElement[]>([]);
  const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasPosition, setCanvasPosition] = useState<Coordinates>({ x: 0, y: 0 });

  const isSelecting = mode === "select" || mode === "shapes";

  /**
   * Get the layer with the specified ID. If no ID is provided,
   * the active layer is returned.
   * @param id The ID of the layer to get.
   * @returns The layer with the specified ID, or the active layer.
   */
  const getLayer = useCallback((id?: string): HTMLCanvasElement | undefined => {
    if (id) {
      return refsOfLayers.current.find(ref => ref.id === id);
    }

    return refsOfLayers.current.find(ref => ref.classList.contains('active'));
  }, []);

  // NOTE:
  // This implementation is not ideal on loading the layers
  // locally. This should be refactored.

  // First, get all the layers from the database.
  useEffect(() => {
    async function getLayers() {
      const entries = await getAllEntries("layers");
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
      dispatch({ type: 'SET_LAYERS', payload: newLayers });
    }

    getLayers();
  }, [dispatch]);

  // Then, update the contents of the layers.
  useEffect(() => {
    async function updateLayerContents() {
      const entries = await getAllEntries("layers");

      entries.forEach((entry, i) => {
        const [_, blob] = entry;
        const canvas = refsOfLayers.current[i];

        if (!canvas) return;
        // f

        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          console.log('Drawing image...');
          ctx!.drawImage(img, 0, 0);
          URL.revokeObjectURL(img.src);
        }

        img.src = URL.createObjectURL(blob);
      });
    }

    updateLayerContents();
  }, [dispatch]);

  return (
    <>
      {
        isSelecting && (
          <SelectionCanvasLayer
            id="selection-canvas"
            width={width}
            height={height}
            getActiveLayer={getLayer}
            xPosition={canvasPosition.x}
            yPosition={canvasPosition.y}
          />
        )
      }
      
      {/* The main canvas. */}
      {
        layers.reverse().map((layer, i) => {
          return (
            <CanvasLayer
              key={layer.id}
              id={layer.id}
              width={width}
              ref={(element: HTMLCanvasElement) => refsOfLayers.current[i] = element}
              height={height}
              active={layer.active}
              layerHidden={layer.hidden}
              layerRef={refsOfLayers.current[i]}
              layerIndex={layer.active ? layers.length + 1 : i + 1}
              xPosition={canvasPosition.x}
              yPosition={canvasPosition.y}
              setCanvasPosition={setCanvasPosition}
            />
          );
        })
      }

      <CanvasLayer
        id="background-canvas"
        ref={backgroundCanvasRef}
        width={width}
        height={height}
        active={false}
        layerIndex={0}
        layerRef={backgroundCanvasRef.current!}
        setCanvasPosition={setCanvasPosition}
        xPosition={canvasPosition.x}
        yPosition={canvasPosition.y}
      />
    </>
  )
};

export default Canvas;