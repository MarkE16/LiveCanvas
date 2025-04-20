// Lib
import * as Utils from "../../lib/utils";
import clsx from "clsx";
import useStore from "../../state/hooks/useStore";

// Types
import type { Shape } from "../../types";
import type { FC } from "react";

// Components
import Tooltip from "../Tooltip/Tooltip";

const ShapeOption: FC<{ icon: string; name: Shape; isActive: boolean }> = ({
	icon,
	name,
	isActive
}) => {
	const changeShape = useStore((state) => state.changeShape);
	const cn = clsx("shape-option", { active: isActive });

	const handleShapeChange = () => {
		changeShape(name);
	};

	return (
		<Tooltip
			text={Utils.capitalize(name)}
			position="bottom"
		>
			<button
				className={cn}
				onClick={handleShapeChange}
				data-testid={`shape-${name}`}
			>
				<i className={`fa ${icon}`} />
			</button>
		</Tooltip>
	);
};

export default ShapeOption;
