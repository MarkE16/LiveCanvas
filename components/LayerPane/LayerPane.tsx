// Lib
import { useAppSelector, useAppDispatch } from "../../state/hooks/reduxHooks";

// Redux Actions
import { changeColor, createLayer } from "../../state/slices/canvasSlice";

// Types
import type { FC, ChangeEvent } from "react";

// Styles
import "./LayerPane.styles.css";

// Components
import LayerInfo from "../LayerInfo/LayerInfo";
import ColorWheel from "../ColorWheel/ColorWheel";

const LayerPane: FC = () => {
	const layers = useAppSelector((state) => state.canvas.layers);
	const color = useAppSelector((state) => state.canvas.color);
	const dispatch = useAppDispatch();

	// Looks ugly. Might need to refactor
	const onBrushChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;

		const currentColorAsArray = color.slice(5, -1).split(",");

		const newColor = `hsla(${currentColorAsArray[0]}, ${currentColorAsArray[1]}, ${currentColorAsArray[2]}, ${value})`;

		dispatch(changeColor(newColor));
	};

	const onNewLayer = () => dispatch(createLayer());

	return (
		<aside id="layer-manager-container">
			<ColorWheel />
			<div>
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
			</div>
			<button
				id="new-layer-button"
				onClick={onNewLayer}
			>
				<i className="fa fa-plus"></i>
			</button>
			<div id="layer-list">
				{layers.map((layer, i) => (
					<LayerInfo
						{...layer}
						key={layer.id}
						positionIndex={i}
					/>
				))}
			</div>
		</aside>
	);
};

export default LayerPane;
