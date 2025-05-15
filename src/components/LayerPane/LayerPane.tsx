// Lib
import { memo } from "react";
import useStore from "@/state/hooks/useStore";
import { useShallow } from "zustand/react/shallow";

// Icons
import Plus from "@/components/icons/Plus/Plus";

// Types
import type { ReactNode } from "react";

// Styles
import "./LayerPane.styles.css";

// Components
import LayerInfo from "@/components/LayerInfo/LayerInfo";
import ColorWheel from "@/components/ColorWheel/ColorWheel";
import Tooltip from "@/components/Tooltip/Tooltip";

const MemoizedLayerInfo = memo(LayerInfo);
const MemoizedColorWheel = memo(ColorWheel);

const MAX_LAYERS = 65;

function LayerPane(): ReactNode {
	const { layers, createLayer } = useStore(
		useShallow((state) => ({
			layers: state.layers,
			createLayer: state.createLayer
		}))
	);
	const totalLayers = layers.length;

	const onNewLayer = () => {
		if (totalLayers < MAX_LAYERS) {
			createLayer();
		}
	};

	const newLayerButton =
		totalLayers >= MAX_LAYERS ? (
			<Tooltip
				text="Maximum number of layers reached"
				position="left"
				arrow
			>
				<button
					aria-label="Create Layer"
					id="new-layer-button"
					disabled={true}
				>
					<Plus />
				</button>
			</Tooltip>
		) : (
			<button
				aria-label="Create Layer"
				id="new-layer-button"
				disabled={false}
				onClick={onNewLayer}
			>
				<Plus />
			</button>
		);

	return (
		<aside id="layer-manager-container">
			<MemoizedColorWheel />

			{newLayerButton}
			<div
				id="layer-list"
				aria-label="Layer List"
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
}

export default LayerPane;
