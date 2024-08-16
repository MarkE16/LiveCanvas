// Lib
import { useAppSelector } from "../../state/hooks/reduxHooks";
import { memo, useRef, forwardRef } from "react";
import UTILS from "../../utils";

// Types
import type { ForwardRefExoticComponent, Ref, MouseEventHandler, MouseEvent } from "react";
import { CanvasLayerProps } from "./CanvasLayer.types";
import { Coordinates } from "../Canvas/Canvas.types";


const CanvasLayer: ForwardRefExoticComponent<CanvasLayerProps> = forwardRef(({
  width,
  height,
  active,
  layerRef,
  layerIndex,
  xPosition,
  yPosition,
  ...rest
}, ref: Ref<HTMLCanvasElement>) => {
  const { 
    mode, 
    scale,
    color,
    drawStrength,
    eraserStrength
  } = useAppSelector((state) => state.canvas);

  const drawStartingPoint = useRef<Coordinates>({ x: 0, y: 0 });
  const isDrawing = useRef<boolean>(false);
  const ERASER_RADIUS = 7;

  // Handler for when the mouse is pressed down on the canvas.
  // This should initiate the drawing process.
  const onMouseDown: MouseEventHandler<HTMLCanvasElement> = (e: MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;

    const ctx = layerRef!.getContext('2d');

    // Calculate the position of the mouse relative to the canvas.
    const { x, y } = UTILS.getCanvasPointerPosition(e, layerRef!);

    if (mode === "draw") {
      ctx!.beginPath();
      ctx!.moveTo(x, y);
    }

    // Save the starting point of the drawing.
    drawStartingPoint.current = { x, y };
  }

  // Handler for when the mouse is moved on the canvas.
  // This should handle a majority of the drawing process.
  const onMouseMove: MouseEventHandler<HTMLCanvasElement> = (e: MouseEvent<HTMLCanvasElement>) => {
    // If the left mouse button is not pressed, then we should not draw.
    if (!isDrawing.current && e.buttons !== 1) {
      return;
    }

    const ctx = layerRef!.getContext('2d');

    // Calculate the position of the mouse relative to the canvas.
    const { x, y } = UTILS.getCanvasPointerPosition(e, layerRef!); 

    switch (mode) {
      case "draw": {
        ctx!.strokeStyle = color;
        ctx!.lineWidth = drawStrength;
        ctx!.lineCap = 'round';
        ctx!.lineJoin = 'round';

        ctx!.lineTo(x, y);
        ctx!.stroke();
        break;
      }

      case "erase": {
        ctx!.clearRect(
          x - ERASER_RADIUS * eraserStrength / 2,
          y - ERASER_RADIUS * eraserStrength / 2,
          ERASER_RADIUS * eraserStrength,
          ERASER_RADIUS * eraserStrength
        );
        break;
      }

      default: {
        break;
      }
    }
  }

  const onMouseUp = () => {
    isDrawing.current = false;

    const ctx = layerRef!.getContext('2d');

    if (mode === "draw") {
      ctx!.closePath();
    }
  }

  const onMouseEnter: MouseEventHandler<HTMLCanvasElement> = (e: MouseEvent<HTMLCanvasElement>) => {
    if (e.buttons === 1) {
      onMouseDown(e);
    }
  }

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      className={`canvas ${active ? 'active' : ''}`}
      style={{
        transform:
        `translate(
        ${xPosition}px, 
        ${yPosition}px
        ) scale(${scale})`,
        zIndex: layerIndex // Layers from the top of the list are drawn first.
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseEnter={onMouseEnter}
      
      {...rest}
    />
  );
});


export default memo(CanvasLayer);