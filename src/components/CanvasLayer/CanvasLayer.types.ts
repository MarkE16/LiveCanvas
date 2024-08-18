import type { HTMLAttributes, RefAttributes, SetStateAction, Dispatch } from 'react';

export type CanvasLayerProps = HTMLAttributes<HTMLCanvasElement> & RefAttributes<HTMLCanvasElement> & {
  width: number;
  height: number;
  active?: boolean;
  layerRef: HTMLCanvasElement | undefined;
  layerIndex?: number; // z-index essentially.
  xPosition: number;
  yPosition: number;
  setCanvasPosition: Dispatch<SetStateAction<{ x: number; y: number; }>>;
};