// Lib
import { useRef, useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '../../state/hooks/reduxHooks';
import { socket } from '../../server/socket';

// Types
import type { FC, MouseEvent } from 'react';

// Styles
import './Canvas.styles.css';
import { Coordinates, SelectionRectProperties } from './Canvas.types';
import CanvasLayer from '../CanvasLayer/CanvasLayer';
import SelectionCanvasLayer from '../SelectionCanvasLayer/SelectionCanvasLayer';

const Canvas: FC = () => {
  const state = useAppSelector(state => state.canvas);
  const { 
    width,
    height,
    color,
    mode,
    drawStrength,
    eraserStrength,
    shape,
    layers,
    scale,
  } = state;

  const refsOfLayers = useRef<HTMLCanvasElement[]>([]);
  const selectionRef = useRef<HTMLCanvasElement>(null);
  
  const isDrawing = useRef<boolean>(false);
  const selectPosition = useRef<Coordinates>({
    x: 0,
    y: 0
  });
  const selectionRect = useRef<SelectionRectProperties | null>(null);
  const clientPosition = useRef<Coordinates>({ x: 0, y: 0 });
  const [lastPointerPosition, setLastPointerPosition] = useState<Coordinates>({ x: 0, y: 0 });
  const canvasPosition = useRef<Coordinates>({ x: 0, y: 0 });

  const ERASER_RADIUS = 5;
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

  // const updateCanvasPosition = (dx: number, dy: number) => {}
    


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

  const onMouseMove = (e: MouseEvent) => {
    const activeLayer = getActiveLayer();

    if (!activeLayer) {
      console.error("`onMouseMove`: Can't draw: Layer does not exist.");
      return;
    }
    const mainCanvas = activeLayer.getContext('2d');
    const { width: canvasWidth, height: canvasHeight } = activeLayer;
    const rect = activeLayer.getBoundingClientRect();

    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;

    const canvasPointerX = (e.clientX - rect.left) * scaleX;
    const canvasPointerY = (e.clientY - rect.top) * scaleY;

    // setLastPointerPosition({
    //   x: e.clientX,
    //   y: e.clientY
    // });

    // if (selectionRect.current) {
    //   if (isPointerInsideRect(pointerX, pointerY)) {
    //     canvas.current!.style.cursor = 'move';
    //   } else {
    //     canvas.current!.style.cursor = 'crosshair';
    //   }
    // }

    
    // Draw. `e.buttons` is 1 when the left mouse button is pressed.
    if (isDrawing.current && e.buttons === 1) {
      
      switch (mode) {
        case 'draw': {
          mainCanvas!.lineWidth = drawStrength;
          mainCanvas!.lineCap = 'round';
          mainCanvas!.lineJoin = 'round';
          mainCanvas!.strokeStyle = color;
          
          mainCanvas!.lineTo(canvasPointerX, canvasPointerY);
          mainCanvas!.stroke();

          sendCanvasStateOnSocket();
          break;
        }

        case 'shapes': {
          const selectionCanvas = selectionRef.current!.getContext('2d');
          const { x, y } = selectPosition.current;
          
          selectionCanvas!.beginPath();
          selectionCanvas!.clearRect(0, 0, width, height);
          selectionCanvas!.lineWidth = 2;
          
          switch (shape) {
            case "circle": {
              // Recall: x^2 + y^2 = r^2
              const radius = Math.sqrt((canvasPointerX - x) ** 2 + (canvasPointerY - y) ** 2);
              selectionCanvas!.arc(x, y, radius, 0, 2 * Math.PI);
              break;
            }

            case "rectangle": {
              if (e.shiftKey) {
                // Make it a square with equal sides.

                selectionCanvas!.strokeRect(x, y, canvasPointerX - x, canvasPointerX - x);
              } else {
                selectionCanvas!.strokeRect(x, y, canvasPointerX - x, canvasPointerY - y);
              }
              break;
            }

            case "triangle": {
              selectionCanvas!.moveTo(x, y);
              selectionCanvas!.lineTo(x + (canvasPointerX - x) / 2, canvasPointerY);
              selectionCanvas!.lineTo(canvasPointerX, y);
              selectionCanvas!.lineTo(x, y);
              break;
            }
          }
          
          selectionCanvas!.stroke();
          selectionCanvas!.closePath();

          break;
        }
        
        case 'erase': {
          mainCanvas!.clearRect(
            canvasPointerX - eraserStrength * ERASER_RADIUS / 2, // x
            canvasPointerY - eraserStrength * ERASER_RADIUS / 2, // y
            eraserStrength * ERASER_RADIUS, // width
            eraserStrength * ERASER_RADIUS // height
          );

          sendCanvasStateOnSocket();
          break;
        }
        
        case 'select': {

          // Draw the selection rectangle.
          const { x, y } = selectPosition.current;
          const selectionCanvas = selectionRef.current!.getContext('2d');

          selectionCanvas!.clearRect(0, 0, width, height);

          selectionCanvas!.strokeStyle = 'rgba(43, 184, 227)';
          selectionCanvas!.lineWidth = 2;
          selectionCanvas!.fillStyle = 'rgba(103, 181, 230, 0.1)';

          // if (movingSelection.current) {
          //   const { rectX, rectY, rectWidth, rectHeight } = selectionRect.current;
          //   const dx = pointerX - rectX;
          //   const dy = pointerY - rectY;

          //   ctx!.fillRect(pointerX + dx, pointerY + dy, rectWidth, rectHeight);
          //   ctx!.strokeRect(pointerX + dx, pointerY + dy, rectWidth, rectHeight);
          //   selectionRect.current = {
          //     x: pointerX + dx,
          //     y: pointerY + dy,
          //     rectWidth,
          //     rectHeight
          //   }
          //   return;
          // }

          selectionCanvas!.fillRect(x, y, canvasPointerX - x, canvasPointerY - y);
          selectionCanvas!.strokeRect(x, y, canvasPointerX - x, canvasPointerY - y);

          selectionRect.current = {
            x,
            y,
            rectWidth: canvasPointerX - x,
            rectHeight: canvasPointerY - y
          }
        break;
      }

      case 'move': {
        // Move the canvas.

        const dx = e.clientX - clientPosition.current.x;
        const dy = e.clientY - clientPosition.current.y;

        if (!activeLayer) {
          console.error("`onMouseMove`: Can't move canvas: Layer does not exist.");
          return;
        }

        activeLayer.style.transform = `
          translate(
          ${(canvasPosition.current.x - -dx)}px,
          ${canvasPosition.current.y - -dy}px) scale(${scale})`;
          
          break;
        }
        default:
          break;
      }
    }
  }

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
      xPosition={canvasPosition.current.x}
      yPosition={canvasPosition.current.y}
    />
  ));

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
              xPosition={canvasPosition.current.x}
              yPosition={canvasPosition.current.y}
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