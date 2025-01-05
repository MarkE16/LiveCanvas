import { describe, it, expect, vi } from "vitest";
import * as utils from "../../utils";

describe("capitalize functionality", () => {
	it("should capitalize the first occurring character", () => {
		expect(utils.capitalize("hello, world!")).toBe("Hello, world!");

		expect(utils.capitalize("iamastring")).toBe("Iamastring");

		expect(utils.capitalize("I am already capitalized")).toBe(
			"I am already capitalized"
		);
	});

	it("should capitalize with title case with custom delimiters", () => {
		let setting = { titleCase: true, delimiter: " " };

		// A space delimiter.
		expect(utils.capitalize("hello, world!", setting)).toBe("Hello, World!");

		// An underscore delimiter.
		setting = { ...setting, delimiter: "_" };
		expect(utils.capitalize("some_variable_name", setting)).toBe(
			"Some_Variable_Name"
		);

		// A dash delimiter.
		setting = { ...setting, delimiter: "-" };
		expect(utils.capitalize("a-secret-code", setting)).toBe("A-Secret-Code");
	});

	it("should not change for non alphabetical values", () => {
		expect(utils.capitalize("12345")).toBe("12345");

		expect(
			utils.capitalize("!@#$%^&", { titleCase: true, delimiter: "-" })
		).toBe("!@#$%^&");
	});
});

describe("createLayer functionality", () => {
	it("should create a layer with no arguments", () => {
		expect(utils.createLayer()).toEqual({
			name: "New Layer",
			id: expect.any(String),
			active: false,
			hidden: false
		});
	});

	it("should create a layer with a name", () => {
		expect(utils.createLayer("My New Layer")).toEqual({
			name: "My New Layer",
			id: expect.any(String),
			active: false,
			hidden: false
		});
	});

	it("should create a layer with a name and id", () => {
		expect(utils.createLayer("My Better Layer", "1234-5678")).toEqual({
			name: "My Better Layer",
			id: "1234-5678",
			active: false,
			hidden: false
		});
	});
});

describe("swapElements functionality", () => {
	it("should swap with value to and from indices", () => {
		const arr = [1, 2, 3, 4, 5];

		expect(utils.swapElements(arr, 0, 4)).toEqual([5, 2, 3, 4, 1]);

		expect(utils.swapElements(arr, 1, 3)).toEqual([1, 4, 3, 2, 5]);
	});

	it("should not swap with invalid to and from indices", () => {
		const arr = [1, 2, 3, 4, 5];

		// Invalid from index.
		expect(utils.swapElements(arr, -1, 4)).toEqual([1, 2, 3, 4, 5]);

		// Invalid to index.
		expect(utils.swapElements(arr, 1, 5)).toEqual([1, 2, 3, 4, 5]);
	});
});

describe("getCanvasPosition functionality", () => {
	it("should calculate the x and y coordinantes without dpi accounted with CSS scale 1", () => {
		const dummyCanvas = document.createElement("canvas");

		dummyCanvas.width = 100;
		dummyCanvas.height = 100;

		// Sample bounding rect grabbed from the browser.
		// This payload is with a scale of 1.
		const mockBoundingRect = {
			x: 532,
			y: 333.5,
			width: 400,
			height: 400,
			top: 333.5,
			right: 932,
			bottom: 733.5,
			left: 532,
			toJSON: vi.fn()
		};

		const spy = vi
			.spyOn(dummyCanvas, "getBoundingClientRect")
			.mockReturnValue(mockBoundingRect);
		const clientX = 600;
		const clientY = 400;

		const result = utils.getCanvasPosition(clientX, clientY, dummyCanvas);

		const scaleX = dummyCanvas.width / mockBoundingRect.width;
		const scaleY = dummyCanvas.height / mockBoundingRect.height;

		expect(result).toEqual({
			x: (clientX - mockBoundingRect.left) * scaleX,
			y: (clientY - mockBoundingRect.top) * scaleY
		});
		expect(spy).toHaveBeenCalled();
	});

	it("should calculate the x and y coordinates without dpi accounted with CSS scale 3", () => {
		const dummyCanvas = document.createElement("canvas");

		dummyCanvas.width = 100;
		dummyCanvas.height = 100;

		// Sample bounding rect grabbed from the browser.
		// This payload is with a scale of 3.
		const mockBoundingRect = {
			x: 132,
			y: -66.5,
			width: 1200,
			height: 1200,
			top: -66.5,
			right: 1332,
			bottom: 1133.5,
			left: 132,
			toJSON: vi.fn()
		};

		const spy = vi
			.spyOn(dummyCanvas, "getBoundingClientRect")
			.mockReturnValue(mockBoundingRect);
		const clientX = 600;
		const clientY = 400;

		const result = utils.getCanvasPosition(clientX, clientY, dummyCanvas);

		const scaleX = dummyCanvas.width / mockBoundingRect.width;
		const scaleY = dummyCanvas.height / mockBoundingRect.height;

		expect(result).toEqual({
			x: (clientX - mockBoundingRect.left) * scaleX,
			y: (clientY - mockBoundingRect.top) * scaleY
		});
		expect(spy).toHaveBeenCalled();
	});
});
