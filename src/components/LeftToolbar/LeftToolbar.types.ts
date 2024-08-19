export type Color = {
  name: string;
  value: string;
}

export type ToolbarProps = {
  color: string;
  setColor: (color: string) => void;
}