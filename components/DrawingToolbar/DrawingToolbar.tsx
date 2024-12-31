// Lib
import * as UTILS from "../../utils";
import { useAppSelector, useAppDispatch } from "../../state/hooks/reduxHooks";
import { SHAPES } from "../../state/store";
import useCanvasElements from "../../state/hooks/useCanvasElements";
import { memo, Fragment } from "react";

// Redux Actions
import {
	changeDrawStrength,
	changeEraserStrength,
	changeColor
} from "../../state/slices/canvasSlice";

// Type
import type { FC, ChangeEvent, ReactElement, MouseEvent } from "react";
import type { Shape } from "../../types";

// Components
import { Tooltip } from "@mui/material";
import ColorPicker from "../ColorPicker/ColorPicker";

// Styles
import "./DrawingToolbar.styles.css";

const MemoizedColorPicker = memo(ColorPicker);

const ShapeOption = ({ icon, name }: { icon: string; name: Shape }) => {
	const { createElement } = useCanvasElements();

	const handleShapeChange = () => {
		createElement(name);
	};

	return (
		<Tooltip
			title={UTILS.capitalize(name)}
			arrow
			placement="bottom"
		>
			<span>
				<button
					className="shape-option"
					onClick={handleShapeChange}
					data-testid={`shape-${name}`}
				>
					<i className={`fa ${icon}`} />
				</button>
			</span>
		</Tooltip>
	);
};

const DrawingToolbar: FC = () => {
	const { drawStrength, eraserStrength, mode, color } = useAppSelector(
		(state) => state.canvas
	);
	const { elements } = useCanvasElements();
	const dispatch = useAppDispatch();
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
			dispatch(changeDrawStrength(strength));
		} else {
			dispatch(changeEraserStrength(strength));
		}
	};

	// Looks ugly. Might need to refactor
	const onBrushChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;

		const currentColorAsArray = color.slice(5, -1).split(",");

		const newColor = `hsla(${currentColorAsArray[0]}, ${currentColorAsArray[1]}, ${currentColorAsArray[2]}, ${value})`;

		dispatch(changeColor(newColor));
	};

	const renderedShapes = SHAPES.map((s) => {
		const { icon, name } = s;

		return (
			<ShapeOption
				key={name}
				icon={icon}
				name={name}
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

	const additionalSettings: ReactElement[] = [];

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
};

export default DrawingToolbar;
