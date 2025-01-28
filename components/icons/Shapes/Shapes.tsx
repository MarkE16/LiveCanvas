// Styles
import "../icons.styles.css";

const Shapes = () => (
	<svg
		width="1em"
		height="1em"
		viewBox="0 0 25 25"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className="icon"
	>
		<circle
			cx="15"
			cy="20"
			r="5"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		/>
		<rect
			x="8"
			y="2"
			transform="rotate(45, 10, 2)"
			width="10"
			height="10"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		/>
		<polygon
			points="20,4 20,23 0,23"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		/>
	</svg>
);

export default Shapes;
