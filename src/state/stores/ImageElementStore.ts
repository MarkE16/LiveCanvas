/** A class for storing the images of any elements that are images. This class is to be used alongside the CanvasElementSlice in the Zustand store. */
export default class ImageElementStore {
	public static images: Map<string, HTMLImageElement> = new Map();

	public static putImage(imageId: string, image: HTMLImageElement) {
		this.images.set(imageId, image);
	}

	public static getImage(imageId: string) {
		return this.images.get(imageId);
	}

	public static deleteImage(imageId: string) {
		this.images.delete(imageId);
	}
}
