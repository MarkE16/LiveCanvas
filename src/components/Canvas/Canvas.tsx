// Lib
import { useRef, useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../state/hooks/reduxHooks';

// Types
import type { FC, MouseEvent } from 'react';

// Styles
import './Canvas.styles.css';

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
    blob,
    layers
  } = state;

  const ref = useRef<HTMLCanvasElement>(null);
  const selectionRef = useRef<HTMLCanvasElement>(null);
  
  const isDrawing = useRef<boolean>(false);
  const selectPosition = useRef({
    x: ref.current?.offsetLeft ?? 0,
    y: ref.current?.offsetTop ?? 0
  });
  const selectionRect = useRef(null);
  const movingSelection = useRef<boolean>(false);
  const [lastPointerPosition, setLastPointerPosition] = useState({ x: 0, y: 0 });

  const ERASER_RADIUS = 5;

  const isPointerInsideRect = (
    x: number,
    y: number
  ): boolean => {
    if (!selectionRect.current) return false;

    const { x: rectX, y: rectY, rectWidth, rectHeight } = selectionRect.current;

    
    return x >= rectX && x <= rectX + rectWidth && y >= rectY && y <= rectY + rectHeight;
  }

  const onMouseDown = (e: MouseEvent) => {
    // Start drawing.
  
    const mainCanvas = ref.current!.getContext('2d');
    const { width: canvasWidth, height: canvasHeight } = ref.current!;
    const rect = ref.current!.getBoundingClientRect();

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


    if (mode === "draw") {
      mainCanvas!.beginPath();
      mainCanvas!.moveTo(canvasPointerX, canvasPointerY);
    } else if (mode === "select" ||  mode == "shapes") {
      selectPosition.current = { x: canvasPointerX, y: canvasPointerY };
      // ctx?.strokeRect(pointerX, pointerY, 0, 0);
    }
  }

  const onMouseMove = (e: MouseEvent) => {
    const mainCanvas = ref.current!.getContext('2d');
    const { width: canvasWidth, height: canvasHeight } = ref.current!;
    const rect = ref.current!.getBoundingClientRect();

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
          break;
        }
        
        case 'select': {

          // Draw the selection rectangle.
          const { x, y } = selectPosition.current;
          const selectionCanvas = selectionRef.current!.getContext('2d');

          selectionCanvas!.clearRect(0, 0, width, height);

          selectionCanvas!.strokeStyle = 'rgba(43, 184, 227)';
          selectionCanvas!.lineWidth = 2;
          selectionCanvas!.fillStyle = 'rgba(43, 184, 227, 0.1)';

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
        default:
          break;
      }
    }
  }

  const onMouseUp = () => {
    // Stop drawing.
    isDrawing.current = false;
    // movingSelection.current = false;

    const mainCanvas = ref.current!.getContext('2d');

    mainCanvas!.closePath();

    if (mode === "shapes") {
      const selectionCanvas = selectionRef.current!.getContext('2d');

      mainCanvas!.drawImage(selectionRef.current!, 0, 0);
      selectionCanvas!.clearRect(0, 0, width, height);
    }

    // Save the canvas state.
    // ref.current!.toBlob(b => {
    //   b?.text().then(txt => {
    //     dispatch({ type: 'SET_BLOB', payload: txt });
    //   });
    // })
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
    const mainCanvas = ref.current!.getContext('2d');

    mainCanvas!.clearRect(0, 0, width, height);
  }

  // useEffect(() =>{
  //   const { ctx } = getContext(mode);

  //   // blob is a string from Blob.text()

  //   if (blob) {
  //     const img = new Image();
  //     img.src = blob;
  //     img.onload = () => {
  //       ctx!.drawImage(img, 0, 0);
  //     }
  //   }

  //   selectionRect.current = null;
  // }, [blob, getContext, mode]);

  // Handle keyboard shortcuts for selection mode.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!selectionRect.current) return;
      const { x, y, rectWidth, rectHeight } = selectionRect.current;
      const selectionCanvas = selectionRef.current!.getContext('2d')

      switch (e.key) {
        case 'Backspace':
        case 'Delete': {
          const mainCanvas = ref.current!.getContext('2d');

          mainCanvas!.clearRect(x, y, rectWidth, rectHeight);
          
          
          selectionCanvas!.clearRect(0, 0, width, height);
          selectionRect.current = null;
          break;
        }

        case 'Escape': {
          selectionCanvas!.clearRect(0, 0, width, height);
          selectionRect.current = null;
          break;
        }

        default:
          break; // Do nothing.
      }
    }

    function canvasContextMenu(e: Event) {
      e.preventDefault();
    }

    const mainCanvasRef = ref.current!;
    const selectionCanvasRef = selectionRef.current!;
    
    window.addEventListener('keydown', handleKeyDown);
    mainCanvasRef.addEventListener('contextmenu', canvasContextMenu);
    selectionCanvasRef.addEventListener('contextmenu', canvasContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      mainCanvasRef.removeEventListener('contextmenu', canvasContextMenu);
      selectionCanvasRef.removeEventListener('contextmenu', canvasContextMenu);
    }
  }, [width, height]);

  return (
    <>
      <div id="canvas-bg">
        {/* A dot to indicate the radius of the eraser. */}
        { mode === "erase" && (
          <div style={{
            zIndex: 99,
            position: 'absolute',
            transform: `translate(${lastPointerPosition.x}px, ${lastPointerPosition.y}px)`,
            width: eraserStrength * ERASER_RADIUS,
            height: eraserStrength * ERASER_RADIUS,
            left: -2.5 * eraserStrength,
            top: -2.5 * eraserStrength,
            pointerEvents: 'none',
            cursor: 'crosshair',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          }}></div>
        )}
        { /* Add an extra layer for selection mode. */ }
        { (mode === "select" || mode === "shapes") && (
          <canvas
            className="ideadrawn-canvas selectionMode"
            width={width}
            height={height}
            ref={selectionRef}
            onPointerDown={onMouseDown}
            onPointerMove={onMouseMove}
            onPointerUp={onMouseUp}
            onPointerLeave={onMouseLeave}
          >

          </canvas>
        )}
        {/* The main canvas. */}
        {
          layers.map(layer => (
            <canvas
              key={layer.id}
              className={`ideadrawn-canvas ${layer.active ? 'active' : ''}`}
              width={width}
              height={height}
              ref={layer.active ? ref : null}
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