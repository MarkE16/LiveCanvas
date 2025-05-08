// Styles
import "../icons.styles.css";

const Trashcan = () => (
	<svg
		width="1em"
		height="1em"
		viewBox="0 0 25 25"
		fill="none"
		className="icon"
		xmlns="http://www.w3.org/2000/svg"
		stroke="currentColor"
		strokeWidth="2"
	>
		{/* Lid */}
		<path
			d="M3 6h18"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>

		{/* Can body */}
		<path
			d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>

		{/* Handle */}
		<path
			d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>

		{/* Optional vertical lines inside can */}
		<line
			x1="10"
			y1="11"
			x2="10"
			y2="17"
			strokeLinecap="round"
		/>
		<line
			x1="14"
			y1="11"
			x2="14"
			y2="17"
			strokeLinecap="round"
		/>
	</svg>
);

export default Trashcan;
