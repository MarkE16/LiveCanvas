// Lib
import { useState } from "react";
import useStoreSubscription from "../../state/hooks/useStoreSubscription";
import useStore from "../../state/hooks/useStore";
import useLayerReferences from "../../state/hooks/useLayerReferences";
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
import type { FC, MouseEvent, ChangeEvent } from "react";
import type { Color } from "react-aria-components";
import type { CanvasElement } from "../../types";

type ColorPickerProps = {
	label: string;
	__for: keyof Pick<CanvasElement, "fill" | "stroke">;
	value: string;
};

const ColorPicker: FC<ColorPickerProps> = ({ label, __for, value }) => {
	const [hex, setHex] = useState<string>(parseColor(value).toString("hex"));
	const changeElementProperties = useStore(
		(state) => state.changeElementProperties
	);
	const elements = useStoreSubscription((state) => state.elements);
	const { references } = useLayerReferences();

	const handleColorChange = (color: Color) => {
		const hex = color.toString("hex");
		const focusedIds = elements.current
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
		const activeLayer = references.current.find((layer) =>
			layer.classList.contains("active")
		);

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
		if (!isOpen) {
			setHex(parseColor(value).toString("hex"));

			updatePreview();
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
};

export default ColorPicker;
