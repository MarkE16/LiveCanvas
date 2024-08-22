// Lib
import { useRef, useState, useCallback } from 'react';
import { useAppSelector } from '../../state/hooks/reduxHooks';

// Types
import type { FC } from 'react';
import type { Coordinates } from './Canvas.types';

// Styles
import './Canvas.styles.css';

// Components
import CanvasLayer from '../CanvasLayer/CanvasLayer';
import SelectionCanvasLayer from '../SelectionCanvasLayer/SelectionCanvasLayer';

const Canvas: FC = () => {
  const state = useAppSelector(state => state.canvas);
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

  const renderedLayers = layers.reverse().map((layer, i) => {
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
        layerIndex={!layer.active ? layers.length - i - 1 : layers.length}
        xPosition={canvasPosition.x}
        yPosition={canvasPosition.y}
        setCanvasPosition={setCanvasPosition}
      />
    );
  });

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
      {renderedLayers}

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