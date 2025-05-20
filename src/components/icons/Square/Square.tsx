import { Square as LucideSquare } from "lucide-react";
import type { ComponentProps } from "react";

const Square = (props: ComponentProps<"svg">) => (
	<LucideSquare
		size="1em"
		{...props}
	/>
);

export default Square;
