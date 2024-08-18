// Lib
import { useRef, useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '../../state/hooks/reduxHooks';
import { socket } from '../../server/socket';

// Types
import type { FC } from 'react';

// Styles
import './Canvas.styles.css';
import { Coordinates } from './Canvas.types';
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

  const clientPosition = useRef<Coordinates>({ x: 0, y: 0 });
  const [lastPointerPosition, setLastPointerPosition] = useState<Coordinates>({ x: 0, y: 0 });
  const [canvasPosition, setCanvasPosition] = useState<Coordinates>({ x: 0, y: 0 });

  const isSelecting = mode === "select" || mode === "shapes";

  const getActiveLayer = useCallback((): HTMLCanvasElement | undefined => {
    // Get the active layer.
    return refsOfLayers.current.find(ref => ref.classList.contains('active'));
  }, []);

  const getLayer = (id: string): HTMLCanvasElement | undefined => {
    return refsOfLayers.current.find(ref => ref.id === id);
  }

  // const isPointerInsideRect = (
  //   x: number,
  //   y: number
  // ): boolean => {
  //   if (!selectionRect.current) return false;

  //   const { x: rectX, y: rectY, rectWidth, rectHeight } = selectionRect.current;

    
  //   return x >= rectX && x <= rectX + rectWidth && y >= rectY && y <= rectY + rectHeight;
  // }

  const sendCanvasStateOnSocket = useCallback(() => {
    // Emit the canvas state to the server,
    // so that other users can see the changes
    // via the WebSocket connection.
    const activeLayer = getActiveLayer();
    if (!activeLayer) {
      console.error("Can't update layer over socket: Layer does not exist.");
      return;
    }

    activeLayer.toBlob(b => {
      if (!b) {
        console.error('Error converting canvas to blob.');
        return;
      }

      socket.emit('canvas-update', b, activeLayer.id);
    });
  }, [getActiveLayer]);

  const clearCanvas = () => {

    // We're only concerned with the main canvas.
    // The selection canvas is cleared when the selection is done.

    const activeLayer = getActiveLayer();

    if (!activeLayer) {
      console.error("`clearCanvas`: Can't clear canvas: Layer does not exist.");
      return;
    }

    const mainCanvas = activeLayer.getContext('2d');

    mainCanvas!.clearRect(0, 0, width, height);

    sendCanvasStateOnSocket();
  }

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
  }, []);

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

  const renderedLayers = layers.reverse().map((layer, i) => (
    <CanvasLayer
      key={layer.id}
      id={layer.id}
      width={width}
      ref={(element: HTMLCanvasElement) => refsOfLayers.current[i] = element}
      height={height}
      active={layer.active}
      layerRef={refsOfLayers.current[i]}
      layerIndex={!layer.active ? layers.length - i - 1 : layers.length}
      xPosition={canvasPosition.x}
      yPosition={canvasPosition.y}
      setCanvasPosition={setCanvasPosition}
    />
  ));

  console.log(clientPosition.current);

  return (
    <>
      <div id="canvas-bg">
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
              getActiveLayer={getActiveLayer}
              xPosition={canvasPosition.x}
              yPosition={canvasPosition.y}
            />
          )
        }
        
        {/* The main canvas. */}
        {renderedLayers}
      </div>
        { /* Add an extra layer for selection mode. */ }
      <div>
        <button id="clear-btn" onClick={clearCanvas}>Clear Canvas</button>
      </div>
    </>
  )
};

export default Canvas;