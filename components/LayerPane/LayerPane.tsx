// Lib
import { memo } from "react";
import useStore from "../../state/hooks/useStore";
import { useShallow } from "zustand/react/shallow";

// Types
import type { FC } from "react";

// Styles
import "./LayerPane.styles.css";

// Components
import LayerInfo from "../LayerInfo/LayerInfo";
import ColorWheel from "../ColorWheel/ColorWheel";
import Footer from "../Footer/Footer";

const MemoizedLayerInfo = memo(LayerInfo);
const MemoizedColorWheel = memo(ColorWheel);
const MemoizedFooter = memo(Footer);

const LayerPane: FC = () => {
	const { layers, createLayer } = useStore(
		useShallow((state) => ({
			layers: state.layers,
			createLayer: state.createLayer
		}))
	);
	const totalLayers = layers.length;

	const onNewLayer = () => createLayer();

	return (
		<aside id="layer-manager-container">
			<MemoizedColorWheel />

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
						canMoveUp={i > 0}
						canMoveDown={i < totalLayers - 1}
						idx={i}
					/>
				))}
			</div>
			<MemoizedFooter />
		</aside>
	);
};

export default LayerPane;
