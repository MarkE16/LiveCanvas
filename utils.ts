import { v4 as uuidv4 } from "uuid";
import { MouseEvent } from "react";
import type { Layer, Coordinates } from "./types";

/**
 * Capitalizes the first letter of a string and leaves the rest
 * of the string untouched.
 * @param str The string to capitalize.
 * @returns The capitalized string.
 *
 * @example
 * capitalize("hello, world!"); // => "Hello, world!"
 */
const capitalize = (str: string): string =>
	str.charAt(0).toUpperCase() + str.slice(1);

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
 * Get the position of the pointer on the given canvas element.
 * @param e The MouseEvent object.
 * @param canvas The canvas element.
 * @returns The position of the pointer on the canvas.
 */
const getCanvasPointerPosition = (
	e: MouseEvent<HTMLCanvasElement>,
	canvas: HTMLCanvasElement
	// dpi: number = window.devicePixelRatio
): Coordinates => {
	const rect = canvas.getBoundingClientRect();
	const scaleX = canvas.width / rect.width;
	const scaleY = canvas.height / rect.height;

	const x = (e.clientX - rect.left) * scaleX;
	const y = (e.clientY - rect.top) * scaleY;

	return { x, y };
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

export {
	capitalize,
	createLayer,
	swapElements,
	getCanvasPointerPosition,
	navigateTo
};
