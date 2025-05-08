// Styles
import "../icons.styles.css";

const ZoomIn = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		fill="none"
		className="icon"
	>
		<g
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		>
			<circle
				cx="10"
				cy="10"
				r="7"
			/>
			<line
				x1="15"
				y1="15"
				x2="21"
				y2="21"
			/>
			<line
				x1="7"
				y1="10"
				x2="13"
				y2="10"
			/>
			<line
				x1="10"
				y1="7"
				x2="10"
				y2="13"
			/>
		</g>
	</svg>
);

export default ZoomIn;
