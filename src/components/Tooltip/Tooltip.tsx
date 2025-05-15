// Components
import {
	Provider as TooltipProvider,
	Root as TooltipRoot,
	Trigger as TooltipTrigger,
	Portal as TooltipPortal,
	Content as TooltipContent,
	Arrow as TooltipArrow
} from "@radix-ui/react-tooltip";

// Styles
import "./Tooltip.styles.css";

// Types
import { type FC, type ReactNode } from "react";

type TooltipProps = {
	text: string;
	position?: "top" | "bottom" | "left" | "right";
	arrow?: boolean;
	children: ReactNode;
};

const Tooltip: FC<TooltipProps> = ({
	children,
	text,
	position = "top",
	arrow = true
}) => {
	return (
		<TooltipProvider>
			<TooltipRoot delayDuration={100}>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
				<TooltipPortal>
					<TooltipContent
						side={position}
						className="TooltipContent"
						sideOffset={5}
					>
						{text}
						{arrow && <TooltipArrow className="TooltipArrow" />}
					</TooltipContent>
				</TooltipPortal>
			</TooltipRoot>
		</TooltipProvider>
	);
};

export default Tooltip;
