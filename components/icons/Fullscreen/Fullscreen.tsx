// Styles
import "../icons.styles.css";
const Fullscreen = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 25 25"
		width="1em"
		height="1em"
		fill="none"
		className="icon"
		stroke="currentColor"
		strokeWidth="2"
	>
		{/* Inner rectangle */}
		<rect
			x="6"
			y="6"
			width="13"
			height="13"
			rx="1"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>

		{/* Top-left corner */}
		<path
			d="M3 8V3H8"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>

		{/* Top-right corner */}
		<path
			d="M17 3H22V8"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>

		{/* Bottom-left corner */}
		<path
			d="M3 17V22H8"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>

		{/* Bottom-right corner */}
		<path
			d="M17 22H22V17"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);
export default Fullscreen;
