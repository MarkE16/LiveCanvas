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

	function handleMouseDown() {
		isDraggingWindow.current = true;
	}
	function handleMouseUp() {
		isDraggingWindow.current = false;
	}
	useEffect(() => {
		function handleMouseMove(e: MouseEvent) {
			if (!isDraggingWindow.current) return;

			const x = e.clientX;
			const y = e.clientY;
			const dx = x - clientPosition.current.x;
			const dy = y - clientPosition.current.y;

			setPosition((prev) => ({
				...prev,
				x: x - prev.x + dx,
				y: y - prev.y + dy
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
			<button onClick={toggleReferenceWindowState}>X</button>
		</header>
	);
};

export default ReferenceWindowHeader;
