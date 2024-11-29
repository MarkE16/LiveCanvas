// Lib
import * as UTILS from "../../utils";
import { useAppSelector, useAppDispatch } from "../../state/hooks/reduxHooks";
import { SHAPES } from "../../state/store";
import { Tooltip } from "@mui/material";
import { Fragment } from "react";

// Redux Actions
import {
	changeShape,
	changeDrawStrength,
	changeEraserStrength,
	changeColor
} from "../../state/slices/canvasSlice";

// Type
import type { FC, ChangeEvent } from "react";
import type { Shape } from "../../types";

// Styles
import "./DrawingToolbar.styles.css";

const DrawingToolbar: FC = () => {
	const { drawStrength, eraserStrength, mode, shape, color } = useAppSelector(
		(state) => state.canvas
	);
	const dispatch = useAppDispatch();

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
		const strength = parseInt(e.target.value);

		if (mode === "draw") {
			dispatch(changeDrawStrength(strength));
		} else {
			dispatch(changeEraserStrength(strength));
		}
	};

	const handleShapeChange = (shape: Shape) => {
		dispatch(changeShape(shape));
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

		const isActive = shape === name;

		return (
			<Fragment key={name}>
				<Tooltip
					title={UTILS.capitalize(name)}
					arrow
					placement="bottom"
				>
					<span>
						<button
							key={name}
							className={`shape-option ${isActive ? "active" : ""}`}
							onClick={() => handleShapeChange(name)}
						>
							<i className={`fa ${icon}`} />
						</button>
					</span>
				</Tooltip>
			</Fragment>
		);
	});

	const renderedStrength = (
		<>
			Strength:{" "}
			<input
				name={`${mode}_strength`.toUpperCase()}
				type="range"
				min={strengthSettings.min}
				max={strengthSettings.max}
				step="1"
				value={strengthSettings.value}
				onChange={handleStrengthChange}
			/>
			<label>{strengthSettings.value}</label>
		</>
	);

	const renderedBrush = (
		<>
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
		</>
	);

	const additionalSettings = [
		renderedStrength,
		mode === "draw" ? renderedBrush : null
	].filter(Boolean);

	// Now insert a break between each setting.
	additionalSettings.forEach((_, index) => {
		if (index % 2 !== 0) {
			additionalSettings.splice(
				index,
				0,
				<span
					style={{ margin: "0 15px", border: "1px solid gray", height: "100%" }}
				/>
			);
		}
	});

	return (
		<div id="drawing-toolbar">
			{mode === "shapes" ? (
				renderedShapes
			) : mode === "draw" || mode === "erase" ? (
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
