export * from "./Canvas.types";
export * from "./History.types";
export * from "./Slices.types";

export type ImageUpdateEvent = CustomEvent<{ layer: HTMLCanvasElement }>;

declare global {
	interface Window {}

	// This is so that TypeScript knows that this custom event exists globally.
	interface DocumentEventMap {
		imageupdate: ImageUpdateEvent;
	}
}
