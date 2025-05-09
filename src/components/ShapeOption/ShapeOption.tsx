// Lib
import * as Utils from "src/lib/utils";
import clsx from "clsx";
import useStore from "@state/hooks/useStore";

// Types
import type { Shape } from "src/types";

// Components
import Tooltip from "@components/Tooltip/Tooltip";

type ShapeOptionProps = Readonly<{
	icon: string;
	name: Shape;
	isActive: boolean;
}>;

function ShapeOption({ icon, name, isActive }: ShapeOptionProps) {
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
}

export default ShapeOption;
