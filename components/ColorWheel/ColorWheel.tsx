// Lib
import {
	ColorWheel as AriaColorWheel,
	ColorWheelTrack as AriaColorWheelTrack,
	ColorArea as AriaColorArea
} from "react-aria-components";
import ColorThumb from "../ColorThumb/ColorThumb";
import useStore from "../../state/hooks/useStore";
import { useShallow } from "zustand/react/shallow";

// Types
import type { FC } from "react";
import type {
	Color,
	ColorWheelProps as AriaColorWheelProps
} from "react-aria-components";

// Styles
import "./ColorWheel.styles.css";

type ColorWheelProps = Omit<
	AriaColorWheelProps,
	"value" | "onChange" | "outerRadius" | "innerRadius"
>;

const ColorWheel: FC<ColorWheelProps> = (props) => {
	const { color, changeColor } = useStore(
		useShallow((state) => ({
			color: state.color,
			changeColor: state.changeColor
		}))
	);

	const onChange = (color: Color) => changeColor(color.toString("hsla"));

	const COLOR_WHEEL_OUTER_RADIUS = 80;
	const COLOR_WHEEL_INNER_RADIUS = 65;

	// The square goes over the circle a bit, so we subtract 5 to make it fit
	const COLOR_AREA_WIDTH = COLOR_WHEEL_INNER_RADIUS * Math.sqrt(2) - 5;
	const COLOR_AREA_HEIGHT = COLOR_WHEEL_INNER_RADIUS * Math.sqrt(2) - 5;

	const id = "color-wheel-container";

	return (
		<div
			id={id}
			data-testid={id}
		>
			<AriaColorWheel
				outerRadius={COLOR_WHEEL_OUTER_RADIUS}
				innerRadius={COLOR_WHEEL_INNER_RADIUS}
				value={color}
				className="color-wheel"
				data-testid="color-wheel"
				onChange={onChange}
				{...props}
			>
				<AriaColorWheelTrack data-testid="color-wheel-track" />
				<ColorThumb data-testid="color-wheel-thumb" />
			</AriaColorWheel>
			{/**
			 * Note: The ColorArea component implmentation of the xChannel and yChannel only works if the color value is in HSL/HSLA format.
			 * If the errors occur, check the format that the color is in.
			 */}
			<AriaColorArea
				value={color}
				onChange={onChange}
				className="color-area"
				data-testid="color-area"
				style={{
					width: `${COLOR_AREA_WIDTH}px`,
					height: `${COLOR_AREA_HEIGHT}px`,
					position: "absolute" // Don't know why, but it doesn't work when applying it in the CSS file
				}}
				xChannel="saturation"
				yChannel="lightness"
			>
				<ColorThumb data-testid="color-area-thumb" />
			</AriaColorArea>
		</div>
	);
};

export default ColorWheel;
