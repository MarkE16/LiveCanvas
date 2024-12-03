// Lib
import { useAppSelector, useAppDispatch } from "../../state/hooks/reduxHooks";
import { memo } from "react";

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

const MemoizedLayerInfo = memo(LayerInfo);

const LayerPane: FC = () => {
	const layers = useAppSelector((state) => state.canvas.layers);
	const dispatch = useAppDispatch();

	const onNewLayer = () => dispatch(createLayer());

	return (
		<aside id="layer-manager-container">
			<ColorWheel />

			<button
				data-testid="new-layer-button"
				id="new-layer-button"
				onClick={onNewLayer}
			>
				<i className="fa fa-plus"></i>
			</button>
			<div
				id="layer-list"
				data-testid="layer-list"
			>
				{layers.map((layer, i) => (
					<MemoizedLayerInfo
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
