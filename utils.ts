import { v4 as uuidv4 } from "uuid";
import type { Layer, Coordinates, CanvasElementType } from "./types";

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
function capitalize(str: string, options?: CapitalizeOptions): string {
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
}

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
function createLayer(name: string = "New Layer", id: string = uuidv4()): Layer {
	return {
		name,
		id,
		active: false,
		hidden: false
	};
}
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
function swapElements<T>(arr: T[], from: number, to: number): T[] {
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
}

function getCanvasScale(canvas: HTMLCanvasElement) {
	const rect = canvas.getBoundingClientRect();
	const scaleX = canvas.width / rect.width;
	const scaleY = canvas.height / rect.height;

	return { scaleX, scaleY };
}

/**
 * Get the position of the given X and Y coordinate relative to the given HTMLCanvasElement.
 * @param x The x-coordinate to calculate.
 * @param y The y-coordinate to calculate.
 * @param canvas The canvas element.
 * @returns The an X and Y coordinate relative to the canvas.
 */
function getCanvasPosition(
	x: number,
	y: number,
	canvas: HTMLCanvasElement
): Coordinates {
	const rect = canvas.getBoundingClientRect();
	const { scaleX, scaleY } = getCanvasScale(canvas);

	const computedX = (x - rect.left) * scaleX;
	const computedY = (y - rect.top) * scaleY;

	return { x: computedX, y: computedY };
}

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
function navigateTo(href: string): void {
	if (typeof window === "undefined") {
		throw new Error(`\`navigateTo\` can only be invoked in the browser.`);
	}

	let url = href;

	if (!url.startsWith("/")) {
		url = `/${url}`;
	}

	window.location.href = url;
}

/**
 * Determines whether two HTML elements are intersecting by comparing their bounding rectangles.
 * @param rect1 An HTML element.
 * @param rect2 An HTML element.
 * @returns whether the two rectangles are intersecting.
 */
function isRectIntersecting(rect1: Element, rect2: Element): boolean {
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
}

/**
 * Debounce a function by delaying its invocation by a specified number of milliseconds. If the debounced function is invoked again before the delay has elapsed, the timer is reset.
 * @param fn A function.
 * @param ms The number of milliseconds to wait before invoking the function.
 * @returns The debounced function.
 */
function debounce<T, A extends unknown[]>(
	fn: (this: T, ...args: A) => T,
	ms: number
) {
	let id: ReturnType<typeof setTimeout> | null = null;

	return function (this: T, ...args: A) {
		if (id !== null) {
			clearTimeout(id);
			id = null;
		}
		id = setTimeout(() => {
			fn.apply(this, args);
			id = null;
		}, ms);
	};
}

type ExportedElement = {
	x: number;
	y: number;
	width: number;
	height: number;
	type: CanvasElementType;
	fill: string | null;
	stroke: string | null;
	fontSize?: number;
	fontFamily?: string;
	fontContent?: string;
	layerId: string | null;
	spaceLeft: number;
	spaceTop: number;
	spaceWidth: number;
	spaceHeight: number;
	id: string;
};

