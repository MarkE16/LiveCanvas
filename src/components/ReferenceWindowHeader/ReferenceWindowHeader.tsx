// Lib
import { useEffect, useRef } from "react";
import useStore from "@state/hooks/useStore";

// Types
import type {
	Dispatch,
	SetStateAction,
	ReactNode,
	MouseEvent as ReactMouseEvent
} from "react";
import type { Coordinates } from "src/types";

// Icons
import Close from "@components/icons/Close/Close";

type ReferenceWindowHeaderProps = Readonly<{
	isPinned: boolean;
	setPosition: Dispatch<SetStateAction<Coordinates>>;
	children: ReactNode;
}>;

function ReferenceWindowHeader({
	isPinned,
	setPosition,
	children
}: ReferenceWindowHeaderProps): ReactNode {
	const toggleReferenceWindow = useStore(
		(state) => state.toggleReferenceWindow
	);
	const isDraggingWindow = useRef<boolean>(false);
	const headerRef = useRef<HTMLHeadingElement>(null);
	const clientPosition = useRef<Coordinates>({ x: 0, y: 0 });

	function handleMouseDown(e: ReactMouseEvent) {
		isDraggingWindow.current = !isPinned;
		clientPosition.current = { x: e.clientX, y: e.clientY };
	}

	useEffect(() => {
		function handleMouseUp() {
			isDraggingWindow.current = false;
		}

		function handleMouseMove(e: MouseEvent) {
			const header = headerRef.current;
			if (!isDraggingWindow.current || !header) return;

			const x = e.clientX;
			const y = e.clientY;

			const dx = x - clientPosition.current.x;
			const dy = y - clientPosition.current.y;

			setPosition((prev) => ({
				...prev,
				x: Math.min(
					Math.max(prev.x + dx, 0),
					window.innerWidth - header.offsetWidth
				),
				y: Math.min(
					Math.max(prev.y + dy, 0),
					window.innerHeight - header.offsetHeight
				)
			}));

			clientPosition.current = { x, y };
		}

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
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
