// Lib
import {
  ColorWheel as AriaColorWheel,
  ColorThumb as AriaColorThumb,
  ColorWheelTrack as AriaColorWheelTrack,
} from "react-aria-components";
import { useAppSelector, useAppDispatch } from "../../state/hooks/reduxHooks";

// Types
import type { FC } from "react";
import type { Color, ColorWheelProps as AriaColorWheelProps } from "react-aria-components";

// Styles
import "./ColorWheel.styles.css";

type ColorWheelProps = Omit<AriaColorWheelProps, "value" | "onChange" | "outerRadius" | "innerRadius">;

const ColorWheel: FC<ColorWheelProps> = (props) => {
  const color = useAppSelector(state => state.canvas.color);
  const dispatch = useAppDispatch();

  const onChange = (color: Color) => dispatch({ type: "SET_COLOR", payload: color.toString("hex") });

  return (
    <div id="color-wheel-container">
      <AriaColorWheel
        outerRadius={80}
        innerRadius={54}
        value={color}
        
        onChange={onChange}

        {...props}
      >
        <AriaColorWheelTrack />

        {/*
        For some reason, the thumb is not visible with the default implementation given from the documentation.
        (https://react-spectrum.adobe.com/react-aria/ColorWheel.html#example) This is a workaround to make it visible and look
        almost identical to the original implementation.
        */}
        <AriaColorThumb style={{
          outline: "1px solid black",
          border: "3px solid white",
          borderRadius: "50%",
          width: "20px",
          height: "20px",
        }}
        />
      </AriaColorWheel>
    </div>
  );
}

export default ColorWheel;