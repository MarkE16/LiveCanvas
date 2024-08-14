// Lib
import { useRef, useState, useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../state/hooks/reduxHooks';
import { socket } from '../../server/socket';

// Types
import type { FC, MouseEvent } from 'react';

// Styles
import './Canvas.styles.css';
import { Coordinates, SelectionRectProperties } from './Canvas.types';

const Canvas: FC = () => {
  const state = useAppSelector(state => state.canvas);
  const dispatch = useAppDispatch();
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
    show_all
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

  const getActiveLayer = (): HTMLCanvasElement | undefined => {

    // Referring to if the layer has the class 'active'
    // so that this function does not have to depend
    // on `layers` from the state.
    return refsOfLayers.current.find(ref => ref.classList.contains('active'));
  }

  const getLayer = (id: string): HTMLCanvasElement | undefined => {
    return refsOfLayers.current.find(ref => ref.id === id);
  }

  const isPointerInsideRect = (
    x: number,
    y: number
  ): boolean => {
    if (!selectionRect.current) return false;

    const { x: rectX, y: rectY, rectWidth, rectHeight } = selectionRect.current;

    
    return x >= rectX && x <= rectX + rectWidth && y >= rectY && y <= rectY + rectHeight;
  }

  const getCanvasPosition = (): Coordinates | undefined => {
    const transformRegex = /translate\(\s*(-?\d+(\.\d+)?)px,\s*(-?\d+(\.\d+)?)px\)/;

    const layer = getActiveLayer();

    if (!layer) return undefined;

    const match = layer.style.transform.match(transformRegex);

    if (!match) return undefined;

    const [, tx, , ty] = match;

    // The `+` operator converts the string to a number.
    return { x: +tx, y: +ty };
  }

  const updateCanvasPosition = (dx: number, dy: number) => {}
    


  const sendCanvasStateOnSocket = useCallback(() => {
    // Emit the canvas state to the server,
    // so that other users can see the changes
    // via the WebSocket connection.
    const layer = getActiveLayer();

    if (!layer) {
      console.error("Can't update layer over socket: Layer does not exist.");
      return;
    }

    layer.toBlob(b => {
      if (!b) {
        console.error('Error converting canvas to blob.');
        return;
      }

      socket.emit('canvas-update', b, layer.id);
    });
  }, []);

  const onMouseDown = (e: MouseEvent) => {
    // Start drawing.

    const layer = getActiveLayer();

    if (!layer) {
      console.error("`onMouseDown`: Can't draw: Layer does not exist.");
      return;
    }

    const mainCanvas = layer.getContext('2d');
    const { width: canvasWidth, height: canvasHeight } = layer;
    const rect = layer.getBoundingClientRect();

    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;

    const canvasPointerX = (e.clientX - rect.left) * scaleX;
    const canvasPointerY = (e.clientY - rect.top) * scaleY;

    // if (isPointerInsideRect(pointerX, pointerY)) {
      // Move the selection.
      // movingSelection.current = true;
      // return;
      // const mainCanvas = ref.current!.getContext('2d');
      // const selectionCanvas = selectionRef.current!.getContext('2d');
      // const { x, y, rectWidth, rectHeight } = selectionRect.current!;

      // const dx = pointerX - x;
      // const dy = pointerY - y;

      // // mainCanvas!.drawImage(selectionRef.current!, x, y, rectWidth, rectHeight, pointerX - dx, pointerY - dy, rectWidth, rectHeight);
      
    // }
    isDrawing.current = true;

    
    clientPosition.current = { x: e.clientX, y: e.clientY };
    if (mode === "draw") {
      mainCanvas!.beginPath();
      mainCanvas!.moveTo(canvasPointerX, canvasPointerY);

    } else if (mode === "select" ||  mode == "shapes") {
      selectPosition.current = { x: canvasPointerX, y: canvasPointerY };

    } else if (mode === "move") {
      const { x: tx, y: ty } = getCanvasPosition()!;

      canvasPosition.current = { x: tx, y: ty };
    }
  }

  const onMouseMove = (e: MouseEvent) => {
    const layer = getActiveLayer();

    if (!layer) {
      console.error("`onMouseMove`: Can't draw: Layer does not exist.");
      return;
    }
    const mainCanvas = layer.getContext('2d');
    const { width: canvasWidth, height: canvasHeight } = layer;
    const rect = layer.getBoundingClientRect();

    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;

    const canvasPointerX = (e.clientX - rect.left) * scaleX;
    const canvasPointerY = (e.clientY - rect.top) * scaleY;

    setLastPointerPosition({
      x: e.clientX,
      y: e.clientY
    });

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

        const layer = getActiveLayer();

        if (!layer) {
          console.error("`onMouseMove`: Can't move canvas: Layer does not exist.");
          return;
        }

        layer.style.transform = `
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

  const onMouseUp = () => {
    // Stop drawing.
    isDrawing.current = false;
    // movingSelection.current = false;

    const layer = getActiveLayer();

    if (!layer) {
      console.error("`onMouseUp`: Can't draw: Layer does not exist.");
      return
    }

    const mainCanvas = layer.getContext('2d');

    mainCanvas!.closePath();

    if (mode === "zoom_in" || mode === "zoom_out" || mode == "select") return;

    if (mode === "shapes") {
      const selectionCanvas = selectionRef.current!.getContext('2d');

      mainCanvas!.drawImage(selectionRef.current!, 0, 0);
      selectionCanvas!.clearRect(0, 0, width, height);
      sendCanvasStateOnSocket();
    } else if (mode === "move") {
      const { x: tx, y: ty } = getCanvasPosition()!;

      canvasPosition.current = {
        x: tx,
        y: ty
      };
    }

  }

  const onMouseLeave = () => {
    //...
  }

  const onMouseEnter = (e: MouseEvent) => {
    // Check if the mouse is down.
    // If it is, start drawing.

    if (e.buttons === 1) {
      onMouseDown(e);
    }
  }

  const clearCanvas = () => {

    // We're only concerned with the main canvas.
    // The selection canvas is cleared when the selection is done.
    const layer = getActiveLayer();

    if (!layer) {
      console.error("`clearCanvas`: Can't clear canvas: Layer does not exist.");
      return;
    }

    const mainCanvas = layer.getContext('2d');

    mainCanvas!.clearRect(0, 0, width, height);

    sendCanvasStateOnSocket();
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const layer = getActiveLayer();

      if (!layer) {
        console.error("`handleKeyDown`: Can't draw: Layer does not exist.");
        return;
      }

      const selectionCanvas = selectionRef.current!.getContext('2d')
      
      switch (e.key) {
        case 'Backspace':
        case 'Delete': {
          
          if (!selectionRect.current) { return; }

          const mainCanvas = layer.getContext('2d');
          const { x, y, rectWidth, rectHeight } = selectionRect.current;
          mainCanvas!.clearRect(x, y, rectWidth, rectHeight);
          
          
          selectionCanvas!.clearRect(0, 0, width, height);

          sendCanvasStateOnSocket();
          selectionRect.current = null;
          break;
      }

        case 'Escape': {
          selectionCanvas!.clearRect(0, 0, width, height);
          selectionRect.current = null;
          break;
        }

        // Zoom in.
        case '+': {
          if (!e.shiftKey) { return; }

          dispatch({ type: 'SET_SCALE', payload: scale + 0.1 });
          break;
        }

        // Zoom out.
        case '_': {
          if (!e.shiftKey) { return; }

          dispatch({ type: 'SET_SCALE', payload: scale - 0.1 });

          break;
        }

        default:
          break; // Do nothing.
      }
    }

    function canvasContextMenu(e: Event) {
      e.preventDefault();
    }

    const layer = getActiveLayer();

    if (!layer) {
      console.error("`useEffect` (keyboard shortcuts): Can't draw: Layer does not exist.");
      return;
    }

    const mainCanvasRef = layer;
    const selectionCanvasRef = selectionRef.current;
    
    window.addEventListener('keydown', handleKeyDown);
    mainCanvasRef.addEventListener('contextmenu', canvasContextMenu);
    selectionCanvasRef?.addEventListener('contextmenu', canvasContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      mainCanvasRef.removeEventListener('contextmenu', canvasContextMenu);
      selectionCanvasRef?.removeEventListener('contextmenu', canvasContextMenu);
    };
  }, [width, height, dispatch, scale, sendCanvasStateOnSocket]);

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

        { /* Add an extra layer for selection mode. */ }
          <canvas
            className={`ideadrawn-canvas selectionMode ${mode === "select" || mode === "shapes" ? 'active' : ''}`}
            style={{
              transform: `translate(
              ${canvasPosition.current.x}px,
              ${canvasPosition.current.y}px
              ) scale(${scale})`
            }}
            width={width}
            height={height}
            ref={selectionRef}
            onPointerDown={onMouseDown}
            onPointerMove={onMouseMove}
            onPointerUp={onMouseUp}
            onPointerLeave={onMouseLeave}
          >

          </canvas>
        
        {/* The main canvas. */}
        {
          layers.reverse().map((layer, i) => (
            <canvas
              key={layer.id}
              id={layer.id}
              className={`ideadrawn-canvas ${(layer.active || show_all) ? 'active' : ''} ${mode}`}
              style={{
                transform:
                `translate(
                ${canvasPosition.current.x}px, 
                ${canvasPosition.current.y}px
                ) scale(${scale})`,
                zIndex: layers.length - i // Layers from the top of the list are drawn first. 
              }}
              width={width}
              height={height}
              ref={el => refsOfLayers.current[i] = el!}
              onPointerDown={onMouseDown}
              onPointerMove={onMouseMove}
              onPointerUp={onMouseUp}
              onPointerLeave={onMouseLeave}
              onPointerEnter={onMouseEnter}
            >
            </canvas>
          ))
        }
      </div>
      <div>
        <button id="clear-btn" onClick={clearCanvas}>Clear Canvas</button>
      </div>
    </>
  )
};

export default Canvas;