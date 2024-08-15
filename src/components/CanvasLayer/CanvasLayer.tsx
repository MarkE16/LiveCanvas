// Lib
import { useAppSelector } from "../../state/hooks/reduxHooks";
import { forwardRef } from "react";

// Types
import type { ForwardRefExoticComponent, Ref  } from "react";
import { CanvasLayerProps } from "./CanvasLayer.types";

const CanvasLayer: ForwardRefExoticComponent<CanvasLayerProps> = forwardRef(
  (props, ref: Ref<HTMLCanvasElement>) => {
    const { width, height } = useAppSelector((state) => state.canvas);

    return (
      <canvas
        ref={ref}
        width={width}
        height={height}
        
        {...props}
      />
    );
  }
);

export default CanvasLayer;