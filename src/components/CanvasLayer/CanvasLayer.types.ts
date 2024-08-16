import { HTMLAttributes } from 'react';

export type CanvasLayerProps = HTMLAttributes<HTMLCanvasElement> & {
  width: number;
  height: number;
  active?: boolean;
  layerIndex?: number; // z-index essentially.
  xPosition?: number;
  yPosition?: number;
};