// Lib
import { useRef, useEffect, act } from "react";
import { useAppSelector } from "../../state/hooks/reduxHooks";
import UTILS from "../../utils";

// Types
import type { FC, MouseEventHandler, MouseEvent } from "react";
import type { SelectionCanvasLayerProps, Coordinates } from "./SelectionCanvasLayer.types";

const SelectionCanvasLayer: FC<SelectionCanvasLayerProps> = ({
  width,
  height,
  layerIndex,
  xPosition,
  yPosition,
  activeLayer,
  ...rest
}) => {
  const scale = useAppSelector(state => state.canvas.scale, (prev, next) => prev === next);
  const isSelecting = useRef<boolean>(false);
  const selectionRef = useRef<HTMLCanvasElement>(null);
  const selectionRct = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const selectionStartingPoint = useRef<Coordinates>({ x: 0, y: 0 });

  const onMouseDown: MouseEventHandler<HTMLCanvasElement> = (e: MouseEvent<HTMLCanvasElement>) => {
    isSelecting.current = true;
    
    const { x, y } = UTILS.getCanvasPointerPosition(e, selectionRef.current!);

    const ctx = selectionRef.current!.getContext("2d");

    ctx!.clearRect(0, 0, selectionRef.current!.width, selectionRef.current!.height);
    

    selectionStartingPoint.current = { x, y };
    selectionRct.current = { ...selectionRct.current, x, y };
  }

  const onMouseMove: MouseEventHandler<HTMLCanvasElement> = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting.current && e.buttons !== 1) {
      return;
    }

    const ctx = selectionRef.current!.getContext("2d");

    const { x, y } = UTILS.getCanvasPointerPosition(e, selectionRef.current!);
    const { x: startX, y: startY } = selectionStartingPoint.current;

    const rectWidth = x - startX;
    const rectHeight = y - startY;

    ctx!.clearRect(0, 0, selectionRef.current!.width, selectionRef.current!.height);

    ctx!.strokeStyle = 'rgba(43, 184, 227)';
    ctx!.lineWidth = 2;
    ctx!.fillStyle = 'rgba(103, 181, 230, 0.1)';

    ctx!.fillRect(startX, startY, rectWidth, rectHeight);
    ctx!.strokeRect(startX, startY, rectWidth, rectHeight);

    selectionRct.current = { x: startX, y: startY, width: rectWidth, height: rectHeight };
  }

  const onMouseUp: MouseEventHandler<HTMLCanvasElement> = () => {
    isSelecting.current = false;

    // const ctx = selectionRef.current!.getContext("2d");
    // ctx!.clearRect(0, 0, selectionRef.current!.width, selectionRef.current!.height);

  }

  useEffect(() => {
    function handleKeyboardActions(e: KeyboardEvent) {
      const { width: canvasWidth, height: canvasHeight } = selectionRef.current!;

      if (e.key === "Escape") {
        const ctx = selectionRef.current!.getContext("2d");
        ctx!.clearRect(0, 0, canvasWidth, canvasHeight);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        // Delete the selection.

        if (!activeLayer) {
          const err = "`SelectionCanvasLayer`: No active layer found to delete.";
          console.error(err);
          alert(err);
          return;
        }

        const ctx = activeLayer.getContext("2d");
        const selectCtx = selectionRef.current!.getContext("2d");

        ctx!.clearRect(
          selectionRct.current.x,
          selectionRct.current.y,
          selectionRct.current.width,
          selectionRct.current.height
        );
        selectCtx!.clearRect(0, 0, canvasWidth, canvasHeight);
      }
    }

    document.addEventListener("keydown", handleKeyboardActions);

    return () => document.removeEventListener("keydown", handleKeyboardActions);
  }, [activeLayer]);
  
  return (
    <canvas
      ref={selectionRef}
      width={width}
      height={height}
      className="canvas selection"
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
      
      {...rest}
    />
  );
}

export default SelectionCanvasLayer;