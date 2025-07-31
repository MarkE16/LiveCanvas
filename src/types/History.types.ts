import { CanvasElementPath, CanvasElement } from "./index";

export type HistoryAction = {
  type: "move_element" | "add_element" | "remove_element";
  properties: Partial<CanvasElement>;
}