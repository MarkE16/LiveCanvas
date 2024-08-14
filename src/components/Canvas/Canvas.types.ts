export type CanvasProps = {
  width?: number;
  height?: number;
  color?: string;
}

export type Coordinates = {
  x: number;
  y: number;
}

export type SelectionRectProperties = Coordinates & {
  rectWidth: number;
  rectHeight: number;
}