// Lib
import {
	ColorWheel as AriaColorWheel,
	ColorThumb as AriaColorThumb,
	ColorWheelTrack as AriaColorWheelTrack,
	ColorArea as AriaColorArea
} from "react-aria-components";
import { useAppSelector, useAppDispatch } from "../../state/hooks/reduxHooks";

// Redux Actions
import { changeColor } from "../../state/slices/canvasSlice";

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
	const currentColor = useAppSelector((state) => state.canvas.color);
	const dispatch = useAppDispatch();

	const onChange = (color: Color) =>
		dispatch(changeColor(color.toString("hsla")));

	/*
  For some reason, the thumb is not visible with the default implementation given from the documentation.
  (https://react-spectrum.adobe.com/react-aria/ColorWheel.html#example) This is a workaround to make it visible and look
  almost identical to the original implementation. (See the styles in the CSS file for more information)
  */
	const thumb = <AriaColorThumb className="thumb" />;

	const COLOR_WHEEL_OUTER_RADIUS = 80;
	const COLOR_WHEEL_INNER_RADIUS = 65;

	// The square goes over the circle a bit, so we subtract 5 to make it fit
	const COLOR_AREA_WIDTH = COLOR_WHEEL_INNER_RADIUS * Math.sqrt(2) - 5;
	const COLOR_AREA_HEIGHT = COLOR_WHEEL_INNER_RADIUS * Math.sqrt(2) - 5;

	return (
		<div id="color-wheel-container">
			<AriaColorWheel
				outerRadius={COLOR_WHEEL_OUTER_RADIUS}
				innerRadius={COLOR_WHEEL_INNER_RADIUS}
				value={currentColor}
				className="color-wheel"
				onChange={onChange}
				{...props}
			>
				<AriaColorWheelTrack />

				{thumb}
			</AriaColorWheel>
			{/**
			 * Note: The ColorArea component implmentation of the xChannel and yChannel only works if the color value is in HSL/HSLA format.
			 * If the errors occur, check the format that the color is in.
			 */}
			<AriaColorArea
				value={currentColor}
				onChange={onChange}
				className="color-area"
				style={{
					width: `${COLOR_AREA_WIDTH}px`,
					height: `${COLOR_AREA_HEIGHT}px`,
					position: "absolute" // Don't know why, but it doesn't work when applying it in the CSS file
				}}
				xChannel="saturation"
				yChannel="lightness"
			>
				{thumb}
			</AriaColorArea>
		</div>
	);
};

export default ColorWheel;
