// Lib
import { useAppSelector } from "../../state/hooks/reduxHooks";
import { memo, useRef, forwardRef } from "react";
import UTILS from "../../utils";
import { socket } from "../../server/socket";

// Types
import type { Ref, MouseEventHandler, MouseEvent } from "react";
import { CanvasLayerProps } from "./CanvasLayer.types";
import { Coordinates } from "../Canvas/Canvas.types";


const CanvasLayer = forwardRef<HTMLCanvasElement, CanvasLayerProps>(({
  width,
  height,
  active = false,
  layerHidden = false,
  layerRef,
  layerIndex,
  xPosition,
  yPosition,
  setCanvasPosition,
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
  const clientPosition = useRef<Coordinates>({ x: 0, y: 0 });
  const isDrawing = useRef<boolean>(false);
  const ERASER_RADIUS = 7;

  const emitLayerState = () => {
    // Emit the canvas state to the server,
    // so that other users can see the changes
    // via the WebSocket connection.
    if (!layerRef) {
      console.error("Can't update layer over socket: Layer does not exist.");
      return;
    }

    console.log('Emitting canvas update...');
    return; // Remove this line when you're ready to emit the canvas update.

    layerRef.toBlob(b => {
      if (!b) {
        console.error('Error converting canvas to blob.');
        return;
      }

      socket.emit('canvas-update', b, layerRef.id);
    });
  }

  const getCurrentTransformPosition = (): Coordinates | undefined => {
    const transformRegex = /translate\(\s*(-?\d+(\.\d+)?)px,\s*(-?\d+(\.\d+)?)px\)/;

    if (!layerRef) return undefined;

    const match = layerRef.style.transform.match(transformRegex);

    if (!match) return undefined;

    const [, tx, , ty] = match;

    // The `+` operator converts the string to a number.
    return { x: +tx, y: +ty };
  }

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
    clientPosition.current = { x: e.clientX, y: e.clientY };
  }

  // Handler for when the mouse is moved on the canvas.
  // This should handle a majority of the drawing process.
  const onMouseMove: MouseEventHandler<HTMLCanvasElement> = (e: MouseEvent<HTMLCanvasElement>) => {
    // If the left mouse button is not pressed, then we should not draw.
    if ((!isDrawing.current && e.buttons !== 1) || layerHidden) {
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

      case "move": {
        // Move the canvas.

        const dx = e.clientX - clientPosition.current.x;
        const dy = e.clientY - clientPosition.current.y;

        const { x: startX, y: startY } = getCurrentTransformPosition()!;

        setCanvasPosition({ x: startX + dx, y: startY + dy });
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

    if (mode === "draw" || mode === "erase") {
      ctx!.closePath();
    }

    emitLayerState();
  }

  const onMouseEnter: MouseEventHandler<HTMLCanvasElement> = (e: MouseEvent<HTMLCanvasElement>) => {
    if (e.buttons === 1) {
      onMouseDown(e);
    }
  }

  const onMouseLeave = () => {
    isDrawing.current = false;

    // const { x, y } = getCurrentTransformPosition()!;

    // setCanvasPosition({ x, y });
  }
  

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      className={`canvas ${active ? "active" : ""} ${mode} ${layerHidden ? "hidden" : ""}`}
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
      onMouseLeave={onMouseLeave}
      
      {...rest}
    />
  );
});


export default memo(CanvasLayer);