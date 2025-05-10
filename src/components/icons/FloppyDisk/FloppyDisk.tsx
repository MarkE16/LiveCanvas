// Styles
import "../icons.styles.css";
const FloppyDisk = () => (
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
		{/* Floppy disk outline */}
		<path
			d="M19 21H6C5.44772 21 5 20.5523 5 20V5C5 4.44772 5.44772 4 6 4H16L20 8V20C20 20.5523 19.5523 21 19 21Z"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>

		{/* Top rectangle (label area) */}
		<rect
			x="8"
			y="4"
			width="8"
			height="6"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>

		{/* Bottom rectangle (disk area) */}
		<rect
			x="8"
			y="14"
			width="9"
			height="7"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);
export default FloppyDisk;
