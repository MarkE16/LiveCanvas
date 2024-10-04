// Lib
import { useAppSelector } from "../../state/hooks/reduxHooks";
import useHistory from "../../state/hooks/useHistory";
import { memo, useRef, forwardRef, useEffect } from "react";
import { getIndexedDB } from "../../state/idb";
import * as UTILS from "../../utils";

// Types
import type { Ref, MouseEventHandler, MouseEvent } from "react";
import type { CanvasLayerProps } from "./CanvasLayer.types";
import type { Coordinates } from "../Canvas/Canvas.types";


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
    eraserStrength,
    show_all: showall
  } = useAppSelector((state) => state.canvas);
  const history = useHistory();

  const drawStartingPoint = useRef<Coordinates>({ x: 0, y: 0 });
  const clientPosition = useRef<Coordinates>({ x: 0, y: 0 });
  const isDrawing = useRef<boolean>(false);
  const currentPath = useRef<Coordinates[]>([]);

  const ERASER_RADIUS = 7;

  const emitLayerState = () => {
    if (!layerRef) {
      console.error("Can't update layer over socket: Layer does not exist.");
      return;
    }

    console.log('Emitting canvas update...');

    layerRef.toBlob(blob => {
      if (!blob) return;

      getIndexedDB().then(db => {
        const tx = db.transaction("layers", "readwrite");
        const store = tx.objectStore("layers");

        store.put(blob, layerRef.id);
      });
    })
    // dispatch({
    //   type: "SAVE_ACTION",
    //   payload: {
    //     type: "undo",
    //     base64: base64Buffer
    //   }
    // })
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

    // Save the current path.
    currentPath.current.push({ x, y });

    console.log(currentPath.current);
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

        currentPath.current.push({ x, y });

        // emitLayerState(); // Not necessary to emit every time the mouse moves (at the moment)
        break;
      }

      case "erase": {
        ctx!.clearRect(
          x - ERASER_RADIUS * eraserStrength / 2,
          y - ERASER_RADIUS * eraserStrength / 2,
          ERASER_RADIUS * eraserStrength,
          ERASER_RADIUS * eraserStrength
        );
        // emitLayerState(); // Not necessary to emit every time the mouse moves (at the moment)
        break;
      }

      case "move": {
        // Move the canvas.

        const dx = e.clientX - clientPosition.current.x;
        const dy = e.clientY - clientPosition.current.y;

        layerRef!.style.transform = `translate(${xPosition + dx}px, ${yPosition + dy}px) scale(${scale})`;
        break;
      }

      default: {
        break;
      }
    }
  }

  const onMouseUp = (e: MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = false;
    
    const ctx = layerRef!.getContext('2d');
    
    const { x, y } = getCurrentTransformPosition()!;

    if (mode === "draw" || mode === "erase") {
      ctx!.closePath();

      // Save the action to the history.
      history.addHistory({
        mode: mode as "draw" | "erase" | "shapes",
        path: currentPath.current,
        layerId: layerRef!.id,
        color,
        drawStrength
      });

      // Clear the current path.
      currentPath.current = [];
    }


    setCanvasPosition({ x, y });

    emitLayerState();
  }

  const onMouseEnter: MouseEventHandler<HTMLCanvasElement> = (e: MouseEvent<HTMLCanvasElement>) => {
    if (e.buttons === 1) {
      onMouseDown(e);
    }
  }

  const onMouseLeave = () => {
    isDrawing.current = false;

    const { x, y } = getCurrentTransformPosition()!;

    setCanvasPosition({ x, y });
  }

    useEffect(() => {
    if (!layerRef) return;
  
    const layerCtx = layerRef.getContext('2d');
    if (!layerCtx) return;
  
    const subCanvas = document.createElement('canvas');
    subCanvas.width = layerRef.width;
    subCanvas.height = layerRef.height;
  
    const subCtx = subCanvas.getContext('2d');
    if (!subCtx) return;
  
    // Copy the existing content from the main canvas to the temporary canvas
    subCtx.drawImage(layerRef, 0, 0);
  
    // Draw the history of the layer on the temporary canvas
    history.undo.forEach(action => {
      const { mode, path, layerId, color, drawStrength } = action;
      if (layerId !== layerRef.id) return;
  
      // Draw the path
      subCtx.beginPath();
      subCtx.strokeStyle = color;
      subCtx.lineWidth = drawStrength;
      subCtx.lineCap = 'round';
      subCtx.lineJoin = 'round';
  
      path.forEach(({ x, y }, index) => {
        if (index === 0) {
          subCtx.moveTo(x, y);
        } else {
          subCtx.lineTo(x, y);
        }
      });
      subCtx.stroke();
    });

    subCtx.closePath();
    // Draw the temporary canvas back onto the main canvas

    layerCtx.clearRect(0, 0, layerRef.width, layerRef.height);
    layerCtx.drawImage(subCanvas, 0, 0);
  }, [history.undo, history.redo, layerRef]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      className={`canvas ${active || showall ? "active" : ""} ${mode} ${layerHidden ? "hidden" : ""}`}
      style={{
        transform:
        `translate(
        ${xPosition}px, 
        ${yPosition}px
        ) scale(${scale})`,
        zIndex: !layerHidden ? layerIndex : -2 // Layers from the top of the list are drawn first.
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