import { HTMLAttributes } from 'react';

export type SelectionCanvasLayerProps = HTMLAttributes<HTMLCanvasElement> & {
  width: number;
  height: number;
  activeLayer: HTMLCanvasElement | undefined;
  layerIndex?: number; // z-index essentially.
  xPosition?: number;
  yPosition?: number;
};

export type Coordinates = {
  x: number;
  y: number;
};