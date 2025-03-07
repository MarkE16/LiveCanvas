import {
	describe,
	it,
	expect,
	vi,
	beforeAll,
	afterAll,
	afterEach
} from "vitest";
import * as utils from "../../lib/utils";
// import { CanvasElement } from "../../types";

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

describe("debounce functionality", () => {
	beforeAll(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.clearAllTimers();
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	it("should debounce properly with the provided interval", () => {
		const mockFn = vi.fn();
		const debouncedFn = utils.debounce(mockFn, 100);

		debouncedFn();

		vi.advanceTimersByTime(50);

		expect(mockFn).not.toHaveBeenCalled();

		vi.advanceTimersByTime(50); // It should be 100ms now.

		expect(mockFn).toHaveBeenCalled();
	});

	it("should debounce multiple calls to a function", () => {
		const mockFn = vi.fn();

		const debouncedFn = utils.debounce(mockFn, 100);

		debouncedFn();
		vi.advanceTimersByTime(50);
		debouncedFn();

		// It should be 100ms now. However, the function should not have been called
		// because the second call should have reset the timer.
		vi.advanceTimersByTime(50);

		expect(mockFn).not.toHaveBeenCalled();

		// It should be 150ms now. At this point, the function should have been called.
		vi.advanceTimersByTime(50);

		expect(mockFn).toHaveBeenCalled();
	});
});

describe("generateCanvasImage functionality", () => {
	let dummyCanvases: HTMLCanvasElement[];
	let dummyElements: SVGGElement[];

	beforeAll(() => {
		dummyCanvases = [
			document.createElement("canvas"),
			document.createElement("canvas"),
			document.createElement("canvas")
		];
		dummyElements = [
			document.createElementNS("http://www.w3.org/2000/svg", "svg"),
			document.createElementNS("http://www.w3.org/2000/svg", "svg"),
			document.createElementNS("http://www.w3.org/2000/svg", "svg")
		];

		dummyCanvases.forEach((canvas, i) => {
			canvas.width = 400;
			canvas.height = 400;
			canvas.id = `${i}`;

			canvas.setAttribute("data-dpi", "1");
		});

		dummyElements.forEach((element, i) => {
			element.setAttribute("width", "400");
			element.setAttribute("height", "400");
			element.setAttribute("data-layerid", "1");

			const idxType = i % 3;
			let type = "";
			switch (idxType) {
				case 0: {
					type = "circle";
					break;
				}
				case 1: {
					type = "rectangle";
					break;
				}
				case 2: {
					type = "triangle";
					break;
				}
				default:
					type = "circle";
			}

			element.setAttribute("data-type", type);
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	it("should properly draw the layers in order", () => {
		const dummySubCanvas = document.createElement("canvas");

		dummySubCanvas.width = 400;
		dummySubCanvas.height = 400;

		const createMock = vi
			.spyOn(document, "createElement")
			.mockReturnValue(dummySubCanvas);

		const ctx = dummySubCanvas.getContext("2d");

		if (!ctx) {
			throw new Error("Canvas context not found");
		}

		const drawImageSpy = vi.spyOn(ctx, "drawImage");

		utils.generateCanvasImage(dummyCanvases);

		expect(createMock).toHaveBeenCalledOnce();

		expect(drawImageSpy.mock.calls).toEqual([
			[dummyCanvases[0], 0, 0],
			[dummyCanvases[1], 0, 0],
			[dummyCanvases[2], 0, 0]
		]);
	});

	it("should throw if no layers are provided", () => {
		expect(() => utils.generateCanvasImage([])).rejects.toThrow();
	});

	it("should properly draw shape elements", () => {
		const dummySubCanvas = document.createElement("canvas");

		dummySubCanvas.width = 400;
		dummySubCanvas.height = 400;

		const createMock = vi
			.spyOn(document, "createElement")
			.mockReturnValue(dummySubCanvas);

		const ctx = dummySubCanvas.getContext("2d");

		if (!ctx) {
			throw new Error("Canvas context not found");
		}

		const strokeSpy = vi.spyOn(ctx, "stroke");
		const fillSpy = vi.spyOn(ctx, "fill");
		const fillRectSpy = vi.spyOn(ctx, "fillRect");
		const strokeRectSpy = vi.spyOn(ctx, "strokeRect");
		const ellipseSpy = vi.spyOn(ctx, "ellipse");
		const moveToSpy = vi.spyOn(ctx, "moveTo");
		const lineToSpy = vi.spyOn(ctx, "lineTo");
		const fillTextSpy = vi.spyOn(ctx, "fillText");
		const strokeTextSpy = vi.spyOn(ctx, "strokeText");

		utils.generateCanvasImage(dummyCanvases, dummyElements);

		expect(createMock).toHaveBeenCalledOnce();

		expect(strokeSpy).toHaveBeenCalledTimes(2);
		expect(fillSpy).toHaveBeenCalledTimes(2);
		// Note: In reality, fillRect is called once since there is only one rectangle.
		// However, fillRect is called before drawing anything to set
		// the background color of the canvas. So, it is called twice.
		expect(fillRectSpy).toHaveBeenCalledTimes(2);
		expect(strokeRectSpy).toHaveBeenCalledOnce();
		expect(ellipseSpy).toHaveBeenCalledOnce();
		expect(moveToSpy).toHaveBeenCalledOnce();
		expect(lineToSpy).toHaveBeenCalledTimes(2);

		expect(fillTextSpy).not.toHaveBeenCalled();
		expect(strokeTextSpy).not.toHaveBeenCalled();
	});
});
