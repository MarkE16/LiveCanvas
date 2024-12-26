import { v4 as uuidv4 } from "uuid";
import type { Layer, Coordinates } from "./types";

type CapitalizeOptions = {
	titleCase: boolean;
	delimiter: string;
};
/**
 * Capitalizes the first letter of a string and leaves the rest
 * of the string untouched.
 * @param str The string to capitalize.
 * @param options The options object.
 * @returns The capitalized string.
 *
 * @example
 * capitalize("hello, world!"); // => "Hello, world!"
 *
 * capitalize("hello, world!", { titleCase: true }); // => "Hello, World!"
 */
const capitalize = (str: string, options?: CapitalizeOptions): string => {
	if (!options) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	if (options.titleCase) {
		return str
			.split(options.delimiter)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(options.delimiter);
	}

	return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Create a new Layer object.
 * @param name The name of the layer. Defaults to "New Layer".
 * @param id The id of the layer. Defaults to a randomly generated UUID.
 * @returns A new Layer object.
 *
 * @example
 * createLayer(); // => { name: "New Layer", id: "1234-5678-9012-3456", active: false, hidden: false }
 *
 * createLayer("Background"); // => { name: "Background", id: "1234-5678-9012-3456", active: false, hidden: false }
 *
 * createLayer("Foreground", "9876-5432-1098-7654"); // => { name: "Foreground", id: "9876-5432-1098-7654", active: false, hidden: false }
 */
const createLayer = (
	name: string = "New Layer",
	id: string = uuidv4()
): Layer => ({
	name,
	id,
	active: false,
	hidden: false
});

/**
 * Swaps the position of two elements in an array. This is done by
 * selecting an element at the `from` index and moving it to the `to` index.
 * The element at the `to` index is then moved to the `from` index.
 *
 * If the `from` or `to` index is out of bounds, the original array is returned.
 * @param arr An array to perform the swap on.
 * @param from The index of the element to move.
 * @param to The new index of the moving element.
 * @returns The modified array, if indices are valid.
 */
const swapElements = <T>(arr: T[], from: number, to: number): T[] => {
	if (from < 0 || from >= arr.length) {
		return arr;
	}

	if (to < 0 || to >= arr.length) {
		return arr;
	}

	const elementAtTo = arr[to];
	const elementAtFrom = arr[from];

	return arr.map((element, i) => {
		if (i === from) return elementAtTo;
		if (i === to) return elementAtFrom;
		return element;
	});
};

/**
 * Get the position of the given X and Y coordinate relative to the given HTMLCanvasElement.
 * @param x The x-coordinate to calculate.
 * @param y The y-coordinate to calculate.
 * @param canvas The canvas element.
 * @param dpi The device pixel ratio. Defaults to `window.devicePixelRatio`.
 * @param accountForDpi Whether to account for the device pixel ratio. Defaults to `true`.
 * @returns The an X and Y coordinate relative to the canvas.
 */
const getCanvasPosition = (
	x: number,
	y: number,
	canvas: HTMLCanvasElement,
	dpi: number = window.devicePixelRatio,
	accountForDpi: boolean = true
): Coordinates => {
	const rect = canvas.getBoundingClientRect();
	const scaleX = canvas.width / rect.width;
	const scaleY = canvas.height / rect.height;
	const calculatedDpi = dpi || window.devicePixelRatio || 1;

	let computedX = (x - rect.left) * scaleX;
	let computedY = (y - rect.top) * scaleY;

	if (accountForDpi) {
		computedX /= calculatedDpi;
		computedY /= calculatedDpi;
	}

	return { x: computedX, y: computedY };
};

/**
 * Navigate to a new route. This function is merely a wrapper around `window.location.href`, mainly
 * for convenience and readability.
 * @param href - The route to navigate to.
 * @returns void
 *
 * @example
 * // Assume the base URL is https://example.com/
 * navigateTo("/home"); // => https://example.com/home
 *
 * navigateTo("about"); // => https://example.com/about
 *
 * navigateTo("/nested/route"); // => https://example.com/nested/route
 *
 * navigateTo("another/nested/route"); // => https://example.com/another/nested/route
 */
const navigateTo = (href: string): void => {
	if (typeof window === "undefined") {
		throw new Error(`\`navigateTo\` can only be invoked in the browser.`);
	}

	let url = href;

	if (!url.startsWith("/")) {
		url = `/${url}`;
	}

	window.location.href = url;
};

/**
 * Determines whether two HTML elements are intersecting by comparing their bounding rectangles.
 * @param rect1 An HTML element.
 * @param rect2 An HTML element.
 * @returns whether the two rectangles are intersecting.
 */
const isRectIntersecting = (rect1: Element, rect2: Element): boolean => {
	const {
		left: r1Left,
		top: r1Top,
		bottom: r1Bottom,
		right: r1Right
	} = rect1.getBoundingClientRect();
	const {
		left: r2Left,
		top: r2Top,
		bottom: r2Bottom,
		right: r2Right
	} = rect2.getBoundingClientRect();

	return (
		r1Left < r2Right && r1Right > r2Left && r1Top < r2Bottom && r1Bottom > r2Top
	);
};

/**
 * Debounce a function by delaying its invocation by a specified number of milliseconds. If the debounced function is invoked again before the delay has elapsed, the timer is reset.
 * @param fn A function.
 * @param ms The number of milliseconds to wait before invoking the function.
 * @returns The debounced function.
 */
const debounce = <T, A extends unknown[]>(
	fn: (this: T, ...args: A) => T,
	ms: number
) => {
	let id: ReturnType<typeof setTimeout> | null = null;

	return function (this: T, ...args: A) {
		if (id !== null) {
			clearTimeout(id);
			id = null;
		} else {
			id = setTimeout(() => {
				fn.apply(this, args);
				id = null;
			}, ms);
		}
	};
};

type ExportedElement = {
	x: number;
	y: number;
	width: number;
	height: number;
	shape: string | null;
	fill: string | null;
	border: string | null;
	layerId: string | null;
	spaceLeft: number;
	spaceTop: number;
	spaceWidth: number;
	spaceHeight: number;
	id: string;
};

const generateCanvasImage = async (
	layers: HTMLCanvasElement | HTMLCanvasElement[],
	elements: Element[],
	quality: number = 1
): Promise<Blob> => {
	if (quality > 1 || quality < 0) {
		throw new Error(
			"Quality must be in the range 0-1 in order to properly export."
		);
	}

	const isArray = Array.isArray(layers);
	if (isArray && layers.length === 0) {
		throw new Error("No layers provided when attempting to export.");
	}

	const substituteCanvas = document.createElement("canvas");
	const referenceLayer = isArray ? layers[0] : layers;
	const { width, height } = referenceLayer;

	substituteCanvas.width = width;
	substituteCanvas.height = height;

	const ctx = substituteCanvas.getContext("2d");
	if (!ctx) {
		throw new Error(
			"Failed to get 2D context from canvas when attempting to export."
		);
	}

	// Set white background
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, width, height);

	const layersArray = isArray ? layers : [layers];

	const promises = layersArray.map((layer) => {
		return new Promise<void>((resolve) => {
			const asObjects = elements
				.map<ExportedElement>((element) => ({
					x: Number(element.getAttribute("data-x")),
					y: Number(element.getAttribute("data-y")),
					width: Number(element.getAttribute("data-width")),
					height: Number(element.getAttribute("data-height")),
					shape: element.getAttribute("data-shape"),
					fill: element.getAttribute("data-fill"),
					border: element.getAttribute("data-border"),
					layerId: element.getAttribute("data-layerid"),
					spaceLeft: Number(element.getAttribute("data-canvas-space-left")),
					spaceTop: Number(element.getAttribute("data-canvas-space-top")),
					spaceWidth: Number(element.getAttribute("data-canvas-space-width")),
					spaceHeight: Number(element.getAttribute("data-canvas-space-height")),
					id: element.id
				}))
				.filter((element) => element.layerId === layer.id);

			ctx.drawImage(layer, 0, 0);

			// Draw the elements
			asObjects.forEach((element) => {
				let { x: eX, y: eY } = element;
				const { width: eWidth, height: eHeight } = element;

				if (isNaN(eX)) {
					eX =
						element.spaceLeft +
						element.spaceWidth / 2 -
						eWidth / 2 -
						element.spaceLeft;
				}

				if (isNaN(eY)) {
					eY =
						element.spaceTop +
						element.spaceHeight / 2 -
						eHeight / 2 -
						element.spaceTop;
				}

				const { x: startX, y: startY } = getCanvasPosition(
					eX + element.spaceLeft,
					eY + element.spaceTop,
					layer,
					0,
					false
				);
				const { x: endX, y: endY } = getCanvasPosition(
					eX + eWidth + element.spaceLeft,
					eY + eHeight + element.spaceTop,
					layer,
					0,
					false
				);

				const width = endX - startX;
				const height = endY - startY;

				ctx.fillStyle = element.fill || "";
				ctx.strokeStyle = element.border || "";

				ctx.beginPath();
				switch (element.shape) {
					case "circle": {
						ctx.ellipse(
							startX + width / 2,
							startY + height / 2,
							width / 2,
							height / 2,
							0,
							0,
							2 * Math.PI
						);
						ctx.fill();
						ctx.stroke();
						break;
					}
					case "rectangle": {
						ctx.fillRect(startX, startY, width, height);
						ctx.strokeRect(startX, startY, width, height);
						break;
					}
					case "triangle": {
						ctx.moveTo(startX + width / 2, startY);
						ctx.lineTo(startX + width, startY + height);
						ctx.lineTo(startX, startY + height);
						ctx.fill();
						ctx.stroke();
						break;
					}
					default: {
						ctx.closePath();
						throw new Error(`Invalid shape ${element.shape} when exporting.`);
					}
				}
			});
			ctx.closePath();
			resolve();
		});
	});

	await Promise.all(promises);

	return new Promise((resolve) => {
		substituteCanvas.toBlob(
			(blob) => {
				if (!blob) throw new Error("Failed to extract blob when exporting.");
				resolve(blob);
			},
			"image/jpeg",
			quality
		);
	});
};

const isMouseOverElement = (e: MouseEvent, element: Element) => {
	return e.target === element || element.contains(e.target as Node);
};

export {
	capitalize,
	createLayer,
	swapElements,
	getCanvasPosition,
	navigateTo,
	isRectIntersecting,
	debounce,
	generateCanvasImage,
	isMouseOverElement
};
