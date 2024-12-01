// Lib
import { useAppSelector, useAppDispatch } from "../../state/hooks/reduxHooks";
import { useState, memo } from "react";
import useLayerReferences from "../../state/hooks/useLayerReferences";

// Redux Actions
import { createLayer, changeDPI } from "../../state/slices/canvasSlice";

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
	const dpi = useAppSelector((state) => state.canvas.dpi);
	const [res, setRes] = useState(dpi);
	const dispatch = useAppDispatch();
	const references = useLayerReferences();

	const onNewLayer = () => dispatch(createLayer());

	const onDPIChange = () => {
		dispatch(changeDPI(res));

		references.forEach((ref) => {
			const ctx = ref.getContext("2d");

			if (ctx) {
				ctx.scale(res, res);
			}
		});
	};

	return (
		<aside id="layer-manager-container">
			<ColorWheel />

			<input
				type="number"
				value={res}
				step={0.1}
				onChange={(e) => setRes(Number(e.target.value))}
			/>
			<button onClick={onDPIChange}>Change DPI</button>
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
