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
	changeEraserStrength
} from "../../state/slices/canvasSlice";

// Type
import type { FC } from "react";
import type { Shape } from "../../types";

// Styles
import "./DrawingToolbar.styles.css";

const DrawingToolbar: FC = () => {
	const { drawStrength, eraserStrength, mode, shape } = useAppSelector(
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
					<button
						key={name}
						className={`shape-option ${isActive ? "active" : ""}`}
						onClick={() => handleShapeChange(name)}
					>
						<i className={`fa ${icon}`} />
					</button>
				</Tooltip>
			</Fragment>
		);
	});

	return (
		<div id="drawing-toolbar">
			{mode === "shapes" ? (
				<div id="shapes">{renderedShapes}</div>
			) : mode === "draw" || mode === "erase" ? (
				<div id="additional-settings">
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
				</div>
			) : (
				<span id="draw-toolbar-no-actions">
					Choose a different tool for actions.
				</span>
			)}
		</div>
	);
};

export default DrawingToolbar;
