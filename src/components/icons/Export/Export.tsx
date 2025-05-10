// Styles
import "../icons.styles.css";
const Export = () => (
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
		{/* Document outline */}
		<path
			d="M14 3H6C5.44772 3 5 3.44772 5 4V21C5 21.5523 5.44772 22 6 22H19C19.5523 22 20 21.5523 20 21V9L14 3Z"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>

		{/* Folded corner */}
		<path
			d="M14 3V9H20"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>

		{/* Export arrow */}
		<path
			d="M12 16V12M12 12L10 14M12 12L14 14"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M9 18H15"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);
export default Export;
