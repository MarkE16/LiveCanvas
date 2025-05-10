// Lib
import { SHAPES } from "@/state/store";
import { memo, Fragment } from "react";
import useStore from "@/state/hooks/useStore";
import { useShallow } from "zustand/react/shallow";

// Type
import type { ReactNode, ChangeEvent, MouseEvent } from "react";

// Components
import ColorPicker from "@/components/ColorPicker/ColorPicker";
import ShapeOption from "@/components/ShapeOption/ShapeOption";

// Styles
import "./DrawingToolbar.styles.css";

const MemoizedColorPicker = memo(ColorPicker);
const MemoizedShapeOption = memo(ShapeOption);

function DrawingToolbar(): ReactNode {
	const {
		mode,
		shape,
		drawStrength,
		eraserStrength,
		changeDrawStrength,
		changeEraserStrength,
		changeColorAlpha
	} = useStore(
		useShallow((state) => ({
			mode: state.mode,
			shape: state.shape,
			drawStrength: state.drawStrength,
			eraserStrength: state.eraserStrength,
			changeDrawStrength: state.changeDrawStrength,
			changeEraserStrength: state.changeEraserStrength,
			changeColorAlpha: state.changeColorAlpha
		}))
	);
	const elements = useStore(
		(state) => state.elements,
		(a, b) =>
			a.length === b.length &&
			a.every(
				(el, i) =>
					el.focused === b[i].focused &&
					el.fill === b[i].fill &&
					el.stroke === b[i].stroke
			)
	);
	const focusedElements = elements.filter((element) => element.focused);

	const strengthSettings =
		mode === "draw"
			? {
					value: drawStrength,
					min: 1,
					max: 15
				}
			: {
					value: eraserStrength,
					min: 3,
					max: 10
				};

	const handleStrengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const strength = Number(e.target.value);

		if (mode === "draw") {
			changeDrawStrength(strength);
		} else {
			changeEraserStrength(strength);
		}
	};

	const onBrushChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = Number(e.target.value);
		changeColorAlpha(value);
	};

	const renderedShapes = SHAPES.map((s) => {
		const { icon, name } = s;

		return (
			<MemoizedShapeOption
				key={name}
				icon={icon}
				name={name}
				isActive={shape === name}
			/>
		);
	});

	const renderedStrength = (
		<Fragment key="settings_Strength">
			Strength:{" "}
			<input
				name={`${mode}_strength`.toUpperCase()}
				type="range"
				min={strengthSettings.min}
				max={strengthSettings.max}
				step="1"
				value={strengthSettings.value}
				onChange={handleStrengthChange}
				data-testid="strength-range"
			/>
			<label data-testid="strength-value">{strengthSettings.value}</label>
		</Fragment>
	);

	const renderedBrush = (
		<Fragment key="settings_Brush">
			<i className="fa fa-paint-brush"></i>
			<input
				type="range"
				id="brush-size"
				defaultValue={1}
				min={0.01}
				max={1}
				step={0.01}
				onChange={onBrushChange}
			/>
		</Fragment>
	);

	const renderedShapeSettings = (
		<Fragment key="settings_Shapes">
			<MemoizedColorPicker
				label="Fill"
				__for="fill"
				value={focusedElements[0]?.fill}
			/>
			<MemoizedColorPicker
				label="Border"
				__for="stroke"
				value={focusedElements[0]?.stroke}
			/>
			{/* <ColorField
				label="Border Width"
				value={
					focusedElements.length === 0
						? "1"
						: focusedElements[0].borderWidth.toString()
				}
				onChange={onBorderWidthChange}
			/> */}
		</Fragment>
	);

	const additionalSettings: ReactNode[] = [];

	if (mode === "draw") {
		additionalSettings.push(renderedStrength, renderedBrush);
	} else if (mode === "erase") {
		additionalSettings.push(renderedStrength);
	} else if (mode === "shapes") {
		additionalSettings.push(<>{renderedShapes}</>);
	}

	if (focusedElements.length > 0) {
		additionalSettings.push(renderedShapeSettings);
	}

	// Now insert a break between each setting.
	additionalSettings.forEach((_, index) => {
		if (index % 2 !== 0) {
			additionalSettings.splice(
				index,
				0,
				<span
					key={`break-${index}`}
					style={{ margin: "0 15px", border: "1px solid gray", height: "100%" }}
				/>
			);
		}
	});

	const stopPropagation = (e: MouseEvent) => e.stopPropagation();

	return (
		<div
			id="drawing-toolbar"
			data-testid="drawing-toolbar"
			role="toolbar"
			onMouseDown={stopPropagation}
			onMouseMove={stopPropagation}
		>
			{additionalSettings.length > 0 ? (
				additionalSettings
			) : (
				<span id="draw-toolbar-no-actions">
					Choose a different tool for actions.
				</span>
			)}
		</div>
	);
}

export default DrawingToolbar;
