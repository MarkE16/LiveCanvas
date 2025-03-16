// Lib
import { useEffect, useRef } from "react";
import useStore from "../../state/hooks/useStore";

// Types
import type {
	FC,
	Dispatch,
	SetStateAction,
	ReactNode,
	MouseEvent as ReactMouseEvent
} from "react";
import type { Coordinates } from "../../types";

// Icons
import Close from "../icons/Close/Close";

type ReferenceWindowHeaderProps = {
	setPosition: Dispatch<SetStateAction<Coordinates>>;
	children: ReactNode;
};

const ReferenceWindowHeader: FC<ReferenceWindowHeaderProps> = ({
	setPosition,
	children
}) => {
	const toggleReferenceWindow = useStore(
		(state) => state.toggleReferenceWindow
	);
	const isDraggingWindow = useRef<boolean>(false);
	const headerRef = useRef<HTMLHeadingElement>(null);
	const clientPosition = useRef<Coordinates>({ x: 0, y: 0 });

	function handleMouseDown(e: ReactMouseEvent) {
		isDraggingWindow.current = true;
		clientPosition.current = { x: e.clientX, y: e.clientY };
	}
	function handleMouseUp() {
		isDraggingWindow.current = false;
	}
	useEffect(() => {
		function handleMouseMove(e: MouseEvent) {
			if (!isDraggingWindow.current || !headerRef.current) return;

			const x = e.clientX;
			const y = e.clientY;

			const dx = x - clientPosition.current.x;
			const dy = y - clientPosition.current.y;

			setPosition((prev) => ({
				...prev,
				x: prev.x + dx,
				y: prev.y + dy
			}));

			clientPosition.current = { x, y };
		}

		document.addEventListener("mousemove", handleMouseMove);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
		};
	}, [setPosition]);

	const toggleReferenceWindowState = (e: ReactMouseEvent) => {
		e.stopPropagation();
		toggleReferenceWindow();
	};

	return (
		<header
			ref={headerRef}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
		>
			<h5 id="reference-window-header-title">{children}</h5>
			<button
				data-testid="close-ref-window"
				onClick={toggleReferenceWindowState}
			>
				<Close />
			</button>
		</header>
	);
};

export default ReferenceWindowHeader;
