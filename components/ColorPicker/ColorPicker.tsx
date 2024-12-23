// Lib
import { useState } from "react";
import { parseColor } from "react-aria-components";
import useCanvasElements from "../../state/hooks/useCanvasElements";

// Components
import {
	Button,
	ColorPicker as AriaColorPicker,
	Dialog,
	DialogTrigger,
	Popover,
	SliderOutput,
	SliderTrack,
	ColorSwatch as AriaColorSwatch,
	ColorSlider as AriaColorSlider,
	ColorArea as AriaColorArea
} from "react-aria-components";
import ColorThumb from "../ColorThumb/ColorThumb";
import ColorField from "../ColorField/ColorField";

// Styles
import "./ColorPicker.styles.css";

// Types
import type { FC, MouseEvent, ChangeEvent } from "react";
import type { Color } from "react-aria-components";
import type { CanvasElement } from "../../types";

type ColorPickerProps = {
	label: string;
	__for: keyof Pick<CanvasElement, "fill" | "border">;
	value: string;
};

const ColorPicker: FC<ColorPickerProps> = ({ label, __for, value }) => {
	const [hex, setHex] = useState<string>(parseColor(value).toString("hex"));
	const { elements, changeElementProperties } = useCanvasElements();

	const handleColorChange = (color: Color) => {
		const hex = color.toString("hex");
		const focusedIds = elements
			.filter((element) => element.focused)
			.map((element) => element.id);

		changeElementProperties(
			(state) => ({
				...state,
				[__for]: hex
			}),
			...focusedIds
		);

		setHex(hex);
	};

	const onHexChange = (e: ChangeEvent<HTMLInputElement>) => {
		try {
			const color = parseColor(e.target.value);
			handleColorChange(color);
		} catch (e: unknown) {
			// Do nothing. This should be thrown if the hex is invalid.
		}

		setHex(e.target.value);
	};

	const stopPropagation = (e: MouseEvent) => e.stopPropagation();

	return (
		<div
			onMouseDown={stopPropagation}
			onMouseMove={stopPropagation}
		>
			<AriaColorPicker>
				<DialogTrigger>
					<Button className="color-picker">
						<AriaColorSwatch
							className="react-aria-ColorSwatch"
							color={value}
						/>
						<span>{label}</span>
					</Button>
					<Popover
						placement="bottom start"
						className="react-aria-Popover"
					>
						<Dialog className="color-picker-dialog">
							<AriaColorArea
								colorSpace="hsb"
								xChannel="saturation"
								yChannel="brightness"
								className="react-aria-ColorArea"
								onChange={handleColorChange}
								value={value}
							>
								<ColorThumb />
							</AriaColorArea>
							<AriaColorSlider
								colorSpace="hsb"
								channel="hue"
								className="react-aria-ColorSlider"
								onChange={handleColorChange}
								value={value}
							>
								<SliderOutput />
								<SliderTrack>
									<ColorThumb />
								</SliderTrack>
							</AriaColorSlider>
							<ColorField
								label="Hex"
								value={hex}
								onChange={onHexChange}
							/>
						</Dialog>
					</Popover>
				</DialogTrigger>
			</AriaColorPicker>
		</div>
	);
};

export default ColorPicker;
