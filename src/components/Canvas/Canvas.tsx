// Lib
import { forwardRef, useRef, useEffect } from 'react';
import { useAppSelector } from '../../state/hooks/reduxHooks';

// Types
import type { FC, MouseEvent } from 'react';
import type { CanvasProps } from './Canvas.types';

// Styles
import './Canvas.styles.css';

const Canvas: FC = () => {
  const color = useAppSelector(state => state.canvas.color);
  const width = useAppSelector(state => state.canvas.width);
  const height = useAppSelector(state => state.canvas.height);
  const ref = useRef<HTMLCanvasElement>(null);
  
  const isDrawing = useRef<boolean>(false);

  const onMouseDown = (e: MouseEvent) => {
    // Start drawing.
    if (!ref.current) return;
  
    const ctx = ref.current?.getContext('2d');
    const { offsetLeft, offsetTop } = ref.current;

    isDrawing.current = true;
    ctx?.beginPath();
    ctx?.moveTo(e.clientX - offsetLeft, e.clientY - offsetTop);
  }

  const onMouseMove = (e: MouseEvent) => {
    // Draw.
    if (isDrawing.current && ref.current) {
      const ctx = ref.current.getContext('2d');
      const { offsetLeft, offsetTop } = ref.current;

      ctx?.lineTo(e.clientX - offsetLeft, e.clientY - offsetTop);
      ctx?.stroke();
    }
  }

  const onMouseUp = (e: MouseEvent) => {
    // Stop drawing.
    isDrawing.current = false;
  }

  const clearCanvas = () => {
    if (!ref.current) return;

    const ctx = ref.current.getContext('2d');

    ctx?.clearRect(0, 0, width, height);
  }

  useEffect(() => {

    const ctx = ref.current?.getContext('2d');

    ctx.strokeStyle = color;

    try {
      ctx?.restore();
    } catch (e) {
      console.error(e);
    }
  }, [color, ref]);

  return (
    <>
      <canvas
      id="ideadrawn-canvas"
      width={width}
      height={height}
      ref={ref}
      onPointerDown={onMouseDown}
      onPointerMove={onMouseMove}
      onPointerUp={onMouseUp}
      >
        
      </canvas>
      <div>
        <button onClick={clearCanvas}>Clear Canvas</button>
      </div>
    </>
  )
};

export default Canvas;