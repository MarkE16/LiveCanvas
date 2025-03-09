// Lib
import * as Utils from "../../lib/utils";

// Types
import type { Shape } from "../../types";
import type { FC } from "react";

// Components
import { Tooltip } from "@mui/material";
import useStore from "../../state/hooks/useStore";
import clsx from "clsx";

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
			title={Utils.capitalize(name)}
			arrow
			placement="bottom"
		>
			<span>
				<button
					className={cn}
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