async function generateCanvasImage(
	layers: ArrayLike<HTMLCanvasElement>,
	elements: ArrayLike<Element> = [],
	quality: number = 1,
	accountForDPI: boolean = false
): Promise<Blob> {
	if (quality > 1 || quality < 0) {
		throw new Error(
			"Quality must be in the range 0-1 in order to properly export."
		);
	}

	if (layers.length === 0) {
		throw new Error("No layers provided when attempting to export.");
	}

	const substituteCanvas = document.createElement("canvas");
	const referenceLayer = layers[0];
	const { width, height } = referenceLayer;
	const dpi = Number(referenceLayer.getAttribute("data-dpi"));
	const scale = Number(referenceLayer.getAttribute("data-scale"));

	if (!dpi) {
		throw new Error("Failed to get DPI from canvas when attempting to export.");
	}

	substituteCanvas.width = width;
	substituteCanvas.height = height;

	const ctx = substituteCanvas.getContext("2d");
	if (!ctx) {
		throw new Error(
			"Failed to get 2D context from canvas when attempting to export."
		);
	}

	if (accountForDPI) {
		substituteCanvas.width *= dpi;
		substituteCanvas.height *= dpi;
		ctx.scale(dpi, dpi);
	}

	// Set white background
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, width, height);

	/**
	 * A helper function that returns an array of lines of the given text that fit within the given width.
	 * @param text The text to split into lines.
	 * @param width The width of the text container.
	 * @param ctx The 2D context of the canvas.
	 */
	function generateTextLines(
		text: string,
		width: number,
		ctx: CanvasRenderingContext2D
	): string[] {
		const lines: string[] = [];
		let charsLeft = text;

		while (charsLeft.length > 0) {
			let splitIndex = charsLeft.length;

			// Find the index to split the word at.
			while (
				ctx.measureText(charsLeft.slice(0, splitIndex)).width > width &&
				splitIndex > 0
			) {
				splitIndex--;
			}

			// Require one character.
			if (splitIndex === 0) {
				splitIndex = 1;
			}

			const splitWord = charsLeft.slice(0, splitIndex);

			// "Super long words" can contain new lines,
			// which can disrupt the word wrapping logic.
			// Therefore, we need to account for new lines.
			const hasNewLine = splitWord.indexOf("\n");

			if (hasNewLine !== -1) {
				lines.push(splitWord.slice(0, hasNewLine));
				charsLeft = charsLeft.slice(hasNewLine + 1);
			} else {
				lines.push(splitWord);
				charsLeft = charsLeft.slice(splitIndex);
			}
		}
		return lines;
	}

	const promises = Array.prototype.map.call(layers, (layer) => {
		return new Promise<void>((resolve) => {
			const asObjects = (
				Array.prototype.map.call(elements, (element) => ({
					x: Number(element.getAttribute("data-x")),
					y: Number(element.getAttribute("data-y")),
					width: Number(element.getAttribute("data-width")),
					height: Number(element.getAttribute("data-height")),
					type: element.getAttribute("data-type") as CanvasElementType,
					fill: element.getAttribute("data-fill"),
					stroke: element.getAttribute("data-stroke"),
					fontSize: Number(element.getAttribute("data-font-size")),
					fontFamily: element.getAttribute("data-font-family") ?? "Arial",
					fontContent: element.getAttribute("data-font-content") ?? "",
					layerId: element.getAttribute("data-layerid"),
					spaceLeft: Number(element.getAttribute("data-canvas-space-left")),
					spaceTop: Number(element.getAttribute("data-canvas-space-top")),
					spaceWidth: Number(element.getAttribute("data-canvas-space-width")),
					spaceHeight: Number(element.getAttribute("data-canvas-space-height")),
					id: element.id
				})) as ExportedElement[]
			).filter((element) => element.layerId === layer.id);

			ctx.drawImage(layer, 0, 0);

			// Draw the elements
			console.log(asObjects);
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
					layer
				);
				const { x: endX, y: endY } = getCanvasPosition(
					eX + eWidth + element.spaceLeft,
					eY + eHeight + element.spaceTop,
					layer
				);

				const width = endX - startX;
				const height = endY - startY;

				ctx.fillStyle = element.fill ?? "";
				ctx.strokeStyle = element.stroke ?? "";

				console.log("Current element type:" + element.type);

				ctx.beginPath();
				switch (element.type) {
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
					case "text": {
						if (!element?.fontContent || !element?.fontSize) {
							throw new Error(
								`Failed to extract text from element with id ${element.id}.`
							);
						}

						ctx.font = `${element.fontSize}px ${element.fontFamily}`;
						ctx.textBaseline = "top";
						const lines = generateTextLines(element.fontContent, width, ctx);
						console.log(lines);
						const lineHeight = 1.5;
						for (let i = 0; i < lines.length; i++) {
							const line = lines[i];
							ctx.fillText(
								line,
								startX,
								startY + i * element.fontSize * lineHeight,
								width
							);
							ctx.strokeText(
								line,
								startX,
								startY + i * element.fontSize * lineHeight,
								width
							);
						}
						break;
					}
					default: {
						ctx.closePath();
						throw new Error(`Invalid shape ${element.type} when exporting.`);
					}
				}
			});
			ctx.closePath();
			resolve();
		});
	}) as Promise<void>[];

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
}

export {
	capitalize,
	createLayer,
	swapElements,
	getCanvasPosition,
	navigateTo,
	isRectIntersecting,
	debounce,
	generateCanvasImage
};
