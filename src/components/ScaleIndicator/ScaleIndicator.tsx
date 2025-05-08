// Lib
import { useRef, useState, useEffect } from "react";

// Types
import type { ReactNode } from "react";

type ScaleIndicatorProps = Readonly<{
	scale: number;
}>;

type Timer = ReturnType<typeof setTimeout>;

function ScaleIndicator({ scale }: ScaleIndicatorProps): ReactNode {
	const timeoutRef = useRef<Timer>(null);
	const [visible, setVisible] = useState<boolean>(false);

	useEffect(() => {
		setVisible(true);
		timeoutRef.current = setTimeout(() => setVisible(false), 2000);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		};
	}, [scale]);

	return (
		<div
			style={{
				position: "absolute",
				left: 10,
				bottom: 10,
				padding: "5px",
				zIndex: 1,
				backgroundColor: "black",
				borderRadius: "5px",
				opacity: visible ? 1 : 0.2,
				transition: "opacity 150ms",
				pointerEvents: "none"
			}}
		>
			{scale.toFixed(1)}x
		</div>
	);
};

export default ScaleIndicator;
