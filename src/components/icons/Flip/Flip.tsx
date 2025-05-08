// Styles
import "../icons.styles.css";
const Flip = () => (
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
		{/* Top down arrow - moved much higher */}
		<path
			d="M5 4L12.5 9L20 4"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>

		{/* Middle dashed line */}
		<line
			x1="5"
			y1="12.5"
			x2="7"
			y2="12.5"
			strokeLinecap="round"
		/>
		<line
			x1="9"
			y1="12.5"
			x2="11"
			y2="12.5"
			strokeLinecap="round"
		/>
		<line
			x1="13"
			y1="12.5"
			x2="15"
			y2="12.5"
			strokeLinecap="round"
		/>
		<line
			x1="17"
			y1="12.5"
			x2="19"
			y2="12.5"
			strokeLinecap="round"
		/>

		{/* Bottom up arrow - moved much lower */}
		<path
			d="M5 21L12.5 16L20 21"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);
export default Flip;
