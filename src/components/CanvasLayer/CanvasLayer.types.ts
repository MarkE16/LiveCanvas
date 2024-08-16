import { HTMLAttributes, Ref } from 'react';

export type CanvasLayerProps = HTMLAttributes<HTMLCanvasElement> & Ref<HTMLCanvasElement> & {
  width: number;
  height: number;
  active?: boolean;
  layerRef: HTMLCanvasElement | undefined;
  layerIndex?: number; // z-index essentially.
  xPosition?: number;
  yPosition?: number;
};