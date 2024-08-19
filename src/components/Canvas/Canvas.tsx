// Lib
import { useRef, useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '../../state/hooks/reduxHooks';
import { socket } from '../../server/socket';

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

  const [lastPointerPosition, setLastPointerPosition] = useState<Coordinates>({ x: 0, y: 0 });
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

  // const isPointerInsideRect = (
  //   x: number,
  //   y: number
  // ): boolean => {
  //   if (!selectionRect.current) return false;

  //   const { x: rectX, y: rectY, rectWidth, rectHeight } = selectionRect.current;

    
  //   return x >= rectX && x <= rectX + rectWidth && y >= rectY && y <= rectY + rectHeight;
  // }

  // Effect for setting up the socket.
  useEffect(() => {

    socket.on('canvas-update', (data: ArrayBuffer, layerId: string) => {

      const layerToUpdate = getLayer(layerId);
      if (!layerToUpdate) {
        console.error(
          `Error updating layer ${layerId}: Layer does not exist.`
        );
        return;
      }

      const mainCanvas = layerToUpdate.getContext('2d');
      const img = new Image();

      img.onload = () => {

        // Use the `width` and `height` properties of the canvas
        // instead of the `width` and `height` state variables
        // so that the effect does not depend on them.
        mainCanvas!.clearRect(0, 0, layerToUpdate.width, layerToUpdate.height);
        mainCanvas!.drawImage(img, 0, 0);
      }

      const blob = new Blob([data]);

      img.src = URL.createObjectURL(blob);
    });

    return () => {
      socket.off('canvas-update');
    };
  }, [getLayer]);

  useEffect(() => {
    refsOfLayers.current.forEach((ref, i) => {
      if (ref) {
        const ctx = ref.getContext('2d');
        const layerBuffer = layers[i].buffer;

        if (layerBuffer) {
          const img = new Image();

          img.onload = () => {
            ctx!.drawImage(img, 0, 0);
          }

          img.src = URL.createObjectURL(new Blob([layerBuffer]));
        }
      }
    })
  }, [layers, width, height]);

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

  console.log(canvasPosition)

  return (
    <>
      {/* A dot to indicate the radius of the eraser. */}
      {/* { mode === "erase" && (
        <div style={{
          zIndex: 99,
          position: 'absolute',
          transform:
          `translate(
          ${lastPointerPosition.x}px,
          ${lastPointerPosition.y}px
          )`,
          width: `${ERASER_RADIUS * eraserStrength}px`,
          height: `${ERASER_RADIUS * eraserStrength}px`,
          pointerEvents: 'none',
          cursor: 'crosshair',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
        }}></div>
      )} */}

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
        width={width}
        height={height}
        active={false}
        layerIndex={-1}
        xPosition={canvasPosition.x}
        yPosition={canvasPosition.y}
      />
    </>
  )
};

export default Canvas;