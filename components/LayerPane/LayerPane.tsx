// Lib
import { useAppSelector, useAppDispatch } from "../../state/hooks/reduxHooks";

// Redux Actions
import { createLayer } from "../../state/slices/canvasSlice";

// Types
import type { FC } from "react";

// Styles
import "./LayerPane.styles.css";

// Components
import LayerInfo from "../LayerInfo/LayerInfo";
import ColorWheel from "../ColorWheel/ColorWheel";
import Footer from "../Footer/Footer";

const LayerPane: FC = () => {
	const layers = useAppSelector((state) => state.canvas.layers);
	const dispatch = useAppDispatch();

	const onNewLayer = () => dispatch(createLayer());

	return (
		<aside id="layer-manager-container">
			<ColorWheel />
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
			<Footer />
		</aside>
	);
};

export default LayerPane;
