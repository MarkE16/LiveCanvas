// Lib
import { useRef, useState } from 'react';
import { useAppSelector } from '../../state/hooks/reduxHooks';

// Types
import type { FC, MouseEvent } from 'react';

// Styles
import './Canvas.styles.css';

const Canvas: FC = () => {
  const state = useAppSelector(state => state.canvas);
  const { width, height, color, mode } = state;

  const ref = useRef<HTMLCanvasElement>(null);
  const selectionRef = useRef<HTMLCanvasElement>(null);
  
  const isDrawing = useRef<boolean>(false);
  const selectPosition = useRef({
    x: ref.current?.offsetLeft ?? 0,
    y: ref.current?.offsetTop ?? 0
  });
  const [lastPointerPosition, setLastPointerPosition] = useState({ x: 0, y: 0 });

  const getContext = (editorMode: typeof mode) => {
    if (editorMode === 'select') {
      return { ctx: selectionRef.current!.getContext('2d'), canvas: selectionRef };
    }

    return { ctx: ref.current!.getContext('2d'), canvas: ref };
  }

  const onMouseDown = (e: MouseEvent) => {
    // Start drawing.
  
    const { ctx, canvas } = getContext(mode);
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
    const { ctx, canvas } = getContext(mode);
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
          ctx!.lineWidth = 5;
          ctx!.lineCap = 'round';
          ctx!.lineJoin = 'round';
          ctx!.strokeStyle = color;
          
          ctx!.lineTo(pointerX, pointerY);
          ctx!.stroke();
          break;
        }
        
        case 'erase': {
          ctx!.lineWidth = 10;
          ctx!.lineCap = 'round';
          ctx!.lineJoin = 'round';
          
          ctx!.clearRect(pointerX - 10, pointerY - 10, 20, 20);
          break;
        }
        
        case 'select': {
          const { x, y } = selectPosition.current;

          ctx!.clearRect(0, 0, width, height);

          ctx!.fillStyle = 'rgba(0, 0, 0, 0.1)';
          ctx!.fillRect(x, y, pointerX - x, pointerY - y);
            
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

    const { ctx } = getContext(mode);

    // Select Mode was on.
    if (mode == "select") {
      // const { offsetLeft, offsetTop } = canvas.current;

      ctx?.clearRect(0, 0, width, height);
    }

    ctx!.closePath();
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

  return (
    <>
      <div>
        {/* A dot to indicate the radius of the eraser. */}
        { mode === "erase" && (
          <div style={{
            zIndex: 99,
            position: 'absolute',
            transform: `translate(${lastPointerPosition.x}px, ${lastPointerPosition.y}px)`,
            width: 20,
            height: 20,
            left: -10,
            top: -10,
            pointerEvents: 'none',
            cursor: 'crosshair',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
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