// Styles
import "../icons.styles.css";
const Image = () => (
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
		{/* Image frame */}
		<rect
			x="3"
			y="5"
			width="19"
			height="15"
			rx="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>

		{/* Mountain/landscape */}
		<path
			d="M3 16L8 11L12 15"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M14 13L22 20"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>

		{/* Sun/circle */}
		<circle
			cx="17"
			cy="9"
			r="2"
		/>
	</svg>
);
export default Image;
