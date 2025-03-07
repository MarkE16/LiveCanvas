// Lib
import useLayerReferences from "../../state/hooks/useLayerReferences";
import * as Utils from "../../lib/utils";

// Types
import type { Shape } from "../../types";
import type { FC } from "react";

// Components
import { Tooltip } from "@mui/material";
import useStore from "../../state/hooks/useStore";

const ShapeOption: FC<{ icon: string; name: Shape }> = ({ icon, name }) => {
	const createElement = useStore((state) => state.createElement);
	const { getActiveLayer } = useLayerReferences();

	const handleShapeChange = () => {
		const activeLayer = getActiveLayer();

		if (!activeLayer) {
			throw new Error("No active layer found. Cannot create element.");
		}
		createElement(name, {
			layerId: activeLayer.id
		});
	};

	return (
		<Tooltip
			title={Utils.capitalize(name)}
			arrow
			placement="bottom"
		>
			<span>
				<button
					className="shape-option"
					onClick={handleShapeChange}
					data-testid={`shape-${name}`}
				>
					<i className={`fa ${icon}`} />
				</button>
			</span>
		</Tooltip>
	);
};

export default ShapeOption;
