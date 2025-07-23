// Lib
import { SHAPES } from "@/state/store";
import { memo, Fragment } from "react";
import useStore from "@/state/hooks/useStore";
import { useShallow } from "zustand/react/shallow";
import clsx from "clsx";

// Type
import type { ReactNode, ChangeEvent, MouseEvent, ReactElement } from "react";
import type { Shape } from "@/types";

// Components
import ColorPicker from "@/components/ColorPicker/ColorPicker";
import ShapeOption from "@/components/ShapeOption/ShapeOption";

// Icons
import Square from "@/components/icons/Square/Square";
import Circle from "@/components/icons/Circle/Circle";
import Triangle from "../icons/Triangle/Triangle";
import Brush from "../icons/Brush/Brush";

const MemoizedColorPicker = memo(ColorPicker);
const MemoizedShapeOption = memo(ShapeOption);

const SHAPE_ICONS: Record<Shape, ReactElement> = {
	rectangle: <Square />,
	circle: <Circle />,
	triangle: <Triangle />
};

function DrawingToolbar(): ReactNode {
	const {
		mode,
		shape,
		shapeMode,
		strokeWidth,
		changeStrokeWidth,
		changeColorAlpha,
		changeShapeMode
	} = useStore(
		useShallow((state) => ({
			mode: state.mode,
			shape: state.shape,
			shapeMode: state.shapeMode,
			strokeWidth: state.strokeWidth,
			changeStrokeWidth: state.changeStrokeWidth,
			changeColorAlpha: state.changeColorAlpha,
			changeShapeMode: state.changeShapeMode
		}))
	);

	const strengthSettings = {
		value: strokeWidth,
		min: 1,
		max: 100
	};

	const handleStrengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const strength = Number(e.target.value);

		changeStrokeWidth(strength);
	};

	const onBrushChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = Number(e.target.value);
		changeColorAlpha(value);
	};

	const renderedShapes = (
		<Fragment key="settings_Shapes">
			{SHAPES.map((s) => (
				<MemoizedShapeOption
					key={s}
					icon={SHAPE_ICONS[s]}
					name={s}
					isActive={shape === s}
				/>
			))}
		</Fragment>
	);

	const renderedShapeMode = (
		<Fragment key="settings_ShapeMode">
			<button
				onClick={() => changeShapeMode("fill")}
				className={clsx(
					"border-none inline-flex justify-center items-center bg-transparent w-[30px] h-[30px] rounded-full mx-[0.5em] my-0 cursor-pointer transition-colors duration-100 hover:bg-[#505050]",
					{
						"bg-[#505050] outline outline-[3px] outline-[#7e83da] outline-offset-[2px]":
							shapeMode === "fill"
					}
				)}
			>
				Fill
			</button>
			<button
				onClick={() => changeShapeMode("stroke")}
				className={clsx(
					"border-none inline-flex justify-center items-center bg-transparent w-[30px] h-[30px] rounded-full mx-[0.5em] my-0 cursor-pointer transition-colors duration-100 hover:bg-[#505050]",
					{
						"bg-[#505050] outline outline-[3px] outline-[#7e83da] outline-offset-[2px]":
							shapeMode === "stroke"
					}
				)}
			>
				Stroke
			</button>
		</Fragment>
	);

	const renderedStrength = (
		<Fragment key="settings_Strength">
			Stroke Width:
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
			<Brush />
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
			{/* <MemoizedColorPicker
				label="Fill"
				__for="fill"
				value={focusedElements[0]?.fill}
			/> */}
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

	if (mode === "brush") {
		additionalSettings.push(renderedStrength, renderedBrush);
	} else if (mode === "eraser") {
		additionalSettings.push(renderedStrength);
	} else if (mode === "shapes") {
		additionalSettings.push(
			renderedShapes,
			renderedStrength,
			renderedShapeMode
		);
	}

	// Now insert a break between each setting.
	for (let i = 0; i < additionalSettings.length; i++) {
		if (i % 2 !== 0) {
			additionalSettings.splice(
				i,
				0,
				<span
					key={`break-${i}`}
					className="mx-[15px] border-l border-[rgb(99,99,99)] h-[30px]"
				/>
			);
			i++; // Skip the next index since we just added a break
		}
	}

	const stopPropagation = (e: MouseEvent) => e.stopPropagation();

	return (
		<div
			className="flex items-center justify-center text-center absolute top-[10px] w-[80%] min-w-0 min-h-[46px] rounded-[25px] bg-[#303744] shadow-[0_0_10px_rgba(0,0,0,0.5)] p-[0.5em_1.5em] overflow-auto z-[100] pointer-events-none [&>*]:pointer-events-auto"
			data-testid="drawing-toolbar"
			role="toolbar"
			onMouseDown={stopPropagation}
			onMouseMove={stopPropagation}
		>
			{additionalSettings.length > 0 ? (
				additionalSettings
			) : (
				<span className="text-gray-500 text-medium overflow-hidden text-ellipsis whitespace-nowrap">
					Choose a different tool for actions.
				</span>
			)}
		</div>
	);
}

export default DrawingToolbar;
