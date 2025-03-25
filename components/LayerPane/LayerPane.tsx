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
import { Tooltip } from "@mui/material";

const MemoizedLayerInfo = memo(LayerInfo);
const MemoizedColorWheel = memo(ColorWheel);

const MAX_LAYERS = 65;

const LayerPane: FC = () => {
	const { layers, createLayer } = useStore(
		useShallow((state) => ({
			layers: state.layers,
			createLayer: state.createLayer
		}))
	);
	const totalLayers = layers.length;

	const onNewLayer = () => createLayer();

	const newLayerButton =
		totalLayers >= MAX_LAYERS ? (
			<Tooltip
				title="Maximum number of layers reached"
				placement="left"
				arrow
			>
				<button
					data-testid="new-layer-button"
					id="new-layer-button"
					disabled={true}
				>
					<i className="fa fa-plus"></i>
				</button>
			</Tooltip>
		) : (
			<button
				data-testid="new-layer-button"
				id="new-layer-button"
				disabled={false}
				onClick={onNewLayer}
			>
				<i className="fa fa-plus"></i>
			</button>
		);

	return (
		<aside id="layer-manager-container">
			<MemoizedColorWheel />

			{newLayerButton}
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
		</aside>
	);
};

export default LayerPane;
