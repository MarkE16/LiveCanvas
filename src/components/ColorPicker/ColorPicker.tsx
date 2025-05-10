// Lib
import { useState, useRef } from "react";
import useStore from "@/state/hooks/useStore";
import useLayerReferences from "@/state/hooks/useLayerReferences";
import { parseColor } from "react-aria-components";

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
import type { ReactNode, MouseEvent, ChangeEvent } from "react";
import type { Color } from "react-aria-components";
import type { CanvasElement } from "@/types";

type ColorPickerProps = {
	label: string;
	__for: keyof Pick<CanvasElement, "fill" | "stroke">;
	value: string;
};

function ColorPicker({ label, __for, value }: ColorPickerProps): ReactNode {
	const [hex, setHex] = useState<string>(parseColor(value).toString("hex"));
	const changeElementProperties = useStore(
		(state) => state.changeElementProperties
	);
	const startColor = useRef<string>(value);
	const { getActiveLayer } = useLayerReferences();

	const handleColorChange = (color: Color) => {
		const hex = color.toString("hex");

		changeElementProperties(
			(state) => ({
				...state,
				[__for]: hex
			}),
			(element) => element.focused
		);

		setHex(hex);
	};

	const onHexChange = async (e: ChangeEvent<HTMLInputElement>) => {
		try {
			const color = parseColor(e.target.value);
			handleColorChange(color);
		} catch (e: unknown) {
			// Do nothing. This should be thrown if the hex is invalid.
		}

		setHex(e.target.value);
	};

	const updatePreview = () => {
		const activeLayer = getActiveLayer();

		if (!activeLayer)
			throw new Error("No active layer found. Cannot update layer preview.");

		const ev = new CustomEvent("imageupdate", {
			detail: {
				layer: activeLayer
			}
		});

		document.dispatchEvent(ev);
	};

	const onOpenChange = (isOpen: boolean) => {
		// Closing, prepare to update the preview.
		if (!isOpen) {
			setHex(parseColor(value).toString("hex"));

			// Only update the preview if the color has changed.
			if (startColor.current !== value) {
				updatePreview();
			}
		} else {
			// Opening, save the current color.
			startColor.current = value;
		}
	};

	const stopPropagation = (e: MouseEvent) => e.stopPropagation();

	return (
		<div
			role="presentation"
			data-testid={`${__for}-color-picker`}
			onMouseDown={stopPropagation}
			onMouseMove={stopPropagation}
		>
			<AriaColorPicker>
				<DialogTrigger onOpenChange={onOpenChange}>
					<Button
						className="color-picker"
						data-testid={`${__for}-picker-button`}
					>
						<AriaColorSwatch
							className="react-aria-ColorSwatch"
							color={value}
						/>
						<span>{label}</span>
					</Button>
					<Popover
						placement="bottom start"
						className="react-aria-Popover"
						data-testid={`${__for}-picker-popover`}
					>
						<Dialog className="color-picker-dialog">
							<AriaColorArea
								colorSpace="hsb"
								xChannel="saturation"
								yChannel="brightness"
								className="react-aria-ColorArea"
								data-testid="picker-area"
								onChange={handleColorChange}
								value={value}
							>
								<ColorThumb />
							</AriaColorArea>
							<AriaColorSlider
								colorSpace="hsb"
								channel="hue"
								className="react-aria-ColorSlider"
								data-testid="picker-slider"
								onChange={handleColorChange}
								value={value}
							>
								<SliderOutput />
								<SliderTrack>
									<ColorThumb />
								</SliderTrack>
							</AriaColorSlider>
							<ColorField
								data-testid="picker-field"
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
}

export default ColorPicker;
