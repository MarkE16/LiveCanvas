// Lib
import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";
import { parseColor } from "react-aria-components";

// Components
import ColorWheel from "../components/ColorWheel/ColorWheel";

// Types
import type { CanvasState } from "../types";
import type { PropsWithChildren } from "react";
// import type { Color } from "react-aria-components";

const mockAriaColorWheel = vi.fn();
const mockAriaColorArea = vi.fn();
const mockOnChange = vi.fn();

vi.mock("react-aria-components", async (importOriginal) => {
	const actual = (await importOriginal()) as NonNullable<unknown>;
	return {
		...actual,
		ColorWheel: ({ children, ...props }: PropsWithChildren) => {
			mockAriaColorWheel(props);
			return (
				<div
					data-testid="color-wheel"
					onChange={mockOnChange}
					{...props}
				>
					{children}
				</div>
			);
		},
		ColorArea: ({ children, ...props }: PropsWithChildren) => {
			mockAriaColorArea(props);
			return (
				<div
					data-testid="color-area"
					onChange={mockOnChange}
					{...props}
				>
					{children}
				</div>
			);
		},
		ColorThumb: (props: PropsWithChildren) => (
			<div data-testid="color-wheel-thumb">{props.children}</div>
		),
		ColorWheelTrack: (props: PropsWithChildren) => (
			<div data-testid="color-wheel-track">{props.children}</div>
		)
	};
});

describe("ColorWheel functionality", () => {
	beforeEach(() => {
		// Color is set to red by default
		const preloadedState: { canvas: CanvasState } = {
			canvas: {
				width: 400,
				height: 400,
				mode: "select",
				shape: "circle",
				drawStrength: 5,
				eraserStrength: 3,
				scale: 1,
				dpi: 1,
				position: { x: 0, y: 0 },
				layers: [
					{ name: "Layer 1", id: "1", active: true, hidden: false },
					{ name: "Layer 2", id: "2", active: false, hidden: false }
				],
				color: "hsla(0, 100%, 50%, 1)"
			}
		};
		renderWithProviders(<ColorWheel />, { preloadedState });
	});

	afterAll(() => {
		vi.resetAllMocks();
	});

	it("should render the component", () => {
		const container = screen.getByTestId("color-wheel-container");
		const colorWheel = screen.getByTestId("color-wheel");
		const colorWheelTrack = screen.getByTestId("color-wheel-track");
		const colorWheelThumb = screen.getAllByTestId("color-wheel-track"); // there should be two thumbs rendered: one for the color wheel and one for the color area.
		const colorWheelArea = screen.getByTestId("color-area");

		console.log(ColorWheel.prototype);

		expect(container).not.toBeNull();
		expect(colorWheel).not.toBeNull();
		expect(colorWheelTrack).not.toBeNull();
		expect(colorWheelArea).not.toBeNull();
		for (const thumb of colorWheelThumb) {
			expect(thumb).not.toBeNull();
		}
	});

	it("should render with default color", () => {
		const color = "hsla(0, 100%, 50%, 1)";
		expect(mockAriaColorWheel).toHaveBeenCalledWith(
			expect.objectContaining({
				value: color
			})
		);

		expect(mockAriaColorArea).toHaveBeenCalledWith(
			expect.objectContaining({
				value: color
			})
		);
	});

	it("should properly update to a new color when changing through color wheel", () => {
		const currentColor = "hsla(0, 100%, 50%, 1)";
		const newColor = "hsla(120, 100%, 50%, 1)";
		const colorWheel = screen.getByTestId("color-wheel");

		expect(mockAriaColorWheel).toHaveBeenCalledWith(
			expect.objectContaining({
				value: currentColor
			})
		);

		expect(mockAriaColorArea).toHaveBeenCalledWith(
			expect.objectContaining({
				value: currentColor
			})
		);

		const parsedColor = parseColor(newColor);

		fireEvent.change(colorWheel, parsedColor);

		expect(mockOnChange).toHaveBeenCalledWith(parsedColor);

		expect(mockAriaColorWheel).toHaveBeenCalledWith(
			expect.objectContaining({
				value: newColor
			})
		);

		expect(mockAriaColorArea).toHaveBeenCalledWith(
			expect.objectContaining({
				value: newColor
			})
		);
	});

	// Note: this test should most likely NOT be changed as these channels are required for the color area to work as intended with the color wheel.
	it("should render the color area with the correct channels", () => {
		expect(mockAriaColorArea).toHaveBeenCalledWith(
			expect.objectContaining({
				xChannel: "saturation",
				yChannel: "lightness"
			})
		);
	});

	it("should correctly compute the color area dimensions", () => {
		const COLOR_WHEEL_INNER_RADIUS = 65;

		const COLOR_AREA_WIDTH = COLOR_WHEEL_INNER_RADIUS * Math.sqrt(2) - 5;
		const COLOR_AREA_HEIGHT = COLOR_WHEEL_INNER_RADIUS * Math.sqrt(2) - 5;
		expect(mockAriaColorArea).toHaveBeenCalledWith(
			expect.objectContaining({
				style: {
					width: `${COLOR_AREA_WIDTH}px`,
					height: `${COLOR_AREA_HEIGHT}px`,
					position: "absolute"
				}
			})
		);
	});
});
