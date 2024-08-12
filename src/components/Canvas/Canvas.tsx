// Lib
import { useRef, useState, useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../state/hooks/reduxHooks';

// Types
import type { FC, MouseEvent } from 'react';

// Styles
import './Canvas.styles.css';

const Canvas: FC = () => {
  const state = useAppSelector(state => state.canvas);
  const dispatch = useAppDispatch();
  const { width, height, color, mode, drawStrength, eraserStrength, blob } = state;

  const ref = useRef<HTMLCanvasElement>(null);
  const selectionRef = useRef<HTMLCanvasElement>(null);
  
  const isDrawing = useRef<boolean>(false);
  const selectPosition = useRef({
    x: ref.current?.offsetLeft ?? 0,
    y: ref.current?.offsetTop ?? 0
  });
  const selectionRect = useRef(null);
  const [lastPointerPosition, setLastPointerPosition] = useState({ x: 0, y: 0 });

  const ERASER_RADIUS = 5;

  const getContext = useCallback(() => {
    if (mode === 'select') {
      return { ctx: selectionRef.current!.getContext('2d'), canvas: selectionRef };
    }

    return { ctx: ref.current!.getContext('2d'), canvas: ref };
  }, [mode]);

  const onMouseDown = (e: MouseEvent) => {
    // Start drawing.
  
    const { ctx, canvas } = getContext();
    const { offsetLeft, offsetTop } = canvas.current!;

    const pointerX = e.clientX - offsetLeft;
    const pointerY = e.clientY - offsetTop;

    isDrawing.current = true;


    if (mode === "draw") {
      ctx!.beginPath();
      ctx!.moveTo(pointerX, pointerY);
    } else if (mode === "select") {
      selectPosition.current = { x: pointerX, y: pointerY };
      // ctx?.strokeRect(pointerX, pointerY, 0, 0);
    }
  }

  const onMouseMove = (e: MouseEvent) => {
    const { ctx, canvas } = getContext();
    const { offsetLeft, offsetTop } = canvas.current!;
    
    const pointerX = e.clientX - offsetLeft;
    const pointerY = e.clientY - offsetTop;

    setLastPointerPosition({
      x: e.clientX,
      y: e.clientY
    });

    
    // Draw.
    if (isDrawing.current) {
      
      switch (mode) {
        case 'draw': {
          ctx!.lineWidth = drawStrength;
          ctx!.lineCap = 'round';
          ctx!.lineJoin = 'round';
          ctx!.strokeStyle = color;
          
          ctx!.lineTo(pointerX, pointerY);
          ctx!.stroke();
          break;
        }
        
        case 'erase': {
          ctx!.clearRect(
            pointerX - eraserStrength * ERASER_RADIUS / 2,
            pointerY - eraserStrength * ERASER_RADIUS / 2,
            eraserStrength * ERASER_RADIUS,
            eraserStrength * ERASER_RADIUS
          );
          break;
        }
        
        case 'select': {
          const { x, y } = selectPosition.current;

          ctx!.clearRect(0, 0, width, height);

          ctx!.strokeStyle = 'rgba(0, 0, 255)';
          ctx!.lineWidth = 2;
          ctx!.fillStyle = 'rgba(0, 0, 255, 0.1)';
          ctx!.fillRect(x, y, pointerX - x, pointerY - y);
          ctx!.strokeRect(x, y, pointerX - x, pointerY - y);

          selectionRect.current = {
            x, y,
            rectWidth: pointerX - x,
            rectHeight: pointerY - y
          }
          // if (movingSelection.current) {
            //   const { x, y, rectWidth, rectHeight } = selectionRect.current;
            //   const dx = pointerX - x;
            //   const dy = pointerY - y;

            //   ctx!.clearRect(0, 0, width, height);

            //   ctx!.strokeStyle = 'rgba(0, 0, 255)';
            //   ctx!.lineWidth = 2;
            //   ctx!.fillStyle = 'rgba(0, 0, 255, 0.1)';

            //   // Follow the pointer.
            //   ctx!.fillRect(pointerX - dx, pointerY - dy, rectWidth, rectHeight);
            //   ctx!.strokeRect(pointerX - dx, pointerY - dy, rectWidth, rectHeight);
              

            //   selectionRect.current = {
            //     x: pointerX - dx,
            //     y: pointerY - dy,
            //     rectWidth,
            //     rectHeight
            //   }

              // ctx!.clearRect(x, y, rectWidth, rectHeight);

              // selectionRect.current = {
              //   x: pointerX,
              //   y: pointerY,
              //   rectWidth,
              //   rectHeight
              // }

              // ctx!.strokeStyle = 'rgba(0, 0, 255)';
              // ctx!.lineWidth = 2;
              // ctx!.fillStyle = 'rgba(0, 0, 255, 0.1)';
              // ctx!.fillRect(x, y, rectWidth, rectHeight);
              // ctx!.strokeRect(x, y, rectWidth, rectHeight);
          // }
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

    const { ctx } = getContext();

    // Select Mode was on.
    if (mode == "select") {
      // movingSelection.current = true;
      // const { offsetLeft, offsetTop } = canvas.current;

      // ctx?.clearRect(0, 0, width, height);
    }

    ctx!.closePath();

    // Save the canvas state.
    ref.current!.toBlob(b => {
      b?.text().then(txt => {
        dispatch({ type: 'SET_BLOB', payload: txt });
      });
    })
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
    const ctx = ref.current!.getContext('2d');

    ctx!.clearRect(0, 0, width, height);
  }

  useEffect(() =>{
    const { ctx } = getContext();

    // blob is a string from Blob.text()

    if (blob) {
      const img = new Image();
      img.src = blob;
      img.onload = () => {
        ctx!.drawImage(img, 0, 0);
      }
    }
  }, [blob, getContext, width, height]);

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
          
          selectionRect.current = null;

          selectionCanvas!.clearRect(0, 0, width, height);
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

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, [getContext, width, height]);

  return (
    <>
      <div>
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
        { mode === "select" && (
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
        <canvas
          className={`ideadrawn-canvas ${mode}`}
          width={width}
          height={height}
          ref={ref}
          onPointerDown={onMouseDown}
          onPointerMove={onMouseMove}
          onPointerUp={onMouseUp}
          onPointerLeave={onMouseUp}
          onPointerEnter={onMouseEnter}
        >
          
        </canvas>
      </div>
      <div>
        <button onClick={clearCanvas}>Clear Canvas</button>
      </div>
    </>
  )
};

export default Canvas;